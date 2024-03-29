const express = require("express");
const router = express.Router();
const Owner = require("../entities/Owner");
const staffAuth = require("../middlewares/staffAuth");
const secretaryAuth = require("../middlewares/secretaryAuth");
const Athlete = require("../entities/Athlete");
const Sub = require("../entities/Sub");
const Entracne = require("../entities/Entrance");
const Gate = require("../entities/Gate");

router.get(
  "/:limit/:pageNumber",
  staffAuth,
  secretaryAuth,
  async (req, res) => {
    const rows = await Entracne.getAll(req.params.limit, req.params.pageNumber);
    return res.send(rows);
  }
);
router.post("/", staffAuth, secretaryAuth, async (req, res) => {
  const isMoving = Gate.getState();
  if (isMoving) return res.status(403).send("gate is moving");
  if (!req.body.rfid_tag) return res.status(400).send("rfid_tag required");
  const athlete = await Athlete.findByRfidTag(req.body.rfid_tag);
  if (!athlete) return res.status(404).send("athlete not found");
  const activeSub = await Sub.findActiveSub(athlete.athlete_id);
  const athleteName = `${athlete.first_name} ${athlete.last_name}`;
  if (!activeSub)
    return res
      .status(403)
      .send(`dear ${athleteName} you dont have an active sub`);

  const entrance = new Entracne({ sub_id: activeSub.sub_id });
  if (!athlete.is_in_gym) {
    await entrance.submitEntrance(athlete.athlete_id);
    Gate.rotate180deg();
    return res.send(`submited entrance for ${athleteName} `);
  } else {
    await entrance.submitDeparture(athlete.athlete_id);
    Gate.rotate180deg();
    return res.send(`submited departure for ${athleteName}`);
  }
});
module.exports = router;
