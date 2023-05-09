const express = require("express");
const uploader = require("../src/utils/multer");

const {
  getAllAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  getAnAssignment,
  submitAssignment,
  getSubmission,
  getAUserSubmission,
  gradeAUserSubmission,
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
const assignment = require("../src/models/course/assignment");

const router = express.Router();

router.route("/").get(getUserAccount).put(updateUserProfile);

// routes to get all assigment
router.route("/assignment").get(getAllAssignments);

//update the asssignment by the id
router
  .route("/assignment/:id")
  .get(getAnAssignment)
  .post(submitAssignment)
  .put(authorization, updateAssignment)
  .delete(authorization, deleteAssignment);

// get all submission for an assignment
router
  .get("/assignment/:id/submissions", authorization, getSubmission)
  .get("/assignment/:id/submission/:userId", getAUserSubmission)
  .post("/assignment/:id/submission/:userId", gradeAUserSubmission);

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
  .post(authorization, uploader.single("image"), postCourseLevel);

//routes for getting module of a course level and creating a module for a course level
router
  .route("/:level/course")
  .get(getALevelModules)
  .post(authorization, uploader.single("image"), createAModule);

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
