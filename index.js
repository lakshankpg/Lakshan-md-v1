const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const app = express();

const __path = process.cwd(); // fixed global var
const PORT = process.env.PORT || 8000;

let code = require("./pair"); // pair.js file එක වැදගත්

require("events").EventEmitter.defaultMaxListeners = 500;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use("/code", code);

app.use("/", (req, res) => {
  res.sendFile(path.join(__path, "pair.html"));
});

// Server Start
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

module.exports = app;
