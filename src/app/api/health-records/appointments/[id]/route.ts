import { ObjectId } from "mongodb";
import { readSessionCookie } from "@/features/auth/infrastructure/sessionCookie";
import { getCollections, toIsoString } from "@/db/health-records";

export const runtime = "nodejs";

function mapAppointmentDetail(doc: Record<string, unknown>) {
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
    notes:
      (typeof doc.notes === "string" && doc.notes) ||
      (typeof doc.description === "string" && doc.description) ||
      null,
  };
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await readSessionCookie();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = await context.params;
  if (!ObjectId.isValid(params.id)) {
    return Response.json({ error: "Invalid id" }, { status: 400 });
  }

  const { appointments } = await getCollections();
  const doc = await appointments.findOne({
    _id: new ObjectId(params.id),
    user_id: session.sub,
  });

  if (!doc) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json({ item: mapAppointmentDetail(doc as Record<string, unknown>) });
}
