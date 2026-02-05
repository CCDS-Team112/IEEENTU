"use server";

import { redirect } from "next/navigation";
import { verifyPassword } from "@/features/auth/infrastructure/password";
import { setSessionCookie } from "@/features/auth/infrastructure/sessionCookie";
import { findUserByEmail } from "@/features/auth/infrastructure/userRepository";

export type SignInState = { error: string | null };

function isNextRedirectError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as { digest?: unknown }).digest === "string" &&
    (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}

export async function signIn(
  _prevState: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  try {
    const user = await findUserByEmail(email);
    if (!user) return { error: "Invalid email or password." };

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) return { error: "Invalid email or password." };

    await setSessionCookie({
      sub: user._id.toString(),
      name: user.name,
      role: user.role,
    });

    redirect("/home");
  } catch (error) {
    if (isNextRedirectError(error)) throw error;

    const message =
      error instanceof Error ? error.message : "Unexpected authentication error.";
    return {
      error:
        "Sign-in is unavailable. Check `MONGODB_URI` and `SESSION_SECRET` in `.env.local`. " +
        message,
    };
  }
}
