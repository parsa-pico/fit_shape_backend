const Joi = require('joi').extend(require('@joi/date'));

const schema = {
  date: Joi.date().format('YYYY-MM-DD').utc(),
  weight: Joi.number().required().max(500),
};

module.exports = schema;
