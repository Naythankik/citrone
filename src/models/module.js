const { default: mongoose } = require("mongoose");

const Module = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "course",
    },

    module: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
      unique: true,
    },
    slug_title: String,
    description: {
      type: String,
      required: true,
    },
    objectives: {
      type: Array,
      required: true,
    },
    lesson: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "lesson",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("module", Module);
