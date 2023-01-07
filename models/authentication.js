const Joi = require('joi');

module.exports = Joi.object({
  email: Joi.string().email().required().max(255),
  password: Joi.string().required().min(8).max(255),
});
