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
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Reset password
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Missing reset token.
          </h1>
          <p className="text-sm text-muted-foreground">
            Request a new link to continue.
          </p>
        </header>

        <Card className="max-w-md">
          <CardTitle>Invalid link</CardTitle>
          <CardDescription>
            Request a new link from{" "}
            <Link
              href="/forgot-password"
              className="font-semibold text-foreground underline-offset-4 hover:underline"
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
    <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
      <section className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          Secure reset
        </p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Choose a new password.
        </h1>
        <p className="text-base text-muted-foreground">
          Make sure your new password is at least 8 characters and unique.
        </p>
      </section>

      <Card className="max-w-md">
        <CardTitle>Set new password</CardTitle>
        <CardDescription>Password must be at least 8 characters.</CardDescription>
        <div className="mt-6">
          <ResetPasswordForm token={token} />
        </div>
      </Card>
    </div>
  );
}
