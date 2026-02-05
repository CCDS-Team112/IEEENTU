import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/features/auth/application/getSession";
import { Card, CardDescription, CardTitle } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";

export default async function HomePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="space-y-10">
      <section className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Dashboard
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Welcome back, {session.name}.
          </h1>
          <p className="text-base text-muted-foreground">
            Your personalized care workspace brings together symptom checks,
            provider notes, and upcoming appointments.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/health-records">
              <Button size="lg">Open health records</Button>
            </Link>
            <Button variant="outline" size="lg">
              Book an appointment
            </Button>
          </div>
        </div>
        <Card className="flex flex-col justify-between">
          <div>
            <CardTitle>Session overview</CardTitle>
            <CardDescription>
              You are signed in with the <strong>{session.role}</strong> role.
            </CardDescription>
          </div>
          <div className="mt-6 rounded-2xl border border-border bg-muted px-4 py-3 text-sm text-muted-foreground">
            Use the toolbar in the header to toggle contrast and font size.
          </div>
        </Card>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardTitle>Care timeline</CardTitle>
          <CardDescription>
            Track symptoms, visits, and follow-ups without the noise.
          </CardDescription>
        </Card>
        <Card>
          <CardTitle>Accessibility ready</CardTitle>
          <CardDescription>
            Keyboard-first navigation with high-contrast toggles and scalable type.
          </CardDescription>
        </Card>
        <Card>
          <CardTitle>Competition polish</CardTitle>
          <CardDescription>
            Modern clinic visuals with thoughtful hierarchy and a calming palette.
          </CardDescription>
        </Card>
      </section>
    </div>
  );
}
