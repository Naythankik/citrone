const express = require("express");
const {
  getAllAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  getAnAssignment,
  submitAssignment,
} = require("../src/controllers/assignmentController");
const {
  getCoursesLevel,
  getALevelModules,
  getModule,
  createLesson,
  createAModule,
  postCourseLevel,
} = require("../src/controllers/moduleController");

const {
  getQuiz,
  postQuiz,
  updateQuiz,
} = require("../src/controllers/quizController");

const {
  getUserAccount,
  updateUserProfile,
} = require("../src/controllers/userControllers");

const authorization = require("../src/middlewares/authorization");

const router = express.Router();

router.route("/").get(getUserAccount).put(updateUserProfile);

// routes for assigment
router.route("/assignment").get(getAllAssignments);

//update the asssignment by the id
router
  .route("/assignment/:id", authorization)
  .get(getAnAssignment)
  .put(updateAssignment)
  .delete(deleteAssignment);

router.post("/assignment/:id", submitAssignment);

//create an assignment for a specific module
router.post(
  "/:level/course/:title/assignment",
  authorization,
  createAssignment
);

// routes for the courses, modules, lessons and quizzes
// routes for getting and setting the courses level
router
  .route("/courses")
  .get(getCoursesLevel)
  .post(authorization, postCourseLevel);

//routes for getting module of a course level and creating a module for a course level
router
  .route("/:level/course")
  .get(getALevelModules)
  .post(authorization, createAModule);

//routes for getting a module and creating a lesson for the module
router
  .route("/:level/course/:title")
  .get(getModule)
  .post(authorization, createLesson);

//routes for quiz
router
  .route("/:level/course/:title/quiz")
  .get(getQuiz)
  .post(authorization, postQuiz)
  .put(authorization, updateQuiz);

module.exports = router;
