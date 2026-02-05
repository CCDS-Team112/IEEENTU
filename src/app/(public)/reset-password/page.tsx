import Link from "next/link";
import { ResetPasswordForm } from "@/features/auth/ui/ResetPasswordForm";
import { Card, CardDescription, CardTitle } from "@/shared/ui/Card";

export default async function ResetPasswordPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const searchParams = await props.searchParams;
  const tokenRaw = searchParams.token;
  const token = Array.isArray(tokenRaw) ? tokenRaw[0] : tokenRaw;

  if (!token) {
    return (
      <div className="space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-bold">Reset password</h1>
          <p className="text-sm text-[color:var(--fg)]/80">
            Missing reset token.
          </p>
        </header>

        <Card className="max-w-md">
          <CardTitle>Invalid link</CardTitle>
          <CardDescription>
            Request a new link from{" "}
            <Link
              href="/forgot-password"
              className="underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--focus)]"
            >
              Forgot password
            </Link>
            .
          </CardDescription>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">Reset password</h1>
        <p className="text-sm text-[color:var(--fg)]/80">
          Choose a new password for your account.
        </p>
      </header>

      <Card className="max-w-md">
        <CardTitle>Set new password</CardTitle>
        <CardDescription>Password must be at least 8 characters.</CardDescription>
        <div className="mt-4">
          <ResetPasswordForm token={token} />
        </div>
      </Card>
    </div>
  );
}

