const { Course, Lesson } = require("../models/");
const slugify = require("slugify");

// when a user wants to get all the levels of the DBs
const getLevels = (req, res) => {
  const level = {
    levels: ["beginner", "intermediate"],
  };

  res.status(200).send({ message: level });
  return;
};

//when a user wants to access all modules for a specified level
const getALevel = async (req, res) => {
  const { level } = req.params;

  //find all the courses of the level requeested by the user
  try {
    const courses = await Course.find({ level }).select(["-lesson"]);

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

//create a course for a specific level
const createACourse = async (req, res) => {
  req.body.level = req.params.level;

  //create a slug of the title
  req.body.slug_title = slugify(req.body.title, "_");

  try {
    await Course.create(req.body);
    res.status(200).send({ message: "course is created successfully" });
  } catch (error) {
    throw new Error(error);
  }
};

//when the user wants to see all lessons for a module
const getModule = async (req, res) => {
  const { title } = req.params;

  try {
    const module = await Course.findOne({ slug_title: title }).populate(
      "lesson"
    );

    res.status(200).send({ lesson: module });
  } catch (error) {
    throw new Error(error);
  }
};

//creating a lesson for a specified module
const createModule = async (req, res) => {
  try {
    const { id } = await Course.findOne({ slug_title: req.params.title });

    req.body.course = id;

    const lesson = await Lesson.create(req.body);

    //if the lesson is created, retrieve the id and update the parent course
    await Course.findByIdAndUpdate(id, {
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
  getLevels,
  getALevel,
  createACourse,
  getModule,
  createModule,
};
