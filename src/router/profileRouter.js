const express = require("express");
const userAuth = require("../middleware/userAuth");
const validateProfileEdit = require("../utils/validateProfileEdit");
const User = require("../model/userSchema");
const upload = require("../storage/multer");
const profileRouter = express.Router();

profileRouter.post(
  "/upload/image",
  userAuth,
  upload.single("profileImage"),
  (req, res) => {
    console.log("image upload hit");
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const imageurl = req.file.filename;

      res
        .status(200)
        .json({ message: "Image uploaded successfully", imageurl });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  }
);

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

    let userData = await User.findByIdAndUpdate(user._id, req.body, {
      new: true,
      runValidator: true,
    });
    res
      .status(200)
      .json({ message: "Profile updated successfully", user: userData });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

module.exports = profileRouter;
