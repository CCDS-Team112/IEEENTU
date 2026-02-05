"use server";

import { findUserByEmail } from "@/features/auth/infrastructure/userRepository";
import {
  createPasswordResetToken,
  generateResetToken,
} from "@/features/auth/infrastructure/passwordResetRepository";
import { headers } from "next/headers";

export type RequestPasswordResetState = {
  error: string | null;
  message: string | null;
  devResetLink?: string | null;
};

export async function requestPasswordReset(
  _prevState: RequestPasswordResetState,
  formData: FormData,
): Promise<RequestPasswordResetState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { error: "Email is required.", message: null };

  try {
    const user = await findUserByEmail(email);

    // Always return the same message to avoid account enumeration.
    const message =
      "If an account exists for that email, a reset link has been created.";

    if (!user) {
      return { error: null, message, devResetLink: null };
    }

    const token = generateResetToken();
    await createPasswordResetToken({ userId: user._id, token, ttlMinutes: 30 });

    const devResetLink =
      process.env.NODE_ENV === "production"
        ? null
        : `/reset-password?token=${encodeURIComponent(token)}`;

    if (devResetLink) {
      const h = await headers();
      const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
      const proto = h.get("x-forwarded-proto") ?? "http";
      console.log(`[password-reset] ${email} -> ${proto}://${host}${devResetLink}`);
    }

    return { error: null, message, devResetLink };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected reset error.";
    return {
      error:
        "Password reset is unavailable. Check `MONGODB_URI` in `.env.local`. " +
        message,
      message: null,
      devResetLink: null,
    };
  }
}
