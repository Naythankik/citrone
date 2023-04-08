const { default: mongoose } = require("mongoose");

const Lesson = new mongoose.Schema(
  {
    module: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "module",
        select: false,
      },
    title: {
      type: String,
      unique: true,
      required: [true, 'please provide the lesson title']
    },
    description: {
      type: String,
      required: [true, 'please provide the lesson description'],
    },
    slides: {
      type: String,
      required: [true, 'please provide the links to the slides'],
    },
    recorded_session: {
      type: String,
      required: [true, 'please provide the recorded session links'],
    },
    assignment: {
      type: String,
      required: [true, 'please provide the assignment links'],
    },
    quiz: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "quiz",
        required: [true, 'please provide the quiz reference'],
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("lesson", Lesson);
