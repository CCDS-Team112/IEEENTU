import Link from "next/link";
import { ObjectId } from "mongodb";
import { notFound, redirect } from "next/navigation";
import type { DoctorRecordDetail } from "@/features/health-records/domain/types";
import { getSession } from "@/features/auth/application/getSession";
import { getCollections, normalizeStringArray, toIsoString } from "@/db/health-records";
import { Card, CardDescription, CardTitle } from "@/shared/ui/Card";

function formatDate(value: string | null) {
  if (!value) return "Unknown date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(date);
}

export default async function DoctorRecordDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  if (!ObjectId.isValid(id)) {
    notFound();
  }

  const { doctorRecords } = await getCollections();
  const doc = await doctorRecords.findOne({
    _id: new ObjectId(id),
    user_id: session.sub,
  });

  if (!doc) {
    notFound();
  }

  const item: DoctorRecordDetail = {
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
    diagnosisNote:
      ((doc as Record<string, unknown>).diagnosis_note as string) ||
      ((doc as Record<string, unknown>).diagnosisNote as string) ||
      null,
    plan: ((doc as Record<string, unknown>).plan as string) || null,
    prescriptions: normalizeStringArray((doc as Record<string, unknown>).prescriptions),
    attachments: normalizeStringArray((doc as Record<string, unknown>).attachments),
  };

  return (
    <div className="space-y-6">
      <Link href="/health-records" className="text-sm underline-offset-4 hover:underline">
        Back to health records
      </Link>

      <Card>
        <CardTitle>Doctor record</CardTitle>
        <CardDescription>Visit on {formatDate(item.date)}.</CardDescription>
        <div className="mt-4 space-y-2 text-sm">
          <p>
            <span className="text-[color:var(--fg)]/70">Doctor:</span>{" "}
            {item.doctorName ?? "Unspecified"}
          </p>
          <p>
            <span className="text-[color:var(--fg)]/70">Visit type:</span>{" "}
            {item.visitType ?? "Unspecified"}
          </p>
        </div>
      </Card>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-sm text-[color:var(--fg)]/70">Doctor</p>
          <p className="text-lg font-semibold">{item.doctorName ?? "Unspecified"}</p>
        </Card>
        <Card>
          <p className="text-sm text-[color:var(--fg)]/70">Visit type</p>
          <p className="text-lg font-semibold">{item.visitType ?? "Unspecified"}</p>
        </Card>
        <Card>
          <p className="text-sm text-[color:var(--fg)]/70">Prescriptions</p>
          <p className="text-lg font-semibold">{item.prescriptions.length}</p>
        </Card>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Diagnosis note</h2>
        <p className="text-sm text-[color:var(--fg)]/80">
          {item.diagnosisNote ?? "No diagnosis note saved."}
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Plan</h2>
        <p className="text-sm text-[color:var(--fg)]/80">
          {item.plan ?? "No plan recorded."}
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Prescriptions</h2>
        {item.prescriptions.length === 0 ? (
          <p className="text-sm text-[color:var(--fg)]/70">No prescriptions listed.</p>
        ) : (
          <div className="space-y-2 text-sm">
            {item.prescriptions.map((prescription) => (
              <div key={prescription} className="rounded-xl border border-[color:var(--border)] p-3">
                {prescription}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Attachments</h2>
        {item.attachments.length === 0 ? (
          <p className="text-sm text-[color:var(--fg)]/70">No attachments.</p>
        ) : (
          <div className="space-y-2 text-sm">
            {item.attachments.map((attachment) => (
              <div key={attachment} className="rounded-xl border border-[color:var(--border)] p-3">
                {attachment}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Record data</h2>
        <pre className="whitespace-pre-wrap rounded-xl border border-[color:var(--border)] bg-[color:var(--muted)] p-4 text-xs text-[color:var(--fg)]">
          {JSON.stringify(item, null, 2)}
        </pre>
      </section>
    </div>
  );
}
