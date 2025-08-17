const express = require("express");
const User = require("../model/user");
const validateSignup = require("../utils/validateSignup");
const bcrypt = require("bcrypt");
const userAuth = require("../middleware/userAuth");
const validateForgetPassword = require("../utils/validateForgetPassword");
const authRouter = express.Router();
require("dotenv").config();

authRouter.post("/signup", async (req, res) => {
  try {
    //validation
    // validateSignup(req);
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

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isValidPassword = await user.passwordCompare(password);
    if (!isValidPassword) {
      return res.status(400).json({ message: "Invalid password" });
    }
    const token = await user.generateAuthToken();

    res.cookie("jwtToken", token, {
      httpOnly: process.env.NODE_ENV === "production",
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ message: "Login successfully!!", user });
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal server error" });
  }
});

authRouter.post("/logout", (req, res) => {
  res.cookie("jwtToken", null, { expires: new Date(Date.now()) });
  res.status(200).json({ message: "Logout successfully" });
});

authRouter.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Please add email address" });
    }

    const user = await User.find({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
    console.error(error);
  }
});

authRouter.patch("/reset-password", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Password required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    //hashPass
    const passwordHash = await user.hashPassword(password);

    await User.updateOne(
      { email },
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
