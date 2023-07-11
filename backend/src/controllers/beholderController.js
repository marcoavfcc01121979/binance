function getMemory(req, res, next) {
  const { symbol, index, interval } = req.params;
  res.json(beholder.getMemory(symbol, index, interval));
}

function getBrain(req, res, next) {
  res.json(beholder.getBrain());
}

module.exports = {
  getMemory,
  // getMemoryIndexes,
  getBrain,
  // getBrainIndexes,
  // getAnalysisIndexes,
  // getAgenda,
  // init
};
