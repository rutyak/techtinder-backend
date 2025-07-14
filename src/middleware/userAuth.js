const jwt = require("jsonwebtoken");
const User = require("../model/userSchema");

const userAuth = async (req, res, next) => {
  try {
    const token = req.cookies.jwtToken;
    if (!token) {
      return res.status(400).json({ message: "Please login" });
    }

    const decoded = await jwt.verify(token, process.env.JWT_SECRET_KEY);
    const { id } = decoded;

    const user = await User.findById(id);
    if (!user) {
      return res.status(400).json({ message: "User not exist" });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};

module.exports = userAuth;