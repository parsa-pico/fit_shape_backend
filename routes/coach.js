const express = require('express');
const router = express.Router();
const coachAuth = require('../middlewares/coachAuth');
const staffAuth = require('../middlewares/staffAuth');
const SportHistory = require('../entities/SportHistory');
const SubHasPlan = require('../entities/SubHasPlan');
const Sub = require('../entities/Sub');
const AthleteWeight = require('../entities/AthleteWeight');
const CoachPlan = require('../entities/CoachPlan');
const subPlanValidation = require('../middlewares/subPlanValidation');
router.get(
  '/assigned_subs/:limit/:pageNumber',
  staffAuth,
  coachAuth,
  async (req, res) => {
    const rows = await Sub.findAllValidPerCoach(
      req.staff.staff_id,
      parseInt(req.params.limit),
      parseInt(req.params.pageNumber)
    );
    return res.send(rows);
  }
);
router.get(
  '/athlete_sport_history/:id/:limit/:pageNumber',
  staffAuth,
  coachAuth,
  async (req, res) => {
    const rows = await SportHistory.findAllPerAthlete(
      parseInt(req.params.id),
      parseInt(req.params.limit),
      parseInt(req.params.pageNumber)
    );
    return res.send(rows);
  }
);
router.get(
  '/sub_plan/:sub_id/:limit/:pageNumber',
  staffAuth,
  coachAuth,
  async (req, res) => {
    const sub = await Sub.findById(req.params.sub_id);

    if (!sub) return res.status(404).send('sub_id not found');
    if (sub.coach_id !== req.staff.staff_id)
      return res.status(403).send('you are not coach of this sub');
    const rows = await SubHasPlan.findAllPerSub(
      parseInt(req.params.sub_id),
      parseInt(req.params.limit),
      parseInt(req.params.pageNumber)
    );
    return res.send(rows);
  }
);
router.post(
  '/sub_plan',
  staffAuth,
  coachAuth,
  subPlanValidation,
  async (req, res) => {
    const subHasPlan = new SubHasPlan(req.body);
    await subHasPlan.insert();
    return res.send(subHasPlan);
  }
);
router.delete(
  '/sub_plan',
  staffAuth,
  coachAuth,
  subPlanValidation,
  async (req, res) => {
    const subHasPlan = await SubHasPlan.findByKeys(
      req.body.sub_id,
      req.body.coach_plan_id
    );
    if (!subHasPlan)
      return res.status(404).send('this sub_has_plan dosent exist');

    await subHasPlan.delete();
    return res.send(subHasPlan);
  }
);
router.get(
  '/athlete_weight/:id/:limit/:pageNumber',
  staffAuth,
  coachAuth,
  async (req, res) => {
    const rows = await AthleteWeight.findAllPerAthlete(
      parseInt(req.params.id),
      parseInt(req.params.limit),
      parseInt(req.params.pageNumber)
    );
    return res.send(rows);
  }
);
module.exports = router;
