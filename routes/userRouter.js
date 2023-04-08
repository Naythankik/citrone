const express = require("express");
const {
  getLevels,
  getALevel,
  createACourse,
  getModule,
  createModule,
} = require("../src/controllers/coursesController");
const {
  getUserAccount,
  updateUserProfile,
} = require("../src/controllers/userControllers");

const router = express.Router();

router.route("/").get(getUserAccount).put(updateUserProfile);
router.get("/courses", getLevels);
router.route("/:level/course").get(getALevel).post(createACourse);
router.route("/:level/course/:title").get(getModule).post(createModule);

module.exports = router;
