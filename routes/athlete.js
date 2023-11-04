const express = require("express");
const path = require("path");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Athlete = require("../entities/Athlete");
const athleteAuth = require("../middlewares/athleteAuth");
const Staff = require("../entities/Staff");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./images");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage });
//signup
router.post("/sign_up", async (req, res) => {
  const { error } = Athlete.validate(req.body);
  if (error) return res.status(400).send(error.message);
  const athlete = new Athlete(req.body);

  const rows = await Athlete.advancedSearch(
    {
      // national_code: athlete.national_code,
      // phone_number: athlete.phone_number,
      email: athlete.email,
    },
    false
  );
  if (rows.length !== 0) return res.status(400).send("user already exists");
  await athlete.insert();
  athlete.sendVerificationCode();
  return res.send({ athlete_id: athlete.athlete_id });
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
  if (!athlete.is_verified) return res.status(403).send("account not verified");
  const { password, verification_code, ...rest } = athlete;
  const token = jwt.sign(
    {
      ...rest,
    },
    process.env.JWT_PRIVATE_KEY
  );
  return res.send(token);
});
router.post("/re_send_verification", async (req, res) => {
  const athlete = await Athlete.findOne("athlete_id", req.body.athlete_id);
  if (!athlete) return res.status(404).send("user not found");
  if (athlete.is_verified) return res.status(403).send("user already verified");
  const verification_code = athlete.generateVerificationCode();
  await athlete.update({ verification_code });
  athlete.sendVerificationCode();
  return res.send("check your email");
});
router.post("/verify", async (req, res) => {
  const { error } = Athlete.validateForVerify(req.body);
  if (error) return res.status(400).send(error.message);
  const athlete = await Athlete.findById(req.body.user_id);
  if (!athlete) return res.status(404).send("athlete not found");
  if (athlete.is_verified)
    return res.status(409).send("this account is already verified");
  const isCorrectToken = athlete.isCorrectToken(req.body.token);

  if (!isCorrectToken) return res.status(400).send("incorrect token");
  await athlete.verifyAthlete();
  return res.send("verified");
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
router.get(`/avatar/:filename`, async (req, res) => {
  res.sendFile(
    `J:/MY-PROJECTS/My node projects/fit_shape_back/images/${req.params.filename}`
  );
});
router.post(
  "/avatar",
  athleteAuth,
  upload.single("avatar"),
  async (req, res, next) => {
    const athlete = await Athlete.findById(req.athlete.athlete_id);
    if (athlete.avatar) {
      fs.unlink(`./images/${athlete.avatar}`, (err) => {
        if (err) next(err);
      });
    }
    await athlete.update({ avatar: req.file.filename });
    res.send(athlete);
  }
);
module.exports = router;
