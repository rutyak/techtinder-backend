const express = require("express");
const connectDB = require("./database");
const userRouter = require("./router/userRouter");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authRouter = require("./router/authRouter");
const profileRouter = require("./router/profileRouter");
const requestRouter = require("./router/requestRouter");

const app = express();
const port = 8000;

app.use(express.json());
app.use(cookieParser());
app.use(cors());

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
