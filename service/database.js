import { MongoClient } from "mongodb";
import fs from "fs";

// Load dbConfig.json safely:
const config = JSON.parse(fs.readFileSync("dbConfig.json", "utf8"));

// Connection URL
const url = `mongodb+srv://${config.userName}:${config.password}@${config.hostname}`;
const client = new MongoClient(url);

// Game database
const dbName = "stocksprint";
let db;
let usersCollection;
let portfolioCollection;
let leaderboardCollection;

// Connect to Mongo
async function connectToDatabase() {
  try {
    await client.connect();
    db = client.db(dbName);

    usersCollection = db.collection("users");
    portfolioCollection = db.collection("portfolios");
    leaderboardCollection = db.collection("leaderboard");

    await db.command({ ping: 1 });
    console.log(`Connected to MongoDB at ${config.hostname}`);
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  }
}

/* ================================
   USERS (AUTH)
================================ */

function getUser(email) {
  return usersCollection.findOne({ email });
}

function getUserByToken(token) {
  return usersCollection.findOne({ token });
}

async function addUser(user) {
  await usersCollection.insertOne(user);
}

async function updateUser(user) {
  await usersCollection.updateOne({ email: user.email }, { $set: user });
}

/* ================================
   DAILY PORTFOLIO DATA
================================ */

// Example portfolio doc:
//
// {
//   email: "player@example.com",
//   tradingDate: "2025-11-13",
//   funds: 10000,
//   holdings: [
//      { symbol: "AAPL", shares: 5, priceAtBuy: 180 }
//   ],
//   profit: 0
// }

async function getPortfolio(email, tradingDate) {
  let portfolio = await portfolioCollection.findOne({ email, tradingDate });

  // Auto-create initial daily state
  if (!portfolio) {
    portfolio = {
      email,
      tradingDate,
      funds: 10000,
      holdings: [],
      profit: 0,
    };
    await portfolioCollection.insertOne(portfolio);
  }

  return portfolio;
}

async function updatePortfolio(portfolio) {
  const { email, tradingDate } = portfolio;

  await portfolioCollection.updateOne(
    { email, tradingDate },
    { $set: portfolio },
    { upsert: true }
  );
}

/* ================================
   LEADERBOARD
================================ */

async function updateLeaderboard(email, tradingDate, profit) {
  await leaderboardCollection.updateOne(
    { email, tradingDate },
    { $set: { email, tradingDate, profit } },
    { upsert: true }
  );
}

async function getLeaderboard(tradingDate) {
  return leaderboardCollection
    .find({ tradingDate })
    .sort({ profit: -1 })
    .limit(10)
    .toArray();
}

/* ================================
   EXPORTS
================================ */

export {
  connectToDatabase,
  getUser,
  getUserByToken,
  addUser,
  updateUser,
  getPortfolio,
  updatePortfolio,
  updateLeaderboard,
  getLeaderboard,
};
