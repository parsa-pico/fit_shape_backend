const Joi = require("joi");

const schema = {
  sub_type_id: Joi.number().required().min(1).max(2),
  price_per_day: Joi.number().required(),
};

module.exports = schema;
