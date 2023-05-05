const Joi = require("joi");
const { Lesson, Quiz } = require("../models");
const { Module } = require("../models");

const getQuiz = async (req, res) => {
  const { title } = req.params;

  try {
    // fetch the id using the title slug
    const { id } = await Lesson.findOne({ slug_title: title });

    //use the destructed id to fetch the quiz from Quiz Collection
    const quiz = await Quiz.findOne({ lesson: id });

    res.status(200).send(quiz);
    return;
  } catch (error) {
    throw new Error(error);
  }
};

const postQuiz = async (req, res) => {
  const { title } = req.params;

  try {
    // fetch the id using the title slug
    const { id } = await Module.findOne({ slug_title: title });

    const quizValidation = Joi.object({
      questions: Joi.array()
        .items(
          Joi.object({
            body: Joi.string().lowercase().required(),
            options: Joi.array().required(),
            answer: Joi.string().valid("a", "b", "c", "d").required(),
          })
        )
        .required(),
    });

    const { error, value } = quizValidation.validate(req.body);

    //if error is true
    if (error) {
      res.status(400).send({ message: error.details[0].message });
      return;
    }

    // check if the quiz has been created before
    const quizExist = await Quiz.findOne({ module: id });

    // if it exists, then add to the set of questions
    if (quizExist) {
      const { questions } = quizExist;

      //check if the question string exist,
      // if true
      questions.filter((question) => {
        if (question.body == value.questions[0].body) {
          res.status(400).send({ message: "question is in quiz already" });
          return;
        }
      });

      // if false, add the question to the quiz document that exist already
      await Quiz.findOneAndUpdate(
        { module: id },
        {
          $addToSet: { questions: value.questions },
        }
      );

      res.status(200).send({ message: "question has been added to quiz" });
      return;
    }

    // create the module field to be added to the quiz document
    value.module = id;

    // else creata a new document of the quiz
    const quiz = await Quiz.create(value);

    //if the quiz is created, update the module document with the id
    await Module.findByIdAndUpdate(id, {
      quiz: quiz.id,
    });

    res.status(200).send({ message: quiz });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
  return;
};

const updateQuiz = async (req, res) => {
  const { title } = req.params;

  try {
    // fetch the id using the title slug
    const { id } = await Lesson.findOne({ slug_title: title });

    // valdiate the entries provided by the admin
    const quizValidation = Joi.object({
      questions: Joi.array().items(
        Joi.object({
          body: Joi.string().lowercase().required(),
          options: Joi.array().required(),
          answer: Joi.string().valid("a", "b", "c", "d").required(),
        })
      ),
    });

    const { error, value } = quizValidation.validate(req.body);

    //if error is true
    if (error) {
      res.status(400).send({ message: error.details[0].message });
      return;
    }

    try {
      //check if the quiz is in the DB
      //if true, update the question field
      const quiz = await Quiz.findOneAndUpdate(
        { lesson: id },
        { $addToSet: { questions: value.questions[0] } }
      );

      res.status(200).send({ message: "quiz has been updated" });
    } catch (error) {
      throw new Error(error);
    }
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = {
  getQuiz,
  postQuiz,
  updateQuiz,
};
