const WebSocket = require("ws");
const ordersRepository = require("./repositories/ordersRepository");
const { orderStatus } = require("./repositories/ordersRepository");

const logger = require("./utils/logger");

const { execCalc, indexKeys } = require("./utils/indexes");

const {
  monitorTypes,
  getActiveMonitors,
} = require("./repositories/monitorsRepository");
// const { getDefaultSettings } = require('./repositories/settingsRepository');

let WSS, beholder, exchange;

function startMiniTickerMonitor(monitorId, broadcastLabel, logs) {
  if (!exchange) return new Error("Exchange Monitor not initialized yet.");
  exchange.miniTickerStream(async (markets) => {
    if (logs) logger("M:" + monitorId, markets);

    try {
      Object.entries(markets).map(async (mkt) => {
        delete mkt[1].volume;
        delete mkt[1].quoteVolume;
        delete mkt[1].eventTime;
        const converted = {};
        Object.entries(mkt[1]).map(
          (prop) => (converted[prop[0]] = parseFloat(prop[1]))
        );

        const results = await beholder.updateMemory(
          mkt[0],
          indexKeys.MINI_TICKER,
          null,
          converted
        );
        if (results) results.map((r) => sendMessage({ notification: r }));
      });

      if (broadcastLabel && WSS) sendMessage({ [broadcastLabel]: markets });

      //simulação de book
      const books = Object.entries(markets).map((mkt) => {
        const book = {
          symbol: mkt[0],
          bestAsk: mkt[1].close,
          bestBid: mkt[1].close,
        };
        const currentMemory = beholder.getMemory(mkt[0], indexKeys.BOOK);

        const newMemory = {};
        newMemory.previous = currentMemory ? currentMemory.current : book;
        newMemory.current = book;

        beholder
          .updateMemory(mkt[0], indexKeys.BOOK, null, newMemory)
          .then((results) => {
            if (results) results.map((r) => sendMessage({ notification: r }));
          });

        return book;
      });
      if (WSS) sendMessage({ book: books });
      //fim da simulação de book
    } catch (err) {
      if (logs) logger("M:" + monitorId, err);
    }
  });
  logger("M:" + monitorId, "Mini Ticker Monitor has started!");
}

let book = [];
function startBookMonitor(monitorId, broadcastLabel, logs) {
  if (!exchange) return new Error("Exchange Monitor not initialized yet.");
  exchange.bookStream(async (order) => {
    if (logs) logger("M:" + monitorId, order);

    try {
      if (book.length === 200) {
        if (broadcastLabel && WSS) sendMessage({ [broadcastLabel]: book });
        book = [];
      } else book.push({ ...order });

      const orderCopy = { ...order };
      delete orderCopy.symbol;
      delete orderCopy.updateId;
      delete orderCopy.bestAskQty;
      delete orderCopy.bestBidQty;

      const converted = {};
      Object.entries(orderCopy).map(
        (prop) => (converted[prop[0]] = parseFloat(prop[1]))
      );

      const currentMemory = beholder.getMemory(order.symbol, indexKeys.BOOK);

      const newMemory = {};
      newMemory.previous = currentMemory ? currentMemory.current : converted;
      newMemory.current = converted;

      const results = await beholder.updateMemory(
        order.symbol,
        indexKeys.BOOK,
        null,
        newMemory
      );
      if (results) results.map((r) => sendMessage({ notification: r }));
    } catch (err) {
      if (logs) logger("M:" + monitorId, err);
    }
  });
  logger("M:" + monitorId, "Book Monitor has started!");
}

async function loadWallet() {
  if (!exchange) throw new Error("Exchange Monitor not initialized yet.");

  try {
    const info = await exchange.balance();
    const wallet = Object.entries(info).map(async (item) => {
      const results = await beholder.updateMemory(
        item[0],
        indexKeys.WALLET,
        null,
        parseFloat(item[1].available)
      );
      if (results) results.map((r) => sendMessage({ notification: r }));

      return {
        symbol: item[0],
        available: item[1].available,
        onOrder: item[1].onOrder,
      };
    });
    return Promise.all(wallet);
  } catch (err) {
    throw new Error(err.body ? JSON.stringify(err.body) : err.message); //evita 401 da Binance
  }
}

async function startUserDataMonitor(monitorId, broadcastLabel, logs) {
  const [balanceBroadcast, executionBroadcast] = broadcastLabel
    ? broadcastLabel.split(",")
    : [null, null];

  try {
    await loadWallet();

    if (!exchange) return new Error("Exchange Monitor not initialized yet.");
    exchange.userDataStream((data) => {
      if (data.e === "executionReport")
        processExecutionData(monitorId, data, executionBroadcast);
      else if (
        data.e === "balanceUpdate" ||
        data.e === "outboundAccountPosition"
      )
        processBalanceData(monitorId, balanceBroadcast, logs, data);
    });

    logger("M:" + monitorId, "User Data Monitor has started!");
  } catch (err) {
    logger(
      "M:" + monitorId,
      "User Data Monitor has NOT started!\n" + err.message
    );
  }
}

