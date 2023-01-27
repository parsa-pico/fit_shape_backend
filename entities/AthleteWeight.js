const { promisePool } = require("../mysql/connection");
const schema = require("../models/athlete_weight");
const Joi = require("joi");
const crud = require("../mysql/crud.js");
class AthleteWeight {
  constructor(obj) {
    this.athlete_id = obj.athlete_id;
    this.date = obj.date;
    this.weight = obj.weight;
  }
  static validate(obj) {
    return Joi.object(schema).validate(obj);
  }

  async insert() {
    const [rows] = await promisePool.execute(
      `insert into athlete_weight() value(?,?,?)`,
      [this.athlete_id, this.date, this.weight]
    );

    return this;
  }

  //   static customValidate(updateObj) {
  //     const customSchema = {};
  //     for (let key in updateObj) {
  //       if (schema[key]) customSchema[key] = schema[key];
  //     }

  // return Joi.object(customSchema).validate(updateObj);
  //   }1
  static async findAllPerAthlete(athlete_id, limit, pageNumber) {
    const offset = (pageNumber - 1) * limit;

    const [rows] = await promisePool.execute(`select * from athlete_weight a
                          where a.athlete_id=${athlete_id}
                          order by date desc
                          limit ${limit} offset ${offset} `);

    return rows;
  }
  static async findByKeys(athlete_id, date) {
    const [rows] = await promisePool.execute(
      `select * from athlete_weight a where a.athlete_id=? and a.date=? limit 1`,
      [athlete_id, date]
    );

    if (rows.length === 0) return null;
    return new AthleteWeight(rows[0]);
  }
  //   async update(updateObj) {
  //     for (let key in updateObj) {
  //       this[key] = updateObj[key];
  //     }
  //     return await crud.update('sport_history', updateObj, {
  //       key: 'sport_history_id',
  //       value: this.sport_history_id,
  //     });
  //   }
  async delete() {
    await promisePool.execute(
      "delete from athlete_weight a  where a.athlete_id=? and a.date=?",
      [this.athlete_id, this.date]
    );
    return this;
  }
}
module.exports = AthleteWeight;
