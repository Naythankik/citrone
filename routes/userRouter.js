const express = require("express");
const {
  createAccount,
  getUserAccount,
  forgetPassword,
  resetPassword,
} = require("../src/controllers/userControllers");

const router = express.Router();

//forget password and reset password
router.get("/forget-password", forgetPassword);
router.post("reset-password/:token", resetPassword);

//get a user profile endpoint
router.get("/:id", getUserAccount);
// router.route('/:id').get(getUserAccount)

//create account (signUp) endpoint
router.post("/", createAccount);

module.exports = router;
