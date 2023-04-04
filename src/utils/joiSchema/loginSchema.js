const Joi = require('joi');

const loginSchema = (data) => {
    const loginScheme = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().password().required()
})
return loginScheme.validate(data)
}

module.exports = loginSchema


