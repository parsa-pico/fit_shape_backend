const express = require("express");
const Sub = require("../entities/Sub");
const SubHasPlan = require("../entities/SubHasPlan");
const athleteAuth = require("../middlewares/athleteAuth");
const router = express.Router();

router.get("/:sub_id/:limit/:pageNumber", athleteAuth, async (req, res) => {
  const sub = await Sub.findById(req.params.sub_id);

  if (!sub) return res.status(404).send("sub not found");

  if (sub.athlete_id !== req.athlete.athlete_id)
    return res.status(403).send("you are not athlete of this sub");

  const rows = await SubHasPlan.findAllPerSub(
    parseInt(req.params.sub_id),
    parseInt(req.params.limit),
    parseInt(req.params.pageNumber)
  );

  return res.send(rows);
});
module.exports = router;
