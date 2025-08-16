const express = require("express");
const userAuth = require("../middleware/userAuth");
const validateProfileEdit = require("../utils/validateProfileEdit");
const User = require("../model/user");
const upload = require("../storage/multer");
const profileRouter = express.Router();

profileRouter.post(
  "/upload/image",
  userAuth,
  (req, res, next) => {
    upload.single("profileImage")(req, res, (err) => {
      if (err) {
        console.error("Multer/Cloudinary Error:", err);
        return res.status(400).json({
          message: "Image upload failed",
          error: err.message || err,
        });
      }
      next();
    });
  },
  async (req, res) => {

    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const imageurl = req.file.path;

      const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        { imageurl },
        { new: true }
      );

      return res.status(200).json({
        message: "Image uploaded successfully",
        imageurl: updatedUser.imageurl,
      });
    } catch (error) {
      console.error("Upload Error:", error);
      return res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
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
