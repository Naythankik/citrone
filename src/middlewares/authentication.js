const jwt = require("jsonwebtoken");
const User = require("../models/user");

const authentication = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    res.status(403).send({ message: "no token found, Login" });
  } else {
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      throw new Error(err);
    }
    return next();
  }
};

module.exports = { authentication };
