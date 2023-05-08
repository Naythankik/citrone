const { default: mongoose } = require("mongoose");

const Module = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "course",
    },
    module: {
      type: String,
      required: [true, "what module is this?"],
    },
    title: {
      type: String,
      required: [true, "please provide the module title"],
      unique: true,
    },
    slug_title: String,
    description: {
      type: String,
      required: [true, "please provide the module description"],
    },
    objectives: {
      type: Array,
      required: [true, "please provide the module objectives"],
    },
    imageUrl: String,
    lesson: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "lesson",
        required: true,
      },
    ],
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "quiz",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("module", Module);
