const express = require("express");
const Sub = require("../entities/Sub");
const SubHasPlan = require("../entities/SubHasPlan");
const coachAuth = require("../middlewares/coachAuth");
const staffAuth = require("../middlewares/staffAuth");
const subPlanValidation = require("../middlewares/subPlanValidation");

const router = express.Router();

router.get(
  "/:sub_id/:limit/:pageNumber",
  staffAuth,
  coachAuth,
  async (req, res) => {
    const sub = await Sub.findById(req.params.sub_id);

    if (!sub) return res.status(404).send("sub_id not found");
    if (sub.coach_id !== req.staff.staff_id)
      return res.status(403).send("you are not coach of this sub");
    const rows = await SubHasPlan.findAllPerSub(
      parseInt(req.params.sub_id),
      parseInt(req.params.limit),
      parseInt(req.params.pageNumber)
    );
    return res.send(rows);
  }
);
router.post("/", staffAuth, coachAuth, subPlanValidation, async (req, res) => {
  const subHasPlan = new SubHasPlan(req.body);
  await subHasPlan.insert();
  return res.send(subHasPlan);
});
router.delete(
  "/",
  staffAuth,
  coachAuth,
  subPlanValidation,
  async (req, res) => {
    const subHasPlan = await SubHasPlan.findByKeys(
      req.body.sub_id,
      req.body.coach_plan_id
    );
    if (!subHasPlan)
      return res.status(404).send("this sub_has_plan dosent exist");

    await subHasPlan.delete();
    return res.send(subHasPlan);
  }
);
module.exports = router;
