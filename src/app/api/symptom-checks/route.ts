import { NextRequest } from "next/server";
import { readSessionCookie } from "@/features/auth/infrastructure/sessionCookie";
import { getCollections } from "@/db/health-records";
import {
  AGE_BANDS,
  RED_FLAGS,
  SEVERITY_OPTIONS,
  createEmptyRedFlags,
  findAgeBandLabel,
  findSeverityLabel,
  isFeverMentioned,
  normalizeSymptom,
  redFlagLabelForKey,
  type AgeBand,
  type DurationUnit,
  type SeverityLevel,
} from "@/features/symptom-checks/domain/constants";

export const runtime = "nodejs";

const AGE_BAND_VALUES = new Set(AGE_BANDS.map((item) => item.value));
const SEVERITY_VALUES = new Set(SEVERITY_OPTIONS.map((item) => item.value));
const DURATION_UNITS = new Set(["hours", "days"] as const);

function parseSymptoms(value: unknown) {
  if (!Array.isArray(value)) return [] as string[];
  return value
    .filter((item) => typeof item === "string")
    .map((item) => normalizeSymptom(item))
    .filter((item) => item.length > 0);
}

function parseRedFlags(value: unknown) {
  const empty = createEmptyRedFlags();
  if (!value || typeof value !== "object") return empty;
  const map = value as Record<string, unknown>;
  return RED_FLAGS.reduce((acc, flag) => {
    acc[flag.key] = Boolean(map[flag.key]);
    return acc;
  }, empty);
}

function parseOptionalString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: NextRequest) {
  const session = await readSessionCookie();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  if (!body) {
    return Response.json({ error: "Invalid payload." }, { status: 400 });
  }

  const ageBand = body.ageBand as AgeBand | undefined;
  if (!ageBand || !AGE_BAND_VALUES.has(ageBand)) {
    return Response.json({ error: "Age band is required." }, { status: 400 });
  }

  const symptoms = parseSymptoms(body.symptoms);
  const freeText = parseOptionalString(body.freeText);
  if (symptoms.length === 0) {
    return Response.json(
      { error: "At least one symptom is required." },
      { status: 400 },
    );
  }

  const duration = body.duration as
    | { value?: unknown; unit?: unknown }
    | undefined;
  const durationValue = Number(duration?.value ?? NaN);
  const durationUnit = duration?.unit as DurationUnit | undefined;
  if (!Number.isFinite(durationValue) || durationValue <= 0) {
    return Response.json(
      { error: "Duration must be a positive number." },
      { status: 400 },
    );
  }
  if (!durationUnit || !DURATION_UNITS.has(durationUnit)) {
    return Response.json(
      { error: "Duration unit must be hours or days." },
      { status: 400 },
    );
  }

  const durationDays = durationUnit === "days" ? durationValue : durationValue / 24;
  if (durationDays > 365) {
    return Response.json(
      { error: "Duration must be less than 365 days." },
      { status: 400 },
    );
  }

  const severity = body.severity as SeverityLevel | undefined;
  if (!severity || !SEVERITY_VALUES.has(severity)) {
    return Response.json({ error: "Severity is required." }, { status: 400 });
  }

  const redFlags = parseRedFlags(body.redFlags);
  const redFlagList = Object.entries(redFlags)
    .filter(([, value]) => value)
    .map(([key]) => redFlagLabelForKey(key));

  const temperatureValue = Number(
    (body.vitals as Record<string, unknown> | undefined)?.temperatureF ?? NaN,
  );
  const temperatureF = Number.isFinite(temperatureValue)
    ? temperatureValue
    : null;

  const medsTaken = parseOptionalString(body.medsTaken);
  const knownConditions = parseOptionalString(body.knownConditions);
  const pregnancyStatus = parseOptionalString(body.pregnancyStatus);

  const feverPresent = isFeverMentioned(symptoms, freeText);

  let triageCategory = "Routine care";
  let guidanceText =
    "Monitor symptoms, rest, and schedule a routine appointment if things do not improve.";

  if (redFlagList.length > 0) {
    triageCategory = "Emergency now";
    guidanceText =
      "Call emergency services or go to the nearest emergency department now.";
  } else if (ageBand === "under_3_months" && feverPresent) {
    triageCategory = "Urgent";
    guidanceText =
      "Seek urgent pediatric evaluation today due to fever in an infant under 3 months.";
  }

  const answers: Record<string, unknown> = {
    "Age band": findAgeBandLabel(ageBand),
    "Main symptoms": symptoms,
    "Free text note": freeText || "Not provided",
    Duration: `${durationValue} ${durationUnit}`,
    Severity: findSeverityLabel(severity),
    "Red flags": redFlagList.length > 0 ? redFlagList.join(", ") : "None",
    "Temperature (F)": temperatureF ?? "Not provided",
    "Meds taken": medsTaken || "Not provided",
    "Known conditions": knownConditions || "Not provided",
    "Pregnancy status": pregnancyStatus || "Not provided",
  };

  const suggestedVitals = feverPresent ? ["temperature"] : [];
  const aiOutput = {
    symptoms,
    duration: { value: durationValue, unit: durationUnit },
    severity,
    redFlags,
    suggestedVitals,
  };

  const aiSummary =
    body.mode === "ai"
      ? `AI intake captured ${symptoms.length} symptom(s) over ${durationValue} ${durationUnit} with ${severity} severity.`
      : null;

  const doc = {
    user_id: session.sub,
    date: new Date(),
    created_at: new Date(),
    age_band: ageBand,
    symptoms,
    top_symptoms: symptoms,
    free_text_note: freeText || null,
    duration_value: durationValue,
    duration_unit: durationUnit,
    severity,
    red_flags: redFlags,
    red_flag_list: redFlagList,
    vitals: temperatureF ? [{ name: "temperature", value: temperatureF, unit: "F" }] : [],
    meds_taken: medsTaken || null,
    known_conditions: knownConditions || null,
    pregnancy_status: pregnancyStatus || null,
    triage_level: triageCategory,
    guidance: guidanceText,
    answers,
    ai_summary: aiSummary,
    ai_output: body.mode === "ai" ? aiOutput : null,
  };

  const { symptomChecks } = await getCollections();
  const result = await symptomChecks.insertOne(doc);

  return Response.json({
    id: String(result.insertedId),
    triage: triageCategory,
    guidance: guidanceText,
  });
}
