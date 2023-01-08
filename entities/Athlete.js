const schema = require("../models/athlete");
const { promisePool } = require("../mysql/connection");
const bcrypt = require("bcrypt");
const crud = require("../mysql/crud.js");
const authentication = require("../models/authentication");
const Joi = require("joi");
class Athlete {
  constructor(obj) {
    this.national_code = obj.national_code;
    this.blood_type_id = obj.blood_type_id;
    this.phone_number = obj.phone_number;
    this.email = obj.email;
    this.password = obj.password;
    this.first_name = obj.first_name;
    this.last_name = obj.last_name;
    this.height = obj.height;
    this.weight = obj.weight;
    this.city = obj.city;
    this.street = obj.street;
    this.alley = obj.alley;
    this.house_number = obj.house_number;
    this.athlete_id = obj.athlete_id || null;
  }
  validate() {
    const { athlete_id, ...rest } = this;
    return Joi.object(schema).validate(rest);
  }
  static validateUserPass(obj) {
    return authentication.validate(obj);
  }
  static async findOne(parameter, value) {
    return await crud.findOne("athlete", parameter, value);
  }
  static async advancedSearch(queryObj, unionWithAnd = true) {
    return await crud.advancedSearch("athlete", queryObj, unionWithAnd);
  }
  static async findById(id) {
    const [rows] = await promisePool.execute(
      `select * from athlete a where a.athlete_id=? limit 1`,
      [id]
    );
    if (rows.length === 0) return null;
    return new Athlete(rows[0]);
  }
  async update(updateObj) {
    for (let key in updateObj) {
      this[key] = updateObj[key];
    }
    return await crud.update("athlete", updateObj, {
      key: "athlete_id",
      value: this.athlete_id,
    });
  }
  static customValidate(updateObj) {
    const customSchema = {};
    for (let key in updateObj) {
      if (schema[key]) customSchema[key] = schema[key];
    }

    return Joi.object(customSchema).validate(updateObj);
  }
  async insert() {
    this.password = await bcrypt.hash(this.password, 10);
    const [rows] = await promisePool.execute(
      "call fit_shape.sign_up_athlete(?,?,?,?,?,?,?,?,?,?,?,?,?)",
      [
        this.national_code,
        this.blood_type_id,
        this.phone_number,
        this.email,
        this.password,
        this.first_name,
        this.last_name,
        this.height,
        this.weight,
        this.city,
        this.street,
        this.alley,
        this.house_number,
      ]
    );

    return rows[0][0];
  }
}
module.exports = Athlete;
