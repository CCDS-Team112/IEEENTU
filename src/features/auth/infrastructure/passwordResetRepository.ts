import "server-only";

import crypto from "crypto";
import { ObjectId } from "mongodb";
import { getDb } from "@/shared/lib/mongodb";

export type PasswordResetTokenRecord = {
  _id: ObjectId;
  userId: ObjectId;
  tokenHash: string;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
};

function collection(db: Awaited<ReturnType<typeof getDb>>) {
  return db.collection<PasswordResetTokenRecord>("password_reset_tokens");
}

let ensuredIndexes: Promise<void> | null = null;

async function ensureIndexes() {
  const db = await getDb();
  await collection(db).createIndex({ tokenHash: 1 }, { unique: true });
  await collection(db).createIndex({ userId: 1 });
  await collection(db).createIndex({ expiresAt: 1 });
}

async function ensureReady() {
  if (!ensuredIndexes) ensuredIndexes = ensureIndexes();
  await ensuredIndexes;
}

function sha256Hex(input: string) {
  return crypto.createHash("sha256").update(input, "utf8").digest("hex");
}

export function generateResetToken() {
  return crypto.randomBytes(32).toString("base64url");
}

export async function createPasswordResetToken(input: {
  userId: ObjectId;
  token: string;
  ttlMinutes?: number;
}) {
  await ensureReady();
  const db = await getDb();

  const ttlMinutes = input.ttlMinutes ?? 30;
  const tokenHash = sha256Hex(input.token);

  const doc: Omit<PasswordResetTokenRecord, "_id"> = {
    userId: input.userId,
    tokenHash,
    expiresAt: new Date(Date.now() + ttlMinutes * 60 * 1000),
    usedAt: null,
    createdAt: new Date(),
  };

  const result = await collection(db).insertOne(doc as PasswordResetTokenRecord);
  return { _id: result.insertedId, ...doc };
}

export async function findValidPasswordResetToken(token: string) {
  await ensureReady();
  const db = await getDb();
  const tokenHash = sha256Hex(token);
  const now = new Date();

  return await collection(db).findOne({
    tokenHash,
    usedAt: null,
    expiresAt: { $gt: now },
  });
}

export async function markPasswordResetTokenUsed(token: string) {
  await ensureReady();
  const db = await getDb();
  const tokenHash = sha256Hex(token);
  const now = new Date();

  const result = await collection(db).updateOne(
    { tokenHash, usedAt: null },
    { $set: { usedAt: now } },
  );

  return result.modifiedCount === 1;
}

export async function debugGetPasswordResetTokenStatus(token: string) {
  if (process.env.NODE_ENV === "production") return null;

  await ensureReady();
  const db = await getDb();
  const tokenHash = sha256Hex(token);
  const doc = await collection(db).findOne({ tokenHash });
  if (!doc) return { exists: false as const };

  const now = new Date();
  return {
    exists: true as const,
    used: doc.usedAt !== null,
    expired: doc.expiresAt <= now,
    expiresAt: doc.expiresAt,
    usedAt: doc.usedAt,
  };
}
