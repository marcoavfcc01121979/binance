const { getDefaultSettings } = require("./repositories/settingsRepository");
const { actionTypes } = require("./repositories/actionsRepository");

const logger = require("./utils/logger");

const MEMORY = {};

let BRAIN = {};

let LOCK_BRAIN = {};

let BRAIN_INDEX = {};

const LOGS = process.env.BEHOLDER_LOGS === "true";
const INTERVAL = parseInt(process.env.AUTOMATION_INTERVAL || 0);

let LOCK_MEMORY = false;

function init(automations) {
  // try {
  //     setLocked(automations.map(a => a.id), true);
  //     LOCK_MEMORY = true;
  //     BRAIN = {};
  //     BRAIN_INDEX = {};
  //     automations.map(auto => {
  //         if (auto.isActive && !auto.schedule)
  //             updateBrain(auto)
  //     });
  // } finally {
  //     setLocked(automations.map(a => a.id), false);
  //     LOCK_MEMORY = false;
  //     logger('beholder', 'Beholder Brain has started!');
  // }
}

async function testAutomations(memoryKey) {
  const automations = findAutomations(memoryKey);

  if (
    !automations ||
    !automations.length ||
    isLocked(automations.filter((a) => a).map((a) => a.id))
  ) {
    if (LOGS)
      console.log(
        `Beholder has no automations for memoryKey: ${memoryKey} or the brain is locked!`
      );
    return false;
  }

  setLocked(
    automations.map((a) => a.id),
    true
  );
  let results;

  try {
    const promises = automations.map(async (automation) => {
      let auto = { ...automation };

      if (auto.symbol.startsWith("*")) {
        const symbol = memoryKey.split(":")[0];
        auto.indexes = auto.indexes.replaceAll(auto.symbol, symbol);
        auto.conditions = auto.conditions.replaceAll(auto.symbol, symbol);
        if (auto.actions) {
          auto.actions.forEach((action) => {
            if (action.orderTemplate) action.orderTemplate.symbol = symbol;
          });
        }
        auto.symbol = symbol;
      }

      return evalDecision(memoryKey, auto);
    });

    results = await Promise.all(promises);
    if (Array.isArray(results) && results.length)
      results = results.flat().filter((r) => r);

    if (!results || (Array.isArray(results) && !results.length)) return false;
    else return results;
  } finally {
    setTimeout(
      () => {
        setLocked(
          automations.map((a) => a.id),
          false
        );
      },
      results && results.length ? INTERVAL : 0
    );
  }
}

async function updateMemory(
  symbol,
  index,
  interval,
  value,
  executeAutomations = true
) {
  if (value === undefined || value === null) return false;
  if (value.toJSON) value = value.toJSON();
  if (value.get) value = value.get({ plain: true });

  if (LOCK_MEMORY) return false;

  const memoryKey = parseMemoryKey(symbol, index, interval);
  MEMORY[memoryKey] = value;

  if (LOGS)
    logger(
      "beholder",
      `Beholder memory updated: ${memoryKey} => ${JSON.stringify(
        value
      )}, will exec autos? ${executeAutomations}`
    );

  if (!executeAutomations) return false;

  return testAutomations(memoryKey);
}

function invertCondition(memoryKey, conditions) {
  const conds = conditions.split(" && ");
  const condToInvert = conds.find(
    (c) => c.indexOf(memoryKey) !== -1 && c.indexOf("current") !== -1
  );
  if (!condToInvert) return false;

  if (condToInvert.indexOf(">=") != -1)
    return condToInvert.replace(">=", "<").replace(/current/g, "previous");
  if (condToInvert.indexOf("<=") != -1)
    return condToInvert.replace("<=", ">").replace(/current/g, "previous");
  if (condToInvert.indexOf(">") != -1)
    return condToInvert.replace(">", "<").replace(/current/g, "previous");
  if (condToInvert.indexOf("<") != -1)
    return condToInvert.replace("<", ">").replace(/current/g, "previous");
  if (condToInvert.indexOf("!") != -1)
    return condToInvert.replace("!", "=").replace(/current/g, "previous");
  if (condToInvert.indexOf("==") != -1)
    return condToInvert.replace("==", "!==").replace(/current/g, "previous");
  return false;
}

function shouldntInvert(automation, memoryKey) {
  //return true;//descomente para desabilitar 'double check' (teste de condição invertida)
  return (
    ["GRID", "TRAILING"].includes(automation.actions[0].type) ||
    automation.schedule ||
    memoryKey.indexOf(":LAST_ORDER") !== -1 ||
    memoryKey.indexOf(":LAST_CANDLE") !== -1 ||
    memoryKey.indexOf(":PREVIOUS_CANDLE") !== -1
  );
}

