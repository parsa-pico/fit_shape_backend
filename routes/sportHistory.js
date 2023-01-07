const express = require('express');
const router = express.Router();
const SportHistory = require('../entities/SportHistory');
const athleteAuth = require('../middlewares/athleteAuth');

router.post('/', athleteAuth, async (req, res) => {
  const { error } = SportHistory.validate(req.body);
  if (error) return res.status(400).send(error.message);
  const sportHistory = new SportHistory({
    ...req.body,
    athlete_id: req.athlete.athlete_id,
  });

  await sportHistory.insert();
  return res.send(sportHistory);
});
router.put('/:id', athleteAuth, async (req, res) => {
  const sportHistory = await SportHistory.findById(req.params.id);

  if (!sportHistory)
    return res.status(404).send('didnt find sport history with this id');
  if (sportHistory.athlete_id !== req.athlete.athlete_id)
    return res
      .status(403)
      .send('you dont have premission to update this record');
  const { error } = SportHistory.customValidate(req.body);
  if (error) return res.status(400).send(error.message);

  await sportHistory.update(req.body);
  return res.send(sportHistory);
});
router.delete('/:id', athleteAuth, async (req, res) => {
  const sportHistory = await SportHistory.findById(req.params.id);

  if (!sportHistory)
    return res.status(404).send('didnt find sport history with this id');
  if (sportHistory.athlete_id !== req.athlete.athlete_id)
    return res
      .status(403)
      .send('you dont have premission to delete this record');
  await sportHistory.delete();
  return res.send(sportHistory);
});
module.exports = router;
