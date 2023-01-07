const Joi = require('joi');

const schema = {
  status: Joi.number().required().max(20),
  track_id: Joi.number().required(),
  id: Joi.string().required(),
  order_id: Joi.string().required(),
};

module.exports = schema;
