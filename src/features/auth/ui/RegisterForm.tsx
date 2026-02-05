"use client";

import { useActionState } from "react";
import { signUp, type SignUpState } from "@/features/auth/application/signUp";
import { Alert } from "@/shared/ui/Alert";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { Label } from "@/shared/ui/Label";

const initialState: SignUpState = { error: null };

export function RegisterForm() {
  const [state, action, isPending] = useActionState(signUp, initialState);

  return (
    <form action={action} className="space-y-5" noValidate>
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" autoComplete="name" placeholder="Alex Doe" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@clinic.com"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          placeholder="Repeat password"
          required
        />
      </div>

      <div aria-live="polite">
        {state.error ? <Alert variant="error">{state.error}</Alert> : null}
      </div>

      <Button type="submit" disabled={isPending} className="w-full" size="lg">
        {isPending ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
