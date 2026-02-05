import { Card, CardDescription, CardTitle } from "@/shared/ui/Card";
import { LoginForm } from "@/features/auth/ui/LoginForm";

export default function LoginPage() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
      <section className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          Secure access
        </p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Welcome back to Careline.
        </h1>
        <p className="text-base text-muted-foreground">
          Sign in to view your health records, upcoming appointments, and
          personalized care summaries.
        </p>
        <div className="rounded-3xl border border-border bg-card/80 p-6 text-sm text-muted-foreground shadow-sm">
          Demo tip: Use the credentials stored in MongoDB. If you need a test
          account, seed a user from the CLI.
        </div>
      </section>

      <Card className="max-w-md">
        <CardTitle>Sign in</CardTitle>
        <CardDescription>Access the protected dashboard instantly.</CardDescription>
        <div className="mt-6">
          <LoginForm />
        </div>
      </Card>
    </div>
  );
}
