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

function mapSymptomCheck(doc: Record<string, unknown>) {
  return {
    id: String(doc._id),
    date:
      toIsoString(doc.date) ||
      toIsoString(doc.created_at) ||
      toIsoString(doc.createdAt),
    topSymptoms: normalizeStringArray(doc.top_symptoms ?? doc.topSymptoms ?? doc.symptoms),
    triageLevel:
      (typeof doc.triage_level === "string" && doc.triage_level) ||
      (typeof doc.triageLevel === "string" && doc.triageLevel) ||
      (typeof doc.triage === "string" && doc.triage) ||
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
  const { symptomChecks } = await getCollections();

  const query = {
    user_id: session.sub,
    ...buildCursorQuery(cursor),
  };

  const docs = await symptomChecks
    .find(query)
    .sort({ date: -1, created_at: -1, createdAt: -1, _id: -1 })
    .limit(limit + 1)
    .toArray();

  const hasNext = docs.length > limit;
  const items = (hasNext ? docs.slice(0, limit) : docs).map((doc) =>
    mapSymptomCheck(doc as Record<string, unknown>),
  );

  const nextCursor = hasNext ? String((docs[limit] as { _id: ObjectId })._id) : null;

  return Response.json({ items, nextCursor });
}
