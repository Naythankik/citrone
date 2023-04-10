const { StatusCodes } = require("http-status-codes");
const crypto = require("crypto");
const { User } = require("../models");
require("dotenv").config();   

const getUserAccount = async (req, res) => {
  const { userId } = req.payload;

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
  const { userId } = req.payload;

  //check if the req has role key
  if (req.body.role) {
    if (req.body.role !== "learner") {
      res.status(StatusCodes.UNAUTHORIZED).send({ message: "User has no access to admin" });
      return;
    }
  }

  if (req.body.password) {
    //if password is submitted by the user
    res
      .status(StatusCodes.UNAUTHORIZED)
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

const resetPassword = async (req, res) => {
  const { token } = req.params;

  // Hash the token for comparison with the one in the database
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

    // update entries
    user.password = password;
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
  getUserAccount,
  resetPassword,
  updateUserProfile,
};
