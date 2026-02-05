import Link from "next/link";
import { ForgotPasswordForm } from "@/features/auth/ui/ForgotPasswordForm";
import { Card, CardDescription, CardTitle } from "@/shared/ui/Card";

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">Forgot password</h1>
        <p className="text-sm text-[color:var(--fg)]/80">
          Remembered it?{" "}
          <Link
            href="/login"
            className="underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--focus)]"
          >
            Back to login
          </Link>
          .
        </p>
      </header>

      <Card className="max-w-md">
        <CardTitle>Create reset link</CardTitle>
        <CardDescription>
          In development, the reset link is printed to the terminal running{" "}
          <code>npm run dev</code>.
        </CardDescription>
        <div className="mt-4">
          <ForgotPasswordForm />
        </div>
      </Card>
    </div>
  );
}
