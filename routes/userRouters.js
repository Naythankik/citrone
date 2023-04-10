const express = require("express");
const {
  getUserAccount,
  updateUserProfile
} = require("../src/controllers/userControllers");
const { authentication } = require("../src/middlewares/authentication");

const router = express.Router();

router
  .route("/")
  .get(authentication, getUserAccount)
  .put(authentication, updateUserProfile);

module.exports = router;
