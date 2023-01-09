const Joi = require("joi");

const schema = {
  plan_type_id: Joi.number().required().max(45),
  description: Joi.string().required().max(100000),
  title: Joi.string().required().max(50),
};

module.exports = schema;
