import { ObjectId } from "mongodb";
import { getMongoDb } from "@/db/mongodb";

const DEFAULT_LIMIT = 5;
const MAX_LIMIT = 25;

export function parseLimit(raw: string | null) {
  const parsed = Number(raw ?? DEFAULT_LIMIT);
  if (Number.isNaN(parsed) || parsed <= 0) return DEFAULT_LIMIT;
  return Math.min(parsed, MAX_LIMIT);
}

export function parseCursor(raw: string | null) {
  if (!raw) return null;
  if (!ObjectId.isValid(raw)) return null;
  return new ObjectId(raw);
}

export function buildCursorQuery(cursor: ObjectId | null) {
  if (!cursor) return {};
  return { _id: { $lt: cursor } };
}

export function toIsoString(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();
  return null;
}

export function normalizeStringArray(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.filter((item) => typeof item === "string");
  }
  if (typeof value === "string") return [value];
  return [];
}

export async function getCollections() {
  const db = await getMongoDb();
  return {
    symptomChecks: db.collection("symptom_checks"),
    doctorRecords: db.collection("doctor_records"),
    appointments: db.collection("appointments"),
  };
}
