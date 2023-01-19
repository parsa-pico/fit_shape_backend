const express = require("express");
const Joi = require("joi");
const Athlete = require("../entities/athlete");
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
  await athlete.update({
    rfid_tag: { isNotString: true, value: req.body.rfid_tag },
  });
  return res.send(athlete);
});
router.get("/athlete", staffAuth, secretaryAuth, async (req, res) => {
  const rows = await Athlete.findAll();

  return res.send(rows);
});
module.exports = router;
