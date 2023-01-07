const { promisePool } = require('../mysql/connection');
const schema = require('../models/sub');
const Joi = require('joi');
const crud = require('../mysql/crud.js');
class Sub {
  constructor(obj) {
    this.sub_id = obj.sub_id || null;
    this.created_date = obj.created_date || null;
    this.closet_number = obj.closet_number || null;
    this.sub_type_id = obj.sub_type_id;
    this.coach_id = obj.coach_id || null;
    this.athlete_id = obj.athlete_id;
    this.total_days = obj.total_days;
    this.remaning_days = obj.remaning_days || null;
    this.is_payed = obj.is_payed || null;
  }
  static validate(obj) {
    return Joi.object(schema).validate(obj);
  }
  static async findAllValidPerCoach(coach_id, limit, pageNumber) {
    const offset = (pageNumber - 1) * limit;
    const [rows] = await promisePool.execute(`select athlete_id,sub_id,coach_id
                        ,blood_type_id,phone_number
                        ,first_name,last_name,height from subscription s 
                        join athlete using (athlete_id)
                        where s.coach_id=${coach_id} and s.remaning_days !=0  and s.is_payed=1
                        limit ${limit} offset ${offset} `);
    return rows;
  }
  async insert() {
    const [rows] = await promisePool.execute(
      `call fit_shape.insert_sub(?,?,?,?);`,
      [this.sub_type_id, this.coach_id, this.athlete_id, this.total_days]
    );

    return rows[0];
  }
  async mustPayAmount() {
    const [rows] = await promisePool.execute(
      `select (st.price_per_day* s.total_days) as total_payment_amount
                        from subscription s
                        join sub_type st using (sub_type_id)
                        where s.sub_id=?  `,
      [this.sub_id]
    );

    return rows[0].total_payment_amount;
  }
  static validateCoach(updateObj) {
    return Joi.object({
      coach_id: Joi.number().required().max(100000),
    }).validate(updateObj);
  }
  static customValidate(updateObj) {
    const customSchema = {};
    for (let key in updateObj) {
      if (schema[key]) customSchema[key] = schema[key];
    }

    return Joi.object(customSchema).validate(updateObj);
  }
  static async findById(id) {
    const [rows] = await promisePool.execute(
      `select * from subscription s where s.sub_id=? limit 1`,
      [id]
    );
    if (rows.length === 0) return null;
    return new Sub(rows[0]);
  }
  async update(updateObj) {
    for (let key in updateObj) {
      this[key] = updateObj[key];
    }
    return await crud.update('subscription', updateObj, {
      key: 'sub_id',
      value: this.sub_id,
    });
  }
  //   async delete() {
  //     await promisePool.execute('delete from subscription where sub_id=?', [
  //       this.sport_history_id,
  //     ]);
  //     return this;
  //   }
}
module.exports = Sub;
