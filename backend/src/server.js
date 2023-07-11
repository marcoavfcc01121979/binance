const database = require("./db");
const app = require("./app");

const appWs = require("./app-ws");

const settingsRepository = require("./repositories/settingsRepository");

const appEm = require("./app-em");
const beholder = require("./beholder");

(async () => {
  console.log("Getting the default settings...");
  const settings = await settingsRepository.getDefaultSettings();
  if (!settings) return new Error(`There is not settings.`);

  console.log("Initializing the beholder Brain...");
  beholder.init([]);

  console.log("Starting the Server Apps...");
  const server = app.listen(process.env.PORT || 3001, () => {
    console.log("App is running.");
  });
  const wss = appWs(server);
  await appEm.init(settings, wss, beholder);
})();
