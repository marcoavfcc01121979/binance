const express = require("express");
require("express-async-errors");

const cors = require("cors");
const helmet = require("helmet");
const authController = require("./controllers/authController");
const errorMiddlewares = require("./middlewares/errorMiddlewares");

const settingsRouter = require("./routers/settingsRouter");
const symbolsRouter = require("./routers/symbolsRouter");

const authMiddlewares = require("./middlewares/authMiddlewares");
const morgan = require("morgan");

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(helmet());
app.use(express.json());

app.use(morgan("dev"));

app.post("/login", authController.doLogin);

app.post("/logout", authController.doLogout);

app.use("/settings", authMiddlewares, settingsRouter);

app.use("/symbols", authMiddlewares, symbolsRouter);

app.use(errorMiddlewares);

module.exports = app;
