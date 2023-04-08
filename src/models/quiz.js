const { default: mongoose } = require("mongoose");

const Quiz = new mongoose.Schema(
  {
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "lesson",
      required: true
    },
    questions: [
      {
        body: String,
        options: Array,
        answer: {
          type: String,
          enum: ['a', 'b', 'c', 'd'],
          required: [true, 'please provide the answer']
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("quiz", Quiz);
