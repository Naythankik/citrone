const { StatusCodes } = require("http-status-codes");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { mail, generatePayload } = require("../../utils");
const { User } = require("../../models");
require("dotenv").config();
const jwtSecret = process.env.JWT_SECRET;
const JWT_EXPIRES = process.env.JWT_EXPIRES;

const { signUpSchema, loginSchema } = require("../../utils/joiSchema");
const { doesUserExist, generateUsername } = require("../../utils");
const { log } = require("console");

//the environment
const environment = process.env.NODE_ENV;

/**user login controller */
const userLogin = async (req, res, next) => {
  // Check if a user is active at the moment on the device
  /**Validate the data in the req.body */
  const validation = loginSchema(req.body);

  const { error, value } = validation;
  if (error) {
    return res
      .status(StatusCodes.UNPROCESSABLE_ENTITY)
      .json({ message: error.details[0].message });
  }

  try {
    /**find a user with the provided email and check if the email and password matched */
    const { email, password } = value;
    const user = await User.findOne({ email }).select([
      "-__v",
      "-createdAt",
      "-updatedAt",
    ]);

    if (!user) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .send("user with email not found");
    }

    // check if the password matches with the one from the user
    const doesPasswordMatch = await user.comparePassword(password);
    if (!doesPasswordMatch) {
      return res.status(StatusCodes.UNAUTHORIZED).send({
        succes: false,
        error: "wrong password provided try again with another password",
      });
    }

    //check if the user status is pending
    if (user.status !== "approved") {
      // await User.findByIdAndDelete(user.id); //delete user account and allowed to sign up again
      // return res
      //   .status(StatusCodes.BAD_REQUEST)
      //   .send({
      //     message: "You failed to verify your email. Please sign up again!",
      //   });
      // return res.status(401).send({ message: "user account has not been verified" });
      const payload = generatePayload(user);

      req.body.payload = payload;
      return next(); //we resend a verification token again if the user status is pending
    }

    /*check if a user is signed in on the device(the browser) at the moment and logout the user */
    if (req.headers.authorization) {
      const existingToken = req.headers.authorization.substring(7);

      if (existingToken) {
        const decodedToken = jwt.verify(existingToken, jwtSecret);

        /**if the new user is different from the currently login user */
        if (decodedToken.userId !== user._id) {
          // update the current login user isActive status to false
          const usersa = await User.findByIdAndUpdate(decodedToken.userId, {
            $set: {
              isActive: false,
            },
          });
        }
      }
    }

    /**Attaching payload to cookie * and allow it to clear automatically after expiration*/
    const payload = generatePayload(user);
    const token = jwt.sign(payload, jwtSecret, { expiresIn: JWT_EXPIRES });

    user.isActive = true; //the user is active (i.e online until he logout)

    await user.save();

    // restrict the fields sent to the user
    user.password = user.status = user.registrationToken = undefined;

    res.status(StatusCodes.OK).send({ user, token });
  } catch (err) {
    res.status(StatusCodes.BAD_REQUEST).send(err.message);
  }
  return;
};

/**user logout controller */
const userLogout = async (req, res) => {
  const {
    headers: { authorization },
  } = req;

  try {
    // fetch the user id from the token
    const { userId } = jwt.verify(
      authorization.split(" ")[1],
      process.env.JWT_SECRET
    );

    // update the user isActive status to false
    await User.findByIdAndUpdate(userId, {
      $set: {
        isActive: false,
      },
    });

    // authorization.split(" ")[1] = "";

    res.status(StatusCodes.OK).json({ message: "user logged out" });
  } catch (error) {
    res.send({ success: false, error: error.message });
  }
};

const createAccount = async (req, res, next) => {
  try {
    //validating the user's inputed data with joi schema
    const { error, value } = signUpSchema(req.body);
    if (error) {
      res.status(StatusCodes.UNPROCESSABLE_ENTITY).send({
        success: false,
        error: error.details[0].message,
      });
      return;
    }
    const userAlreadyExist = await doesUserExist(
      User,
      value,
      "email",
      "phoneNumber"
    );

    if (userAlreadyExist) {
      return res
        .status(userAlreadyExist.status)
        .json({ message: userAlreadyExist.message });
    }

    //if the validation and checking passed we create the new  user
    const newUser = new User(value);
    newUser.username = await generateUsername(User, newUser.firstName); //generating a username for the new user
    await newUser.save();
    const payload = generatePayload(newUser);

    req.body.payload = payload;
    next();
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      success: false,
      message: err.message,
    });
    return;
  }
};

const forgetPassword = async (req, res) => {
  const { email } = req.body;

  try {
    //find the email from the user schema
    const user = await User.findOne({ email });

    //   //if user is not found , return a response of 404
    if (!user) res.status(404).send({ error: "Email is not found" });

    // if found, create a token
    const token = crypto.randomBytes(32).toString("hex");

    user.passwordResetToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    user.forgetPasswordExpires = Date.now() + 1000 * 60 * 10; //The token shout last for 10 mins

    //create data for mailing
    const data = {
      to: email,
      subject: "Forgot password confirmation",
      text: `Hello! 
          You are receiving this email because we received a password reset request for your account.\n\n
          <a href="${process.env.APP_URL}${process.env.PORT}/api/citrone/resetPassword/${token}">Reset Password</a> \n\n
          This password reset link will expire in 60 minutes.
          If you did not request a password reset, no further action is required.
          `,
      html: `Hello!
      You are receiving this email because we received a password reset request for your account.\n\n
      <a href="${process.env.APP_URL}${process.env.PORT}/api/citrone/resetPassword/${token}">Reset Password</a> \n\n
      This password reset link will expire in 60 minutes.
      If you did not request a password reset, no further action is required.
      `,
    };

    mail(data);

    await user.save();

    res
      .status(200)
      .send({ message: "Mail has been sent to the email address provided" });
    return;
  } catch (error) {
    res.send({ error: error.message });
  }
  return;
};

const resetPassword = async (req, res) => {
  const { token } = req.params;
  const hashToken = crypto.createHash("sha256").update(token).digest("hex");

  try {
    const user = await User.findOne({
      passwordResetToken: hashToken,
      forgetPasswordExpires: { $gte: Date() },
    });

    //if the user returns null
    if (!user) {
      res.status(408).send("Token has expired. Try again later");
      return;
    }
    const { password, confirmPassword } = req.body;

    // check if password is undefined
    if (!password) {
      res
        .status(400)
        .send({ success: false, error: "Password must be provided" });
      return;
    }

    //check if the password matches with confirm password
    if (password !== confirmPassword) {
      res
        .status(403)
        .send({ success: false, error: "Password does not match" });
      return;
    }

    user.forgetPasswordExpires = undefined;
    user.passwordResetToken = undefined;
    await user.save();

    res.status(200).send({ message: "Password has been successfully reset" });
  } catch (error) {
    throw new Error(error);
  }
  return;
};

module.exports = {
  createAccount,
  forgetPassword,
  resetPassword,
  userLogin,
  userLogout,
};
