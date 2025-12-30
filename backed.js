// =======================
// EFOOTBALL SHOWDOWN BACKEND
// =======================

const express = require("express");
const http = require("http");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

const JWT_SECRET = "CHANGE_THIS_SECRET";

// -----------------------
// IN-MEMORY DATABASE (replace later)
// -----------------------
const users = [
  {
    id: "admin1",
    username: "admin",
    password: bcrypt.hashSync("admin123", 10),
    role: "ADMIN"
  },
  {
    id: "player1",
    username: "player",
    password: bcrypt.hashSync("player123", 10),
    role: "PLAYER"
  }
];

const players = {
  player1: { name: "Player One", points: 10, status: "OFFLINE" }
};

// -----------------------
// AUTH MIDDLEWARE
// -----------------------
function protect(role) {
  return (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.sendStatus(401);

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      if (role && decoded.role !== role) return res.sendStatus(403);
      req.user = decoded;
      next();
    } catch {
      res.sendStatus(401);
    }
  };
}

// -----------------------
// AUTH ROUTE
// -----------------------
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (!user) return res.sendStatus(401);

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.sendStatus(401);

  const token = jwt.sign(
    { id: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: "2h" }
  );

  res.json({ token, role: user.role });
});

// -----------------------
// PLAYER DASHBOARD
// -----------------------
app.get("/player", protect("PLAYER"), (req, res) => {
  res.json(players[req.user.id]);
});

// -----------------------
// ADMIN CONTROLS
// -----------------------
app.post("/admin/points", protect("ADMIN"), (req, res) => {
  const { playerId, points } = req.body;
  players[playerId].points = points;
  io.emit("pointsUpdated", players);
  res.sendStatus(200);
});

// -----------------------
// SOCKETS
// -----------------------
io.on("connection", socket => {
  socket.on("online", id => {
    if (players[id]) players[id].status = "ONLINE";
    io.emit("statusUpdated", players);
  });
});

// -----------------------
server.listen(4000, () =>
  console.log("Backend running on http://localhost:4000")
);
