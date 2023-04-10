const express = require("express");
const router = express.Router();

const {
  createChat,
  getUserChatsWithAnotherUser,
} = require("../src/controllers/chatControllers");
const { authentication } = require("../src/middlewares/authentication");

router.post("/", authentication, createChat);
router.get("/:friendId",authentication, getUserChatsWithAnotherUser);

module.exports = router;
 