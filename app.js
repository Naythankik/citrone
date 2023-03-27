const express = require("express");
require("dotenv").config();
const app = express();
const connection = require("./config/dbConnection");
const authRoutes = require("./routes/authRoutes");

const PORT = process.env.PORT;
connection();

//Middlewares
app.use(express.json());

//Routes
app.use("/api/citrone", authRoutes);

app.listen(PORT, () => {
  console.log(`App is running on ${PORT}`);
});
