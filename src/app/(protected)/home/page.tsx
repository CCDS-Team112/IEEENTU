import { redirect } from "next/navigation";
import { getSession } from "@/features/auth/application/getSession";
import { Card, CardDescription, CardTitle } from "@/shared/ui/Card";

export default async function HomePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">Home</h1>
        <p className="text-sm text-[color:var(--fg)]/80">
          Protected route. Your role is <strong>{session.role}</strong>.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardTitle>Welcome</CardTitle>
          <CardDescription>
            Signed in as <strong>{session.name}</strong>.
          </CardDescription>
        </Card>

        <Card>
          <CardTitle>Accessibility status</CardTitle>
          <CardDescription>
            Use the toolbar in the navbar to toggle contrast and font size.
          </CardDescription>
        </Card>
      </section>

      <Card>
        <CardTitle>Upcoming features</CardTitle>
        <CardDescription>
          This is a clean extension point for your hackathon features.
        </CardDescription>
      </Card>
    </div>
  );
}

