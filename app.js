const express = require("express");
require("dotenv").config();
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const connection = require("./config/dbConnection");
const userRouter = require("./routes/userRouter");
const { authRouter } = require("./routes/index");
const chatRouter = require("./routes/chatRouters");

const cors = require("cors");

const { resetPassword } = require("./src/controllers/userControllers");
const { verifySignUpMail } = require("./src/middlewares/createAccount");
const { authentication } = require("./src/middlewares/authentication");
const { User } = require("./src/models");

const app = express();
const PORT = process.env.PORT;
connection(); //server connection function

//Middlewares

app.use(cors({ origin: process.env.APP_URL, credentials: true }));

app.use(express.json());
app.use(logger("dev")); //logger to log every request and response summary

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.get("/api/citrone/getUsers", async (req, res) => {
  try {
    const users = await User.find().select([
      "firstName",
      "lastName",
      "email",
      "username",
      "phoneNumber",
    ]);
    res.status(200).send({ message: users });
  } catch (error) {
    res.status(400).send({ success: false, error: error.message });
  }
  return;
});

app.get("/api/citrone/email/verify/:token", verifySignUpMail);

//Routes

app.post("/api/citrone/resetPassword/:token", resetPassword);
app.use("/api/citrone/auth", authRouter);
app.use("/api/citrone/chat", chatRouter);
app.use("/api/citrone/user", authentication, userRouter);

//default routes
app.use(["/", "/api/citrone"], (req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint doesnt exist",
  });
  return;
});

app.listen(PORT, () => {
  console.log(`App is running on ${PORT}`);
});
