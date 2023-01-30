const { promisePool } = require("../mysql/connection");

class Entracne {
  constructor(obj) {
    this.sub_id = obj.sub_id;
    this.entered_date_time = obj.entered_date_time || null;
    this.exited_date_time = obj.exited_date_time || null;
  }

  static async getAll(limit, pageNumber) {
    const offset = (pageNumber - 1) * limit;

    const [rows] = await promisePool.execute(`
    SELECT e.entrance_id,e.entered_date_time,e.exited_date_time,first_name,last_name
    FROM entrance e 
    join subscription using(sub_id)
    join athlete using(athlete_id)
    order by e.entered_date_time desc
    limit ${limit} offset ${offset} `);
    return rows;
  }
  async submitEntrance(athlete_id) {
    await promisePool.execute(`call submit_entrance(?,?);`, [
      athlete_id,
      this.sub_id,
    ]);
  }
  async submitDeparture(athlete_id) {
    await promisePool.execute(`call submit_departure(?,?);`, [
      athlete_id,
      this.sub_id,
    ]);
  }
  async insert() {
    await promisePool.execute(
      `insert into entrance() value(default,?,default)`,
      [this.sub_id]
    );
  }
}
module.exports = Entracne;
