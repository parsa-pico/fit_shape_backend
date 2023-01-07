const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Athlete = require('../entities/athlete');
const { promisePool } = require('../mysql/connection');
const sportHistory = require('./sportHistory');
const athleteAuth = require('../middlewares/athleteAuth');
const SubHasPlan = require('../entities/SubHasPlan');
const Sub = require('../entities/Sub');
const router = express.Router();

//signup
router.post('/sign_up', async (req, res) => {
  const athlete = new Athlete(req.body);
  const { error } = athlete.validate(req.body);

  if (error) return res.status(400).send(error.message);
  const rows = await Athlete.advancedSearch(
    {
      national_code: athlete.national_code,
      phone_number: athlete.phone_number,
      email: athlete.email,
    },
    false
  );
  if (rows.length !== 0) return res.status(400).send('user already exists');
  const result = await athlete.insert();
  return res.send(result);
});
//login
router.post('/login', async (req, res) => {
  const { error } = Athlete.validateUserPass(req.body);
  if (error) return res.status(400).send(error.message);
  const athlete = await Athlete.findOne('email', req.body.email);

  if (!athlete) return res.status(400).send('invalid user name or password');
  const isValidPassword = await bcrypt.compare(
    req.body.password,
    athlete.password
  );
  if (!isValidPassword)
    return res.status(400).send('invalid user name or password');
  const token = jwt.sign(
    {
      first_name: athlete.first_name,
      last_name: athlete.last_name,
      athlete_id: athlete.athlete_id,
      phone_number: athlete.phone_number,
      email: athlete.email,
      national_code: athlete.national_code,
    },
    process.env.JWT_PRIVATE_KEY
  );
  return res.send(token);
});
//get

//update
router.put('/', athleteAuth, async (req, res) => {
  if (req.body.password)
    return res.status(403).send('you cant change password with this api');
  const athlete = await Athlete.findById(req.athlete.athlete_id);
  if (!athlete) return res.status(404).send('athlete not found');
  const { error } = Athlete.customValidate(req.body);
  if (error) return res.status(400).send(error.message);

  await athlete.update(req.body);
  const { password, ...rest } = athlete;
  return res.send(rest);
});
router.get(
  '/sub_plan/:sub_id/:limit/:pageNumber',
  athleteAuth,
  async (req, res) => {
    const sub = await Sub.findById(req.params.sub_id);

    if (!sub) return res.status(404).send('sub not found');

    if (sub.athlete_id !== req.athlete.athlete_id)
      return res.status(403).send('you are not athlete of this sub');

    const rows = await SubHasPlan.findAllPerSub(
      parseInt(req.params.sub_id),
      parseInt(req.params.limit),
      parseInt(req.params.pageNumber)
    );

    return res.send(rows);
  }
);
module.exports = router;
