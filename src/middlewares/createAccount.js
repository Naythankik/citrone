const { StatusCodes } = require("http-status-codes");
const Mailgen = require('mailgen');
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;

const generateSignUpMail = async (req, res, next) => {
    try{
       const { payload } = req.body
/** my gmail information */
const config = {
    service: 'gmail',
    auth: {
        user: process.env.EMAIL, 
        pass: process.env.EMAIL_PASS
    }
}

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


    let transporter = nodemailer.createTransport(config);

    let MailGenerator = new Mailgen({
        theme: "default",
        product : {
            name: "Mailgen",
            link :  `http://localhost:3000/register/verify/${token}`
        }
    })

    let response = {
        body: {
          name: 'Jon Doe',
          intro: 'Welcome to email verification',
          action: {
            instructions: 'Please click the button below to verify your account',
            button: {
              color: 'blue',
              text: 'Verify account',
              link: 'http://example.com/verify_account',
            },
          },
        },
      }

    let mail = MailGenerator.generate(response)
    
    const message = {
        from: 'faruqhameed1@gmail.com',
        to: 'seroca2770@dogemn.com',
        subject: 'citrone email verification',
        html: mail
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
            res
            .status(StatusCodes.OK)
            .send(
                `<a href=${process.env.APP_URL}${process.env.PORT}/api/citrone/login></a>`
                `<p>Your email address has been successfully verified.</p>
            <p>Please click <a href="/login">here</a> to log in.</p>`
            )
            
        })
    }
    catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: err.message })
    }

}

module.exports = {
    generateSignUpMail,verifySignUpMail
}
