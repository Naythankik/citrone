const Joi = require("joi");
function signUpSchema(data) {
  //user sign up schema (post & put request)
  const schema = Joi.object({
    firstName: Joi.string().min(2).max(16).valid().required(),
    lastName: Joi.string().min(2).max(16).valid().required(),
    phoneNumber: Joi.string().required(),
    email: Joi.string().email().required().lowercase(),
    password: Joi.string().min(6).max(16).required(),
  });
  return schema.validate(data);
}

module.exports = signUpSchema;
