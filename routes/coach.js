const express = require("express");
const router = express.Router();
const coachAuth = require("../middlewares/coachAuth");
const staffAuth = require("../middlewares/staffAuth");
const SportHistory = require("../entities/SportHistory");
const SubHasPlan = require("../entities/SubHasPlan");
const Sub = require("../entities/Sub");
const AthleteWeight = require("../entities/AthleteWeight");
const CoachPlan = require("../entities/CoachPlan");
const subPlanValidation = require("../middlewares/subPlanValidation");
router.get(
  "/assigned_subs/:limit/:pageNumber",
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
  "/athlete_sport_history/:id/:limit/:pageNumber",
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
  "/athlete_weight/:id/:limit/:pageNumber",
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
