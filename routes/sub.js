const express = require("express");
const IdPay = require("../entities/IdPay");
const Payment = require("../entities/Payment");
const router = express.Router();
const Sub = require("../entities/Sub");
const athleteAuth = require("../middlewares/athleteAuth");

router.get("/:limit/:pageNumber", athleteAuth, async (req, res) => {
  const rows = await Sub.findAllPerAthlete(
    req.athlete.athlete_id,
    req.params.limit,
    req.params.pageNumber
  );
  return res.send(rows);
});
router.get("/doesHaveActiveSub", athleteAuth, async (req, res) => {
  const activeSub = await Sub.doesHaveActivePayedSub(req.athlete.athlete_id);
  if (activeSub) return res.send(1);
  return res.send(0);
});
router.get("/sub_type", async (req, res) => {
  const rows = await Sub.findAllSubTypes();
  return res.send(rows);
});
router.post("/", athleteAuth, async (req, res) => {
  const { error } = Sub.validate(req.body);
  if (error) return res.status(400).send(error.message);
  const activeSub = await Sub.doesHaveActivePayedSub(req.athlete.athlete_id);
  if (activeSub) return res.status(400).send("you already have an active sub");
  const sub = new Sub({
    ...req.body,
    athlete_id: req.athlete.athlete_id,
  });
  if (sub.sub_type_id != 2 && sub.coach_id)
    return res.status(400).send("normal sub cannot have coach");
  await sub.insert();
  console.log(sub);
  const paymentAmount = await sub.mustPayAmount();
  const { id: payment_id, link: payment_link } = await IdPay.makePayment(
    sub.sub_id,
    paymentAmount
  );

  const payment = new Payment({
    payment_id,
    payment_link,
    status_id: 2,
    sub_id: sub.sub_id,
    payment_amount: paymentAmount,
  });
  await payment.insert();
  return res.send({ ...sub, payment_link });
});
router.put("/:id", athleteAuth, async (req, res) => {
  const { error } = Sub.validateCoach(req.body);
  if (error) return res.status(400).send(error.message);

  const sub = await Sub.findById(req.params.id);

  if (!sub) return res.status(404).send("didnt find subscription with this id");
  if (sub.sub_type_id != 2)
    return res.status(403).send("your subscription type is normal");
  if (sub.athlete_id !== req.athlete.athlete_id)
    return res
      .status(403)
      .send("you dont have premission to update this record");
  if (sub.coach_id || sub.total_days !== sub.remaning_days)
    return res
      .status(403)
      .send(
        "you can only update coach_id if it is null or you dont have any entrance"
      );
  await sub.update(req.body);
  return res.send(sub);
});

module.exports = router;
