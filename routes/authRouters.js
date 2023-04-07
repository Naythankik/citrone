const express = require("express");
const {
  createAccount,
  userLogin,
  forgetPassword,
  userLogout,
} = require("../src/controllers/auth");
const { authentication } = require("../src/middlewares/authentication");
const {generateSignUpMail,verifySignUpMail} = require("../src/middlewares/createAccount")

const router = express.Router();

//forget password and reset password
router.post("/forget-password", forgetPassword);

// login endpoint
router.post("/login", userLogin);

// logout endpoint
router.get("/logout", authentication, userLogout);

//create account (signUp) endpoint
router.route("/").post(createAccount, generateSignUpMail);

// router.post("/deactivate", authentication, deactivateAUser);

module.exports = router;
