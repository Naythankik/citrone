const Joi = require('joi');

const loginValidation = (data) => {
    const loginScheme = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().password().required()
})
}


