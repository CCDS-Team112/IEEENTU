"use server";

import { redirect } from "next/navigation";
import { hashPassword } from "@/features/auth/infrastructure/password";
import { setSessionCookie } from "@/features/auth/infrastructure/sessionCookie";
import {
  createUser,
  findUserByEmail,
} from "@/features/auth/infrastructure/userRepository";

export type SignUpState = { error: string | null };

function isNextRedirectError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as { digest?: unknown }).digest === "string" &&
    (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}

export async function signUp(
  _prevState: SignUpState,
  formData: FormData,
): Promise<SignUpState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!name || !email || !password) {
    return { error: "Name, email, and password are required." };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  try {
    const existing = await findUserByEmail(email);
    if (existing) {
      return { error: "An account with this email already exists." };
    }

    const passwordHash = await hashPassword(password);
    const user = await createUser({
      email,
      name,
      role: "USER",
      passwordHash,
    });

    await setSessionCookie({
      sub: user._id.toString(),
      name: user.name,
      role: user.role,
    });

    redirect("/home");
  } catch (error) {
    if (isNextRedirectError(error)) throw error;

    const message =
      error instanceof Error ? error.message : "Unexpected registration error.";
    return {
      error:
        "Registration is unavailable. Check `MONGODB_URI` and `SESSION_SECRET` in `.env.local`. " +
        message,
    };
  }
}

