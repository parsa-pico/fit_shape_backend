const Joi = require("joi");
const mailService = require("../services/nodeMailer");
const {
  customNotifySchema,
  notifyPerJobPositionSchema,
} = require("../models/notify");
const { promisePool } = require("../mysql/connection");
class Email {
  constructor(obj) {
    this.receiversArr = obj.receiversArr;
    this.subject = obj.subject;
    this.html = obj.html;
  }
  send() {
    const receivers = this.receiversArr.join(",");
    const mailOptions = {
      from: process.env.GMAIL_USER_NAME,
      to: receivers,
      subject: this.subject,
      html: this.html,
    };
    mailService.sendMail(mailOptions, (error, info) => {
      if (error) {
        throw new Error(error);
      }
    });
  }
  static validateForCustomReceivers(obj) {
    return Joi.object(customNotifySchema).validate(obj);
  }
  static validateForCustomTypes(obj) {
    return Joi.object(notifyPerJobPositionSchema).validate(obj);
  }
  static async getUsersMails(types) {
    let query = [];
    types.forEach((type) => query.push(` job_position_id=${type} `));
    query = query.join(" or ");

    const [rows] = await promisePool.query(
      `select email from users_emails where ${query}`
    );
    return rows.map((row) => row.email);
  }
}
module.exports = Email;
