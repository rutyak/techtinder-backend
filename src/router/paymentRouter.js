const express = require("express");
const paymentRouter = express.Router();
const userAuth = require("../middleware/userAuth");
const instance = require("../utils/razorpay");
const Payment = require("../model/payment");
const membershipAmount = require("../utils/constants");
const {
  validateWebhookSignature,
} = require("razorpay/dist/utils/razorpay-utils");
require("dotenv").config();

paymentRouter.post("/payment/create", userAuth, async (req, res) => {
  console.log("create payment hit");
  try {
    const { membershipType } = req.body;
    const { firstname, lastname, email } = req.user;

    console.log("membershipType: ", membershipType);
    console.log("object in backend: ", membershipAmount);
    console.log("amount in backend: ", membershipAmount[membershipType] * 100);

    const order = await instance.orders.create({
      amount: membershipAmount[membershipType] * 100,
      currency: "INR",
      receipt: "receipt#1",
      notes: {
        firstname,
        lastname,
        email,
        membershipType,
      },
    });

    const amountInRupees = (order.amount / 100).toFixed(2);

    //save
    const paymentRes = await Payment.create({
      userId: req.user._id,
      orderId: order.id,
      status: order.status,
      amount: amountInRupees,
      currency: order.currency,
      receipt: order.receipt,
      notes: order.notes,
    });

    let payment = {
      ...paymentRes.toJSON(),
      keyId: process.env.RAZORPAY_KEY_ID,
    };

    res.status(200).json({ message: "Order created successfully", payment });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: error.error?.description || error.message || "Unknown error",
    });
  }
});

paymentRouter.post("/payment/webhook", async (req, res) => {
  try {
    const webhookSignature = req.headers["x-razorpay-signature"];

    const isWebhookValid = validateWebhookSignature(
      JSON.stringify(req.body),
      webhookSignature,
      process.env.RAZORPAY_WEBHOOK_SECRET
    );

    if (!isWebhookValid) {
      return res.status(400).json({ message: "Webhook signature is invalid" });
    }

    const paymentDetails = req.body.payload.payment.entity;

    const payment = await Payment.findOne({ orderId: paymentDetails.order_id });
    if (!payment) {
      return res.status(400).json({ message: "Payment record not found" });
    }

    payment.status = paymentDetails.status;
    await payment.save();

    const user = await User.findById(payment.userId);
    if (user && paymentDetails.status === "captured") {
      user.isPremium = true;
      user.membershipType = payment.notes.membershipType;
      await user.save();
    }

    res.status(200).json({ message: "Payment successfull" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

module.exports = paymentRouter;
