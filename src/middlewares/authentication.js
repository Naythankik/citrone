const jwt = require("jsonwebtoken");

const authentication = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    res.status(403).send({ message: "no token found, Login" });
  } else {
    try {
      req.payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      throw new Error(err);
    }
    return next();
  }
};

module.exports = { authentication };
