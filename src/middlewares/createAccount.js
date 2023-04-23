const { StatusCodes } = require("http-status-codes");
const Mailgen = require("mailgen");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
// require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;

const generateSignUpMail = async (req, res, next) => {
  try {
    const { payload } = req.body;

    /** my gmail information */

    const config = {
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS,
      },
    };

    //The config object is missing a secure and port field,
    //There by stopping the email from sending

    const maxAge = "10m";
    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: maxAge, // 10mins
    });

    // send the token to the database and the email address of the user
    const user = await User.findByIdAndUpdate(payload.userId, {
      $set: { registrationToken: token },
    });

    let transporter = nodemailer.createTransport(config);

    let MailGenerator = new Mailgen({
      theme: "default",
      product: {
        name: "Stutern",
        link: `${process.env.HOSTED_URL}`,
      },
    });

    let response = {
      body: {
        name: payload.username,
        intro: "Welcome to Stutern Citrone Platform",
        action: {
          instructions: "Please click the button below to verify your account",
          button: {
            color: "green",
            text: "Verify email address",
            link: `${process.env.APP_URL}/api/citrone/email/verify/${token}`,
          },
        },
        outro: "Happy learning. we wish you the very best",
      },
    };

    let mail = MailGenerator.generate(response);

    const message = {
      // from: process.env.SENDER_EMAIL, //save a sender on the .env and fetch
      from: "Citrone citrone@gmail.com.co.ng", //save a sender on the .env and fetch
      to: user.email,
      subject: "CITRONE EMAIL VERIFICATION",
      html: mail,
    };

    transporter.sendMail(message).then((info) => {
      return res.status(201).json({
        msg: "check your email for verification",
        info: info.messageId,
        preview: nodemailer.getTestMessageUrl(info),
      });
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const verifySignUpMail = async (req, res) => {
  try {
    const { token } = req.params;

    const verifyToken = jwt.verify(token, JWT_SECRET);

    if (!verifyToken) {
      return res
        .status(401)
        .send({ message: "email verification failed, sign up again" });
    }

    await User.findOneAndUpdate(
      { registrationToken: token },
      {
        registrationToken: "",
        status: "approved",
      }
    );
    //update the registrationToken field to undefined

    res.redirect(process.env.HOSTED_URL);
    return;
  } catch (err) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: err.message });
  }
};

module.exports = {
  generateSignUpMail,
  verifySignUpMail,
};
