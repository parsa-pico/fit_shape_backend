require("dotenv").config();
require("./startup/logger")();
require("./startup/config")();
require("express-async-errors");
const app = require("express")();
require("./startup/routes")(app);

app.listen(3000, () => console.log("listening..."));
