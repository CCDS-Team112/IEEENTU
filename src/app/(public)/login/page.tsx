import { Card, CardDescription, CardTitle } from "@/shared/ui/Card";
import { LoginForm } from "@/features/auth/ui/LoginForm";

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">Log in</h1>
        <p className="text-sm text-[color:var(--fg)]/80">
          Use the credentials configured in <code>.env.local</code>.
        </p>
      </header>

      <Card className="max-w-md">
        <CardTitle>Sign in</CardTitle>
        <CardDescription>Access the protected home page.</CardDescription>
        <div className="mt-4">
          <LoginForm />
        </div>
      </Card>
    </div>
  );
}

