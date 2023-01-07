const Joi = require('joi');

module.exports = {
  national_code: Joi.string().required().min(10).max(10),
  phone_number: Joi.string().required().min(11).max(11),
  email: Joi.string().email().required(),
  password: Joi.string().required().min(8).max(255),
  first_name: Joi.string().required().max(45),
  last_name: Joi.string().required().max(45),
  city: Joi.string().required().max(45),
  street: Joi.string().required().max(255),
  alley: Joi.string().required().max(255),
  house_number: Joi.string().required().max(10),
};
