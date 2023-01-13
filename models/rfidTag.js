const Joi = require("joi");

const schema = {
  rfid_tag: Joi.number().required(),
};

module.exports = schema;
