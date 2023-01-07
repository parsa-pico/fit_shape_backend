const { promisePool } = require("../mysql/connection");
const schema = require("../models/sportHistory");
const Joi = require("joi");
const crud = require("../mysql/crud.js");
class SportHistory {
  constructor(obj) {
    this.athlete_id = obj.athlete_id;
    this.spent_years = obj.spent_years;
    this.sport = obj.sport;
    this.description = obj.description || null;
    this.sport_history_id = obj.sport_history_id || null;
  }
  static validate(obj) {
    return Joi.object(schema).validate(obj);
  }

  async insert() {
    const [rows] = await promisePool.execute(
      `insert into sport_history() value(default,?,?,?,?)`,
      [this.athlete_id, this.spent_years, this.sport, this.description]
    );

    this.sport_history_id = rows.insertId;
    return this;
  }

  static customValidate(updateObj) {
    const customSchema = {};
    for (let key in updateObj) {
      if (schema[key]) customSchema[key] = schema[key];
    }

    return Joi.object(customSchema).validate(updateObj);
  }
  static async findAllPerAthlete(athlete_id, limit, pageNumber) {
    const offset = (pageNumber - 1) * limit;

    const [rows] = await promisePool.execute(`select * from sport_history s
                          where s.athlete_id=${athlete_id}
                          order  by s.sport 
                          limit ${limit} offset ${offset}  `);

    return rows;
  }
  static async findById(id) {
    const [rows] = await promisePool.execute(
      `select * from sport_history s where s.sport_history_id=? limit 1`,
      [id]
    );
    if (rows.length === 0) return null;
    return new SportHistory(rows[0]);
  }
  async update(updateObj) {
    for (let key in updateObj) {
      this[key] = updateObj[key];
    }
    return await crud.update("sport_history", updateObj, {
      key: "sport_history_id",
      value: this.sport_history_id,
    });
  }
  async delete() {
    await promisePool.execute(
      "delete from sport_history where sport_history_id=?",
      [this.sport_history_id]
    );
    return this;
  }
}
module.exports = SportHistory;
