const MEMORY = {};

const LOGS = process.env.BEHOLDER_LOGS === "true";

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

  //   if (LOGS)
  //     logger(
  //       "beholder",
  //       `Beholder memory updated: ${memoryKey} => ${JSON.stringify(
  //         value
  //       )}, will exec autos? ${executeAutomations}`
  //     );

  if (!executeAutomations) return false;

  // return testAutomations(memoryKey);
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
};
