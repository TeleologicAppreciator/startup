import { MongoClient } from "mongodb";
import fs from "fs";

const config = JSON.parse(fs.readFileSync("dbConfig.json", "utf8"));

const url = `mongodb+srv://${config.userName}:${config.password}@${config.hostname}`;
const client = new MongoClient(url);
const dbName = "stocksprint";
const db = client.db(dbName);

const usersCollection = db.collection("users");
const playerCollection = db.collection("players");

export async function connectToDatabase() {
  try {
    await client.connect();
    await db.command({ ping: 1 });
    console.log(`Connected to MongoDB at ${config.hostname}`);
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  }
}

export async function getUser(email) {
  return await usersCollection.findOne({ email });
}

export async function getUserByToken(token) {
  return await usersCollection.findOne({ token });
}

export async function addUser(user) {
  await usersCollection.insertOne(user);
}

export async function updateUser(user) {
  await usersCollection.updateOne({ email: user.email }, { $set: user });
}

export async function getPlayer(email) {
  let player = await playerCollection.findOne({ email });
  if (!player) {
    player = { email, funds: 10000, holdings: [], profit: 0 };
    await playerCollection.insertOne(player);
  }
  return player;
}

export async function updatePlayer(player) {
  await playerCollection.updateOne({ email: player.email }, { $set: player });
}

export async function getLeaderboard() {
  return await playerCollection
    .find({})
    .sort({ profit: -1 })
    .limit(10)
    .toArray();
}