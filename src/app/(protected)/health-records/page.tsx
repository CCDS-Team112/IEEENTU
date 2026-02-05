import Link from "next/link";
import { ObjectId } from "mongodb";
import type {
  AppointmentListItem,
  DoctorRecordListItem,
  PaginatedResponse,
  SymptomCheckListItem,
} from "@/features/health-records/domain/types";
import { redirect } from "next/navigation";
import { getSession } from "@/features/auth/application/getSession";
import { Card, CardDescription, CardTitle } from "@/shared/ui/Card";
import {
  buildCursorQuery,
  getCollections,
  normalizeStringArray,
  parseCursor,
  toIsoString,
} from "@/db/health-records";

function formatDate(value: string | null) {
  if (!value) return "Unknown date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(date);
}

function formatDateTime(value: string | null) {
  if (!value) return "Unknown time";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

type SearchParams = { [key: string]: string | string[] | undefined };

export default async function HealthRecordsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const resolvedParams = (await searchParams) ?? {};
  const symptomCursor = typeof resolvedParams.symptomCursor === "string" ? resolvedParams.symptomCursor : undefined;
  const doctorCursor = typeof resolvedParams.doctorCursor === "string" ? resolvedParams.doctorCursor : undefined;
  const appointmentCursor =
    typeof resolvedParams.appointmentCursor === "string"
      ? resolvedParams.appointmentCursor
      : undefined;

  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const limit = 5;
  const { symptomChecks, doctorRecords, appointments } = await getCollections();

  const symptomCursorId = parseCursor(symptomCursor ?? null);
  const doctorCursorId = parseCursor(doctorCursor ?? null);
  const appointmentCursorId = parseCursor(appointmentCursor ?? null);

  const [symptomCount, doctorCount, appointmentCount, symptomDocs, doctorDocs, appointmentDocs] =
    await Promise.all([
      symptomChecks.countDocuments({ user_id: session.sub }),
      doctorRecords.countDocuments({ user_id: session.sub }),
      appointments.countDocuments({ user_id: session.sub }),
      symptomChecks
        .find({ user_id: session.sub, ...buildCursorQuery(symptomCursorId) })
        .sort({ date: -1, created_at: -1, createdAt: -1, _id: -1 })
        .limit(limit + 1)
        .toArray(),
      doctorRecords
        .find({ user_id: session.sub, ...buildCursorQuery(doctorCursorId) })
        .sort({ date: -1, visit_date: -1, created_at: -1, createdAt: -1, _id: -1 })
        .limit(limit + 1)
        .toArray(),
      appointments
        .find({ user_id: session.sub, ...buildCursorQuery(appointmentCursorId) })
        .sort({ date_time: -1, start_time: -1, created_at: -1, createdAt: -1, _id: -1 })
        .limit(limit + 1)
        .toArray(),
    ]);

  const symptomHasNext = symptomDocs.length > limit;
  const doctorHasNext = doctorDocs.length > limit;
  const appointmentHasNext = appointmentDocs.length > limit;

  const symptomItems = (symptomHasNext ? symptomDocs.slice(0, limit) : symptomDocs).map(
    (doc) =>
      ({
        id: String((doc as { _id: ObjectId })._id),
        date:
          toIsoString((doc as Record<string, unknown>).date) ||
          toIsoString((doc as Record<string, unknown>).created_at) ||
          toIsoString((doc as Record<string, unknown>).createdAt),
        topSymptoms: normalizeStringArray(
          (doc as Record<string, unknown>).top_symptoms ??
            (doc as Record<string, unknown>).topSymptoms ??
            (doc as Record<string, unknown>).symptoms,
        ),
        triageLevel:
          ((doc as Record<string, unknown>).triage_level as string) ||
          ((doc as Record<string, unknown>).triageLevel as string) ||
          ((doc as Record<string, unknown>).triage as string) ||
          null,
      }) satisfies SymptomCheckListItem,
  );

  const doctorItems = (doctorHasNext ? doctorDocs.slice(0, limit) : doctorDocs).map(
    (doc) =>
      ({
        id: String((doc as { _id: ObjectId })._id),
        date:
          toIsoString((doc as Record<string, unknown>).date) ||
          toIsoString((doc as Record<string, unknown>).visit_date) ||
          toIsoString((doc as Record<string, unknown>).created_at) ||
          toIsoString((doc as Record<string, unknown>).createdAt),
        doctorName:
          ((doc as Record<string, unknown>).doctor_name as string) ||
          ((doc as Record<string, unknown>).doctorName as string) ||
          null,
        visitType:
          ((doc as Record<string, unknown>).visit_type as string) ||
          ((doc as Record<string, unknown>).visitType as string) ||
          null,
      }) satisfies DoctorRecordListItem,
  );

  const appointmentItems = (
    appointmentHasNext ? appointmentDocs.slice(0, limit) : appointmentDocs
  ).map(
    (doc) =>
      ({
        id: String((doc as { _id: ObjectId })._id),
        dateTime:
          toIsoString((doc as Record<string, unknown>).date_time) ||
          toIsoString((doc as Record<string, unknown>).dateTime) ||
          toIsoString((doc as Record<string, unknown>).start_time) ||
          toIsoString((doc as Record<string, unknown>).startTime) ||
          toIsoString((doc as Record<string, unknown>).created_at) ||
          toIsoString((doc as Record<string, unknown>).createdAt),
        status:
          ((doc as Record<string, unknown>).status as string) ||
          ((doc as Record<string, unknown>).state as string) ||
          null,
        joinUrl:
          ((doc as Record<string, unknown>).join_url as string) ||
          ((doc as Record<string, unknown>).joinUrl as string) ||
          ((doc as Record<string, unknown>).meet_link as string) ||
          null,
      }) satisfies AppointmentListItem,
  );

  const symptomData: PaginatedResponse<SymptomCheckListItem> = {
    items: symptomItems,
    nextCursor: symptomHasNext
      ? String((symptomDocs[limit] as { _id: ObjectId })._id)
      : null,
  };
  const doctorData: PaginatedResponse<DoctorRecordListItem> = {
    items: doctorItems,
    nextCursor: doctorHasNext
      ? String((doctorDocs[limit] as { _id: ObjectId })._id)
      : null,
  };
  const appointmentData: PaginatedResponse<AppointmentListItem> = {
    items: appointmentItems,
    nextCursor: appointmentHasNext
      ? String((appointmentDocs[limit] as { _id: ObjectId })._id)
      : null,
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm font-medium text-[color:var(--fg)]/70">Your health timeline</p>
        <h1 className="text-3xl font-bold tracking-tight">Health Records</h1>
        <p className="max-w-2xl text-sm text-[color:var(--fg)]/80">
          Review your symptom checks, doctor notes, and appointments in one place.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-[color:var(--fg)]/70">Symptom submissions</p>
            <p className="text-2xl font-semibold">{symptomCount}</p>
          </div>
          <span className="rounded-full border border-[color:var(--border)] px-3 py-1 text-xs font-medium">
            Checks
          </span>
        </Card>
        <Card className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-[color:var(--fg)]/70">Doctor records</p>
            <p className="text-2xl font-semibold">{doctorCount}</p>
          </div>
          <span className="rounded-full border border-[color:var(--border)] px-3 py-1 text-xs font-medium">
            Visits
          </span>
        </Card>
        <Card className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-[color:var(--fg)]/70">Appointments</p>
            <p className="text-2xl font-semibold">{appointmentCount}</p>
          </div>
          <span className="rounded-full border border-[color:var(--border)] px-3 py-1 text-xs font-medium">
            Sessions
          </span>
        </Card>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <Card className="flex h-full flex-col gap-4">
          <div>
            <CardTitle>Symptom submissions</CardTitle>
            <CardDescription>Latest symptom checks and triage results.</CardDescription>
          </div>
          <div className="space-y-3 text-sm">
            {symptomData.items.length === 0 ? (
              <p className="text-[color:var(--fg)]/70">No symptom checks yet.</p>
            ) : (
              symptomData.items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-[color:var(--border)] p-3 transition-shadow hover:shadow-sm"
                >
                  <p className="text-[color:var(--fg)]/80">{formatDate(item.date)}</p>
                  <p className="font-medium">
                    {item.topSymptoms.length > 0 ? item.topSymptoms.join(", ") : "Symptoms recorded"}
                  </p>
                  <p className="text-[color:var(--fg)]/70">
                    Triage: {item.triageLevel ?? "Unspecified"}
                  </p>
                  <Link
                    href={`/health-records/symptom-checks/${item.id}`}
                    className="mt-2 inline-flex text-sm underline-offset-4 hover:underline"
                  >
                    View details
                  </Link>
                </div>
              ))
            )}
          </div>
          {symptomData.nextCursor ? (
            <Link
              href={`/health-records?symptomCursor=${symptomData.nextCursor}`}
              className="text-sm underline-offset-4 hover:underline"
            >
              Load more
            </Link>
          ) : null}
        </Card>

        <Card className="flex h-full flex-col gap-4">
          <div>
            <CardTitle>Doctor records</CardTitle>
            <CardDescription>Consultations, notes, and care plans.</CardDescription>
          </div>
          <div className="space-y-3 text-sm">
            {doctorData.items.length === 0 ? (
              <p className="text-[color:var(--fg)]/70">No doctor records yet.</p>
            ) : (
              doctorData.items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-[color:var(--border)] p-3 transition-shadow hover:shadow-sm"
                >
                  <p className="text-[color:var(--fg)]/80">{formatDate(item.date)}</p>
                  <p className="font-medium">{item.doctorName ?? "Doctor visit"}</p>
                  <p className="text-[color:var(--fg)]/70">
                    Visit: {item.visitType ?? "Unspecified"}
                  </p>
                  <Link
                    href={`/health-records/doctor-records/${item.id}`}
                    className="mt-2 inline-flex text-sm underline-offset-4 hover:underline"
                  >
                    View details
                  </Link>
                </div>
              ))
            )}
          </div>
          {doctorData.nextCursor ? (
            <Link
              href={`/health-records?doctorCursor=${doctorData.nextCursor}`}
              className="text-sm underline-offset-4 hover:underline"
            >
              Load more
            </Link>
          ) : null}
        </Card>

        <Card className="flex h-full flex-col gap-4">
          <div>
            <CardTitle>Appointments</CardTitle>
            <CardDescription>Upcoming or completed virtual consults.</CardDescription>
          </div>
          <div className="space-y-3 text-sm">
            {appointmentData.items.length === 0 ? (
              <p className="text-[color:var(--fg)]/70">No appointments yet.</p>
            ) : (
              appointmentData.items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-[color:var(--border)] p-3 transition-shadow hover:shadow-sm"
                >
                  <p className="text-[color:var(--fg)]/80">{formatDateTime(item.dateTime)}</p>
                  <p className="font-medium">Status: {item.status ?? "Unspecified"}</p>
                  <div className="mt-2 flex items-center gap-3">
                    <Link
                      href={`/health-records/appointments/${item.id}`}
                      className="text-sm underline-offset-4 hover:underline"
                    >
                      View details
                    </Link>
                    {item.joinUrl ? (
                      <a
                        href={item.joinUrl}
                        className="text-sm underline-offset-4 hover:underline"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Join
                      </a>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </div>
          {appointmentData.nextCursor ? (
            <Link
              href={`/health-records?appointmentCursor=${appointmentData.nextCursor}`}
              className="text-sm underline-offset-4 hover:underline"
            >
              Load more
            </Link>
          ) : null}
        </Card>
      </section>
    </div>
  );
}