async function sendSms(settings, automation) {
  await require("./utils/sms")(settings, automation.name + " has fired!");
  if (automation.logs) logger("A:" + automation.id, `SMS sent!`);
  return {
    text: `SMS sent from automation '${automation.name}'`,
    type: "success",
  };
}

function doAction(settings, action, automation) {
  try {
    switch (action.type) {
      case actionTypes.ALERT_EMAIL:
        return sendEmail(settings, automation);
      case actionTypes.ALERT_SMS:
        return sendSms(settings, automation);
      case actionTypes.ALERT_TELEGRAM:
        return sendTelegram(settings, automation);
      case actionTypes.ORDER:
        return placeOrder(settings, automation, action);
      case actionTypes.TRAILING:
        return trailingEval(settings, automation, action);
      case actionTypes.WITHDRAW:
        return withdrawCrypto(settings, automation, action);
      case actionTypes.GRID:
        return gridEval(settings, automation);
    }
  } catch (err) {
    if (automation.logs) {
      logger("A:" + automation.id, `${automation.name}:${action.type}`);
      logger("A:" + automation.id, err);
    }
    return {
      text: `Error at ${automation.name}: ${err.message}`,
      type: "error",
    };
  }
}

async function evalDecision(memoryKey, automation) {
  if (!automation) return false;

  try {
    const indexes = automation.indexes ? automation.indexes.split(",") : [];

    if (indexes.length) {
      const isChecked = indexes.every(
        (ix) => MEMORY[ix] !== null && MEMORY[ix] !== undefined
      );
      if (!isChecked) return false;

      const invertedCondition = shouldntInvert(automation, memoryKey)
        ? ""
        : invertCondition(memoryKey, automation.conditions);
      const evalCondition =
        automation.conditions +
        (invertedCondition ? " && " + invertedCondition : "");

      if (LOGS)
        logger(
          "A:" + automation.id,
          `Beholder trying to evaluate:\n${evalCondition}\n at ${automation.name}`
        );

      const isValid = evalCondition
        ? Function("MEMORY", "return " + evalCondition)(MEMORY)
        : true;
      if (!isValid) return false;
    }

    if (!automation.actions || !automation.actions.length) {
      if (LOGS || automation.logs)
        logger(
          "A:" + automation.id,
          `No actions defined for automation ${automation.name}`
        );
      return false;
    }

    if (
      (LOGS || automation.logs) &&
      !["GRID", "TRAILING"].includes(automation.actions[0].type)
    )
      logger(
        "A:" + automation.id,
        `Beholder evaluated a condition at automation: ${automation.name} => ${automation.conditions}`
      );

    const settings = await getDefaultSettings();
    const results = [];

    for (let i = 0; i < automation.actions.length; i++) {
      const action = automation.actions[i];
      const result = await doAction(settings, action, automation);
      if (!result || result.type === "error") break;

      results.push(result);
    }

    if (automation.logs && results && results.length && results[0])
      logger(
        "A:" + automation.id,
        `Automation ${
          automation.name
        } finished execution at ${new Date()}\nResults: ${JSON.stringify(
          results
        )}`
      );

    return results.flat();
  } catch (err) {
    if (automation.logs) logger("A:" + automation.id, err);
    return {
      type: "error",
      text: `Error at evalDecision for '${automation.name}': ${err}`,
    };
  }
}

function findAutomations(indexKey) {
  let ids = [];
  if (BRAIN_INDEX.hasWildcard) {
    const props = Object.entries(BRAIN_INDEX).filter((p) =>
      indexKey.endsWith(p[0].replace("*", ""))
    );
    ids = props.map((p) => p[1]).flat();
  } else ids = BRAIN_INDEX[indexKey];

  if (!ids) return [];
  return [...new Set(ids)].map((id) => BRAIN[id]);
}

function updateBrain(automation) {
  if (!automation.isActive || !automation.conditions) return;

  const actions = automation.actions
    ? automation.actions.map((a) => {
        a = a.toJSON ? a.toJSON() : a;
        delete a.createdAt;
        delete a.updatedAt;
        //delete a.orderTemplate;
        return a;
      })
    : [];

  const grids = automation.grids
    ? automation.grids.map((g) => {
        g = g.toJSON ? g.toJSON() : g;
        delete g.createdAt;
        delete g.updatedAt;
        delete g.automationId;
        if (g.orderTemplate) {
          delete g.orderTemplate.createdAt;
          delete g.orderTemplate.updatedAt;
          delete g.orderTemplate.name;
        }
        return g;
      })
    : [];

  if (automation.toJSON) automation = automation.toJSON();

  delete automation.createdAt;
  delete automation.updatedAt;

  automation.actions = actions;
  automation.grids = grids;

  BRAIN[automation.id] = automation;
  automation.indexes
    .split(",")
    .map((ix) => updateBrainIndex(ix, automation.id));
}

