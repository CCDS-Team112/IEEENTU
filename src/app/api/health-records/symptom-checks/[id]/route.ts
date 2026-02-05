import { ObjectId } from "mongodb";
import { readSessionCookie } from "@/features/auth/infrastructure/sessionCookie";
import { getCollections, normalizeStringArray, toIsoString } from "@/db/health-records";

export const runtime = "nodejs";

function mapSymptomCheckDetail(doc: Record<string, unknown>) {
  const answers =
    typeof doc.answers === "object" && doc.answers !== null ? doc.answers : null;

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
    answers,
    redFlags: normalizeStringArray(doc.red_flags ?? doc.redFlags),
    guidance:
      (typeof doc.guidance === "string" && doc.guidance) ||
      (typeof doc.plan === "string" && doc.plan) ||
      null,
    aiSummary:
      (typeof doc.ai_summary === "string" && doc.ai_summary) ||
      (typeof doc.aiSummary === "string" && doc.aiSummary) ||
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

  const { symptomChecks } = await getCollections();
  const doc = await symptomChecks.findOne({
    _id: new ObjectId(params.id),
    user_id: session.sub,
  });

  if (!doc) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json({ item: mapSymptomCheckDetail(doc as Record<string, unknown>) });
}
