import Link from "next/link";
import { ForgotPasswordForm } from "@/features/auth/ui/ForgotPasswordForm";
import { Card, CardDescription, CardTitle } from "@/shared/ui/Card";

export default function ForgotPasswordPage() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
      <section className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          Password reset
        </p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Let’s get you back in.
        </h1>
        <p className="text-base text-muted-foreground">
          We will generate a secure reset link. In development it prints to your
          terminal.
        </p>
        <p className="text-sm text-muted-foreground">
          Remembered it?{" "}
          <Link
            href="/login"
            className="font-semibold text-foreground underline-offset-4 hover:underline"
          >
            Back to login
          </Link>
          .
        </p>
      </section>

      <Card className="max-w-md">
        <CardTitle>Create reset link</CardTitle>
        <CardDescription>
          Use the emailed link to choose a new password.
        </CardDescription>
        <div className="mt-6">
          <ForgotPasswordForm />
        </div>
      </Card>
    </div>
  );
}
