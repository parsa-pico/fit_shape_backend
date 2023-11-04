module.exports = function () {
  if (!process.env.JWT_PRIVATE_KEY) {
    console.log("jwt private key not defiend");
    throw new Error("jwt private key not defiend");
  }
  if (!process.env.ID_PAY_AUTH_KEY) {
    console.log("id pay auth key not defiend");
    throw new Error("id pay auth key not defiend");
  }
  if (!process.env.OWNER_ID) {
    console.log("owner id is not defined in env");
    throw new Error("owner id is not defined in env");
  }
  if (!process.env.GMAIL_USER_NAME) {
    console.log("gmail user name is not defined in env");
    throw new Error("gmail user name is not defined in env");
  }
  if (!process.env.GMAIL_PASSWORD) {
    console.log("gmail password is not defined in env");
    throw new Error("gmail password is not defined in env");
  }
  if (!process.env.FRONT_BASE_URL) {
    console.log("front base url is not defined in env");
    throw new Error("front base url is not defined in env");
  }
  if (
    !process.env.MYSQL_HOST ||
    !process.env.MYSQL_USER ||
    !process.env.MYSQL_PASSWORD ||
    !process.env.MYSQL_DATABASE ||
    !process.env.MYSQL_PORT
  ) {
    console.log("MYSQL CONFIGS ARE not defined in env");
    throw new Error("MYSQL CONFIGS ARE not defined in env");
  }
};
