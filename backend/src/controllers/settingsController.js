function getSettings(req, res, next) {
  res.json({
    email: "admin@admin.com",
  });
}

module.exports = {
  getSettings,
};
