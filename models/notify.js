const Joi = require("joi");

const customNotifySchema = {
  receiversArr: Joi.array().items(Joi.string()).required(),
  subject: Joi.string().required().max(50),
  html: Joi.string().required().max(1000),
};
const notifyPerJobPositionSchema = {
  types: Joi.array().items(Joi.number().min(0).max(3)).required(),
  subject: Joi.string().required().max(50),
  html: Joi.string().required().max(1000),
};
module.exports.customNotifySchema = customNotifySchema;
module.exports.notifyPerJobPositionSchema = notifyPerJobPositionSchema;
