module.exports = function () {
  if (!process.env.JWT_PRIVATE_KEY) {
    console.log('jwt private key not defiend');
    throw new Error('jwt private key not defiend');
  }
  if (!process.env.ID_PAY_AUTH_KEY) {
    console.log('id pay auth key not defiend');
    throw new Error('id pay auth key not defiend');
  }
};
