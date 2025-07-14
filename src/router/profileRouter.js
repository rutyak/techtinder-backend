const express = require("express");
const userAuth = require("../middleware/userAuth");
const validateProfileEdit = require("../utils/validateProfileEdit");
const User = require("../model/userSchema");
const profileRouter = express.Router();

profileRouter.get("/profile/view", userAuth, (req, res) => {
  try {
    const user = req.user;
    res.status(200).json({ message: "User data fetched successfully", user });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    //validation
    validateProfileEdit(req);

    const user = req.user;

    await User.findByIdAndUpdate(user._id, req.body, {
      new: true,
      runValidator: true,
    });
    res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

module.exports = profileRouter;
