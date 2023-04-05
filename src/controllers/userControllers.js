const { StatusCodes } = require("http-status-codes");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { mail, generatePayload } = require("../utils");
const { User } = require("../models");
require("dotenv").config();
const jwtSecret = process.env.JWT_SECRET;
const JWT_EXPIRES = process.env.JWT_EXPIRES;

const { signUpSchema, loginSchema } = require("../utils/joiSchema");
const { doesUserExist, generateUsername } = require("../utils");

/**user login controller */
const userLogin = async (req, res) => {
  /**Validate the data in the req.body */
  const { error, value } = loginSchema(req.body);

  if (error) {
    return res
      .status(StatusCodes.UNPROCESSABLE_ENTITY)
      .json({ message: error.details[0].message });
  }
  try {
    /**find a user with the provided email and check if the email and password matched */
    const { email, password } = value;
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .send("user with email not found");
    }

    const doesPasswordMatch = await user.comparePassword(password);
    if (!doesPasswordMatch) {
      return res.status(StatusCodes.UNAUTHORIZED).send("Password is incorrect");
    }

    /**Attaching payload to cookie */
    const payload = generatePayload(user);

    const token = jwt.sign(payload, jwtSecret, { expiresIn: JWT_EXPIRES });

    res.cookie("token", token, {
      httpOnly: true,
      expiresIn: new Date(Date.now() + JWT_EXPIRES),
    });

    user.isActive = true; //the user is active (i.e online until he logout)
    user.token = token; // using the token to logout user

    //save the user data
    await user.save();

    res.status(StatusCodes.OK).json({ data: user });
  } catch (err) {
    res.status(StatusCodes.BAD_REQUEST).send(err.message);
  }
};

/**user logout controller */
const userLogout = async (req, res) => {
  const { token } = req.cookies;

  //check if cookie is true
  if (!token) {
    res.status(401).send({ message: "User is not logged in" });
    return;
  }

  //use the token to find the user from the database
  try {
    const user = await User.findOne({ token: token });

    // if user returns null
    if (!user) {
      return res.status(204).send({ message: "User is not active" });
    }

    //if user returns true, update the user document
    await User.findOneAndUpdate(
      { token },
      {
        $set: {
          isActive: false,
          token: "",
        },
      }
    );

    //clear the cookie after the user document has been updated
    res.clearCookie("token", { httpOnly: true, secure: true });

    res.status(200).send({ message: "user logged out" });
  } catch (error) {
    throw new Error({ Error: error });
  }
  return;
  // res.cookie("token", "logout", {
  //   httpOnly: true,
  //   expires: new Date(Date.now() + 1000),
  // });
  // res.status(StatusCodes.OK).json({ msg: "user logged out" });
};

const createAccount = async (req, res) => {
  try {
    //validating the user's inputed data with joi schema
    const validation = signUpSchema(req.body);
    if (validation.error) {
      res
        .status(StatusCodes.UNPROCESSABLE_ENTITY)
        .send(validation.error.details[0].message);
      return;
    }
    const userAlreadyExist = await doesUserExist(
      User,
      validation.value,
      "email",
      "mobileNumber"
    );
    if (userAlreadyExist) {
      return res
        .status(userAlreadyExist.status)
        .json({ message: userAlreadyExist.message });
    }

    //if the validation and checking passed we create the new  user
    const newUser = new User(validation.value);
    newUser.username = await generateUsername(User, newUser.firstName); //generating a username for the new user
    await newUser.save();
    res
      .status(StatusCodes.OK)
      .json({ message: "account created successfully", data: newUser });
  } catch (err) {
    res.status(StatusCodes.BAD_REQUEST).send(err.message);
  }
};

const getUserAccount = async (req, res) => {
  const { userId } = req.user;

  try {
    const user = await User.findById(userId);
    if (!user) {
      res.status(StatusCodes.NOT_FOUND).json({ message: "User not found" });
      return;
    }
    res.status(StatusCodes.OK).json({ data: user });
  } catch (err) {
    res.status(StatusCodes.BAD_REQUEST).json({ message: err.message });
  }
};

const updateUserProfile = async (req, res) => {
  //use the authentication to receive user details from the payload saved to jwt
  const { userId } = req.user;

  //check if the req has role key
  if (req.body.role) {
    if (req.body.role !== "learner") {
      res.status(401).send({ message: "User has no access to admin" });
      return;
    }
  }

  if (req.body.password) {
    //if password is submitted by the user
    res
      .status(401)
      .send({ message: "User can't change password via this endpoint" });
    return;
  }

  try {
    await User.findByIdAndUpdate(userId, { $set: req.body });

    res.status(202).send({ message: "user profile has been edited!!!" });
  } catch (error) {
    throw new Error({ error });
  }
  return;
};

const deactivateAUser = async (req, res) => {
  //when the login API is ready, use the authentication to fetch the user
  //clear the session and cookie of the user
  const { id } = req.params;

  try {
    const user = await User.findByIdAndUpdate(id, {
      $set: {
        deactivate: true,
      },
    });

    //if the user is null
    if (!user) {
      res.status(400).send({ message: "No user found with the specified ID" });
      return;
    }

    //after user account has been deactivated
    //logout user, then send a response
    res.status(200).send({ message: "Your account has been deactivated" });
  } catch (error) {
    throw new Error(error);
  }
};

const forgetPassword = async (req, res) => {
  const { email } = req.body;
  try {
    //find the email from the user schema
    const user = await User.findOne({ email });

    //   //if user is not found , return a response of 404
    if (!user) throw new Error("Email is not found");

    // if found, create a token
    const token = crypto.randomBytes(32).toString("hex");

    user.passwordResetToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");
    user.forgetPasswordExpires = Date.now() + 1000 * 60 * 10;

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
    throw new Error(error);
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
      res.status(400).send("Password must be provided");
      return;
    }

    //check if the password matches with confirm password
    if (password !== confirmPassword) {
      res.status(403).send("Password does not match");
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
  getUserAccount,
  forgetPassword,
  resetPassword,
  updateUserProfile,
  userLogin,
  userLogout,
  deactivateAUser,
};
