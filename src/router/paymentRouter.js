const express = require("express");
const paymentRouter = express.Router();

paymentRouter.post("/create/order", (req, res) => {
  try {
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

paymentRouter.post("/payment/varification", (req, res) => {
  try {
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

module.exports = paymentRouter;
