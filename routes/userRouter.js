const express = require("express");
const {
  createAccount,
  getUserAccount,
  forgetPassword,
  updateUserProfile,
  deactivateAUser,
} = require("../src/controllers/userControllers");

const router = express.Router();

//forget password and reset password
router.post("/forget-password", forgetPassword);

//get a user profile endpoint
router.get("/:id", getUserAccount);
// router.route('/:id').get(getUserAccount)

//create account (signUp) endpoint
router.route("/").post(createAccount);
router.route("/:id").put(updateUserProfile).post(deactivateAUser);

module.exports = router;
