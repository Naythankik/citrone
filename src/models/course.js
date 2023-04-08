const { default: mongoose } = require("mongoose");

const Course = new mongoose.Schema(
  {
    level: {
      type: String,
      enum: ["beginner", "intermediate"],
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
      type: String,
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

module.exports = mongoose.model("course", Course);
