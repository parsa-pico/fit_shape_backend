const { promisePool } = require("../mysql/connection");
const schema = require("../models/payment");
const verifyPaymentSchema = require("../models/verifyPayment");
const Joi = require("joi");
const crud = require("../mysql/crud.js");
class Payment {
  constructor(obj) {
    this.payment_id = obj.payment_id;
    this.payment_link = obj.payment_link;
    this.status_id = obj.status_id;
    this.sub_id = obj.sub_id;
    this.created_date_time = obj.created_date_time || null;
    this.payed_date_time = obj.payed_date_time || null;
    this.payment_amount = obj.payment_amount;
    this.payment_tracking_code = obj.payment_tracking_code || null;
  }
  static validate(obj) {
    return Joi.object(schema).validate(obj);
  }
  static validateForVeifyPayment(obj) {
    return Joi.object(verifyPaymentSchema).validate(obj);
  }
  static async findAll(limit, pageNumber) {
    const offset = (pageNumber - 1) * limit;

    const [rows] = await promisePool.query(
      `
    SELECT athlete_id, first_name,last_name,phone_number,national_code,
    payed_date_time,payment_tracking_code,payment_amount,status_id
    FROM payment p 
    join subscription s using(sub_id)
    join athlete a using (athlete_id)
    order by payed_date_time desc
    limit ? offset ?
    `,
      [limit, offset]
    );

    return rows;
  }
  static async findAllPayedPerAthlete() {
    const [rows] = await promisePool.execute(
      `
      SELECT athlete_id, first_name,last_name,
      phone_number,national_code,sum(payment_amount) as total_payment
      FROM payment p 
      join subscription s using(sub_id)
      join athlete a using (athlete_id)
      where status_id=3
      group by athlete_id with rollup    
    `
    );

    return rows;
  }

  async insert() {
    const [rows] = await promisePool.execute(
      `insert into payment
      (payment_id,payment_link,status_id,sub_id,payment_amount)
       value(?,?,?,?,?) ;`,
      [
        this.payment_id,
        this.payment_link,
        this.status_id,
        this.sub_id,
        this.payment_amount,
      ]
    );

    return rows[0];
  }

  static async findById(id) {
    const [rows] = await promisePool.execute(
      `select * from payment p where p.payment_id = ? limit 1`,
      [id]
    );
    if (rows.length === 0) return null;
    return new Payment(rows[0]);
  }

  async update(updateObj) {
    for (let key in updateObj) {
      this[key] = updateObj[key];
    }
    return await crud.update("payment", updateObj, {
      key: "payment_id",
      value: this.payment_id,
    });
  }
  async setSubToPayed(payment_tracking_code) {
    const [rows] = await promisePool.execute(
      `call set_payment_and_sub_to_verified(?, ?, ?);`,
      [payment_tracking_code, this.payment_id, this.sub_id]
    );
    this.payment_tracking_code = payment_tracking_code;
    this.status_id = 3;
  }
}
module.exports = Payment;
