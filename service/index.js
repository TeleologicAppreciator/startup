import express from "express";
import cookieParser from "cookie-parser";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { fileURLToPath } from "url";
import fetch from "node-fetch";
import { simulateDailyUpdate } from "./dailyUpdate.js";
import { WebSocketServer } from "ws";

// --- MongoDB helpers ---
import {
  connectToDatabase,
  getUser,
  getUserByToken,
  addUser,
  updateUser,
  getPortfolio,
  updatePortfolio,
  updateLeaderboard,
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

let tradingState = {
  isOpen: false,
  openTime: null,
  closeTime: null,
};

// Create WebSocket server
const wss = new WebSocketServer({ noServer: true });

// Broadcast to all connected clients
function broadcast(message) {
  const payload = JSON.stringify(message);
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(payload);
    }
  });
}

// ===============================
//  Fetch stock prices
// ===============================
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
      }
    } catch (err) {
      console.error(`Error fetching ${symbol}:`, err);
    }
  }

  console.log("Opening prices fetched:", openingPrices);

  // Broadcast to all clients
  broadcast({
    type: "opening_prices",
    prices: openingPrices,
    timestamp: new Date().toISOString(),
  });
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
      }
    } catch (err) {
      console.error(`Error fetching ${symbol}:`, err);
    }
  }

  console.log("Closing prices fetched:", closingPrices);

  // Broadcast to all clients
  broadcast({
    type: "closing_prices",
    prices: closingPrices,
    timestamp: new Date().toISOString(),
  });
}

// ===============================
//  Trading Day Management
// ===============================
async function openTradingDay() {
  console.log("\n[Trading] ========== OPENING TRADING DAY ==========");

  tradingState.isOpen = true;
  tradingState.openTime = new Date().toISOString();

  await fetchOpeningPrices();

  broadcast({
    type: "trading_opened",
    message: "Trading day has opened!",
    timestamp: tradingState.openTime,
  });

  console.log("[Trading] Trading day is now OPEN");
}

async function closeTradingDay() {
  console.log("\n[Trading] ========== CLOSING TRADING DAY ==========");

  tradingState.isOpen = false;
  tradingState.closeTime = new Date().toISOString();

  await fetchClosingPrices();
  await calculateAllProfits();

  broadcast({
    type: "trading_closed",
    message: "Trading day has closed!",
    timestamp: tradingState.closeTime,
  });

  console.log("[Trading] Trading day is now CLOSED");
}

async function calculateAllProfits() {
  console.log("[Profits] Calculating profits for all users...");

  const tradingDate = new Date().toISOString().slice(0, 10);
  const leaderboard = await getLeaderboard(tradingDate);

  for (const entry of leaderboard) {
    const portfolio = await getPortfolio(entry.email, tradingDate);

    let totalValue = portfolio.funds;

    for (const holding of portfolio.holdings) {
      const closingPrice = closingPrices[holding.symbol];
      if (closingPrice) {
        totalValue += holding.quantity * closingPrice;
      } else {
        totalValue += holding.totalCost;
      }
    }

    const profit = totalValue - 10000;
    portfolio.profit = profit;

    await updatePortfolio(portfolio);
    await updateLeaderboard(entry.email, tradingDate, profit);
  }

  const updatedLeaderboard = await getLeaderboard(tradingDate);

  broadcast({
    type: "leaderboard_update",
    leaderboard: updatedLeaderboard,
    timestamp: new Date().toISOString(),
  });

  console.log("[Profits] All profits calculated");
}

// ===============================
//  Auth middleware
// ===============================
async function requireAuth(req, res, next) {
  const token = req.cookies.token;
  const user = await getUserByToken(token);
  if (!user) return res.status(401).send({ msg: "Unauthorized" });
  req.user = user;
  next();
}

// ===============================
//  Auth routes
// ===============================
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

  res.cookie("token", token, { httpOnly: true, sameSite: "lax" });
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

// ===============================
//  Stock data endpoints
// ===============================
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

// ===============================
//  Buy stock
// ===============================
app.post("/api/buy", requireAuth, async (req, res) => {
  const email = req.user.email;
  const { symbol, quantity, price } = req.body;

  if (!symbol || !quantity || !price)
    return res.status(400).send({ msg: "Missing required fields" });

  const tradingDate = new Date().toISOString().slice(0, 10);

  const portfolio = await getPortfolio(email, tradingDate);
  const cost = price * quantity;

  if (portfolio.funds < cost)
    return res.status(400).send({ msg: "Not enough funds" });

  portfolio.funds -= cost;

  const existing = portfolio.holdings.find((h) => h.symbol === symbol);

  if (existing) {
    existing.quantity += quantity;
    existing.totalCost += cost;
    existing.buyPrice = existing.totalCost / existing.quantity;
  } else {
    portfolio.holdings.push({
      symbol,
      quantity,
      totalCost: cost,
      buyPrice: price,
    });
  }

  await updatePortfolio(portfolio);

  res.send({
    msg: `Bought ${quantity} shares of ${symbol} at $${price}`,
    portfolio,
  });
});

