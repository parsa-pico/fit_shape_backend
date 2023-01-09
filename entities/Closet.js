const { promisePool } = require("../mysql/connection");
class Closet {
  constructor(closet_number) {
    this.closet_number = closet_number;
    this.is_occupied = null;
  }

  static async assignClosetToSub(sub_id) {
    const [rows] = await promisePool.execute(
      `call fit_shape.update_closet_for_sub(?);`,
      [sub_id]
    );

    if (rows[0][0].free_closet_number === undefined) return null;
    return rows[0][0].free_closet_number;
  }
}
module.exports = Closet;
