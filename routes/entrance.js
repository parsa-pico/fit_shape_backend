const express = require("express");
const Owner = require("../entities/Owner");
const router = express.Router();
const staffAuth = require("../middlewares/staffAuth");
const secretaryAuth = require("../middlewares/secretaryAuth");
const Athlete = require("../entities/athlete");
const Sub = require("../entities/Sub");
const Entracne = require("../entities/Entrance");

router.post("/", staffAuth, secretaryAuth, async (req, res) => {
  if (!req.body.rfid_tag) return res.status(400).send("rfid_tag required");
  const athlete = await Athlete.findByRfidTag(req.body.rfid_tag);

  if (!athlete) return res.status(404).send("athlete not found");
  const activeSub = await Sub.findActiveSub(athlete.athlete_id);
  if (!activeSub) return res.status(403).send("you dont have an active sub");

  const entrance = new Entracne({ sub_id: activeSub.sub_id });
  if (!athlete.is_in_gym) {
    await entrance.submitEntrance(athlete.athlete_id);
    return res.send("submited entrance,now you are in gym");
  } else {
    await entrance.submitDeparture(athlete.athlete_id);
    return res.send("submited departure,now you are out of gym");
  }
});
module.exports = router;
