const mailService = require("../services/nodeMailer");

class Email {
  static send(receiversArr, subject, html) {
    const receivers = receiversArr.join(",");
    const mailOptions = {
      from: process.env.GMAIL_USER_NAME,
      to: receivers,
      subject,
      html,
    };
    mailService.sendMail(mailOptions, (error, info) => {
      if (error) throw new Error(error);
    });
  }
}
module.exports = Email;
