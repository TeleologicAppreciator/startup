import express from "express";
import cookieParser from "cookie-parser";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { fileURLToPath } from "url";
import fetch from "node-fetch";
import { connectToDatabase } from "./database.js";

await connectToDatabase();

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());
app.use(cookieParser());
app.use(express.static("public"));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- In-memory data ---
const users = {};
const playerData = {};

let openingPrices = {};
let closingPrices = {};

// --- Fetch stock data ---
async function fetchOpeningPrices() {
  const symbols = ["AAPL", "TSLA", "AMZN"];
  const apiKey = "4072f6f3409f4392a2cdeaa60bc5b4f8";

  openingPrices = {};

  for (const symbol of symbols) {
    try {
      const response = await fetch(
        `https://api.twelvedata.com/quote?symbol=${symbol}&apikey=${apiKey}`
      );
      const data = await response.json();

      if (data && data.symbol && data.close) {
        openingPrices[data.symbol] = parseFloat(data.close);
      } else {
        console.error(`No valid close price for ${symbol}:`, data);
      }
    } catch (err) {
      console.error(`Error fetching ${symbol}:`, err);
    }
  }

  console.log("Opening prices fetched:", openingPrices);
}

async function fetchClosingPrices() {
  const symbols = Object.keys(openingPrices);
  const apiKey = "4072f6f3409f4392a2cdeaa60bc5b4f8";

  closingPrices = {};

  for (const symbol of symbols) {
    try {
      const response = await fetch(
        `https://api.twelvedata.com/quote?symbol=${symbol}&apikey=${apiKey}`
      );
      const data = await response.json();

      if (data && data.symbol && data.close) {
        closingPrices[data.symbol] = parseFloat(data.close);
      } else {
        console.error(`No valid close price for ${symbol}:`, data);
      }
    } catch (err) {
      console.error(`Error fetching ${symbol}:`, err);
    }
  }

  console.log("Closing prices fetched:", closingPrices);
}

// --- Middleware ---
function requireAuth(req, res, next) {
  const token = req.cookies.token;
  const user = Object.values(users).find((u) => u.token === token);
  if (!user) return res.status(401).send({ msg: "Unauthorized" });
  req.user = user;
  next();
}

// --- Auth routes ---
app.post("/api/register", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).send({ msg: "Missing email or password" });

  if (users[email]) return res.status(400).send({ msg: "User already exists" });

  const passwordHash = await bcrypt.hash(password, 10);
  users[email] = { passwordHash, token: "" };
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
  res.cookie("token", token, {
  httpOnly: true,
  sameSite: "none",
  secure: true,
});
  res.send({ msg: "Login successful", email });
});

app.post("/api/logout", (req, res) => {
  const token = req.cookies.token;
  const entry = Object.entries(users).find(([_, u]) => u.token === token);
  if (entry) entry[1].token = "";
  res.clearCookie("token");
  res.send({ msg: "Logged out" });
});

// --- Stock endpoints ---
app.post("/api/fetch-opening", async (req, res) => {
  await fetchOpeningPrices();
  res.send({ msg: "Opening prices updated", data: openingPrices });
});

app.post("/api/fetch-closing", async (req, res) => {
  await fetchClosingPrices();
  res.send({ msg: "Closing prices updated", data: closingPrices });
});

app.get("/api/opening-prices", (req, res) => {
  res.send(openingPrices);
});

app.get("/api/closing-prices", (req, res) => {
  res.send(closingPrices);
});

// --- Trading logic ---
app.post("/api/buy", requireAuth, (req, res) => {
  const email = Object.keys(users).find((e) => users[e].token === req.cookies.token);
  const { symbol, quantity, price } = req.body;

  if (!symbol || !quantity || !price)
    return res.status(400).send({ msg: "Missing required fields" });

  if (!playerData[email]) {
    playerData[email] = { funds: 10000, holdings: [], profit: 0 };
  }

  const player = playerData[email];
  const cost = price * quantity;

  if (player.funds < cost) {
    return res.status(400).send({ msg: "Not enough funds" });
  }

  player.funds -= cost;

  const existing = player.holdings.find((h) => h.symbol === symbol);
  if (existing) {
    existing.quantity += quantity;
    existing.totalCost += cost;
    existing.buyPrice = existing.totalCost / existing.quantity;
  } else {
    player.holdings.push({ symbol, quantity, buyPrice: price, totalCost: cost });
  }

  res.send({
    msg: `Bought ${quantity} shares of ${symbol} at $${price}`,
    portfolio: player,
  });
});

app.get("/api/portfolio", requireAuth, (req, res) => {
  const email = Object.keys(users).find((e) => users[e].token === req.cookies.token);

  if (!playerData[email]) {
    playerData[email] = { funds: 10000, holdings: [], profit: 0 };
  }

  res.send(playerData[email]);
});

app.get("/api/leaderboard", (req, res) => {
  const leaderboard = Object.entries(playerData)
    .map(([email, data]) => ({
      email,
      profit: data.profit || 0,
      funds: data.funds,
    }))
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 10);

  res.send(leaderboard);
});

// --- Daily cycle / summary endpoints ---
app.post("/api/update-profits", (req, res) => {
  Object.keys(playerData).forEach((email) => {
    const player = playerData[email];
    const randomProfit = +(Math.random() * 500 - 250).toFixed(2);
    player.profit = randomProfit;
  });

  console.log("Profits updated:", playerData);
  res.send({ msg: "Random profits updated", players: playerData });
});

app.post("/api/end-day", (req, res) => {
  Object.keys(playerData).forEach((email) => {
    playerData[email].holdings = [];
    playerData[email].funds = 10000;
  });

  console.log("End of day — portfolios reset.");
  res.send({ msg: "Trading day ended. All holdings reset.", players: playerData });
});

app.get("/api/summary", requireAuth, (req, res) => {
  const email = Object.keys(users).find((e) => users[e].token === req.cookies.token);
  const player = playerData[email] || { funds: 10000, profit: 0, holdings: [] };

  const sorted = Object.entries(playerData)
    .map(([email, data]) => ({
      email,
      profit: data.profit || 0,
    }))
    .sort((a, b) => b.profit - a.profit);

  const rank = sorted.findIndex((entry) => entry.email === email) + 1;

  res.send({
    email,
    funds: player.funds,
    profit: player.profit,
    rank,
  });
});

app.get("/api/secure", requireAuth, (req, res) => {
  res.send({ msg: "You accessed a protected endpoint!" });
});

// --- Fallback for React frontend ---
app.use((req, res) => {
  res.status(404).send({ msg: "Not found" });
});

app.listen(port, () => {
  console.log(`StockSprint service running on port ${port}`);
});