// ===============================
//  Portfolio
// ===============================
app.get("/api/portfolio", requireAuth, async (req, res) => {
  const tradingDate = new Date().toISOString().slice(0, 10);
  const portfolio = await getPortfolio(req.user.email, tradingDate);
  res.send(portfolio);
});

// ===============================
//  Leaderboard
// ===============================
app.get("/api/leaderboard", async (req, res) => {
  const tradingDate = new Date().toISOString().slice(0, 10);
  const leaderboard = await getLeaderboard(tradingDate);
  res.send(leaderboard);
});

app.get("/api/testDailyUpdate", (req, res) => {
  simulateDailyUpdate();
  res.json({ msg: "Daily update simulated" });
});

// ===============================
//  Daily profit updates
//  (random for now to match your old behavior)
// ===============================
app.post("/api/update-profits", async (req, res) => {
  const tradingDate = new Date().toISOString().slice(0, 10);
  const leaderboard = await getLeaderboard(tradingDate);

  for (const entry of leaderboard) {
    const randomProfit = +(Math.random() * 500 - 250).toFixed(2);
    await updateLeaderboard(entry.email, tradingDate, randomProfit);
  }

  console.log("Profits updated");
  res.send({ msg: "Random profits updated" });
});

app.post("/api/daily-update", async (req, res) => {
  console.log("[ManualDailyUpdate] Daily update triggered manually");

  // TODO: future — fetch new stock prices
  // TODO: future — auto-buy/auto-sell
  // TODO: future — update user portfolios

  res.json({ status: "ok", msg: "Daily update triggered (placeholder)" });
});

// ===============================
//  End-of-day reset
// ===============================
app.post("/api/end-day", async (req, res) => {
  const tradingDate = new Date().toISOString().slice(0, 10);
  const leaderboard = await getLeaderboard(tradingDate);

  for (const entry of leaderboard) {
    const portfolio = await getPortfolio(entry.email, tradingDate);
    portfolio.funds = 10000;
    portfolio.holdings = [];
    portfolio.profit = 0;

    await updatePortfolio(portfolio);
  }

  console.log("End of day — portfolios reset");
  res.send({ msg: "Trading day ended. All holdings reset." });
});

// ===============================
//  Summary endpoint
// ===============================
app.get("/api/summary", requireAuth, async (req, res) => {
  const tradingDate = new Date().toISOString().slice(0, 10);

  const portfolio = await getPortfolio(req.user.email, tradingDate);
  const leaderboard = await getLeaderboard(tradingDate);

  const sorted = [...leaderboard].sort((a, b) => b.profit - a.profit);
  const rank = sorted.findIndex((p) => p.email === req.user.email) + 1;

  res.send({
    email: portfolio.email,
    funds: portfolio.funds,
    profit: portfolio.profit,
    rank,
  });
});

// ===============================
//  Protected endpoint
// ===============================
app.get("/api/secure", requireAuth, (req, res) => {
  res.send({ msg: "You accessed a protected endpoint!" });
});

// ===============================
//  React fallback
// ===============================
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start server and setup WebSocket
const server = app.listen(port, () => {
  console.log(`StockSprint service running on port ${port}`);
});

server.on("upgrade", (req, socket, head) => {
  if (req.url === "/ws") {
    wss.handleUpgrade(req, socket, head, ws => {
      wss.emit("connection", ws, req);
    });
  } else {
    socket.destroy();
  }
});

// Store connections
wss.on("connection", ws => {
  console.log("WebSocket connected");

  ws.isAlive = true;

  ws.on("pong", () => {
    ws.isAlive = true;
  });

  ws.on("message", data => {
    // For now: broadcast to everyone
    wss.clients.forEach(client => {
      if (client.readyState === 1) {
        client.send(data.toString());
      }
    });
  });

  ws.send(JSON.stringify({ system: "connected" }));
});

// Ping/pong keepalive
setInterval(() => {
  wss.clients.forEach(ws => {
    if (!ws.isAlive) return ws.terminate();
    ws.isAlive = false;
    ws.ping();
  });
}, 10000);