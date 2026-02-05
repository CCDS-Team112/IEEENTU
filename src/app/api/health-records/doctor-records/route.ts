import { NextRequest } from "next/server";
import { ObjectId } from "mongodb";
import { readSessionCookie } from "@/features/auth/infrastructure/sessionCookie";
import {
  buildCursorQuery,
  getCollections,
  normalizeStringArray,
  parseCursor,
  parseLimit,
  toIsoString,
} from "@/db/health-records";

export const runtime = "nodejs";

function mapDoctorRecord(doc: Record<string, unknown>) {
  return {
    id: String(doc._id),
    date:
      toIsoString(doc.date) ||
      toIsoString(doc.visit_date) ||
      toIsoString(doc.created_at) ||
      toIsoString(doc.createdAt),
    doctorName:
      (typeof doc.doctor_name === "string" && doc.doctor_name) ||
      (typeof doc.doctorName === "string" && doc.doctorName) ||
      null,
    visitType:
      (typeof doc.visit_type === "string" && doc.visit_type) ||
      (typeof doc.visitType === "string" && doc.visitType) ||
      null,
  };
}

export async function GET(request: NextRequest) {
  const session = await readSessionCookie();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limit = parseLimit(request.nextUrl.searchParams.get("limit"));
  const cursor = parseCursor(request.nextUrl.searchParams.get("cursor"));
  const { doctorRecords } = await getCollections();

  const query = {
    user_id: session.sub,
    ...buildCursorQuery(cursor),
  };

  const docs = await doctorRecords
    .find(query)
    .sort({ date: -1, visit_date: -1, created_at: -1, createdAt: -1, _id: -1 })
    .limit(limit + 1)
    .toArray();

  const hasNext = docs.length > limit;
  const items = (hasNext ? docs.slice(0, limit) : docs).map((doc) =>
    mapDoctorRecord(doc as Record<string, unknown>),
  );

  const nextCursor = hasNext ? String((docs[limit] as { _id: ObjectId })._id) : null;

  return Response.json({ items, nextCursor });
}

export async function POST(request: NextRequest) {
  const session = await readSessionCookie();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.role !== "ADMIN" && session.role !== "DOCTOR") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const userId =
    (typeof body.user_id === "string" && body.user_id) ||
    (typeof body.userId === "string" && body.userId) ||
    session.sub;

  const record = {
    user_id: userId,
    date: body.date ?? body.visit_date ?? body.visitDate ?? new Date().toISOString(),
    doctor_name: body.doctor_name ?? body.doctorName ?? null,
    visit_type: body.visit_type ?? body.visitType ?? null,
    diagnosis_note: body.diagnosis_note ?? body.diagnosisNote ?? null,
    plan: body.plan ?? null,
    prescriptions: normalizeStringArray(body.prescriptions),
    attachments: normalizeStringArray(body.attachments),
    created_at: new Date(),
  };

  const { doctorRecords } = await getCollections();
  const result = await doctorRecords.insertOne(record);

  return Response.json({ id: String(result.insertedId) }, { status: 201 });
}
