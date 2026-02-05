"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, type SignInState } from "@/features/auth/application/signIn";
import { Alert } from "@/shared/ui/Alert";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { Label } from "@/shared/ui/Label";

const initialState: SignInState = { error: null, redirectTo: null };

export function LoginForm() {
  const [state, action, isPending] = useActionState(signIn, initialState);
  const router = useRouter();

  useEffect(() => {
    if (state.redirectTo) {
      router.push(state.redirectTo);
    }
  }, [state.redirectTo, router]);

  return (
    <form action={action} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>

      <div aria-live="polite">
        {state.error ? <Alert variant="error">{state.error}</Alert> : null}
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
