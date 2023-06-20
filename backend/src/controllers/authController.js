const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

function doLogin(req, res, next) {
  const { email, password } = req.body;

  if (
    email === "admin@admin.com" &&
    bcrypt.compareSync(
      password,
      "$2a$12$8NvTNdAunk6.tpLCytbA6uiKiwyDxQc.aj6bnLaTwtqSqrhALttDy"
    )
  ) {
    const token = jwt.sign({ id: 1 }, process.env.JWT_SECRET, {
      expiresIn: parseInt(process.env.JWT_EXPIRES),
    });
    res.json({ token });
  } else {
    res.sendStatus(401);
  }
}

const blacklist = [];

function doLogout(req, res, next) {
  const token = req.headers["authorization"];
  blacklist.push(token);
  res.sendStatus(200);
}

function isBalckListed(token) {
  return blacklist.some((t) => t === token);
}

module.exports = {
  doLogin,
  doLogout,
  isBalckListed,
};
