const express = require("express");
const Owner = require("../entities/Owner");
const Sub = require("../entities/Sub");
const router = express.Router();
const ownerAuth = require("../middlewares/ownerAuth");
const staffAuth = require("../middlewares/staffAuth");
const Staff = require("../entities/Staff");
const Joi = require("joi");
const subType = require("../models/subType");

// this is get method,but get method doesnt support req.body and i wanna have nested obj
router.post(
  "/staff/:limit/:pageNumber",
  staffAuth,
  ownerAuth,
  async (req, res) => {
    const [rows, count, totalPages] = await Owner.getAllStaff(
      parseInt(req.params.limit),
      parseInt(req.params.pageNumber),
      req.body
    );
    return res.send({ rows, count, totalPages });
  }
);
router.put("/staff", staffAuth, ownerAuth, async (req, res) => {
  let result;
  if (req.body.job_position_id === null)
    // because of joi validate func,i set job position id to a valid number,because i couldnt find allow null
    result = Owner.validate({ ...req.body, job_position_id: 3 });
  else result = Owner.validate(req.body);
  if (result.error) return res.status(400).send(error.message);

  const staff = await Staff.findById(req.body.staff_id);

  if (!staff || staff.staff_id == process.env.OWNER_ID)
    return res.status(404).send("staff not found");
  await staff.updateJustIntValues({
    job_position_id: req.body.job_position_id,
  });
  return res.send(staff);
});
router.put("/sub_type", staffAuth, ownerAuth, async (req, res) => {
  const { error } = Joi.object(subType).validate(req.body);
  if (error) return res.status(400).send(error.message);
  await Sub.updatePrices(
    { price_per_day: req.body.price_per_day },
    req.body.sub_type_id
  );
  return res.send("ok");
});
module.exports = router;
