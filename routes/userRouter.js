const express = require("express");
const {
  getCoursesLevel,
  getALevel,
  getModule,
  createLesson,
  createAModule,
  postCourseLevel,
} = require("../src/controllers/moduleController");
const { getQuiz, postQuiz } = require("../src/controllers/quizController");
const {
  getUserAccount,
  updateUserProfile,
} = require("../src/controllers/userControllers");
const authorization = require("../src/middlewares/authorization");

const router = express.Router();

router.route("/").get(getUserAccount).put(updateUserProfile);

// routes for the courses, modules, lessons and quizzes
router
  .route("/courses")
  .get(getCoursesLevel)
  .post(authorization, postCourseLevel);
router.route("/:level/course").get(getALevel).post(createAModule);
router.route("/:level/course/:title").get(getModule).post(createLesson);
router.route("/:level/course/:title/quiz").get(getQuiz).post(postQuiz);

module.exports = router;
