const express = require('express');
const router = express.Router();
const CoachPlan = require('../entities/CoachPlan');
const staffAuth = require('../middlewares/staffAuth');
const coachAuth = require('../middlewares/coachAuth');

//get all coach plans that a coach has
router.get('/me/:limit/:pageNumber', staffAuth, coachAuth, async (req, res) => {
  const rows = await CoachPlan.findAllPerCoach(
    req.staff.staff_id,
    parseInt(req.params.limit),
    parseInt(req.params.pageNumber)
  );
  return res.send(rows);
});
router.post('/', staffAuth, coachAuth, async (req, res) => {
  const { error } = CoachPlan.validate(req.body);
  if (error) return res.status(400).send(error.message);
  const coachPlan = new CoachPlan({
    ...req.body,
    coach_id: req.staff.staff_id,
  });

  await coachPlan.insert();
  return res.send(coachPlan);
});
router.put('/:id', staffAuth, coachAuth, async (req, res) => {
  const coachPlan = await CoachPlan.findById(req.params.id);

  if (!coachPlan)
    return res.status(404).send('didnt find coach plan with this id');
  if (coachPlan.coach_id !== req.staff.staff_id)
    return res
      .status(403)
      .send('you dont have premission to update this record');
  const { error } = CoachPlan.customValidate(req.body);
  if (error) return res.status(400).send(error.message);

  await coachPlan.update(req.body);
  return res.send(coachPlan);
});
router.delete('/:id', staffAuth, coachAuth, async (req, res) => {
  const coachPlan = await CoachPlan.findById(req.params.id);

  if (!coachPlan)
    return res.status(404).send('didnt find coach plan with this id');
  if (coachPlan.coach_id !== req.staff.staff_id)
    return res
      .status(403)
      .send('you dont have premission to delete this record');
  await coachPlan.delete();
  return res.send(coachPlan);
});
module.exports = router;
