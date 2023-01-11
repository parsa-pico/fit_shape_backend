module.exports = function (req, res, next) {
  if (req.staff.job_position_id !== 3)
    return res.status(403).send("you dont have premission");
  next();
};
