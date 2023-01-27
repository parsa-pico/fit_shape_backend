const Gate = require("../entities/Gate");
const secretaryAuth = require("../middlewares/secretaryAuth");
const staffAuth = require("../middlewares/staffAuth");

const router = require("express").Router();
router.post("/on", staffAuth, secretaryAuth, async (req, res) => {
  try {
    Gate.on();
    return res.send("ok");
  } catch (error) {
    return res.status(500).send("could not turn on");
  }
});
router.post("/off", staffAuth, secretaryAuth, async (req, res) => {
  try {
    Gate.off();
    return res.send("ok");
  } catch (error) {
    return res.status(500).send("could not turn off");
  }
});
router.post("/rotate", staffAuth, secretaryAuth, async (req, res) => {
  try {
    const isMoving = Gate.getState();
    if (isMoving) return res.status(403).send("gate is moving");
    Gate.rotate180deg();
    return res.send("ok");
  } catch (error) {
    return res.status(500).send("could not rotate");
  }
});

module.exports = router;
