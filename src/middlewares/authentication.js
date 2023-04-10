const jwt = require("jsonwebtoken");

const authentication = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    res.status(403).send({ message: "no token found, Login" });
  } else {
    try {
      req.payload = jwt.verify(token, process.env.JWT_SECRET);
      return next();
    } catch (err) {
      res.status(500).send(err.message); 
    }
    
  }
};

module.exports = { authentication };
