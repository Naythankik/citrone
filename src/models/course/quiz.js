const { default: mongoose } = require("mongoose");

const Quiz = new mongoose.Schema(
  {
    module: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "module",
      required: true,
    },
    questions: [
      {
        body: {
          type: String,
          unique: true,
        },
        options: Array,
        answer: {
          type: String,
          enum: ["a", "b", "c", "d"],
          required: [true, "please provide the answer"],
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("quiz", Quiz);
