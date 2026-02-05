import { NextRequest } from "next/server";
import { ObjectId } from "mongodb";
import { readSessionCookie } from "@/features/auth/infrastructure/sessionCookie";
import {
  buildCursorQuery,
  getCollections,
  parseCursor,
  parseLimit,
  toIsoString,
} from "@/db/health-records";

export const runtime = "nodejs";

function mapAppointment(doc: Record<string, unknown>) {
  return {
    id: String(doc._id),
    dateTime:
      toIsoString(doc.date_time) ||
      toIsoString(doc.dateTime) ||
      toIsoString(doc.start_time) ||
      toIsoString(doc.startTime) ||
      toIsoString(doc.created_at) ||
      toIsoString(doc.createdAt),
    status:
      (typeof doc.status === "string" && doc.status) ||
      (typeof doc.state === "string" && doc.state) ||
      null,
    joinUrl:
      (typeof doc.join_url === "string" && doc.join_url) ||
      (typeof doc.joinUrl === "string" && doc.joinUrl) ||
      (typeof doc.meet_link === "string" && doc.meet_link) ||
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
  const { appointments } = await getCollections();

  const query = {
    user_id: session.sub,
    ...buildCursorQuery(cursor),
  };

  const docs = await appointments
    .find(query)
    .sort({ date_time: -1, start_time: -1, created_at: -1, createdAt: -1, _id: -1 })
    .limit(limit + 1)
    .toArray();

  const hasNext = docs.length > limit;
  const items = (hasNext ? docs.slice(0, limit) : docs).map((doc) =>
    mapAppointment(doc as Record<string, unknown>),
  );

  const nextCursor = hasNext ? String((docs[limit] as { _id: ObjectId })._id) : null;

  return Response.json({ items, nextCursor });
}
