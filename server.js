const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");

const app = express();
const PORT = 3000;

// CHANGE THIS PASSWORD
const ADMIN_PASSWORD = "coach123";

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

const DATA_FILE = "./data/data.json";

// Read data
function readData() {
  return JSON.parse(fs.readFileSync(DATA_FILE));
}

// Write data
function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Get public data
app.get("/api/data", (req, res) => {
  res.json(readData());
});

// Player sign-in
app.post("/api/player", (req, res) => {
  const { username, team } = req.body;
  const data = readData();

  data.players.push({ username, team });
  writeData(data);

  res.json({ success: true });
});

// Admin login
app.post("/api/admin/login", (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false });
  }
});

// Admin update match
app.post("/api/admin/update", (req, res) => {
  const data = readData();
  data.match = req.body.match;
  writeData(data);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
