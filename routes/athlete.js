const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Athlete = require("../entities/athlete");
const { promisePool } = require("../mysql/connection");
const sportHistory = require("./sportHistory");
const athleteAuth = require("../middlewares/athleteAuth");
const SubHasPlan = require("../entities/SubHasPlan");
const Sub = require("../entities/Sub");
const Staff = require("../entities/Staff");
const router = express.Router();

//signup
router.post("/sign_up", async (req, res) => {
  const athlete = new Athlete(req.body);
  const { error } = athlete.validate(req.body);

  if (error) return res.status(400).send(error.message);
  const rows = await Athlete.advancedSearch(
    {
      // national_code: athlete.national_code,
      // phone_number: athlete.phone_number,
      email: athlete.email,
    },
    false
  );
  if (rows.length !== 0) return res.status(400).send("user already exists");
  const result = await athlete.insert();
  return res.send(result);
});
//login
router.post("/login", async (req, res) => {
  const { error } = Athlete.validateUserPass(req.body);
  if (error) return res.status(400).send(error.message);
  const athlete = await Athlete.findOne("email", req.body.email);

  if (!athlete) return res.status(400).send("invalid user name or password");
  const isValidPassword = await bcrypt.compare(
    req.body.password,
    athlete.password
  );
  if (!isValidPassword)
    return res.status(400).send("invalid user name or password");
  const { password, ...rest } = athlete;
  const token = jwt.sign(
    {
      ...rest,
    },
    process.env.JWT_PRIVATE_KEY
  );
  return res.send(token);
});

router.get("/is_unique/:email", async (req, res) => {
  const { error } = Athlete.customValidate({ email: req.params.email });
  if (error) return res.status(400).send(error.message);
  const athlete = Athlete.findById(req.params.email);
  if (athlete) return res.status(400).send("athlete already exists");
  return res.send("this email dosent exists yet");
});
router.get("/coach", athleteAuth, async (req, res) => {
  const rows = await Staff.advancedSearch(
    { job_position_id: 2 },
    true,
    `staff_id,concat(first_name,' ',last_name) as full_name`
  );
  return res.send(rows);
});
//update
router.put("/", athleteAuth, async (req, res) => {
  if (req.body.password || req.body.email)
    return res
      .status(403)
      .send("you cant change email or password with this api");
  const athlete = await Athlete.findById(req.athlete.athlete_id);
  // if (!athlete) return res.status(404).send("athlete not found");
  const { error } = Athlete.customValidate(req.body);
  if (error) return res.status(400).send(error.message);

  await athlete.update(req.body);
  const { password, ...rest } = athlete;
  return res.send(rest);
});

module.exports = router;
