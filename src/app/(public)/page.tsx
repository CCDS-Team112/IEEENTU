import Link from "next/link";
import { Card, CardDescription, CardTitle } from "@/shared/ui/Card";

export default function LandingPage() {
  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <p className="text-sm font-medium text-[color:var(--fg)]/80">
          Accessibility-first Next.js starter
        </p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Access Starter
        </h1>
        <p className="max-w-2xl text-[color:var(--fg)]/90">
          A minimal, production-shaped skeleton with authentication, protected
          routes, and built-in accessibility controls.
        </p>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/login"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-transparent bg-[color:var(--primary)] px-4 py-2 text-sm font-medium text-[color:var(--primary-fg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--focus)] motion-reduce:transition-none sm:transition-opacity hover:opacity-90"
          >
            Log in
          </Link>
          <a
            href="/api/health"
            className="min-h-11 rounded-xl border border-[color:var(--border)] px-4 py-2 text-sm font-medium underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--focus)]"
          >
            Health check
          </a>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardTitle>High contrast</CardTitle>
          <CardDescription>
            Toggle a high-contrast theme that improves readability.
          </CardDescription>
        </Card>
        <Card>
          <CardTitle>Font scaling</CardTitle>
          <CardDescription>
            Cycle font size (100%, 115%, 130%) and persist it across refresh.
          </CardDescription>
        </Card>
        <Card>
          <CardTitle>Keyboard-first</CardTitle>
          <CardDescription>
            Strong focus rings, skip link, and semantic landmarks.
          </CardDescription>
        </Card>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Quick links</h2>
        <ul className="list-disc pl-5 text-sm">
          <li>
            <Link
              href="/login"
              className="underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--focus)]"
            >
              Log in
            </Link>
          </li>
          <li>
            <Link
              href="/home"
              className="underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--focus)]"
            >
              Home (protected)
            </Link>
          </li>
        </ul>
      </section>
    </div>
  );
}
