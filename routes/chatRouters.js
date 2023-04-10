const express = require("express");
const router = express.Router();

const { createChat } = require("../src/controllers/chatControllers");
const { authentication } = require("../src/middlewares/authentication");

router.post("/", authentication, createChat);

module.exports = router;
