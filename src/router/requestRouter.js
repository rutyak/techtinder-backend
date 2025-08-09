const express = require("express");
const { findById } = require("../model/connectionRequest");
const ConnectionRequest = require("../model/connectionRequest");
const userAuth = require("../middleware/userAuth");
const User = require("../model/userSchema");
const { default: mongoose } = require("mongoose");
const requestRouter = express.Router();

requestRouter.post("/request/send/:status/:id", userAuth, async (req, res) => {
  console.log("request hit: ");

  try {
    const fromUserId = req.user._id;
    const toUserId = req.params.id;
    const status = req.params.status;

    const isValidUserId = await User.findById(toUserId);
    if (!isValidUserId) {
      return res.status(400).json({ message: "User id is invalid" });
    }

    if (fromUserId.equals(toUserId)) {
      return res
        .status(400)
        .json({ message: "Cannot send a request to yourself" });
    }

    const allowedStatus = ["interested", "ignored", "superinterested"];
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const isExistingReq = await ConnectionRequest.findOne({
      $or: [
        { fromUserId, toUserId },
        { fromUserId: toUserId, toUserId: fromUserId },
      ],
    });
    if (isExistingReq) {
      return res.status(400).json({ message: "Request already exists" });
    }

    const connectionReq = await ConnectionRequest.create({
      fromUserId,
      toUserId,
      status,
    });

    res.status(201).json({
      message: "Request sent successfully",
      connectionReq,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

requestRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    console.log("accept reject hit");

    try {
      const loggedInUser_id = req.user._id;
      const { status, requestId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(requestId)) {
        return res.status(400).json({ message: "Invalid request ID format" });
      }

      let allowedStatus = ["accepted", "rejected"];
      if (!allowedStatus.includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      let connection = await ConnectionRequest.findOne({
        _id: requestId,
        toUserId: loggedInUser_id,
        status: "interested",
      });
      if (!connection) {
        return res
          .status(404)
          .json({ message: "Invalid connection request or already processed" });
      }

      connection.status = status;
      connection.updatedAt = new Date();
      await connection.save();

      res.status(200).json({
        message: `${status} successfully!`,
        connection,
      });
    } catch (error) {
      res
        .status(200)
        .json({ message: "Internal server error", error: error.message });
    }
  }
);

module.exports = requestRouter;
