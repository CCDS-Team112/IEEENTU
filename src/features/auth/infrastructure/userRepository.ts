import "server-only";

import { ObjectId } from "mongodb";
import { getDb } from "@/shared/lib/mongodb";

export type AuthRole = "USER" | "ADMIN";

export type UserRecord = {
  _id: ObjectId;
  email: string;
  emailLower: string;
  name: string;
  role: AuthRole;
  passwordHash: string;
  createdAt: Date;
};

function usersCollection(db: Awaited<ReturnType<typeof getDb>>) {
  return db.collection<UserRecord>("users");
}

let ensuredIndexes: Promise<void> | null = null;

async function ensureUserIndexes() {
  const db = await getDb();
  await usersCollection(db).createIndex({ emailLower: 1 }, { unique: true });
}

async function ensureReady() {
  if (!ensuredIndexes) ensuredIndexes = ensureUserIndexes();
  await ensuredIndexes;
}

export async function findUserByEmail(email: string) {
  await ensureReady();
  const db = await getDb();
  const emailLower = email.trim().toLowerCase();
  return await usersCollection(db).findOne({ emailLower });
}

export async function findUserById(id: string) {
  await ensureReady();
  const db = await getDb();
  if (!ObjectId.isValid(id)) return null;
  return await usersCollection(db).findOne({ _id: new ObjectId(id) });
}

export async function createUser(input: {
  email: string;
  name: string;
  role: AuthRole;
  passwordHash: string;
}) {
  await ensureReady();
  const db = await getDb();
  const email = input.email.trim();
  const emailLower = email.toLowerCase();

  const doc: Omit<UserRecord, "_id"> = {
    email,
    emailLower,
    name: input.name.trim(),
    role: input.role,
    passwordHash: input.passwordHash,
    createdAt: new Date(),
  };

  const result = await usersCollection(db).insertOne(doc as UserRecord);
  return { _id: result.insertedId, ...doc };
}

export async function updateUserPasswordHash(userId: ObjectId, passwordHash: string) {
  await ensureReady();
  const db = await getDb();
  await usersCollection(db).updateOne(
    { _id: userId },
    { $set: { passwordHash } },
  );
}
