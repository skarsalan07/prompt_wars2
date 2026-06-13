const connectMock = vi.fn(async () => {
  throw new Error("mongodb-down");
});

vi.mock("mongodb", () => ({
  MongoClient: class MockMongoClient {
    connect = connectMock;
  },
}));

import { getMongoClient } from "@/lib/db/client";

function getGlobalState() {
  return globalThis as typeof globalThis & {
    __mongoClientPromise?: Promise<unknown>;
  };
}

describe("mongo client fallback", () => {
  beforeEach(() => {
    process.env.MONGODB_URI = "mongodb://example.test/database";
    connectMock.mockClear();
    getGlobalState().__mongoClientPromise = undefined;
  });

  afterEach(() => {
    getGlobalState().__mongoClientPromise = undefined;
  });

  it("returns null when the Mongo connection cannot be established", async () => {
    await expect(getMongoClient()).resolves.toBeNull();
    expect(connectMock).toHaveBeenCalledTimes(1);
    expect(getGlobalState().__mongoClientPromise).toBeUndefined();
  });
});
