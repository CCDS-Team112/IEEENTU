"use server";

import { redirect } from "next/navigation";
import { hashPassword } from "@/features/auth/infrastructure/password";
import {
  debugGetPasswordResetTokenStatus,
  findValidPasswordResetToken,
  markPasswordResetTokenUsed,
} from "@/features/auth/infrastructure/passwordResetRepository";
import { updateUserPasswordHash } from "@/features/auth/infrastructure/userRepository";

export type ResetPasswordState = { error: string | null };

function isNextRedirectError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as { digest?: unknown }).digest === "string" &&
    (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}

export async function resetPassword(
  _prevState: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const token = String(formData.get("token") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!token) return { error: "Reset token is missing." };

  if (!password) return { error: "New password is required." };
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  try {
    const resetToken = await findValidPasswordResetToken(token);
    if (!resetToken) {
      const status = await debugGetPasswordResetTokenStatus(token);
      if (status?.exists === false) return { error: "Reset link is invalid." };
      if (status?.exists === true && status.used)
        return { error: "This reset link was already used. Request a new one." };
      if (status?.exists === true && status.expired)
        return { error: "Reset link expired. Request a new one." };
      return { error: "Reset link is invalid or expired." };
    }

    const passwordHash = await hashPassword(password);
    await updateUserPasswordHash(resetToken.userId, passwordHash);
    await markPasswordResetTokenUsed(token);

    redirect("/login");
  } catch (error) {
    if (isNextRedirectError(error)) throw error;

    const message =
      error instanceof Error ? error.message : "Unexpected reset error.";
    return {
      error:
        "Password reset is unavailable. Check `MONGODB_URI` in `.env.local`. " +
        message,
    };
  }
}
