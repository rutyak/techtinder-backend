const express = require("express");
const connectDB = require("./database");
const userRouter = require("./router/userRouter");
const cors = require("cors");

const cookieParser = require("cookie-parser");

const authRouter = require("./router/authRouter");
const profileRouter = require("./router/profileRouter");
const requestRouter = require("./router/requestRouter");

const app = express();

const port = process.env.PORT;

const corsOPtions = {
  origin: ["http://localhost:5173"],
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOPtions));
app.use(express.json());
app.use(cookieParser());

app.use(authRouter);
app.use(profileRouter);
app.use(requestRouter);
app.use(userRouter);

connectDB()
  .then(() => {
    console.log("Data base connection established !!");

    app.listen(port, () => {
      console.log(`listening on port http://localhost:${port}`);
    });
  })
  .catch(() => {
    console.error("Problem in database connection...");
  });
