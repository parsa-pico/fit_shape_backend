const { promisePool } = require("../mysql/connection");
const schema = require("../models/sub");
const Joi = require("joi");
const crud = require("../mysql/crud.js");
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
  static async doesHaveActivePayedSub(athlete_id) {
    const [rows] =
      await promisePool.execute(`select exists (SELECT * FROM subscription
      where athlete_id=${athlete_id} and is_payed=1 and remaning_days!=0 ) as does_have_active_sub
      ;`);
    if (rows[0].does_have_active_sub) return true;
    return false;
  }
  static async findActiveSub(athlete_id) {
    const [rows] = await promisePool.execute(`SELECT * FROM subscription
      where athlete_id=${athlete_id} and is_payed=1 and remaning_days!=0 
      ;`);

    if (rows.length === 0) return null;
    return rows[0];
  }
  static async findAllValidPerCoach(coach_id, limit, pageNumber) {
    const offset = (pageNumber - 1) * limit;
    const [rows] = await promisePool.execute(`
      select athlete_id,sub_id,coach_id,remaning_days
      ,blood_type_id,phone_number
      ,first_name,last_name,height from subscription s 
      join athlete using (athlete_id)
      where s.coach_id=${coach_id}  and s.is_payed=1
      order by s.created_date_time desc
      limit ${limit} offset ${offset} `);
    return rows;
  }
  static async findAllPerAthlete(athlete_id, limit, pageNumber) {
    const offset = (pageNumber - 1) * limit;
    const [rows] = await promisePool.execute(`
    select sub_id,created_date_time,closet_number,sub_type_id,coach_id,
    total_days,remaning_days,
    is_payed,concat(first_name,' ',last_name) as coach_full_name
    from subscription s 
    left join staff sf on (sf.staff_id=s.coach_id)
    where s.athlete_id=${athlete_id} 
    order by sub_id desc
    limit ${limit} offset ${offset}  `);
    return rows;
  }
  async insert() {
    const [rows] = await promisePool.execute(
      `call fit_shape.insert_sub(?,?,?,?);`,
      [this.sub_type_id, this.coach_id, this.athlete_id, this.total_days]
    );

    this.sub_id = rows[0][0].sub_id;
  }
  async mustPayAmountWithInsertedSub() {
    const [rows] = await promisePool.execute(
      `select (st.price_per_day* s.total_days) as total_payment_amount
                        from subscription s
                        join sub_type st using (sub_type_id)
                        where s.sub_id=?  `,
      [this.sub_id]
    );

    return rows[0].total_payment_amount;
  }
  async mustPayAmount() {
    const [rows] = await promisePool.execute(
      `select price_per_day from sub_type where sub_type_id=?  `,
      [this.sub_type_id]
    );
    const pricePerDay = rows[0].price_per_day;
    return pricePerDay * this.total_days;
  }
  static validateCoach(updateObj) {
    return Joi.object({
      coach_id: Joi.number().required().max(100000),
    }).validate(updateObj);
  }
  static async findAllSubTypes() {
    const [rows] = await promisePool.execute(`select * from sub_type`);
    return rows;
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
    return await crud.update("subscription", updateObj, {
      key: "sub_id",
      value: this.sub_id,
    });
  }

  static async updatePrices(updateObj, sub_type_id) {
    return await crud.update("sub_type", updateObj, {
      key: "sub_type_id",
      value: sub_type_id,
    });
  }
  static async advancedSearch(queryObj, unionWithAnd = true) {
    return await crud.advancedSearch("subscription", queryObj, unionWithAnd);
  }
}
module.exports = Sub;
