const express = require("express");
const Closet = require("../entities/Closet");
const router = express.Router();
const Sub = require("../entities/Sub");
const athleteAuth = require("../middlewares/athleteAuth");

router.post("/", athleteAuth, async (req, res) => {
  if (!req.body.sub_id) return res.status(400).send("sub_id is required");
  const sub = await Sub.findById(req.body.sub_id);
  if (sub.athlete_id != req.athlete.athlete_id)
    return res.status(403).send("you are not athlete of this sub");
  if (sub.closet_number)
    return res.status(403).send("this sub already have a closet");
  if (!sub.is_payed)
    return res.status(403).send("you should pay your sub first");
  if (!sub.remaning_days) return res.status(403).send("this sub is expired");
  const closet_number = await Closet.assignClosetToSub(sub.sub_id);
  return res.send({ closet_number });
});
module.exports = router;
