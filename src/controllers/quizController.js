const { Lesson, Quiz } = require("../models");

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
    const { id } = await Lesson.findOne({ slug_title: title });

    req.body.lesson = id;

    const quiz = await Quiz.create(req.body);

    //if the quiz is created, update the lesson document with the id
    await Lesson.findByIdAndUpdate(id, {
      $addToSet: { quiz: id },
    });

    res.status(200).send({ message: quiz });
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = {
  getQuiz,
  postQuiz,
};
