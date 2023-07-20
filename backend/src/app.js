const express = require("express");
require("express-async-errors");

const cors = require("cors");
const helmet = require("helmet");
const authController = require("./controllers/authController");

const errorMiddlewares = require("./middlewares/errorMiddlewares");

const settingsRouter = require("./routers/settingsRouter");
const symbolsRouter = require("./routers/symbolsRouter");
const exchangeRouter = require("./routers/exchangeRouter");
const ordersRouter = require("./routers/ordersRouter");
const monitorsRouter = require("./routers/monitorsRouter");
const automationsRouter = require("./routers/automationsRouter");
const beholderRouter = require("./routers/beholderRouter");

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

app.use("/exchange", authMiddlewares, exchangeRouter);

app.use("/orders", authMiddlewares, ordersRouter);

app.use("/monitors", authMiddlewares, monitorsRouter);

app.use("/automations", authMiddlewares, automationsRouter);

app.use("/beholder", authMiddlewares, beholderRouter);

app.use(errorMiddlewares);

module.exports = app;
