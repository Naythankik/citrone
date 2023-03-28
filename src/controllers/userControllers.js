const {StatusCodes} = require('http-status-codes')
const crypto = require('crypto');
const {User} = require('../models')
const {signUpSchema} = require('../utils/joiSchema')
const {doesUserExist,generateUsername} = require('../utils')

const createAccount = async (req, res) => {
    try{
         //validating the user's inputed data with joi schema
    const validation = signUpSchema(req.body)
    if (validation.error) {
        res.status(StatusCodes.UNPROCESSABLE_ENTITY).send(validation.error.details[0].message);
        return;
    }
    const userAlreadyExist = await doesUserExist(User, validation.value, 'email', 'mobileNumber')
    if (userAlreadyExist) {
        return res.status(userAlreadyExist.status).json({ message: userAlreadyExist.message })
    }

    //if the validation and checking passed we create the new  user
        const newUser = new User(validation.value)  
        newUser.username = await generateUsername(User, newUser.firstName)//generating a username for the new user
         await newUser.save()
        res.status(StatusCodes.OK).json({message: 'account created successfully', data: newUser})
    }
    catch (err) {
        res.status(StatusCodes.BAD_REQUEST).send(err.message);
    }
}

const getUserAccount = async (req, res) => {
    try{
        const user = await User.findById(req.params.id)
        if(!user) {
            res.status(StatusCodes.NOT_FOUND).json({message: 'User not found'});
            return
        }
        res.status(StatusCodes.OK).json({data: user})
    }
    catch(err) {
        res.status(StatusCodes.BAD_REQUEST).json({message: err.message});
    }
}
module.exports = {createAccount, getUserAccount}