const mysql2 = require("mysql2");

const pool = mysql2.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
  port: process.env.MYSQL_PORT,
});
const promisePool = pool.promise();
module.exports.promisePool = promisePool;
