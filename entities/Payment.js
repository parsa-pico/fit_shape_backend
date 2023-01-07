const { promisePool } = require('../mysql/connection');
const schema = require('../models/payment');
const verifyPaymentSchema = require('../models/verifyPayment');
const Joi = require('joi');
const crud = require('../mysql/crud.js');
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

  //   static customValidate(updateObj) {
  //     const customSchema = {};
  //     for (let key in updateObj) {
  //       if (schema[key]) customSchema[key] = schema[key];
  //     }

  //     return Joi.object(customSchema).validate(updateObj);
  //   }
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
    return await crud.update('payment', updateObj, {
      key: 'payment_id',
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
  //   async delete() {
  //     await promisePool.execute('delete from subscription where sub_id=?', [
  //       this.sport_history_id,
  //     ]);
  //     return this;
  //   }
}
module.exports = Payment;
