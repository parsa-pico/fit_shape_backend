const schema = require("../models/athlete");
const verifyUserSchema = require("../models/verifyUser");
const { promisePool } = require("../mysql/connection");
const bcrypt = require("bcrypt");
const crud = require("../mysql/crud.js");
const authentication = require("../models/authentication");
const Joi = require("joi");
const randtoken = require("rand-token");
const Email = require("./Email");
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
    this.rfid_tag = obj.rfid_tag || null;
    this.house_number = obj.house_number;
    this.athlete_id = obj.athlete_id || null;
    this.is_in_gym = obj.is_in_gym || null;
    this.is_verified = obj.is_verified || null;
    this.verification_code = obj.verification_code || null;
  }
  static validate(obj) {
    return Joi.object(schema).validate(obj);
  }
  static validateForVerify(obj) {
    return Joi.object(verifyUserSchema).validate(obj);
  }
  static async findAll() {
    const [rows] = await promisePool.execute(`select
     athlete_id,national_code,phone_number,email,blood_type_id,
     national_code,height,rfid_tag,is_in_gym,
     first_name,last_name,city,street,alley,house_number from athlete `);
    return rows;
  }
  static validateUserPass(obj) {
    return authentication.validate(obj);
  }
  static async findOne(parameter, value) {
    return new Athlete(await crud.findOne("athlete", parameter, value));
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
  static async findByRfidTag(tag) {
    const [rows] = await promisePool.execute(
      `select first_name,last_name , athlete_id,is_in_gym 
       from athlete a where a.rfid_tag=? limit 1`,
      [tag]
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
  generateVerificationCode() {
    return randtoken.generate(16);
  }
  async insert() {
    this.password = await bcrypt.hash(this.password, 10);
    this.verification_code = this.generateVerificationCode();
    const [rows] = await promisePool.execute(
      "call fit_shape.sign_up_athlete(?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
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
        this.verification_code,
      ]
    );
    this.athlete_id = rows[0][0].athlete_id;
  }
  sendVerificationCode() {
    const email = new Email({
      receiversArr: [this.email],
      subject: "fit shape-verify your account",
      html: `<h3>click on the link to activate your account:</h3>
      ${process.env.FRONT_BASE_URL}/callback/verify_athlete?user_id=${this.athlete_id}&token=${this.verification_code}`,
    });
    return email.send();
  }
  isCorrectToken(token) {
    return this.verification_code === token ? true : false;
  }
  async verifyAthlete() {
    const [rows] = await promisePool.execute(
      `
  update athlete
  set is_verified = 1
  where athlete_id = ? 
  `,
      [this.athlete_id]
    );
    return rows;
  }
  static getBloodType(id) {
    switch (id) {
      case 1:
        return "O+";
      case 2:
        return "O-";
      case 3:
        return "B+";
      case 4:
        return "B-";
      case 5:
        return "A+";
      case 6:
        return "A-";
      case 7:
        return "AB+";
      case 8:
        return "AB-";
    }
  }
}
module.exports = Athlete;
