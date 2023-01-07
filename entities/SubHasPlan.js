const { promisePool } = require('../mysql/connection');
const schema = require('../models/subHasPlan');
const Joi = require('joi');
const crud = require('../mysql/crud.js');
class SubHasPlan {
  constructor(obj) {
    this.sub_id = obj.sub_id;
    this.coach_plan_id = obj.coach_plan_id;
  }
  static validate(obj) {
    return Joi.object(schema).validate(obj);
  }

  async insert() {
    const [rows] = await promisePool.execute(
      `insert into sub_has_coach_plan() value(?,?)`,
      [this.sub_id, this.coach_plan_id]
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
  static async findAllPerSub(sub_id, limit, pageNumber) {
    const offset = (pageNumber - 1) * limit;

    const [rows] = await promisePool.execute(`select * from sub_has_coach_plan s
                          join coach_plan c using(coach_plan_id)
                          where s.sub_id=${sub_id} 
                          limit ${limit} offset ${offset} `);

    return rows;
  }
  static async findByKeys(sub_id, coach_plan_id) {
    const [rows] = await promisePool.execute(
      `select * from sub_has_coach_plan s where s.sub_id=? and s.coach_plan_id=? limit 1`,
      [sub_id, coach_plan_id]
    );

    if (rows.length === 0) return null;
    return new SubHasPlan(rows[0]);
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
      'delete from sub_has_coach_plan s  where s.sub_id=? and s.coach_plan_id=?',
      [this.sub_id, this.coach_plan_id]
    );
    return this;
  }
}
module.exports = SubHasPlan;
