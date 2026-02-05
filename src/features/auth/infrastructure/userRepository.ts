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

export async function ensureUserIndexes() {
  const db = await getDb();
  await usersCollection(db).createIndex({ emailLower: 1 }, { unique: true });
}

export async function findUserByEmail(email: string) {
  const db = await getDb();
  const emailLower = email.trim().toLowerCase();
  return await usersCollection(db).findOne({ emailLower });
}

export async function findUserById(id: string) {
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