function updateBrainIndex(index, automationId) {
  if (!BRAIN_INDEX[index]) BRAIN_INDEX[index] = [];
  BRAIN_INDEX[index].push(automationId);

  if (index.startsWith("*")) BRAIN_INDEX.hasWildcard = true;
}

function deleteMemory(symbol, index, interval) {
  try {
    const indexKey = interval ? `${index}_${interval}` : index;
    const memoryKey = `${symbol}:${indexKey}`;
    if (MEMORY[memoryKey] === undefined) return;

    LOCK_MEMORY = true;
    delete MEMORY[memoryKey];

    if (LOGS) logger("beholder", `Beholder memory delete: ${memoryKey}!`);
  } finally {
    LOCK_MEMORY = false;
  }
}

function parseMemoryKey(symbol, index, interval = null) {
  const indexKey = interval ? `${index}_${interval}` : index;
  return `${symbol}:${indexKey}`;
}

function getMemory(symbol, index, interval) {
  if (symbol && index) {
    const indexKey = interval ? `${index}_${interval}` : index;
    const memoryKey = `${symbol}:${indexKey}`;

    const result = MEMORY[memoryKey];
    return typeof result === "object" ? { ...result } : result;
  }

  return { ...MEMORY };
}

function flattenObject(ob) {
  var toReturn = {};

  for (var i in ob) {
    if (!ob.hasOwnProperty(i)) continue;

    if (typeof ob[i] == "object" && ob[i] !== null) {
      var flatObject = flattenObject(ob[i]);
      for (var x in flatObject) {
        if (!flatObject.hasOwnProperty(x)) continue;

        toReturn[i + "." + x] = flatObject[x];
      }
    } else {
      toReturn[i] = ob[i];
    }
  }
  return toReturn;
}

function getEval(prop) {
  if (prop.indexOf("MEMORY") !== -1) return prop;
  if (prop.indexOf(".") === -1) return `MEMORY['${prop}']`;

  const propSplit = prop.split(".");
  const memKey = propSplit[0];
  const memProp = prop.replace(memKey, "");
  return `MEMORY['${memKey}']${memProp}`;
}

function getMemoryIndexes() {
  return Object.entries(flattenObject(MEMORY))
    .map((prop) => {
      if (prop[0].indexOf("previous") !== -1 || prop[0].indexOf(":") === -1)
        return false;
      const propSplit = prop[0].split(":");
      return {
        symbol: propSplit[0],
        variable: propSplit[1].replace(".current", ""),
        eval: getEval(prop[0]),
        example: prop[1],
      };
    })
    .filter((ix) => ix)
    .sort((a, b) => {
      if (a.variable < b.variable) return -1;
      if (a.variable > b.variable) return 1;
      return 0;
    });
}

function deleteBrainIndex(indexes, automationId) {
  if (typeof indexes === "string") indexes = indexes.split(",");
  indexes.forEach((ix) => {
    if (!BRAIN_INDEX[ix] || BRAIN_INDEX[ix].length === 0) return;
    const pos = BRAIN_INDEX[ix].findIndex((id) => id === automationId);
    BRAIN_INDEX[ix].splice(pos, 1);
  });

  if (BRAIN_INDEX.hasWildcard)
    BRAIN_INDEX.hasWildcard = Object.entries(BRAIN_INDEX).some((p) =>
      p[0].startsWith("*")
    );
}

function deleteBrain(automation) {
  try {
    setLocked(automation.id, true);
    delete BRAIN[automation.id];
    deleteBrainIndex(automation.indexes.split(","), automation.id);
    if (automation.logs)
      logger(
        "A:" + automation.id,
        `Automation removed from BRAIN #${automation.id}`
      );
  } finally {
    setLocked(automation.id, false);
  }
}

function getBrainIndexes() {
  return { ...BRAIN_INDEX };
}

function getBrain() {
  return { ...BRAIN };
}

module.exports = {
  init,
  updateMemory,
  getMemory,
  getBrain,
  deleteMemory,
  getMemoryIndexes,
  getBrainIndexes,
  deleteBrain,
  updateBrain,
};