function processExecutionData(monitorId, executionData, broadcastLabel) {
  if (executionData.x === orderStatus.NEW) return; //ignora as novas, pois podem ter vindo de outras fontes

  const order = {
    symbol: executionData.s,
    orderId: executionData.i,
    clientOrderId:
      executionData.X === orderStatus.CANCELED
        ? executionData.C
        : executionData.c,
    side: executionData.S,
    type: executionData.o,
    status: executionData.X,
    isMaker: executionData.m,
    transactTime: executionData.T,
  };

  if (order.status === orderStatus.FILLED) {
    const quoteAmount = parseFloat(executionData.Z);
    order.avgPrice = quoteAmount / parseFloat(executionData.z);
    order.commission = executionData.n;
    order.quantity = executionData.q;
    const isQuoteCommission =
      executionData.N && order.symbol.endsWith(executionData.N);
    order.net = isQuoteCommission
      ? quoteAmount - parseFloat(order.commission)
      : quoteAmount;
  }

  if (order.status === orderStatus.REJECTED) order.obs = executionData.r;

  setTimeout(async () => {
    try {
      const updatedOrder = await ordersRepository.updateOrderByOrderId(
        order.orderId,
        order.clientOrderId,
        order
      );
      if (updatedOrder) {
        notifyOrderUpdate(order);

        const orderCopy = getLightOrder(updatedOrder.get({ plain: true }));
        const results = await beholder.updateMemory(
          order.symbol,
          indexKeys.LAST_ORDER,
          null,
          orderCopy
        );
        if (results) results.map((r) => sendMessage({ notification: r }));
        if (broadcastLabel) sendMessage({ [broadcastLabel]: order });
      }
    } catch (err) {
      logger("M:" + monitorId, err);
    }
  }, 3000);
}

function stopChartMonitor(monitorId, symbol, interval, indexes, logs) {
  if (!symbol) return new Error(`Can't stop a Chart Monitor without a symbol.`);
  if (!exchange) return new Error("Exchange Monitor not initialized yet.");
  exchange.terminateChartStream(symbol, interval);
  if (logs)
    logger("M:" + monitorId, `Chart Monitor ${symbol}_${interval} stopped!`);

  beholder.deleteMemory(symbol, indexKeys.LAST_CANDLE, interval);
  beholder.deleteMemory(symbol, indexKeys.PREVIOUS_CANDLE, interval);

  if (indexes && Array.isArray(indexes))
    indexes.map((ix) => beholder.deleteMemory(symbol, ix, interval));
}

function startChartMonitor(
  monitorId,
  symbol,
  interval,
  indexes,
  broadcastLabel,
  logs
) {
  if (!symbol)
    return new Error(`Can't start a Chart Monitor without a symbol.`);
  if (!exchange) return new Error("Exchange Monitor not initialized yet.");

  exchange.chartStream(symbol, interval || "1m", async (ohlc) => {
    const lastCandle = {
      open: ohlc.open[ohlc.open.length - 1],
      close: ohlc.close[ohlc.close.length - 1],
      high: ohlc.high[ohlc.high.length - 1],
      low: ohlc.low[ohlc.low.length - 1],
      volume: ohlc.volume[ohlc.volume.length - 1],
    };

    const previousCandle = {
      open: ohlc.open[ohlc.open.length - 2],
      close: ohlc.close[ohlc.close.length - 2],
      high: ohlc.high[ohlc.high.length - 2],
      low: ohlc.low[ohlc.low.length - 2],
      volume: ohlc.volume[ohlc.volume.length - 2],
    };

    const previousPreviousCandle = {
      open: ohlc.open[ohlc.open.length - 3],
      close: ohlc.close[ohlc.close.length - 3],
      high: ohlc.high[ohlc.high.length - 3],
      low: ohlc.low[ohlc.low.length - 3],
      volume: ohlc.volume[ohlc.volume.length - 3],
    };

    if (logs) logger("M:" + monitorId, lastCandle);

    try {
      beholder.updateMemory(
        symbol,
        indexKeys.LAST_CANDLE,
        interval,
        { current: lastCandle, previous: previousCandle },
        false
      );
      beholder.updateMemory(
        symbol,
        indexKeys.PREVIOUS_CANDLE,
        interval,
        { current: previousCandle, previous: previousPreviousCandle },
        false
      );

      if (broadcastLabel && WSS) sendMessage({ [broadcastLabel]: lastCandle });

      let results = await processChartData(
        monitorId,
        symbol,
        indexes,
        interval,
        ohlc,
        logs
      );

      if (results) {
        results.push(
          await beholder.testAutomations(
            beholder.parseMemoryKey(symbol, indexKeys.LAST_CANDLE, interval)
          )
        );
        results.push(
          await beholder.testAutomations(
            beholder.parseMemoryKey(symbol, indexKeys.PREVIOUS_CANDLE, interval)
          )
        );

        if (logs) logger("M:" + monitorId, `chartStream Results: ${results}`);
        results.flat().map((r) => sendMessage({ notification: r }));
      }
    } catch (err) {
      if (logs) logger("M:" + monitorId, err);
    }
  });
  logger(
    "M:" + monitorId,
    `Chart Monitor has started for ${symbol}_${interval}!`
  );
}

