const { StatusCodes } = require("http-status-codes");
const crypto = require("crypto");
const jwt = require('jsonwebtoken');
const {mail, generatePayload} = require("../../utils");
const { User } = require("../../models");
require('dotenv').config();
const jwtSecret = process.env.JWT_SECRET
const JWT_EXPIRES = process.env.JWT_EXPIRES

const { signUpSchema, loginSchema } = require("../../utils/joiSchema");
const { doesUserExist, generateUsername } = require("../../utils");

/**user login controller */
const userLogin = async (req, res) => {
    /**Validate the data in the req.body */
    const validation = loginSchema(req.body)
    const { error, value } = validation
    if (error) {
        return res
            .status(StatusCodes.UNPROCESSABLE_ENTITY)
            .json({ message: error.details[0].message })
    }
    try {
        /**find a user with the provided email and check if the email and password matched */
        const { email, password } = value
        const user = await User.findOne({ email })
        if (!user) {
            return res
                .status(StatusCodes.NOT_FOUND)
                .send('user with email not found')
        }
        const doesPasswordMatch = await user.comparePassword(password);
        if (!doesPasswordMatch) {
            return res
                .status(StatusCodes.UNAUTHORIZED)
                .send('wrong password provided try again with another password')
        }
        /**Attaching payload to cookie */
        const payload = generatePayload(user)

        const token = jwt.sign(payload, jwtSecret, { expiresIn: JWT_EXPIRES })
        res.cookie('token', token, {
            httpOnly: true,
            expiresIn: new Date(Date.now() + JWT_EXPIRES),
            signed: true
        })

        user.isActive = true //the user is active (i.e online until he logout)
        res.
            status(StatusCodes.OK)
            .json({ data: user })
    }
    catch (err) {
        res
            .status(StatusCodes.BAD_REQUEST)
            .send(err.message)
    }
}

/**user logout controller */
const userLogout = async (req, res) => {
    res.cookie('token', 'logout', {
        httpOnly: true,
        expires: new Date(Date.now() + 1000)
    })
    res
        .status(StatusCodes.OK)
        .json({ msg: 'user logged out' })
}

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
  forgetPassword,
  resetPassword,
  userLogin,
  userLogout
};
