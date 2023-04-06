const express = require("express");
require("dotenv").config();
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const connection = require("./config/dbConnection");
const userRouter = require("./routes/userRouter");
const { authRouter } = require("./routes/index");
const { resetPassword } = require("./src/controllers/userControllers");
const { authentication } = require("./src/middlewares/authentication");

const app = express();
const PORT = process.env.PORT;
connection(); //server connection function

//Middlewares
app.use(express.json());
app.use(logger("dev")); //logger to log every request and response summary

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

//Routes
app.post("/api/citrone/resetPassword/:token", resetPassword);
app.use("/api/citrone/auth", authRouter);
app.use("/api/citrone/user", authentication, userRouter);

app.use(["/", "/api/citrone/"], (req, res) => {
  res.status(400).json({ message: "Welcome to Citrone" });
});
app.listen(PORT, () => {
  console.log(`App is running on ${PORT}`);
});
