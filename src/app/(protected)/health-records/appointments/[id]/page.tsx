import Link from "next/link";
import { ObjectId } from "mongodb";
import { notFound, redirect } from "next/navigation";
import type { AppointmentDetail } from "@/features/health-records/domain/types";
import { getSession } from "@/features/auth/application/getSession";
import { getCollections, toIsoString } from "@/db/health-records";
import { Card, CardDescription, CardTitle } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";

function formatDateTime(value: string | null) {
  if (!value) return "Unknown time";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default async function AppointmentDetailPage({
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

  const { appointments } = await getCollections();
  const doc = await appointments.findOne({
    _id: new ObjectId(id),
    user_id: session.sub,
  });

  if (!doc) {
    notFound();
  }

  const item: AppointmentDetail = {
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
    notes:
      ((doc as Record<string, unknown>).notes as string) ||
      ((doc as Record<string, unknown>).description as string) ||
      null,
  };

  return (
    <div className="space-y-8">
      <Link
        href="/health-records"
        className="text-sm font-semibold text-foreground underline-offset-4 hover:underline"
      >
        Back to health records
      </Link>

      <Card>
        <CardTitle>Appointment</CardTitle>
        <CardDescription>Scheduled {formatDateTime(item.dateTime)}.</CardDescription>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
            {item.status ?? "Unspecified"}
          </span>
          {item.joinUrl ? (
            <a href={item.joinUrl} target="_blank" rel="noreferrer">
              <Button size="sm">Join meeting</Button>
            </a>
          ) : null}
        </div>
      </Card>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-sm text-muted-foreground">Status</p>
          <p className="text-lg font-semibold text-foreground">
            {item.status ?? "Unspecified"}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-muted-foreground">Join link</p>
          <p className="text-lg font-semibold text-foreground">
            {item.joinUrl ? "Available" : "Not set"}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-muted-foreground">Notes</p>
          <p className="text-lg font-semibold text-foreground">
            {item.notes ? "Provided" : "None"}
          </p>
        </Card>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Notes</h2>
        <p className="text-sm text-muted-foreground">
          {item.notes ?? "No notes available."}
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
