const { default: mongoose } = require("mongoose");

const Quiz = new mongoose.Schema(
  {
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "lesson",
    },
    questions: [
      {
        body: String,
        options: Array,
        answer: {
          type: String,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("quiz", Quiz);
