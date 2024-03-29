const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).send('no token provided');

  try {
    const decoded = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
    if (!decoded.athlete_id) throw new Error('not an athlete');
    req.athlete = decoded;
    next();
  } catch (error) {
    res.status(400).send('invalid token');
  }
};
