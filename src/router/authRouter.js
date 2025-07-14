const express = require("express");
const User = require("../model/userSchema");
const validateSignup = require("../utils/validateSignup");
const bcrypt = require("bcrypt");
const userAuth = require("../middleware/userAuth");
const validateForgetPassword = require("../utils/validateForgetPassword");
const authRouter = express.Router();
require("dotenv").config();

authRouter.post("/signup", async (req, res) => {
  console.log("SIfgn up is hittting...");
  try {
    //validation
    validateSignup(req);

    const { password, email } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      return res.status(409).json({ message: "User already exists" });
    }

    const tempUser = new User();
    const passwordHash = await tempUser.hashPassword(password);

    await User.create({ ...req.body, password: passwordHash });
    res.status(201).json({ message: "Signup successfully!!" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal server error" });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isValidPassword = await user.passwordCompare(password);
    if (!isValidPassword) {
      res.status(400).json({ message: "Invalid password" });
    }
    const token = await user.generateAuthToken();
    res.cookie("jwtToken", token);
    res.status(200).json({ message: "Login successfully!!" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal server error" });
  }
});

authRouter.post("/logout", (req, res) => {
  res.cookie("jwtToken", null, { expires: new Date(Date.now()) });
  res.status(200).json({ message: "Logout successfully" });
});

authRouter.patch("/forgot/password", userAuth, async (req, res) => {
  try {
    //validation
    validateForgetPassword(req);

    const { oldPassword, newPassword } = req.body;

    const user = req.user;

    const isValidPassword = await user.passwordCompare(oldPassword);
    if (!isValidPassword) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    //hashPass
    const passwordHash = await user.hashPassword(newPassword);

    await User.findByIdAndUpdate(
      user._id,
      { password: passwordHash },
      { new: true, runValidators: true }
    );
    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});
module.exports = authRouter;
