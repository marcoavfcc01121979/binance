const express = require("express");
const router = express.Router();
const beholderController = require("../controllers/beholderController");

// router.get('/memory/:symbol?/:index?/:interval?', beholderController.getMemory);

router.get("/brain", beholderController.getBrain);

module.exports = router;
