const Joi = require("joi");
const mailService = require("../services/nodeMailer");
const notifySchema = require("../models/notify");
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
      if (error) throw new Error(error);
    });
  }
  static validate(obj) {
    return Joi.object(notifySchema).validate(obj);
  }
}
module.exports = Email;
