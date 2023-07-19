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

function getBrain() {
  return { ...BRAIN };
}

module.exports = {
  init,
  updateMemory,
  getMemory,
  getBrain,
  deleteMemory,
};
