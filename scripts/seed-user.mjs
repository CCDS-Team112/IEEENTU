import { MongoClient } from "mongodb";

function getArg(name) {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx === -1) return null;
  return process.argv[idx + 1] ?? null;
}

function requiredArg(name) {
  const value = getArg(name);
  if (!value) {
    console.error(`Missing required argument: --${name}`);
    process.exit(1);
  }
  return value;
}

function normalizeBcryptHash(value) {
  // Allow passing hashes copied from `.env.local` format (escaped `$` as `\\$`).
  return value.replace(/\\\$/g, "$");
}

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error("Missing MONGODB_URI in .env.local");
  process.exit(1);
}

const dbName = process.env.MONGODB_DB || "access_starter";

const email = requiredArg("email").trim();
const name = requiredArg("name").trim();
const roleRaw = requiredArg("role").toUpperCase();
const role = roleRaw === "ADMIN" ? "ADMIN" : roleRaw === "USER" ? "USER" : null;
if (!role) {
  console.error("Invalid --role. Use USER or ADMIN.");
  process.exit(1);
}

const passwordHash = normalizeBcryptHash(requiredArg("password-hash"));

const client = new MongoClient(mongoUri);
await client.connect();
const db = client.db(dbName);

const users = db.collection("users");
await users.createIndex({ emailLower: 1 }, { unique: true });

const emailLower = email.toLowerCase();

const existing = await users.findOne({ emailLower });
if (existing) {
  console.error(`User already exists for email: ${email}`);
  process.exit(1);
}

const result = await users.insertOne({
  email,
  emailLower,
  name,
  role,
  passwordHash,
  createdAt: new Date(),
});

console.log(`Created user ${email} (${role}) with id ${result.insertedId}`);
await client.close();

