import { ObjectId } from "mongodb";
import { readSessionCookie } from "@/features/auth/infrastructure/sessionCookie";
import { getCollections, normalizeStringArray, toIsoString } from "@/db/health-records";

export const runtime = "nodejs";

function mapDoctorRecordDetail(doc: Record<string, unknown>) {
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
    diagnosisNote:
      (typeof doc.diagnosis_note === "string" && doc.diagnosis_note) ||
      (typeof doc.diagnosisNote === "string" && doc.diagnosisNote) ||
      null,
    plan: (typeof doc.plan === "string" && doc.plan) || null,
    prescriptions: normalizeStringArray(doc.prescriptions),
    attachments: normalizeStringArray(doc.attachments),
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

  const { doctorRecords } = await getCollections();
  const doc = await doctorRecords.findOne({
    _id: new ObjectId(params.id),
    user_id: session.sub,
  });

  if (!doc) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json({ item: mapDoctorRecordDetail(doc as Record<string, unknown>) });
}
