const express = require("express");
const {
  createAccount,
  userLogin,
  forgetPassword,
  userLogout,
} = require("../src/controllers/auth");
const { authentication } = require("../src/middlewares/authentication");
const { generateSignUpMail } = require("../src/middlewares/createAccount");

const router = express.Router();

//forget password and reset password
router.post("/forget-password", forgetPassword);

// login endpoint
router.post("/login", userLogin,generateSignUpMail);

// logout endpoint
router.get("/logout", authentication, userLogout);

//create account (signUp) endpoint
router.route("/").post(createAccount, generateSignUpMail);

module.exports = router;
