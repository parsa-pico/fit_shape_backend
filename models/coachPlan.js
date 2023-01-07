const Joi = require('joi');

const schema = {
  plan_type_id: Joi.number().required().max(45),
  description: Joi.string().required().max(100000),
};

module.exports = schema;
