import Link from "next/link";
import { ObjectId } from "mongodb";
import { notFound, redirect } from "next/navigation";
import type { SymptomCheckDetail } from "@/features/health-records/domain/types";
import { getSession } from "@/features/auth/application/getSession";
import { getCollections, normalizeStringArray, toIsoString } from "@/db/health-records";
import { Card, CardDescription, CardTitle } from "@/shared/ui/Card";

function formatDate(value: string | null) {
  if (!value) return "Unknown date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(date);
}

function renderKeyValueEntries(entries: [string, unknown][]) {
  if (entries.length === 0) {
    return <p className="text-sm text-muted-foreground">No answers saved.</p>;
  }

  return (
    <div className="grid gap-2 text-sm">
      {entries.map(([key, value]) => (
        <div
          key={key}
          className="rounded-2xl border border-border bg-background/70 p-4"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {key}
          </p>
          <p className="mt-1 font-semibold text-foreground">{String(value)}</p>
        </div>
      ))}
    </div>
  );
}

export default async function SymptomCheckDetailPage({
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

  const { symptomChecks } = await getCollections();
  const doc = await symptomChecks.findOne({
    _id: new ObjectId(id),
    user_id: session.sub,
  });

  if (!doc) {
    notFound();
  }

  const item: SymptomCheckDetail = {
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
    answers:
      typeof (doc as Record<string, unknown>).answers === "object" &&
      (doc as Record<string, unknown>).answers !== null
        ? ((doc as Record<string, unknown>).answers as Record<string, unknown>)
        : null,
    redFlags: normalizeStringArray(
      (doc as Record<string, unknown>).red_flags ?? (doc as Record<string, unknown>).redFlags,
    ),
    guidance:
      ((doc as Record<string, unknown>).guidance as string) ||
      ((doc as Record<string, unknown>).plan as string) ||
      null,
    aiSummary:
      ((doc as Record<string, unknown>).ai_summary as string) ||
      ((doc as Record<string, unknown>).aiSummary as string) ||
      null,
  };

  const answers =
    item.answers && typeof item.answers === "object"
      ? Object.entries(item.answers)
      : [];

  return (
    <div className="space-y-8">
      <Link
        href="/health-records"
        className="text-sm font-semibold text-foreground underline-offset-4 hover:underline"
      >
        Back to health records
      </Link>

      <Card>
        <CardTitle>Symptom check</CardTitle>
        <CardDescription>Submitted {formatDate(item.date)}.</CardDescription>
        <div className="mt-4 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-[0.2em]">Top symptoms</p>
            <p className="mt-1 text-base font-semibold text-foreground">
              {item.topSymptoms.length > 0
                ? item.topSymptoms.join(", ")
                : "Not recorded"}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em]">Triage</p>
            <p className="mt-1 text-base font-semibold text-foreground">
              {item.triageLevel ?? "Unspecified"}
            </p>
          </div>
        </div>
      </Card>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-sm text-muted-foreground">Triage level</p>
          <p className="text-lg font-semibold text-foreground">
            {item.triageLevel ?? "Unspecified"}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-muted-foreground">Top symptoms</p>
          <p className="text-lg font-semibold text-foreground">
            {item.topSymptoms.length}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-muted-foreground">Red flags</p>
          <p className="text-lg font-semibold text-foreground">
            {item.redFlags.length}
          </p>
        </Card>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Answers</h2>
        {renderKeyValueEntries(answers)}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Red flags</h2>
        {item.redFlags.length === 0 ? (
          <p className="text-sm text-muted-foreground">None noted.</p>
        ) : (
          <div className="grid gap-2 text-sm">
            {item.redFlags.map((flag) => (
              <div
                key={flag}
                className="rounded-2xl border border-border bg-background/70 p-3"
              >
                {flag}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Guidance</h2>
        <p className="text-sm text-muted-foreground">
          {item.guidance ?? "No guidance saved."}
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">AI summary</h2>
        <p className="text-sm text-muted-foreground">
          {item.aiSummary ?? "No summary available."}
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Record data</h2>
        <pre className="whitespace-pre-wrap rounded-2xl border border-border bg-muted p-4 text-xs text-muted-foreground">
          {JSON.stringify(item, null, 2)}
        </pre>
      </section>
    </div>
  );
}
