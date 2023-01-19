const { promisePool } = require("./connection");

module.exports.update = async function (tableName, updateObj, idObj) {
  let q = [];
  for (let key in updateObj) {
    if (updateObj[key].isNotString) q.push(` ${key}= ${updateObj[key].value} `);
    else q.push(` ${key}='${updateObj[key]}' `);
  }

  q = q.join(",");

  const [rows] = await promisePool.query(
    `update ${tableName} set ${q} where ${idObj.key}='${idObj.value}'`
  );
  return rows;
};
module.exports.advancedSearch = async function advancedSearch(
  tableName,
  queryObj,
  unionWithAnd = true,
  select = "*"
) {
  let queryArray = [];
  for (let key in queryObj) {
    queryArray.push(`${key} = '${queryObj[key]}'`);
  }

  const union = unionWithAnd ? " and " : " or ";
  queryArray = queryArray.join(union);
  const [rows] = await promisePool.query(
    `select  ${select}  from ${tableName} where ${queryArray}`
  );
  return rows;
};
module.exports.findOne = async function (tableName, parameter, value) {
  const [rows] = await promisePool.query(
    `select * from ${tableName} where ${parameter}='${value}' limit 1`
  );
  return rows[0];
};
