const Joi = require("joi");

const schema = {
  user_id: Joi.number().required(),
  token: Joi.string().max(255),
};

module.exports = schema;