function stopChartMonitor(monitorId, symbol, interval, indexes, logs) {
  if (!symbol) return new Error(`Can't stop a Chart Monitor without a symbol.`);
  if (!exchange) return new Error("Exchange Monitor not initialized yet.");
  exchange.terminateChartStream(symbol, interval);
  if (logs)
    logger("M:" + monitorId, `Chart Monitor ${symbol}_${interval} stopped!`);

  beholder.deleteMemory(symbol, indexKeys.LAST_CANDLE, interval);
  beholder.deleteMemory(symbol, indexKeys.PREVIOUS_CANDLE, interval);

  if (indexes && Array.isArray(indexes))
    indexes.map((ix) => beholder.deleteMemory(symbol, ix, interval));
}

async function processChartData(
  monitorId,
  symbol,
  indexes,
  interval,
  ohlc,
  logs
) {
  if (typeof indexes === "string") indexes = indexes.split(",");
  if (!indexes || !Array.isArray(indexes) || indexes.length === 0) return false;

  const memoryKeys = [];

  indexes.map((index) => {
    const params = index.split("_");
    const indexName = params[0];
    params.splice(0, 1);

    try {
      const calc = execCalc(indexName, ohlc, ...params);
      if (logs)
        logger(
          "M:" + monitorId,
          `${index}_${interval} calculated: ${JSON.stringify(
            calc.current ? calc.current : calc
          )}`
        );
      beholder.updateMemory(symbol, index, interval, calc, false);

      memoryKeys.push(beholder.parseMemoryKey(symbol, index, interval));
    } catch (err) {
      logger(
        "M:" + monitorId,
        `Exchange Monitor => Can't calc the index ${index}:`
      );
      logger("M:" + monitorId, err);
    }
  });

  return Promise.all(
    memoryKeys.map(async (key) => {
      return beholder.testAutomations(key);
    })
  );
}

async function init(settings, wssInstance, beholderInstance) {
  if (!settings || !beholderInstance)
    throw new Error(
      `You can't init the Exchange Monitor App without his settings. Check your database and/or startup code.`
    );

  WSS = wssInstance;
  beholder = beholderInstance;
  exchange = require("./utils/exchanges")(settings);

  const monitors = await getActiveMonitors();
  monitors.map((m) => {
    setTimeout(() => {
      switch (m.type) {
        case monitorTypes.MINI_TICKER:
          return startMiniTickerMonitor(m.id, m.broadcastLabel, m.logs);
        case monitorTypes.BOOK:
          return startBookMonitor(m.id, m.broadcastLabel, m.logs);
        case monitorTypes.USER_DATA: {
          if (!settings.accessKey || !settings.secretKey) return;
          return startUserDataMonitor(m.id, m.broadcastLabel, m.logs);
        }
        case monitorTypes.CANDLES:
          return startChartMonitor(
            m.id,
            m.symbol,
            m.interval,
            m.indexes ? m.indexes.split(",") : [],
            m.broadcastLabel,
            m.logs
          );
        case monitorTypes.TICKER:
          return startTickerMonitor(m.id, m.symbol, m.broadcastLabel, m.logs);
      }
    }, 250); //Binance only permits 5 commands / second
  });

  // const lastOrders = await ordersRepository.getLastFilledOrders();
  // await Promise.all(
  //   lastOrders.map(async (order) => {
  //     const orderCopy = getLightOrder(order.get({ plain: true }));
  //     await beholder.updateMemory(
  //       order.symbol,
  //       indexKeys.LAST_ORDER,
  //       null,
  //       orderCopy,
  //       false
  //     );
  //   })
  // );

  logger("system", "App Exchange Monitor is running!");
}

module.exports = {
  init,
  startChartMonitor,
  stopChartMonitor,
};
