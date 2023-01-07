const express = require('express');
const IdPay = require('../entities/IdPay');
const router = express.Router();
const Payment = require('../entities/Payment');
const Sub = require('../entities/Sub');
const athleteAuth = require('../middlewares/athleteAuth');

router.post('/', athleteAuth, async (req, res) => {
  const { error } = Payment.validate(req.body);
  if (error) return res.status(400).send(error.message);
  const sub = await Sub.findById(req.body.sub_id);
  if (!sub) return res.status(404).send('sub not found');
  if (sub.athlete_id !== req.athlete.athlete_id)
    return res.status(403).send('you are not athelte of this sub');
  if (sub.is_payed) return res.status(403).send('this sub is payed already');
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
  return res.send(payment);
});
router.post('/verify', athleteAuth, async (req, res) => {
  const { error } = Payment.validateForVeifyPayment(req.body);
  if (error) return res.status(400).send(error.message);
  const payment = await Payment.findById(req.body.id);
  if (!payment) return res.status(404).send('payment not found');
  if (payment.status_id == 3)
    return res.status(400).send('this payment is verified');
  const isVerified = await IdPay.fakeisVerifiedPayment(req.body.status);
  if (!isVerified) {
    await payment.update({
      status_id: 1,
      payed_date_time: new Date().toISOString().slice(0, 19).replace('T', ' '),
      payment_tracking_code: req.body.track_id,
    });
    return res.send({ ...payment, description: 'payment failed' });
  }
  await payment.setSubToPayed(req.body.track_id);
  return res.send(payment);
});

module.exports = router;
