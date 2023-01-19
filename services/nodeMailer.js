const nodemailer = require("nodemailer");
module.exports = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER_NAME,
    pass: process.env.GMAIL_PASSWORD,
  },
});
