const { default: mongoose } = require("mongoose");

const Lesson = new mongoose.Schema(
  {
    module: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "module",
        select: false,
      },
    ],
    title: {
      type: String,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    slides: {
      type: String,
      required: true,
    },
    recorded_session: {
      type: String,
      required: true,
    },
    assignment: {
      type: String,
      required: true,
    },
    quiz: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "quiz",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("lesson", Lesson);
