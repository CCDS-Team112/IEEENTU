"use client";

import { useActionState } from "react";
import { resetPassword, type ResetPasswordState } from "@/features/auth/application/resetPassword";
import { Alert } from "@/shared/ui/Alert";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { Label } from "@/shared/ui/Label";

const initialState: ResetPasswordState = { error: null };

export function ResetPasswordForm(props: { token: string }) {
  const [state, action, isPending] = useActionState(resetPassword, initialState);

  return (
    <form action={action} className="space-y-4" noValidate>
      <input type="hidden" name="token" value={props.token} />

      <div className="space-y-2">
        <Label htmlFor="password">New password</Label>
        <Input id="password" name="password" type="password" autoComplete="new-password" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm new password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
        />
      </div>

      <div aria-live="polite">
        {state.error ? <Alert variant="error">{state.error}</Alert> : null}
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Updating password…" : "Update password"}
      </Button>
    </form>
  );
}

