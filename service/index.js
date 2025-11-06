import express from "express";
import cookieParser from "cookie-parser";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { fileURLToPath } from "url";
import fetch from "node-fetch";

const app = express();
const port = process.argv.length > 2 ? process.argv[2] : 4000;

app.use(express.json());
app.use(cookieParser());
app.use(express.static("public"));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const users = {};
const playerData = {};

let openingPrices = {};
let closingPrices = {};

async function fetchOpeningPrices() {
  const symbols = ["AAPL", "TSLA", "AMZN"];
  const response = await fetch(
    `https://financialmodelingprep.com/api/v3/quote-short/${symbols.join(",")}?apikey=demo`
  );
  const data = await response.json();

  openingPrices = {};
  data.forEach((item) => (openingPrices[item.symbol] = item.price));

  console.log("Opening prices fetched:", openingPrices);
}

async function fetchClosingPrices() {
  const symbols = Object.keys(openingPrices);
  if (symbols.length === 0) return;

  const response = await fetch(
    `https://financialmodelingprep.com/api/v3/quote-short/${symbols.join(",")}?apikey=demo`
  );
  const data = await response.json();

  closingPrices = {};
  data.forEach((item) => (closingPrices[item.symbol] = item.price));

  console.log("Closing prices fetched:", closingPrices);
}

function requireAuth(req, res, next) {
  const token = req.cookies.token;
  const user = Object.values(users).find((u) => u.token === token);
  if (!user) return res.status(401).send({ msg: "Unauthorized" });
  req.user = user;
  next();
}


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
  res.cookie("token", token, { httpOnly: true });
  res.send({ msg: "Login successful", email });
});

app.post("/api/logout", (req, res) => {
  const token = req.cookies.token;
  const entry = Object.entries(users).find(([_, u]) => u.token === token);
  if (entry) entry[1].token = "";
  res.clearCookie("token");
  res.send({ msg: "Logged out" });
});


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

app.post('/api/update-profits', (req, res) => {
  Object.keys(playerData).forEach((email) => {
    const player = playerData[email];
    const randomProfit = +(Math.random() * 500 - 250).toFixed(2);
    player.profit = randomProfit;
  });

  console.log("Profits updated:", playerData);
  res.send({ msg: "Random profits updated", players: playerData });
});

app.post('/api/end-day', (req, res) => {
  Object.keys(playerData).forEach((email) => {
    playerData[email].holdings = [];
    playerData[email].funds = 10000;
  });

  console.log("End of day — portfolios reset.");
  res.send({ msg: "Trading day ended. All holdings reset.", players: playerData });
});

app.get('/api/summary', (req, res) => {
  const token = req.cookies.token;
  const userEntry = Object.entries(users).find(([_, u]) => u.token === token);

  if (!userEntry) {
    return res.status(401).send({ msg: "Unauthorized" });
  }

  const email = userEntry[0];
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

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.listen(port, () => {
  console.log(`StockSprint service running on port ${port}`);
});