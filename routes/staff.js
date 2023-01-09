const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Staff = require("../entities/Staff");
const { promisePool } = require("../mysql/connection");
const staffAuth = require("../middlewares/staffAuth");
const router = express.Router();

//signup
router.post("/sign_up", async (req, res) => {
  const { error } = Staff.validate(req.body);
  if (error) return res.status(400).send(error.message);

  const staff = new Staff(req.body);
  const rows = await Staff.advancedSearch(
    {
      national_code: staff.national_code,
      phone_number: staff.phone_number,
      email: staff.email,
    },
    false
  );
  if (rows.length !== 0) return res.status(400).send("user already exists");
  const result = await staff.insert();
  return res.send(result);
});
//login
router.post("/login", async (req, res) => {
  const { error } = Staff.validateUserPass(req.body);
  if (error) return res.status(400).send(error.message);
  const staff = await Staff.findOne("email", req.body.email);

  if (!staff) return res.status(400).send("invalid user name or password");
  const isValidPassword = await bcrypt.compare(
    req.body.password,
    staff.password
  );
  if (!isValidPassword)
    return res.status(400).send("invalid user name or password");

  if (!staff.job_position_id)
    return res.status(403).send("owner didnt give you any job position yet");
  const token = jwt.sign(
    {
      first_name: staff.first_name,
      last_name: staff.last_name,
      staff_id: staff.staff_id,
      phone_number: staff.phone_number,
      email: staff.email,
      national_code: staff.national_code,
      job_position_id: staff.job_position_id,
      city: staff.city,
      street: staff.street,
      alley: staff.alley,
      house_number: staff.house_number,
    },
    process.env.JWT_PRIVATE_KEY
  );
  return res.send(token);
});

//update
router.put("/", staffAuth, async (req, res) => {
  if (req.body.password || req.body.email)
    return res
      .status(403)
      .send("you cant change email or password with this api");
  const staff = await Staff.findById(req.staff.staff_id);
  if (!staff) return res.status(404).send("staff not found");
  const { error } = Staff.customValidate(req.body);
  if (error) return res.status(400).send(error.message);

  await staff.update(req.body);
  const { password, ...rest } = staff;
  return res.send(rest);
});

module.exports = router;
