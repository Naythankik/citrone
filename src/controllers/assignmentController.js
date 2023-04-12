const Joi = require("joi");

const { Assignment, Module, User } = require("../models");

const getAllAssignments = async (req, res) => {
  try {
    // fetch all assigments from the collection
    const assignment = await Assignment.find().populate({
      path: "module",
      // populate: { path: "lesson" },
    });

    res.status(200).send({ assignment });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
  return;
};

const getAnAssignment = async (req, res) => {
  // destructure the parameters from the request and fetch the id
  const { id } = req.params;

  // use the id to fetch the details of the document
  try {
    const assignment = await Assignment.findById(id).select(["-module"]);

    // if it fails, send an error to the user
    if (!assignment) {
      res.status(400).send({ error: "assignment not found" });
      return;
    }

    //send the success response to the user
    res.status(200).send({ assignment });
  } catch (error) {
    throw new Error(error);
  }
  return;
};

const submitAssignment = async (req, res) => {
  // fetch the user id from the payload
  const { userId } = req.payload;

  // destructure the parameters from the request and fetch the id
  const { id } = req.params;

  //validate the request form from the user
  const submissionValidation = Joi.object({
    answer: Joi.string().required(),
    mail: Joi.boolean(),
  });

  const { error, value } = submissionValidation.validate(req.body);

  //if error is true, return a 400 status to the user
  if (error) {
    res.status(400).send({ error: error.details[0].message });
    return;
  }

  try {
    //find the assignment document from the collection
    const assignment = await Assignment.findById(id);

    //check if the assignment is still up for submission
    // if false , send a 400 status to the user
    if (assignment.dueDate < Date.now()) {
      res.status(400).send({ error: "assignment is obsolete" });
      return;
    }

    //check if the user have submitted
    for (let learner of assignment.submissions) {
      //check for the id of the user
      if (learner.user == userId) {
        //the re-submit button is sent,update the user assigment
        learner.answer = value.answer;

        await assignment.save();

        res
          .status(200)
          .send({ message: "assignment has been re-submitted successfully" });
        return;
      }
    }

    //if true, append the answer to the document
    await Assignment.findByIdAndUpdate(id, {
      $addToSet: {
        submissions: {
          user: userId,
          answer: value.answer,
          mail: value.mail,
        },
      },
    });

    // if the submission is successful, update the user document
    await User.findByIdAndUpdate(userId, {
      $addToSet: {
        assignment: id,
      },
    });

    //then send a 200 status to the user
    res.status(200).send({ message: "assignment submitted successfully" });
  } catch (error) {
    res.status(400).send({ error: error.message });
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

    //check if the assigment exist,
    //a module can have only one assignment
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

const updateAssignment = async (req, res) => {
  // destructure the parameters from the request and fetch the id
  const { id } = req.params;

  try {
    //find the document using the id and update
    const assignment = await Assignment.findByIdAndUpdate(id, req.body);

    // if it returns null, send a failed response to the user
    if (!assignment) {
      res.status(400).send({ error: "assigment not found" });
      return;
    }

    //return a success response to the user
    res
      .status(200)
      .send({ message: "assignment has been updated", data: assignment });
  } catch (error) {
    throw new Error(error);
  }
  return;
};

const deleteAssignment = async (req, res) => {
  // destructure the parameters from the request and fetch the id
  const { id } = req.params;

  try {
    //find the document using the id and delete
    const assignment = await Assignment.findByIdAndDelete(id);

    // if it returns null, send a failed response to the user
    if (!assignment) {
      res.status(400).send({ error: "assigment not found" });
      return;
    }

    //return a success response to the user
    res.status(200).send({ message: "assignment has been deleted" });
  } catch (error) {
    throw new Error(error);
  }
  return;
};

module.exports = {
  getAllAssignments,
  getAnAssignment,
  submitAssignment,
  createAssignment,
  updateAssignment,
  deleteAssignment,
};
