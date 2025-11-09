import { MongoClient } from "mongodb";
import fs from "fs";

let db;

export async function connectToDatabase() {
  const config = JSON.parse(fs.readFileSync("./dbConfig.json"));
  const url = `mongodb+srv://${config.userName}:${config.password}@${config.hostname}`;
  const client = new MongoClient(url);
  db = client.db("startup");

  try {
    await db.command({ ping: 1 });
    console.log(`Connected to MongoDB at ${config.hostname}`);
  } catch (ex) {
    console.error(`Database connection failed: ${ex.message}`);
    process.exit(1);
  }
}

export function getDb() {
  return db;
}