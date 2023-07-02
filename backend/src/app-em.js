const WebSocket = require("ws");
const crypto = require("./utils/crypto");
const ordersRepository = require("./repositories/ordersRepository");
const { orderStatus } = require("./repositories/ordersRepository");
const monitorsRepository = require("./repositories/monitorsRepository");

let WSS, beholder, exchange;

function startMiniTickerMonitor(broadCastLabel, logs) {
  if (!exchange) return new Error("Exchamge Monitor not initialized yet!");
  exchange.miniTickerStream((markets) => {
    if (logs) console.log(markets);

    if (broadCastLabel && WSS) WSS.broadcast({ [broadCastLabel]: markets });
  });
}

async function init(settings, wssInstance, beholderInstance) {
  if (!settings || !beholderInstance)
    throw new Error(
      `Can´t start Exchange Monitor without settings and/or beholderInstance`
    );

  WSS = wssInstance;
  beholder = beholderInstance;
  exchange = require("./utils/exchanges")(settings);

  const monitors = await monitorsRepository.getActiveMonitors();
  monitors.map((monitor) => {
    setTimeout(() => {
      switch (monitor.type) {
        case monitorsRepository.monitorTypes.MINI_TICKER:
          return startMiniTickerMonitor(monitor.broadCastLabel, monitor.logs);
        case monitorsRepository.monitorTypes.BOOK:
          return;
        case monitorsRepository.monitorTypes.USER_DATA:
          return;
        case monitorsRepository.monitorTypes.CANDLES:
          return;
      }
    }, 250);
  });

  console.log(`App Exchange Monitor is running.`);
}

module.exports = (settings, wss) => {
  // if (!settings)
  //   throw new Error(`Can´t start Exchange Monitor without settings`);
  // settings.secretKey = crypto.decrypt(settings.secretKey);
  // const exchange = require("./utils/exchanges")(settings);

  // exchange.miniTickerStream((markets) => {
  //   // console.log(markets);
  //   broadcast({ miniTicker: markets });

  //   //simulação de book
  //   const books = Object.entries(markets).map((mkt) => {
  //     return { symbol: mkt[0], bestAsk: mkt[1].close, bestBid: mkt[1].close };
  //   });
  //   broadcast({ book: books });
  //   //fim da simulação de book
  // });

  function processExecutionData(executionData) {
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

      const isQuoteCommission =
        executionData.N && order.symbol.endsWith(executionData.N);
      order.net = isQuoteCommission
        ? quoteAmount - parseFloat(order.commission)
        : quoteAmount;
    }

    if (order.status === orderStatus.REJECTED) order.obs = executionData.r;

    setTimeout(() => {
      ordersRepository
        .updateOrderByOrderId(order.orderId, order.clientOrderId, order)
        .then((order) => order && broadcast({ execution: order }))
        .catch((err) => console.error(err));
    }, 3000);
  }

  exchange.userDataStream(
    (balanceData) => {
      broadcast({ balance: balanceData });
    },
    (executionData) => {
      processExecutionData(executionData);
    }
  );
};
