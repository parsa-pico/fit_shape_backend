const express = require("express");
const Joi = require("joi");
const Athlete = require("../entities/athlete");
const Email = require("../entities/Email");
const secretaryAuth = require("../middlewares/secretaryAuth");
const staffAuth = require("../middlewares/staffAuth");
const router = express.Router();
const rfidSchema = require("../models/rfidTag");
//cahnge only rfid tag
router.put("/athlete/:id", staffAuth, secretaryAuth, async (req, res) => {
  if (req.body.rfid_tag !== null) {
    const { error } = Joi.object(rfidSchema).validate(req.body);
    if (error) return res.status(400).send(error.message);
  }
  const athlete = await Athlete.findById(parseInt(req.params.id));
  if (!athlete) return res.status(404).send("athelte not found");
  const updateObj =
    req.body.rifd_tag === null
      ? { rfid_tag: { isNotString: true, value: req.body.rfid_tag } }
      : { rfid_tag: req.body.rfid_tag };
  await athlete.update(updateObj);
  return res.send(athlete);
});
router.get("/athlete", staffAuth, secretaryAuth, async (req, res) => {
  const rows = await Athlete.findAll();

  return res.send(rows);
});
router.post("/custom_notify", staffAuth, secretaryAuth, async (req, res) => {
  const { error } = Email.validateForCustomReceivers(req.body);
  if (error) return res.status(400).send(error.message);

  try {
    const email = new Email(req.body);
    email.send();
    return res.send("email sent");
  } catch (error) {
    return res.send("something failed when sending emails");
  }
});
router.post("/notify", staffAuth, secretaryAuth, async (req, res) => {
  const { error } = Email.validateForCustomTypes(req.body);
  if (error) return res.status(400).send(error.message);
  const emails = await Email.getUsersMails(req.body.types);
  try {
    const email = new Email({
      receiversArr: emails,
      subject: req.body.subject,
      html: req.body.html,
    });
    email.send();
    return res.send("email sent");
  } catch (error) {
    return res.send("something failed when sending emails");
  }
});
module.exports = router;
