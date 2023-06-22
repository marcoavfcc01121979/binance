const express = require("express");
require("express-async-errors");

const cors = require("cors");
const helmet = require("helmet");
const authController = require("./controllers/authController");
const settingsController = require("./controllers/settingsController");
const errorMiddlewares = require("./middlewares/errorMiddlewares");
const authMiddlewares = require("./middlewares/authMiddlewares");

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

app.post("/login", authController.doLogin);

app.get("/settings", authMiddlewares, settingsController.getSettings);

app.patch("/settings", authMiddlewares, settingsController.updateSettings);

app.post("/logout", authController.doLogout);

app.use(errorMiddlewares);

module.exports = app;
