const SubHasPlan = require("../entities/SubHasPlan");
const Sub = require("../entities/Sub");
const CoachPlan = require("../entities/CoachPlan");

module.exports = async function (req, res, next) {
  const { error } = SubHasPlan.validate(req.body);
  if (error) return res.status(400).send(error.message);
  const sub = await Sub.findById(req.body.sub_id);

  if (!sub) return res.status(400).send("invalid sub id");
  if (sub.coach_id !== req.staff.staff_id)
    return res.status(403).send("you are not coach of this sub");
  if (!sub.is_payed)
    return res.status(403).send("this athlete has not payed yet");
  if (!sub.remaning_days) return res.status(403).send("this sub is expired");
  const coach_plan = await CoachPlan.findById(req.body.coach_plan_id);
  if (!coach_plan) return res.status(400).send("invalid coach plan id");
  if (coach_plan.coach_id !== req.staff.staff_id)
    return res.status(403).send("you are not coach of this coach_plan");
  next();
};
