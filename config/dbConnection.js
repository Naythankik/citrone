const { default: mongoose } = require("mongoose");
mongoose.set("strictQuery", true);

const connection = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log("Database is running");
  } catch (error) {
    console.error(error.message);
  }
};

module.exports = connection;
