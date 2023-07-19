const indexes = require("../utils/indexes");

function getMemory(req, res, next) {
  const { symbol, index, interval } = req.params;
  res.json(beholder.getMemory(symbol, index, interval));
}

function getBrain(req, res, next) {
  res.json(beholder.getBrain());
}

function getAnalysisIndexes(req, res, next) {
  res.json(indexes.getAnalysisIndexes());
}

module.exports = {
  getMemory,
  // getMemoryIndexes,
  getBrain,
  // getBrainIndexes,
  getAnalysisIndexes,
  // getAgenda,
  // init
};
