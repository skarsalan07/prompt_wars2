import { MongoClient } from "mongodb";

declare global {
  var __mongoClientPromise: Promise<MongoClient> | undefined;
}

export async function getMongoClient() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    return null;
  }

  if (!global.__mongoClientPromise) {
    const client = new MongoClient(uri);
    global.__mongoClientPromise = client.connect();
  }

  try {
    return await global.__mongoClientPromise;
  } catch {
    global.__mongoClientPromise = undefined;
    return null;
  }
}
