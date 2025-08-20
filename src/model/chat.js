const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const chatSchema = new mongoose.Schema({
  paticipants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  }],
  messages: [messageSchema],
});

const Chat = mongoose.model("chat", chatSchema);
module.exports = Chat;
