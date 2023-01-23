require("dotenv").config();
require("./startup/logger")();
require("./startup/config")();
require("express-async-errors");
const app = require("express")();
require("./startup/routes")(app);
const port = process.env.PORT || 3000;
app.listen(port, () => console.log("listening on port " + port));
