const Joi = require("joi");

const schema = {
  receiversArr: Joi.array().items(Joi.string()).required(),
  subject: Joi.string().required().max(50),
  html: Joi.string().required().max(1000),
};

module.exports = schema;
