const Joi = require('joi');

const schema = {
  sub_id: Joi.number().required().max(100000),
  coach_plan_id: Joi.number().required().max(100000),
};

module.exports = schema;
