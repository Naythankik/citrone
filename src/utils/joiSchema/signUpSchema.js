const Joi = require('joi')
function signUpSchema(data) { //user sign up schema (post & put request)
    const schema = Joi.object({
        fistName: Joi.string().min(2).max(16).valid().lowercase().required(),
        lastName: Joi.string().min(2).max(16).valid().lowercase().required(),
        phoneNumber: Joi.number().min(10).max(16).required(),
        email: Joi.string().email().required().lowercase(),
        password: Joi.string().alphanum().min(6).max(16).required(),
    })
    return schema.validate(data)
}

module.exports = {signUpSchema}