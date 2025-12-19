const express = require("express");
const cors = require("cors");
const router = require("./routes/router.js");
const bodyParser = require("body-parser");
var session = require("express-session");
const path = require("path");

const server = express();

server.set("view engine", "ejs");
server.set("views", path.join(__dirname, "views"));

server.use(bodyParser.json());

const port = 8888;

server.use("/", router);

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
