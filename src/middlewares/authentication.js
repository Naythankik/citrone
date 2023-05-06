const jwt = require("jsonwebtoken");
const { mail, generatePayload } = require("../utils/");

const authentication = async (req, res, next) => {
  const {
    headers: { authorization },
  } = req;

  if (!authorization || !authorization.includes("Bearer")) {
    res.status(400).send({ message: "Authorization failed/malformed" });
    return;
  }

  // Retrieve token after the Bearer substring
  const token = authorization.substring(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    req.payload = payload;
    const now = Date.now().valueOf() / 1000;
    if (payload.exp - now < 300) {
      // if the token expires in less than 5 minutes
      // Refresh the token and send it to the client

      // await res.clearCookie("token", {
      //   httpOnly: true,
      //   secure: true,
      // });

      //generate new token
      const payload = generatePayload(user);

      /**Attaching payload to cookie * and allow it to clear automatically after expiration*/
      const newToken = jwt.sign(payload, jwtSecret, {
        expiresIn: JWT_EXPIRES,
      });

      // res.cookie("token", newToken, {
      //   httpOnly: true,
      //   expires: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now,
      // });
    req.headers.authorization.substring(7) = newToken;
    }
    return next();
  } catch (err) {
    //clear cookie when the token has expired so the user can login without clearing the cookies
    // res.clearCookie("token", {
    //   httpOnly: true,
    //   secure: true,
    // });

    res.status(500).send(`${err.message}, Login again`);
  }
};

module.exports = { authentication };
