const express = require("express");
const {
  createAccount,
  getUserAccount,
} = require("../src/controllers/userControllers");

const router = express.Router();

//get a user profile endpoint
router.get("/:id", getUserAccount);

//create account (signUp) endpoint
router.post("/", createAccount);

module.exports = router;
