import "server-only";

import { MongoClient } from "mongodb";

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

export function getMongoDbName() {
  return process.env.MONGODB_DB || "access_starter";
}

export function getMongoUri() {
  return requiredEnv("MONGODB_URI");
}

type MongoGlobal = typeof globalThis & {
  __mongoClientPromise?: Promise<MongoClient>;
};

export function getMongoClient() {
  const globalWithMongo = globalThis as MongoGlobal;

  if (!globalWithMongo.__mongoClientPromise) {
    const client = new MongoClient(getMongoUri());
    globalWithMongo.__mongoClientPromise = client.connect();
  }

  return globalWithMongo.__mongoClientPromise;
}

export async function getDb() {
  const client = await getMongoClient();
  return client.db(getMongoDbName());
}

