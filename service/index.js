import express from "express";
import cookieParser from "cookie-parser";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { fileURLToPath } from "url";
import fetch from "node-fetch";

// --- MongoDB helpers ---
import {
  connectToDatabase,
  getUser,
  getUserByToken,
  addUser,
  updateUser,
  getPlayer,
  updatePlayer,
  getLeaderboard,
} from "./database.js";

// --- Connect to MongoDB ---
await connectToDatabase();

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());
app.use(cookieParser());
app.use(express.static("public"));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
async function requireAuth(req, res, next) {
  const token = req.cookies.token;
  const user = await getUserByToken(token);
  if (!user) return res.status(401).send({ msg: "Unauthorized" });
  req.user = user;
  next();
}

// --- Auth routes ---
app.post("/api/register", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).send({ msg: "Missing email or password" });

  const existing = await getUser(email);
  if (existing) return res.status(400).send({ msg: "User already exists" });

  const passwordHash = await bcrypt.hash(password, 10);
  await addUser({ email, passwordHash, token: "" });
  res.send({ msg: "Registration successful" });
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await getUser(email);
  if (!user) return res.status(400).send({ msg: "User not found" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).send({ msg: "Invalid credentials" });

  const token = uuidv4();
  user.token = token;
  await updateUser(user);

  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "none",
    secure: true,
  });
  res.send({ msg: "Login successful", email });
});

app.post("/api/logout", async (req, res) => {
  const token = req.cookies.token;
  const user = await getUserByToken(token);
  if (user) {
    user.token = "";
    await updateUser(user);
  }
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
app.post("/api/buy", requireAuth, async (req, res) => {
  const email = req.user.email;
  const { symbol, quantity, price } = req.body;

  if (!symbol || !quantity || !price)
    return res.status(400).send({ msg: "Missing required fields" });

  const player = await getPlayer(email);
  const cost = price * quantity;

  if (player.funds < cost)
    return res.status(400).send({ msg: "Not enough funds" });

  player.funds -= cost;

  const existing = player.holdings.find((h) => h.symbol === symbol);
  if (existing) {
    existing.quantity += quantity;
    existing.totalCost += cost;
    existing.buyPrice = existing.totalCost / existing.quantity;
  } else {
    player.holdings.push({ symbol, quantity, buyPrice: price, totalCost: cost });
  }

  await updatePlayer(player);
  res.send({
    msg: `Bought ${quantity} shares of ${symbol} at $${price}`,
    portfolio: player,
  });
});

app.get("/api/portfolio", requireAuth, async (req, res) => {
  const player = await getPlayer(req.user.email);
  res.send(player);
});

app.get("/api/leaderboard", async (req, res) => {
  const leaderboard = await getLeaderboard();
  res.send(leaderboard);
});

// --- Daily cycle / summary endpoints ---
app.post("/api/update-profits", async (req, res) => {
  const leaderboard = await getLeaderboard();
  for (const player of leaderboard) {
    const randomProfit = +(Math.random() * 500 - 250).toFixed(2);
    player.profit = randomProfit;
    await updatePlayer(player);
  }

  console.log("Profits updated");
  res.send({ msg: "Random profits updated" });
});

app.post("/api/end-day", async (req, res) => {
  const leaderboard = await getLeaderboard();
  for (const player of leaderboard) {
    player.holdings = [];
    player.funds = 10000;
    await updatePlayer(player);
  }

  console.log("End of day — portfolios reset.");
  res.send({ msg: "Trading day ended. All holdings reset." });
});

app.get("/api/summary", requireAuth, async (req, res) => {
  const player = await getPlayer(req.user.email);
  const leaderboard = await getLeaderboard();
  const sorted = leaderboard.sort((a, b) => b.profit - a.profit);
  const rank = sorted.findIndex((p) => p.email === req.user.email) + 1;

  res.send({
    email: player.email,
    funds: player.funds,
    profit: player.profit,
    rank,
  });
});

app.get("/api/secure", requireAuth, (req, res) => {
  res.send({ msg: "You accessed a protected endpoint!" });
});

// --- Fallback for React frontend ---
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(port, () => {
  console.log(`StockSprint service running on port ${port}`);
});