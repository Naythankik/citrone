const Joi = require("joi");

const { Assignment, Module, User } = require("../models");
const assignment = require("../models/course/assignment");
const { mail } = require("../utils");

const getAllAssignments = async (req, res) => {
  try {
    // fetch all assigments from the collection
    const assignment = await Assignment.find()
      .populate({
        path: "module",
        select: "-_id",
        // populate: { path: "lesson" },
      })
      .select(["-_id"]);

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
      res.status(400).send({ succes: false, error: "assignment is obsolete" });
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

  const value = req.body;

  // check if the value is an empty object,
  // if true, return an error to the user
  if (Object.keys(value)) {
    res.status(400).send({ success: false, error: "input can not be empty" });
    return;
  }

  //else
  try {
    //find the document using the id and update
    const assignment = await Assignment.findByIdAndUpdate(id, value);

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
    //find the document using the id
    const assignment = await Assignment.findById(id);

    // if it returns null, send a failed response to the user
    if (!assignment) {
      res.status(400).send({ error: "assigment not found" });
      return;
    }

    // check if the assignment submission field is not empty
    if (assignment.submissions.length > 0) {
      //loop through the submissions if there it is more than zero
      //use the user field to find the user from the user model and update the assignment field on the user document
      for (let user of assignment.submissions) {
        await User.findByIdAndUpdate(user.user, {
          $pull: { assignment: assignment.id },
        });
      }
    }

    //delete the assignment documents
    await assignment.deleteOne();

    //return a success response to the user
    res.status(200).send({ message: "assignment has been deleted" });
  } catch (error) {
    throw new Error(error);
  }
  return;
};

// grading the assignment by the tutor
const getSubmission = async (req, res) => {
  // fetch the assignemnt Id from the request sent
  const { id } = req.params;

  try {
    //find the document of assignment
    const assignment = await Assignment.findById(id).select(["submissions"]);

    // return only the submission field to the admin
    res.status(200).send(assignment);
  } catch (error) {
    res.status(402).send({ success: false, error: error.message });
  }
  return;
};

const getAUserSubmission = async (req, res) => {
  //destruct the request from the incoming endpoint
  const { id, userId } = req.params;
  try {
    // fetch the assignment document
    const assignment = await Assignment.findById(id);

    // assigng the submissions field to a constant
    const submission = assignment.submissions;

    // find the user specified in the submission array,
    // the return the object of the submission
    submission.find((user) => {
      if (user.user == userId) {
        res.status(200).send(user);
      }
    });
  } catch (error) {
    res.status(403).send({ success: false, error: error.mesaage });
  }
  return;
};

const gradeAUserSubmission = async (req, res) => {
  //destruct the request from the incoming endpoint
  const { id, userId } = req.params;

  const learner = await User.findById(userId);

  try {
    // fetch the assignment document
    const assignment = await Assignment.findById(id);

    //  validate the grade coming from the admin
    const gradeValidation = Joi.object({
      grade: Joi.number().min(1).max(100).required(),
    });

    // destruct the validation of the request sent by the admin
    const { error, value } = gradeValidation.validate(req.body);

    //check if there is error,
    //if error , returns a cient error back to the admin
    if (error) {
      res.status(400).send({ succes: false, error: error.details[0].message });
    }

    // assing the submissions field to a constant
    const submission = assignment.submissions;

    try {
      // find the user specified in the submission array,
      // the return the object of the submission
      submission.filter(async (user) => {
        if (user.user == userId) {
          // check if the user has been graded,
          if (user.grade) {
            res.status(400).send({
              success: true,
              message: "grade exist for the user already",
            });
            return;
          }

          // else update the learner grade
          const { modifiedCount } = await Assignment.updateOne(
            { id: id, "submissions.user": userId },
            {
              $set: { "submissions.$.grade": value.grade },
            }
          );

          if (modifiedCount) {
            // check if the user subscribes to receive mail when graded
            if (user.mail) {
              // send mail to the user else do nothing

              const data = {
                to: learner.email,
                subject: "Assignment Grading",
                text: "You are receiving this mail cause you turn the notification",
                html: `<a href="afaffkgvh">The link to see the grade of the assignment</a>`,
              };

              // send the mail to the learner
              mail(data);
            }
          }
        }
      });

      // return a response 200 to the admin
      res.status(200).send({
        success: true,
        message: "assignment has been graded sucessfully",
      });
      return;
    } catch (error) {
      res.status(400).send({ success: false, error: error.message });
      return;
    }
  } catch (error) {
    res.status(403).send({ success: false, error: error.mesaage });
    return;
  }
};

module.exports = {
  getAllAssignments,
  getAnAssignment,
  submitAssignment,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  getSubmission,
  getAUserSubmission,
  gradeAUserSubmission,
};
