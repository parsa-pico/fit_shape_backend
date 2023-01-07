const Joi = require('joi');

const schema = {
  spent_years: Joi.number().required().max(100),
  sport: Joi.string().required().max(45),
  description: Joi.optional(),
};

module.exports = schema;
