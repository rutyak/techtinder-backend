const express = require("express");
const userRouter = express();
const User = require("../model/userSchema");
const userAuth = require("../middleware/userAuth");
const { populate } = require("../model/connectionRequest");
const ConnectionRequest = require("../model/connectionRequest");

const USER_SAFE_DATA = "firstname lastname age gender skills";

userRouter.get("/user/request/received", userAuth, async (req, res) => {
  try {
    const loggedInUser_id = req.user._id;
    console.log("loggedInUser_id: ", loggedInUser_id);

    const requests = await ConnectionRequest.find({
      toUserId: loggedInUser_id,
      status: "interested",
    }).populate("fromUserId", USER_SAFE_DATA);

    res.status(200).json({ message: "Fetched successfully!!", requests });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    let loggedInUser_id = req.user._id;

    let connections = await ConnectionRequest.find({
      $or: [
        { fromUserId: loggedInUser_id, status: "accepted" },
        { toUserId: loggedInUser_id, status: "accepted" },
      ],
    })
      .populate("fromUserId", USER_SAFE_DATA)
      .populate("toUserId", USER_SAFE_DATA);

    console.log("connections: ", connections);

    let data = connections.map((data) => {
      if (data.fromUserId._id.equals(loggedInUser_id)) {
        return data.toUserId;
      }
      return data.fromUserId;
    });

    res.status(200).json({ message: "Connections fetched successfully", data });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

userRouter.get("/user/feeds", userAuth, async (req, res) => {
  try {
    let loggedInUser_id = req.user._id;
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 50;
    limit = limit > 50 ? 50 : limit;
    let skip = (page - 1) * limit;

    //from connection
    let connections = await ConnectionRequest.find({
      $or: [{ fromUserId: loggedInUser_id }, { toUserId: loggedInUser_id }],
    }).select("fromUserId toUserId");

    //ids array
    let connectionIds = new Set();
    connections.forEach((conn) => {
      connectionIds.add(conn.fromUserId.toString());
      connectionIds.add(conn.toUserId.toString());
    });

    //feeds
    let feeds = await User.find({
      $and: [
        { _id: { $nin: Array.from(connectionIds) } },
        { _id: { $ne: loggedInUser_id } },
      ],
    })
      .select(USER_SAFE_DATA)
      .skip(skip)
      .limit(limit);

    res.status(200).json({ message: "feeds fetched successfully", feeds });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

module.exports = userRouter;
