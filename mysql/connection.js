const mysql2 = require('mysql2');

const pool = mysql2.createPool({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'fit_shape',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
});
const promisePool = pool.promise();
module.exports.promisePool = promisePool;
