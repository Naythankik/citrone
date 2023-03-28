const {StatusCodes} = require('http-status-codes')

//checking if the email or mobile number already exists for post request
const doesUserExist = async (model, value, email, mobileNumber) => {
    const doesEmailExist = await model.findOne({ email: value[email] })
    if (doesEmailExist) {
        let result = { status: StatusCodes.CONFLICT, message: 'email already exists' }
        return result;
    }
    const doesMobileNumberExist = await model.findOne({ mobileNumber: value[mobileNumber] })
    if (doesMobileNumberExist) {
        let result = { status: StatusCodes.CONFLICT, message: 'phone number already exists' }
        return result;
    }
}

module.exports = doesUserExist