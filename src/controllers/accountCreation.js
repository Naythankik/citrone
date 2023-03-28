const {StatusCodes} = require('http-status-codes')
const {User} = require('../models')
const {signUpSchema} = require('../utils/joiSchema')
const doesUserExist = require('../utils/userAlreadyExist')
const createAccount = async (req, res) => {
    try{
         //validating the user's inputed data with joi schema
    const validation = signUpSchema(req.body)
    if (validation.error) {
        res.status(StatusCodes.UNPROCESSABLE_ENTITY).send(validation.error.details[0].message);
        return;
    }
    const userAlreadyExist = await doesUserExist(User, validation.value, 'email', 'userName', 'mobileNumber')
    if (userAlreadyExist) {
        return res.status(userAlreadyExist.status).json({ message: userAlreadyExist.message })
    }

    //if the validation and checking passed we create the new  user
        const newUser = await User.create(validation.value)
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
            res.status(StatusCodes.NOT_FOUND)
        }
    }
    catch(err) {
        res.status(StatusCodes.BAD_REQUEST).json({message: err.message});
    }
}

module.exports = {createAccount, getUserAccount}