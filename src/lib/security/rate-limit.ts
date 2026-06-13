import { MongoClient } from "mongodb";

const WINDOW_MS = 60_000;
const LIMIT = 30;

type MemoryBucket = {
  count: number;
  resetAt: number;
};

const memoryStore = new Map<string, MemoryBucket>();

async function incrementInMemory(key: string) {
  const now = Date.now();
  const bucket = memoryStore.get(key);

  if (!bucket || bucket.resetAt < now) {
    memoryStore.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: LIMIT - 1 };
  }

  bucket.count += 1;
  return {
    allowed: bucket.count <= LIMIT,
    remaining: Math.max(0, LIMIT - bucket.count),
  };
}

export async function enforceRateLimit(key: string, client?: MongoClient) {
  if (!client) {
    return incrementInMemory(key);
  }

  const collection = client.db(process.env.MONGODB_DB_NAME ?? "mental_wellness").collection("RateLimits");
  const now = new Date();
  const resetAt = new Date(Date.now() + WINDOW_MS);

  const result = await collection.findOneAndUpdate(
    {
      key,
      expiresAt: { $gt: now },
    },
    {
      $inc: { count: 1 },
      $setOnInsert: { expiresAt: resetAt },
    },
    {
      upsert: true,
      returnDocument: "after",
    },
  );

  const count = Number(result?.count ?? 1);
  return {
    allowed: count <= LIMIT,
    remaining: Math.max(0, LIMIT - count),
  };
}
