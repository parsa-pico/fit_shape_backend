const Joi = require('joi');

const schema = {
  sub_id: Joi.number().required().max(200000),
};

module.exports = schema;
