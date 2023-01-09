const schema = require("../models/staff");
const { promisePool } = require("../mysql/connection");
const bcrypt = require("bcrypt");
const crud = require("../mysql/crud.js");
const authenticationSchema = require("../models/authentication");
const Joi = require("joi");
class Staff {
  constructor(obj) {
    this.national_code = obj.national_code;
    this.phone_number = obj.phone_number;
    this.email = obj.email;
    this.password = obj.password;
    this.first_name = obj.first_name;
    this.last_name = obj.last_name;
    this.city = obj.city;
    this.street = obj.street;
    this.alley = obj.alley;
    this.house_number = obj.house_number;
    this.staff_id = obj.staff_id || null;
    this.job_position_id = obj.job_position_id || null;
  }
  validate() {
    const { staff_id, ...rest } = this;
    return Joi.object(schema).validate(rest);
  }
  static validateUserPass(obj) {
    return authenticationSchema.validate(obj);
  }
  static async findOne(parameter, value) {
    const rows = await crud.findOne("staff", parameter, value);
    return new Staff(rows);
  }
  static async advancedSearch(queryObj, unionWithAnd = true, select) {
    return await crud.advancedSearch("staff", queryObj, unionWithAnd, select);
  }
  static async findById(id) {
    const [rows] = await promisePool.execute(
      `select * from staff s where s.staff_id=? limit 1`,
      [id]
    );
    if (rows.length === 0) return null;
    return new Staff(rows[0]);
  }
  async update(updateObj) {
    for (let key in updateObj) {
      this[key] = updateObj[key];
    }
    return await crud.update("staff", updateObj, {
      key: "staff_id",
      value: this.staff_id,
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
      "call fit_shape.sign_up_staff(?,?,?,?,?,?,?,?,?,?)",
      [
        this.national_code,
        this.phone_number,
        this.email,
        this.password,
        this.first_name,
        this.last_name,
        this.city,
        this.street,
        this.alley,
        this.house_number,
      ]
    );

    return rows[0][0];
  }
}
module.exports = Staff;
