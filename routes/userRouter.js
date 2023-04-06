const express = require("express");
const {
  getUserAccount,
  updateUserProfile,
} = require("../src/controllers/userControllers");

const router = express.Router();

router.route("/").get(getUserAccount).put(updateUserProfile);

module.exports = router;
