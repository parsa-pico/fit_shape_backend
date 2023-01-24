const { promisePool } = require("../mysql/connection");
const Joi = require("joi");
const crud = require("../mysql/crud.js");

class Owner {
  static async getAllStaff(limit, pageNumber, queryObj) {
    const offset = (pageNumber - 1) * limit;
    let where = `where staff_id != ${process.env.OWNER_ID} `;

    if (Object.keys(queryObj).length !== 0) {
      where += " and " + crud.convertQueryObjToString(queryObj);
    }
    const [rows] = await promisePool.execute(
      `select staff_id,national_code,job_position_id,phone_number,email,
      first_name,last_name,city,street,alley,house_number 
      from staff ${where} limit ${limit} offset ${offset} `
    );
    const [countRows] = await promisePool.execute(
      `select count(staff_id) as count
      from staff ${where} `
    );
    const count = countRows[0].count;
    const totalPages = Math.ceil(count / limit);
    return [rows, count, totalPages];
  }

  static validate(obj) {
    const schema = {
      job_position_id: Joi.number().required().min(2).max(3),
      staff_id: Joi.number().required(),
    };

    return Joi.object(schema).validate(obj);
  }
  static async giveJobPosition(staffId, jobPositionId) {
    await promisePool.execute(`
    update staff
    set job_position_id= ${jobPositionId}
    where staff_id= ${staffId}`);
  }
}
module.exports = Owner;
