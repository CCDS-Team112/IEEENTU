import Link from "next/link";
import { RegisterForm } from "@/features/auth/ui/RegisterForm";
import { Card, CardDescription, CardTitle } from "@/shared/ui/Card";

export default function RegisterPage() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
      <section className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          Create account
        </p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Join a calmer, smarter health experience.
        </h1>
        <p className="text-base text-muted-foreground">
          Your account unlocks secure access to symptom checks, visit notes, and
          appointment planning in one place.
        </p>
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-foreground underline-offset-4 hover:underline"
          >
            Log in
          </Link>
          .
        </p>
      </section>

      <Card className="max-w-md">
        <CardTitle>Register</CardTitle>
        <CardDescription>
          Accounts are stored in MongoDB with bcrypt-secured passwords.
        </CardDescription>
        <div className="mt-6">
          <RegisterForm />
        </div>
      </Card>
    </div>
  );
}
