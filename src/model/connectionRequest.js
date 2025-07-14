const mongoose = require("mongoose");

const connectionRequest = new mongoose.Schema({
  fromUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  toUserId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  status: {
    type: String,
    enum: {
      values: ["interested", "ignored", "accepted", "rejected"],
      messsage: "Invalid status",
    },
    default: "interested",
  },
  updatedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

connectionRequest.index({ fromUserId: 1, toUserId: 1 }, { unique: true });

connectionRequest.pre("save", function (next) {
  if (this.fromUserId.equals(this.toUserId)) {
    throw new Error("Cannot send a connection request to yourself");
  }
  next();
});

const ConnectionRequest = mongoose.model(
  "ConnectionRequest",
  connectionRequest
);
module.exports = ConnectionRequest;
