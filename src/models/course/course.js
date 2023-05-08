const { default: mongoose } = require("mongoose");

const Course = new mongoose.Schema(
  {
    level: {
      type: String,
      unique: true,
    },
    module: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "module",
      },
    ],
    imageUrl: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("courses", Course);
