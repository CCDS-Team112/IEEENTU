import Link from "next/link";
import { RegisterForm } from "@/features/auth/ui/RegisterForm";
import { Card, CardDescription, CardTitle } from "@/shared/ui/Card";

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">Create account</h1>
        <p className="text-sm text-[color:var(--fg)]/80">
          Already have an account?{" "}
          <Link
            href="/login"
            className="underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--focus)]"
          >
            Log in
          </Link>
          .
        </p>
      </header>

      <Card className="max-w-md">
        <CardTitle>Register</CardTitle>
        <CardDescription>
          Accounts are stored in MongoDB. Passwords are stored as bcrypt hashes.
        </CardDescription>
        <div className="mt-4">
          <RegisterForm />
        </div>
      </Card>
    </div>
  );
}

