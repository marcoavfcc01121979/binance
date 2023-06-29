const WebSocket = require("ws");
const crypto = require("./utils/crypto");

module.exports = (settings, wss) => {
  if (!settings)
    throw new Error(`Can´t start Exchange Monitor without settings`);
  settings.secretKey = crypto.decrypt(settings.secretKey);
  const exchange = require("./utils/exchanges")(settings);

  function broadcast(jsonObject) {
    if (!wss || !wss.clients) return;
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(jsonObject));
      }
    });
  }

  exchange.miniTickerStream((markets) => {
    // console.log(markets);
    broadcast({ miniTicker: markets });

    //simulação de book
    const books = Object.entries(markets).map((mkt) => {
      return { symbol: mkt[0], bestAsk: mkt[1].close, bestBid: mkt[1].close };
    });
    broadcast({ book: books });
    //fim da simulação de book
  });

  exchange.userDataStream(
    (balanceData) => {
      broadcast({ balance: balanceData });
    },
    (executionData) => {
      processExecutionData(executionData);
    }
  );

  console.log(`App Exchange Monitor is running.`);
};
