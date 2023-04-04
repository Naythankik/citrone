const express = require("express");
const {
  createAccount,
  getUserAccount,
  userLogin,
  forgetPassword,
  updateUserProfile,
} = require("../src/controllers/userControllers");

const router = express.Router();

//forget password and reset password
router.post("/forget-password", forgetPassword);
router.post('/login', userLogin);

//get a user profile endpoint
router.get("/:id", getUserAccount);
// router.route('/:id').get(getUserAccount)

//create account (signUp) endpoint
router.route("/").post(createAccount);
router.put("/:id", updateUserProfile);

module.exports = router;
