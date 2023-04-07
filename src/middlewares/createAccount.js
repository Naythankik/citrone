const generateSignUpMail = async (req, res, next) => {
    const {payload} = req.body
    /** my gmail information */
    const config = {
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASS
        }
    }
    
    const transporter = nodemailer.createTransport(config)
    
    const maxAge = '10m'
    const token = jwt.sign(
        payload,
        signature,
        {
            expiresIn: maxAge, // 10mins
        }
    );
    
    const message = {
        from: 'faruqhameed1@gmail.com',
        to: 'gemipo4119@djpich.com',
        subject: 'testing email verification',
        text: `Hi! ${user.name}.
        Please follow the given link to verify your email
        http://localhost:3000/register/verify/${token} 
        Thanks`,
        html: `Hi! ${user.name}.
        Please follow the given link to verify your email
        http://localhost:3000/register/verify/${token} 
        Thanks`
    }
    transporter.sendMail(message).then((info) => {
        return res.status(201)
        .json({ 
            msg: "check your email for verification",
            info : info.messageId,
            preview: nodemailer.getTestMessageUrl(info)
        })
    }).catch(error => {
        return res.status(500).json({ error })
    })
  }

const verifySignUpMail = async (req, res)=>{
    try{
         const {token} =await req.params
    const verifyToken = jwt.verify(token, JWT_SECRET, (err, decodedToken)=>{
        if (err){
            return res
            .status(401).send({message: 'email verification failed, sign up again'})
        }
       const {payload} = decodedToken.payload
        user.save()
    })
    }
    catch(err){
        res.status(404).send({message: err.message})
    }
   
}
    