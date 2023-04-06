const express = require("express");
require("dotenv").config();
const Helmet = require("helmet");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const connection = require("./config/dbConnection");
const {userRouter,authRouter} = require("./routes");
const { resetPassword } = require("./src/controllers/auth/");

const app = express();
const PORT = process.env.PORT;
connection(); //server connection function

//Middlewares
app.use(express.json());
app.use(logger("dev")); //logger to log every request and response summary

//Faruq
// app.use(cookieParser(process.env.COOKIE_PARSER_KEY));

//Main
//I used this so i can get the cookie from the cookie request, to logout the user
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));


//Routes
app.post("/api/citrone/resetPassword/:token", resetPassword);
app.use("/api/citrone/user", userRouter);
app.use("/api/citrone/auth", authRouter);


app.use(["/", "/api/citrone/", "/*"], (req, res) => {
  res.status(400).json({ message: "Welcome to Citrone" });
});
app.listen(PORT, () => {
  console.log(`App is running on ${PORT}`);
});
