const { Module, Lesson, Course } = require("../models");
const slugify = require("slugify");

// when a user wants to get all the levels of the DBs
const getCoursesLevel = async (req, res) => {
  try {
    const level = await Course.find();
    res.status(200).send({ message: level });
    return;
  } catch (error) {
    throw new Error(error);
  }
};

//create a Course level for the Document
const postCourseLevel = async (req, res) => {
  try {
    await Course.create(req.body);
    res.status(200).send({ message: "course has been created" });
  } catch (error) {
    throw new Error(error);
  }
};

//when a user wants to access all modules for a specified level
const getALevel = async (req, res) => {
  const { level } = req.params;

  //retrieve the id of the level from the request
  const { id } = await Course.findOne({ level });

  //find all the courses of under the level via the id retrieved above
  try {
    const courses = await Module.find({ course: id }).select(["-lesson"]);

    // if course returns null
    if (!courses) {
      res.status(400).send({ error: "no course is found" });
      return;
    }

    res.send({ message: courses });
    return;
    return;
  } catch (error) {
    throw new Error(error);
  }
};

//create a Module for a specific level
const createAModule = async (req, res) => {
  const { level } = req.params;
  //find the level of the course from the document
  const { id } = await Course.findOne({ level });

  //create a slug of the title
  req.body.slug_title = slugify(req.body.title, "_");
  req.body.course = id;

  try {
    const module = await Module.create(req.body);

    // if the module is created, add the id to the course module
    await Course.findOneAndUpdate(
      { level: level },
      { $addToSet: { module: module.id } }
    );

    res.status(200).send({ message: "module has been created successfully" });
  } catch (error) {
    throw new Error(error);
  }
};

//when the user wants to see all lessons for a module
const getModule = async (req, res) => {
  const { title } = req.params;

  try {
    const module = await Module.findOne({ slug_title: title }).populate(
      "lesson"
    );

    res.status(200).send({ lesson: module });
  } catch (error) {
    throw new Error(error);
  }
};

//creating a lesson for a specified module
const createLesson = async (req, res) => {
  try {
    const { id } = await Module.findOne({ slug_title: req.params.title });

    req.body.module = id;

    const lesson = await Lesson.create(req.body);

    //if the lesson is created, retrieve the id and update the parent course
    await Module.findByIdAndUpdate(id, {
      $addToSet: {
        lesson: lesson.id,
      },
    });

    res.status(200).send({ message: lesson });
    return;
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = {
  getCoursesLevel,
  postCourseLevel,
  getALevel,
  createAModule,
  getModule,
  createLesson,
};
