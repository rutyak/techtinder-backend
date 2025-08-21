const express = require("express");
const connectDB = require("./database");
const userRouter = require("./router/userRouter");
const cors = require("cors");
const initializeSocket = require("./utils/socket");
const http = require("http");

const cookieParser = require("cookie-parser");

const authRouter = require("./router/authRouter");
const profileRouter = require("./router/profileRouter");
const requestRouter = require("./router/requestRouter");
const paymentRouter = require("./router/paymentRouter");
const chatRouter = require("./router/chatRouter");

const app = express();
const server = http.createServer(app);
initializeSocket(server);

app.use("/uploads", express.static("uploads"));

const port = process.env.PORT;

const corsOptions = {
  origin: ["http://localhost:5173", "https://techtinder.netlify.app"],
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "x-razorpay-signature",
    "Accept",
    "x-rtb-fingerprint-id",
  ],
  exposedHeaders: ["x-rtb-fingerprint-id"],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

app.use(authRouter);
app.use(profileRouter);
app.use(requestRouter);
app.use(userRouter);
app.use(paymentRouter);
app.use(chatRouter);

connectDB()
  .then(() => {
    console.log("Data base connection established !!");

    server.listen(port, () => {
      console.log(`listening on port http://localhost:${port}`);
    });
  })
  .catch(() => {
    console.error("Problem in database connection...");
    process.exit(1);
  });
