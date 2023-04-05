const express = require("express");
const {
  createAccount,
  getUserAccount,
  userLogin,
  forgetPassword,
  updateUserProfile,
  userLogout
} = require("../src/controllers/userControllers");

const router = express.Router();

//forget password and reset password
router.post("/forget-password", forgetPassword);

// login endpoint
router.post('/login', userLogin);

// logout endpoint
router.get('/logout', userLogout);

//get a user profile endpoint
router.get("/:id", getUserAccount);
// router.route('/:id').get(getUserAccount)

//create account (signUp) endpoint
router.route("/").post(createAccount);
router.put("/:id", updateUserProfile);

module.exports = router;
