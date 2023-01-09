const { promisePool } = require("../mysql/connection");
const schema = require("../models/coachPlan");
const Joi = require("joi");
const crud = require("../mysql/crud.js");
class CoachPlan {
  constructor(obj) {
    this.coach_id = obj.coach_id;
    this.plan_type_id = obj.plan_type_id;
    this.description = obj.description;
    this.title = obj.title;
    this.coach_plan_id = obj.coach_plan_id || null;
  }
  static validate(obj) {
    return Joi.object(schema).validate(obj);
  }

  async insert() {
    const [rows] = await promisePool.execute(
      `insert into coach_plan() value(default,?,?,?)`,
      [this.coach_id, this.plan_type_id, this.description, this.title]
    );

    this.coach_plan_id = rows.insertId;
    return this;
  }

  static customValidate(updateObj) {
    const customSchema = {};
    for (let key in updateObj) {
      if (schema[key]) customSchema[key] = schema[key];
    }

    return Joi.object(customSchema).validate(updateObj);
  }

  static async findAllPerCoach(id, limit, pageNumber) {
    const offset = (pageNumber - 1) * limit;

    const [rows] = await promisePool.execute(`select * from coach_plan
                         c where c.coach_id=${id}
                          limit ${limit} offset ${offset} `);
    return rows;
  }
  static async findById(id) {
    const [rows] = await promisePool.execute(
      `select * from coach_plan c where c.coach_plan_id=? limit 1`,
      [id]
    );
    if (rows.length === 0) return null;
    return new CoachPlan(rows[0]);
  }
  async update(updateObj) {
    for (let key in updateObj) {
      this[key] = updateObj[key];
    }
    return await crud.update("coach_plan", updateObj, {
      key: "coach_plan_id",
      value: this.coach_plan_id,
    });
  }
  async delete() {
    await promisePool.execute("delete from coach_plan where coach_plan_id=?", [
      this.coach_plan_id,
    ]);
    return this;
  }
}
module.exports = CoachPlan;
