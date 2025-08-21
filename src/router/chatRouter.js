const express = require("express");
const Chat = require("../model/chat");
const userAuth = require("../middleware/userAuth");
const chatRouter = express.Router();

chatRouter.get("/chat/:targetUserId", userAuth, async (req, res) => {
  try {
    const { targetUserId } = req.params;
    const userId = req.user._id;

    const chat = await Chat.find({
      paticipants: { $all: [userId, targetUserId] },
    }).populate({
      path: "messages.senderId",
      select: "firstname lastname",
    });

    if (!chat) {
      return res.status(400).json({ message: "No chat data available" });
    }

    res.status(200).json({ message: "Chat fetched successfully", chat });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

module.exports = chatRouter;
