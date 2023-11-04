const express = require("express");
const Joi = require("joi");
const Athlete = require("../entities/Athlete");
const Email = require("../entities/Email");
const Sub = require("../entities/Sub");
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

  let updateObj;
  if (req.body.rfid_tag === null)
    updateObj = { rfid_tag: { isNotString: true, value: req.body.rfid_tag } };
  else updateObj = { rfid_tag: req.body.rfid_tag };

  await athlete.update(updateObj);
  return res.send(athlete);
});
router.get("/athlete", staffAuth, secretaryAuth, async (req, res) => {
  const rows = await Athlete.findAll();

  return res.send(rows);
});
// this end point is not in use
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
      html: `${req.body.html}
      <div> written by ${req.staff.first_name} ${req.staff.last_name} </div>`,
    });
    email.send();
    return res.send("email sent");
  } catch (error) {
    return res.send("something failed when sending emails");
  }
});
//get all subs
// router.get('/sub',staffAuth,secretaryAuth,async(req,res)=>{
//   const rows=await Sub.f
// })
// change coach
router.put("/sub/:id", staffAuth, secretaryAuth, async (req, res) => {
  const { error } = Sub.validateCoach(req.body);
  if (error) return res.status(400).send(error.message);

  const sub = await Sub.findById(req.params.id);

  if (!sub) return res.status(404).send("didnt find subscription with this id");
  if (sub.sub_type_id != 2)
    return res.status(403).send("subscription type is normal");

  if (sub.coach_id)
    return res
      .status(403)
      .send("you can only update coach  if it is not selected");
  await sub.update(req.body);
  return res.send(sub);
});
module.exports = router;
