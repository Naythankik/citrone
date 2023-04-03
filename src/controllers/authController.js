const express = require("express");
const mail = require("../utils/mail");
const crypto = require("crypto");

const forgetPassword = async (req, res) => {
  const { email } = req.body;
  const token = crypto.randomBytes(32).toString("hex");
  const passwordResetToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  //create data for mailing
  const data = {
    to: email,
    subject: "Forgot password confirmation",
    text: `Hello!
    You are receiving this email because we received a password reset request for your account.`,
  };

  console.log(token, passwordResetToken);
  return;

  // try {
  //   const user = await User.findOne({req.email});

  //   //if user is not found , return a response of 404
  //   if(!user) throw new Error("Email is not found");

  //   //if email is found send a mail to the user with a unique token
  //   const token = crypto.randomBytes(32).toString("hex");
  //   user.passwordResetToken = crypto.createHash("sha256").update(token).digest("hex")

  // } catch (error) {
  //   throw new Error(error);
  // }
};

const resetPassword = async (req, res) => {};
module.exports = { forgetPassword, resetPassword };
