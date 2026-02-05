import Link from "next/link";
import { Card, CardDescription, CardTitle } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { ContactDoctor } from "./ContactDoctor";

export default function LandingPage() {
  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-[32px] border border-border bg-grid p-8 shadow-[0_25px_60px_-45px_rgba(15,23,42,0.55)] sm:p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-white/70 via-white/40 to-transparent" />
        <div className="relative space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Modern Clinic Portal
          </div>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Careline makes every patient touchpoint feel human.
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
            A competition-ready healthcare experience with secure access,
            intelligent summaries, and a timeline that helps patients understand
            their care.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/login">
              <Button size="lg">Log in</Button>
            </Link>
            <Link href="/register">
              <Button variant="outline" size="lg">
                Create account
              </Button>
            </Link>
            <a
              href="/api/health"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-border px-6 text-sm font-semibold text-foreground transition hover:bg-accent"
            >
              Health check
            </a>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardTitle>Accessible by design</CardTitle>
          <CardDescription>
            High-contrast mode and adaptive text scaling keep every screen clear
            and readable.
          </CardDescription>
        </Card>
        <Card>
          <CardTitle>Unified health timeline</CardTitle>
          <CardDescription>
            Pulls symptom checks, doctor notes, and appointments into one
            effortless story.
          </CardDescription>
        </Card>
        <Card>
          <CardTitle>Secure, fast, reliable</CardTitle>
          <CardDescription>
            Signed sessions, protected routes, and MongoDB-backed persistence
            keep data safe.
          </CardDescription>
        </Card>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <Card className="flex flex-col justify-between">
          <div>
            <CardTitle>Instant navigation</CardTitle>
            <CardDescription>
              Jump directly to login, register, or health records with one click.
            </CardDescription>
          </div>
          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <Link
              href="/login"
              className="rounded-full border border-border px-4 py-2 font-semibold text-foreground transition hover:bg-accent"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="rounded-full border border-border px-4 py-2 font-semibold text-foreground transition hover:bg-accent"
            >
              Create account
            </Link>
            <Link
              href="/home"
              className="rounded-full border border-border px-4 py-2 font-semibold text-foreground transition hover:bg-accent"
            >
              View dashboard
            </Link>
          </div>
        </Card>
        <Card className="flex flex-col justify-between">
          <div>
            <CardTitle>Designed for competition</CardTitle>
            <CardDescription>
              Strong visual hierarchy, clean typography, and a modern clinic
              palette make every view feel premium.
            </CardDescription>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            Tip: Toggle the accessibility toolbar in the header to see contrast
            and font scaling in action.
          </p>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Contact Doctor</h2>
        <p className="text-sm text-[color:var(--fg)]/80">
          Book a 15-minute virtual consultation and get a Google Meet link.
        </p>
        <ContactDoctor />
      </section>
    </div>
  );
}
