const mongoose = require("mongoose");
const ChatSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, "you can send an empty text message"],
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: [true, "senderId is required"],
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: [true, "receiverId is required"],
    },
    read: {
        type: Boolean,
        default: false,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Chat', ChatSchema);