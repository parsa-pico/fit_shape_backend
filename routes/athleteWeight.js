const express = require('express');
const router = express.Router();
const AthleteWeight = require('../entities/AthleteWeight');
const athleteAuth = require('../middlewares/athleteAuth');
router.get('/:limit/:pageNumber', athleteAuth, async (req, res) => {
  const rows = await AthleteWeight.findAllPerAthlete(
    req.athlete.athlete_id,
    parseInt(req.params.limit),
    parseInt(req.params.pageNumber)
  );
  return res.send(rows);
});
router.post('/', athleteAuth, async (req, res) => {
  const { error } = AthleteWeight.validate(req.body);
  if (error) return res.status(400).send(error.message);
  const athleteWeight = new AthleteWeight({
    ...req.body,
    athlete_id: req.athlete.athlete_id,
  });

  await athleteWeight.insert();
  return res.send(athleteWeight);
});
// router.put('/:id', athleteAuth, async (req, res) => {
//   const sportHistory = await AthleteWeight.findById(req.params.id);

//   if (!sportHistory)
//     return res.status(404).send('didnt find sport history with this id');
//   if (sportHistory.athlete_id !== req.athlete.athlete_id)
//     return res
//       .status(403)
//       .send('you dont have premission to update this record');
//   const { error } = AthleteWeight.customValidate(req.body);
//   if (error) return res.status(400).send(error.message);

//   await sportHistory.update(req.body);
//   return res.send(sportHistory);
// });
router.delete('/:date', athleteAuth, async (req, res) => {
  const athleteWeight = await AthleteWeight.findByKeys(
    req.athlete.athlete_id,
    req.params.date
  );

  if (!athleteWeight)
    return res.status(404).send('didnt find athlete weight with these keys');
  //   if (athleteWeight.athlete_id !== req.athlete.athlete_id)
  //     return res
  //       .status(403)
  //       .send('you dont have premission to delete this record');
  await athleteWeight.delete();
  return res.send(athleteWeight);
});
module.exports = router;
