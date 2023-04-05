const express = require("express");
const {
  createAccount,
  getUserAccount,
  userLogin,
  forgetPassword,
  updateUserProfile,
  userLogout,
  deactivateAUser,
} = require("../src/controllers/userControllers");
const { authentication } = require("../src/middlewares/authentication");

const router = express.Router();

//forget password and reset password
router.post("/forget-password", forgetPassword);

// login endpoint
router.post("/login", userLogin);

// logout endpoint
router.get("/logout", authentication, userLogout);

//create account (signUp) endpoint
router
  .route("/")
  .post(createAccount)
  .get(authentication, getUserAccount)
  .put(authentication, updateUserProfile);
router.route("/:id").post(deactivateAUser);

module.exports = router;
