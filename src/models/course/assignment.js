const mongoose = require("mongoose");

const AssignmentSchema = new mongoose.Schema(
  {
    module: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "module",
      required: [true, "module required"],
    },
    name: {
      type: String,
      required: [true, " please provide the assignment name"],
    },
    tutor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: [true, "tutor id is required"],
    },
    question: {
      type: String,
      required: [true, "please provide the question"],
    },
    resources: {
      type: String,
    },
    dueDate: {
      type: Date,
      required: [true, "please provide a submission deadline"],
    },
    submissions: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
        },
        answer: String,
        grade: Number,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("assignment", AssignmentSchema);
