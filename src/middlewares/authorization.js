const { User } = require("../models");

const authorization = async (req, res, next) => {
  try {
    const { userId } = req.user;

    //fetch active user details from document and check if the user is an admin
    const user = await User.findById(userId);

    if (user.role !== "admin") {
      res.status(401).send({ error: "you're not an admin" });
    } else {
      next();
    }
    return;
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = authorization;
