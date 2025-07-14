const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: [true, "firstname required"],
    trim: true,
    maxLength: 50,
    match: [
      /^[a-zA-Z\-']+$/,
      "First name can only contain letters, hyphens and apostrophes",
    ],
  },
  lastname: {
    type: String,
    trim: true,
    maxLength: 50,
    match: [
      /^[a-zA-Z\-']+$/,
      "Last name can only contain letters, hyphens and apostrophes",
    ],
  },
  email: {
    type: String,
    required: [true, "Email required"],
    lowercase: true,
    trim: true,
    unique: true,
    validate: {
      validator: function (value) {
        return validator.isEmail(value);
      },
      message:
        "Please enter a valid email address format (e.g., user@example.com)",
    },
  },
  age: {
    type: Number,
    min: 18,
    max: 60,
  },
  gender: {
    type: String,
    lowercase: true,
    enum: {
      values: ["male", "female", "others"],
      message: "Gender must be either male, female, or others",
    },
  },
  password: {
    type: String,
    required: true,
    validate: {
      validator: function (value) {
        return validator.isStrongPassword(value, {
          minLength: 8,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
        });
      },
      message:
        "Password must contain: 1 uppercase, 1 lowercase, 1 number, 1 special symbol, and be at least 8 characters long",
    },
  },
  skills: {
    type: [String],
    validate: {
      validator: function (v) {
        return v.length <= 10;
      },
      message: "Skills should not be greater than 10",
    },
  },
});

userSchema.methods.hashPassword = async function (password) {
  return await bcrypt.hash(password, 10);
};

userSchema.methods.passwordCompare = async function (password) {
  if (!password) throw new Error("Password is invalid");
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAuthToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: "2h",
  });
};
const User = mongoose.model("Users", userSchema);

module.exports = User;
