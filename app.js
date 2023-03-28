const express = require("express");
require("dotenv").config();
const Helmet = require('helmet')
const logger = require('morgan')
const connection = require("./config/dbConnection");
const authRoutes = require("./routes/authRoutes");

const app = express();
const PORT = process.env.PORT;
connection();


//Middlewares
app.use(express.json());
app.use(logger('dev')) //morgan to log every request and response summary
app.use(express.urlencoded({extended: true}))

//Routes
app.use("/api/citrone", authRoutes);

app.listen(PORT, () => {
  console.log(`App is running on ${PORT}`);
});
