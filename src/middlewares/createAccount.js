const { StatusCodes } = require("http-status-codes");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES = process.env.JWT_EXPIRES;

const generateSignUpMail = async (req, res, next) => {
    try{
       const { payload } = req.body

        /** testing account email */
        let testAccount = await nodemailer.createTestAccount();

        // create reusable transporter object using the default SMTP transport
      let transporter = nodemailer.createTransport({
          host: "smtp.ethereal.email",
          port: 587,
          secure: false, // true for 465, false for other ports
          auth: {
              user: testAccount.user, // generated ethereal user
              pass: testAccount.pass, // generated ethereal password
          },
      });


    const maxAge = '10m'
    const token = jwt.sign(
        payload,
        JWT_SECRET,
        {
            expiresIn: maxAge, // 10mins
        }
    );
    // send the token to the database and the email address of the user
    User.findByIdAndUpdate(payload.userId, {$set: {registrationToken: token}})
    const message = {
        from: 'faruqhameed1@gmail.com',
        to: 'gemipo4119@djpich.com',
        subject: 'testing email verification',
        text: `Hi! ${payload.name}.
        Please follow the given link to verify your email
        http://localhost:3000/register/verify/${token} 
        Thanks`,
        html: `Hi! ${payload.name}.
        Please follow the given link to verify your email
        http://localhost:3000/register/verify/${token} 
        Thanks`
    }
    transporter.sendMail(message).then((info) => {
        return res.status(201)
            .json({
                msg: "check your email for verification",
                info: info.messageId,
                preview: nodemailer.getTestMessageUrl(info)
            })
    }) 
    }
    catch(error) {
        return res.status(500).json({message: error.message})
    }
}


// (err, user) => {
//     if (err) {
//       console.error(err);
//       res.status(500).send('Internal server error');
//     } else if (!user) {
//       res.status(400).send('Invalid verification token');
//     } else if (user.email !== req.query.email) {
//       res.status(400).send('Email address does not match verification token');
//     } else {
//       // Update user account status to "verified"
//       db.collection('users').updateOne({ _id: user._id }, { $set: { verified: true } }, (err, result) => {
//         if (err) {
//           console.error(err);
//           res.status(500).send('Internal server error');
//         } else {
//           res.redirect('/login');
//         }
//     }

//verify the token 
const verifySignUpMail = async (req, res) => {
    try {
        const { token } = await req.params
        const verifyToken = jwt.verify(token, JWT_SECRET, (err, decodedToken) => {
            if (err) {
                return res
                    .status(401).send({ message: 'email verification failed, sign up again' })
            }
            const { payload } = decodedToken.payload
            User.findByIdAndUpdate(payload.userId, {status: 'approved'})
            
        })
    }
    catch (err) {
        res.status(404).send({ message: err.message })
    }

}
