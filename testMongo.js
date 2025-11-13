const { MongoClient } = require('mongodb');
const config = require('./dbConfig.json');

const url = `mongodb+srv://${config.userName}:${config.password}@${config.hostname}`;
const client = new MongoClient(url);

// Pick any database and collection name for the test
const db = client.db('rental');
const collection = db.collection('house');

async function main() {
  try {
    await db.command({ ping: 1 });
    console.log(`DB connected to ${config.hostname}`);
  } catch (ex) {
    console.log(`Connection failed: ${ex.message}`);
    process.exit(1);
  }

  try {
    // Insert a test document
    const house = {
      name: 'Beachfront views',
      summary: 'Test record',
      beds: 1,
    };
    await collection.insertOne(house);

    // Query it back
    const rentals = await collection.find().toArray();
    console.log(rentals);

    // Clean up
    await collection.deleteMany({});
  } catch (ex) {
    console.log(`Database error: ${ex.message}`);
  } finally {
    await client.close();
  }
}

main();