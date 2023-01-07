const express = require('express');
const router = express.Router();
const Sub = require('../entities/Sub');
const athleteAuth = require('../middlewares/athleteAuth');

router.post('/', athleteAuth, async (req, res) => {
  const { error } = Sub.validate(req.body);
  if (error) return res.status(400).send(error.message);
  const sub = new Sub({
    ...req.body,
    athlete_id: req.athlete.athlete_id,
  });
  if (sub.sub_type_id !== 2 && sub.coach_id)
    return res.status(400).send('normal sub cannot have coach');
  const result = await sub.insert();
  return res.send(result);
});
router.put('/:id', athleteAuth, async (req, res) => {
  const { error } = Sub.validateCoach(req.body);
  if (error) return res.status(400).send(error.message);

  const sub = await Sub.findById(req.params.id);

  if (!sub) return res.status(404).send('didnt find subscription with this id');
  if (sub.sub_type_id !== 2)
    return res.status(403).send('your subscription type is normal');
  if (sub.athlete_id !== req.athlete.athlete_id)
    return res
      .status(403)
      .send('you dont have premission to update this record');
  if (sub.coach_id || sub.total_days !== sub.remaning_days)
    return res
      .status(403)
      .send(
        'you can only update coach_id if it is null or you dont have any entrance'
      );
  await sub.update(req.body);
  return res.send(sub);
});

module.exports = router;
