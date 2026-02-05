import { readSessionCookie } from "@/features/auth/infrastructure/sessionCookie";
import { getCollections, normalizeStringArray, toIsoString } from "@/db/health-records";

export const runtime = "nodejs";

function mapSymptomLatest(doc: Record<string, unknown>) {
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

function mapDoctorLatest(doc: Record<string, unknown>) {
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

function mapAppointmentLatest(doc: Record<string, unknown>) {
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

export async function GET() {
  const session = await readSessionCookie();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { symptomChecks, doctorRecords, appointments } = await getCollections();

  const [symptomCount, doctorCount, appointmentCount] = await Promise.all([
    symptomChecks.countDocuments({ user_id: session.sub }),
    doctorRecords.countDocuments({ user_id: session.sub }),
    appointments.countDocuments({ user_id: session.sub }),
  ]);

  const [latestSymptom, latestDoctor, latestAppointment] = await Promise.all([
    symptomChecks.findOne(
      { user_id: session.sub },
      { sort: { date: -1, created_at: -1, createdAt: -1, _id: -1 } },
    ),
    doctorRecords.findOne(
      { user_id: session.sub },
      { sort: { date: -1, visit_date: -1, created_at: -1, createdAt: -1, _id: -1 } },
    ),
    appointments.findOne(
      { user_id: session.sub },
      { sort: { date_time: -1, start_time: -1, created_at: -1, createdAt: -1, _id: -1 } },
    ),
  ]);

  return Response.json({
    symptomChecks: {
      count: symptomCount,
      latest: latestSymptom
        ? mapSymptomLatest(latestSymptom as Record<string, unknown>)
        : null,
    },
    doctorRecords: {
      count: doctorCount,
      latest: latestDoctor
        ? mapDoctorLatest(latestDoctor as Record<string, unknown>)
        : null,
    },
    appointments: {
      count: appointmentCount,
      latest: latestAppointment
        ? mapAppointmentLatest(latestAppointment as Record<string, unknown>)
        : null,
    },
  });
}
