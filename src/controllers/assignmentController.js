const Joi = require("joi");
const { Assignment, Module } = require("../models");

const getAllAssignments = async (req, res) => {
  try {
    // fetch all assigments from the collection
    const assignment = await Assignment.find().populate("module");

    res.status(200).send({ assignment });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
  return;
};

const createAssignment = async (req, res) => {
  try {
    const { title } = req.params;

    // check if the module exist
    // if it exist, fetch id
    const { id } = await Module.findOne({ slug_title: title });

    // validate the entry of data
    const assignmentValidation = Joi.object({
      name: Joi.string().required(),
      question: Joi.string().required(),
      resources: Joi.string().required(),
    });

    const { error, value } = assignmentValidation.validate(req.body);

    //if error is true
    if (error) {
      res.status(400).send({ error: error.details[0].message });
      return;
    }

    //check if the assigment exist
    const assignmentExist = await Assignment.findOne({ module: id });

    if (assignmentExist) {
      res.status(400).send({ error: "assignment exist" });
      return;
    }

    // assign values to the field
    value.dueDate = Date.now() + 1000 * 60 * 60 * 24 * 3;
    value.module = id;
    value.tutor = req.payload.userId;

    await Assignment.create(value);

    res
      .status(200)
      .send({ message: "Assignment has been posted successfully" });
    return;
  } catch (error) {
    throw new Error(error);
  }
  return;
};

module.exports = {
  getAllAssignments,
  createAssignment,
};
