const Joi = require('joi');

const schema = {
  sub_type_id: Joi.number().required().max(45),
  coach_id: Joi.number().optional().max(100000),
  total_days: Joi.number().required().max(512),
};

module.exports = schema;
