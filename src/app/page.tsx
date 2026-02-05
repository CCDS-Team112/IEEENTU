// src/app/page.tsx
export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-6 text-black">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header */}
        <header className="flex flex-col gap-3 rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-3xl font-bold tracking-tight">
              Hackathon Starter
            </h1>
            <span className="rounded-full border bg-gray-50 px-3 py-1 text-sm text-black">
              Next.js + Tailwind
            </span>
          </div>

          <p className="max-w-2xl text-black">
            A clean UI shell with a health check, feature cards, and a place to
            paste your pitch. Extend the cards into real pages or components.
          </p>

          <div className="flex flex-wrap gap-3">
            <a
              href="/api/health"
              className="inline-flex items-center justify-center rounded-xl bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              Open /api/health
            </a>
            <a
              href="https://nextjs.org/docs"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-xl border bg-white px-4 py-2 text-sm font-medium text-black hover:bg-gray-50"
            >
              Next.js Docs
            </a>
            <a
              href="https://tailwindcss.com/docs"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-xl border bg-white px-4 py-2 text-sm font-medium text-black hover:bg-gray-50"
            >
              Tailwind Docs
            </a>
          </div>
        </header>

        {/* Main grid */}
        <section className="grid gap-6 md:grid-cols-3">
          <Card
            title="Build fast"
            desc="Start with a simple route structure and iterate. Ship a demo, then refactor."
            tag="UI"
          />
          <Card
            title="API-ready"
            desc="Use Next.js route handlers for quick endpoints. Replace with real services later."
            tag="Backend"
          />
          <Card
            title="Deploy anytime"
            desc="Works great on Vercel. Also fine on any Node server that can run Next."
            tag="Ops"
          />
        </section>

        {/* Health check callout */}
        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-black">
            Backend health check
          </h2>
          <p className="mt-2 text-black">
            Your API route should return JSON at{" "}
            <code className="rounded bg-gray-50 px-2 py-1 text-black">
              /api/health
            </code>
            .
          </p>

          <div className="mt-4 overflow-hidden rounded-xl border">
            <div className="flex items-center justify-between bg-gray-50 px-4 py-2">
              <span className="text-sm font-medium text-black">Try it</span>
              <span className="text-xs text-black">
                Tip: open DevTools Network tab
              </span>
            </div>
            <pre className="overflow-auto p-4 text-sm text-black">
{`curl http://localhost:3000/api/health
# -> { "ok": true, "time": "..." }`}
            </pre>
          </div>
        </section>

        {/* Footer */}
        <footer className="pb-8 text-center text-sm text-black">
          Built for chaos. Refactor for wisdom.
        </footer>
      </div>
    </main>
  );
}

function Card(props: { title: string; desc: string; tag: string }) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm text-black">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold text-black">{props.title}</h3>
        <span className="rounded-full border bg-gray-50 px-3 py-1 text-xs font-medium text-black">
          {props.tag}
        </span>
      </div>
      <p className="mt-2 text-black">{props.desc}</p>
      <div className="mt-4">
        <button className="rounded-xl border bg-white px-3 py-2 text-sm font-medium text-black hover:bg-gray-50">
          Extend this card →
        </button>
      </div>
    </div>
  );
}
