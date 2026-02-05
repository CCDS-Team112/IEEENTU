"use client";

import { useActionState } from "react";
import {
  requestPasswordReset,
  type RequestPasswordResetState,
} from "@/features/auth/application/requestPasswordReset";
import { Alert } from "@/shared/ui/Alert";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { Label } from "@/shared/ui/Label";

const initialState: RequestPasswordResetState = {
  error: null,
  message: null,
  devResetLink: null,
};

export function ForgotPasswordForm() {
  const [state, action, isPending] = useActionState(
    requestPasswordReset,
    initialState,
  );

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

      <div aria-live="polite" className="space-y-2">
        {state.error ? <Alert variant="error">{state.error}</Alert> : null}
        {state.message ? <Alert variant="info">{state.message}</Alert> : null}
        <Alert variant="info">
          In development, the reset link is printed to the terminal running{" "}
          <code>npm run dev</code>.
        </Alert>
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Creating reset link…" : "Create reset link"}
      </Button>
    </form>
  );
}
