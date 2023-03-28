const { StatusCodes } = require("http-status-codes");
const crypto = require("crypto");
const mail = require("../utils/mail");
const { User } = require("../models");
const { signUpSchema } = require("../utils/joiSchema");
const { doesUserExist, generateUsername } = require("../utils");

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
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(StatusCodes.NOT_FOUND).json({ message: "User not found" });
      return;
    }
    res.status(StatusCodes.OK).json({ data: user });
  } catch (err) {
    res.status(StatusCodes.BAD_REQUEST).json({ message: err.message });
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
          You are receiving this email because we received a password reset request for your account.`,
      html: `<a href="/${process.env.APP_URL}${process.env.PORT}/resetPassword/${token}">Reset Password</a>`,
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

const resetPassword = async (req, res) => {};

module.exports = {
  createAccount,
  getUserAccount,
  forgetPassword,
  resetPassword,
};
