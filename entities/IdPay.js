const { default: axios } = require('axios');

class IdPay {
  static async makePayment(sub_id, amount) {
    const { data } = await axios.post(
      'https://api.idpay.ir/v1.1/payment',
      {
        order_id: sub_id.toString(),
        amount,
        callback: 'http://localhost:3000/callback',
      },
      {
        headers: {
          'content-type': 'application/json',
          'X-API-KEY': process.env.ID_PAY_AUTH_KEY,
          'X-SANDBOX': 1,
        },
      }
    );
    return data;
  }
  static async fakeisVerifiedPayment(status) {
    if (status == 10) return true;
    return false;
  }
}

module.exports = IdPay;
