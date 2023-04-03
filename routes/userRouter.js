const express = require("express");
const {
  createAccount,
  getUserAccount,

  forgetPassword,
} = require("../src/controllers/userControllers");

const router = express.Router();

//forget password and reset password
router.post("/forget-password", forgetPassword);

//get a user profile endpoint
router.get("/:id", getUserAccount);
// router.route('/:id').get(getUserAccount)

//create account (signUp) endpoint
router.post("/", createAccount);

module.exports = router;
