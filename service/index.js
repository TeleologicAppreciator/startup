import express from "express";
import cookieParser from "cookie-parser";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

const app = express();
const port = process.argv.length > 2 ? process.argv[2] : 4000;

app.use(express.json());
app.use(cookieParser());

app.use(express.static("public"));

const users = {};
const leaderboard = [
  { email: "demo@stocksprint.com", profit: 250.5 },
  { email: "trader@stocksprint.com", profit: 180.2 },
];

// --- Routes ---
app.get("/api/test", (req, res) => {
  res.send({ message: "StockSprint backend is running!" });
});

app.post("/api/register", async (req, res) => {
  const { email, password } = req.body;
  if (users[email]) {
    return res.status(400).send({ msg: "User already exists" });
  }
  const passwordHash = await bcrypt.hash(password, 10);
  users[email] = { passwordHash };
  res.send({ msg: "Registration successful" });
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  const user = users[email];
  if (!user) return res.status(400).send({ msg: "User not found" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).send({ msg: "Invalid credentials" });

  const token = uuidv4();
  users[email].token = token;
  res.cookie("token", token, { httpOnly: true });
  res.send({ msg: "Login successful" });
});

app.get("/api/portfolio", (req, res) => {
  const token = req.cookies.token;
  const user = Object.entries(users).find(([_, u]) => u.token === token);
  if (!user) return res.status(401).send({ msg: "Unauthorized" });

  res.send({
    email: user[0],
    holdings: [],
    funds: 10000,
    profit: 0,
  });
});

app.post("/api/logout", (req, res) => {
  res.clearCookie("token");
  res.send({ msg: "Logged out" });
});

app.get("/api/leaderboard", (req, res) => {
  res.send(leaderboard);
});

app.listen(port, () => {
  console.log(`StockSprint service running on port ${port}`);
});