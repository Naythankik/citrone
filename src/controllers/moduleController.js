const { Module, Lesson, Course, Assignment } = require("../models");
const slugify = require("slugify");
const Joi = require("joi");

const { uploadImage } = require("../utils/uploadImage");

// when a user wants to get all the levels of the DBs
const getCoursesLevel = async (req, res) => {
  try {
    const level = await Course.find().select(["-module", "-_id"]);
    res.status(200).send({ message: level });
    return;
  } catch (error) {
    throw new Error(error);
  }
};

//create a Course level for the Document
const postCourseLevel = async (req, res) => {
  //validation for the input submitted by the user
  const courseInput = Joi.object({
    level: Joi.string().lowercase().required(),
  });

  const { error, value } = courseInput.validate(req.body);

  //check if error is true and send the response back to the user
  if (error) {
    res.status(400).send({ message: error.details[0].message });
    return;
  }

  // upload the file sent by the user
  // then append the uploaded url to the image url field
  try {
    const result = await uploadImage(req.file.path, value.level);
    value.imageUrl = result.url;

    await Course.create(value);
    res.status(200).send({ message: "course has been created" });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }

  return;
};

//when a user wants to access all modules for a specified level
const getALevelModules = async (req, res) => {
  const { level } = req.params;

  //retrieve the id of the level from the request
  try {
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
    } catch (error) {
      throw new Error(error);
    }
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

  //create a validation to get the value and error of the details submitted by the admin
  const moduleValidation = Joi.object({
    module: Joi.string().required(),
    title: Joi.string().lowercase().required(),
    description: Joi.string().lowercase().required(),

    //accepts an array so as to destructure the entries into a list
    objectives: Joi.array().items(Joi.string().required()).required(),
  });

  const { error, value } = moduleValidation.validate(req.body);

  // if error is true, send a response to the admin
  if (error) {
    res.status(400).send({ message: error.details[0].message });
    return;
  }

  //create a slug of the title
  value.slug_title = slugify(req.body.title, "_");
  value.course = id;

  try {
    //check the incoming file by the admin,
    //made use of slug title so the file upload will be unique
    const result = await uploadImage(req.file.path, value.slug_title);
    value.imageUrl = result.url;

    const module = await Module.create(value);

    // if the module is created, add the id to the course or level module
    await Course.findOneAndUpdate(
      { level: level },
      { $addToSet: { module: module.id } }
    );

    res.status(200).send({ message: "module has been created successfully" });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
  return;
};

//when the user wants to see all lessons for a module
const getModule = async (req, res) => {
  //try destruction of the requset parameter
  try {
    const { title } = req.params;

    try {
      const module = await Module.findOne({ slug_title: title }).populate(
        "lesson"
      );

      res.status(200).send({ lesson: module });
    } catch (error) {
      throw new Error(error);
    }
  } catch (error) {
    throw new Error(error);
  }
};

//creating a lesson for a specified module
const createLesson = async (req, res) => {
  const { id } = await Module.findOne({ slug_title: req.params.title });

  //valiation of the lesson request body
  const lessonValidation = Joi.object({
    title: Joi.string().lowercase().required(),
    description: Joi.string().lowercase().required(),
    slides: Joi.string().lowercase().required(),
    assignment: Joi.string().lowercase().required(),
    recorded_session: Joi.string().lowercase().required(),
  });

  const { error, value } = lessonValidation.validate(req.body);

  //if error is true
  if (error) {
    res.status(400).send({ message: error.details[0].message });
    return;
  }

  value.module = id;

  try {
    const lesson = await Lesson.create(value);

    //if the lesson is created, retrieve the id and update the parent course
    await Module.findByIdAndUpdate(id, {
      $addToSet: {
        lesson: lesson.id,
      },
    });

    res.status(200).send({ success: true, message: lesson });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
  return;
};

module.exports = {
  getCoursesLevel,
  postCourseLevel,
  getALevelModules,
  createAModule,
  getModule,
  createLesson,
};
