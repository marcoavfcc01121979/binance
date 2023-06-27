"use strict";
require("dotenv").config();
const bcrypt = require("bcryptjs");
const crypto = require("../src/utils/crypto");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const settingsId = await queryInterface.rawSelect(
      "Settings",
      { where: {}, limit: 1 },
      ["id"]
    );
    if (!settingsId) {
      return queryInterface.bulkInsert("settings", [
        {
          email: "marcoavfcc@gmail.com",
          password: bcrypt.hashSync("123456"),
          apiUrl: "https://testnet.binance.vision/api/",
          streamUrl: "wss://testnet.binance.vision/ws/",
          accessKey:
            "RyZOon5ks56CHXBZNMTIKdl7mKRVNpzGL7zmj9Rg63A4bQiasKFn03aXVatnChH8",
          secretKey: crypto.encrypt(
            "2wRSKaoB5rjoso0hsz527kZT9GwgG1HtIUQM0jEm4XIthXsDeUIyp6kvffhlMP5q"
          ),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
    }
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete("settings", null, {});
  },
};
