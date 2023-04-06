const jwt = require("jsonwebtoken");
const User = require("../models/user");

const authentication = async (req, res, next) => {
  const cookie = await req.cookies;
  console.log({cookie})
  const token = cookie.token;
  // req.body.token ||
  // req.query.token ||
  // req.headers.authorization.split(" ")[1];

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

const authorization = async (req, res, next) => {
  try {
    const { id } = req.user;
    const admin = await User.findById(id);
    if (admin.role !== "admin") {
      throw new Error({ error: "User is not an admin" });
    } else {
      next();
    }
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = { authentication };
