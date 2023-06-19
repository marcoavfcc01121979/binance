const express = require("express");
require("express-async-errors");

const cors = require("cors");
const helmet = require("helmet");
const authController = require("./controllers/authController");

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

app.post("/login", authController.doLogin);

app.post("/logout", authController.doLogout);

const errorMiddlewares = require("./middlewares/errorMiddlewares");
app.use(errorMiddlewares);

module.exports = app;
