const { default: mongoose } = require("mongoose");

const Lesson = new mongoose.Schema(
  {
    course: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "course",
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
    quiz: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("lesson", Lesson);
