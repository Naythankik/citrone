const express = require("express");
const router = express.Router();

const {
  createChat,
  getUserChatsWithAnotherUser,
  getAllChatsOfAUser,
} = require("../src/controllers/chatControllers");
const { authentication } = require("../src/middlewares/authentication");

router.route("/", authentication).post(createChat).get(getAllChatsOfAUser);
router.get("/:friendId", authentication, getUserChatsWithAnotherUser);

module.exports = router;
