"use server";

import { redirect } from "next/navigation";
import { getAuthAccounts } from "@/features/auth/infrastructure/env";
import { verifyPassword } from "@/features/auth/infrastructure/password";
import { setSessionCookie } from "@/features/auth/infrastructure/sessionCookie";

export type SignInState = { error: string | null; redirectTo?: string | null };

export async function signIn(
  _prevState: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required.", redirectTo: null };
  }

  let accounts: ReturnType<typeof getAuthAccounts>;
  try {
    accounts = getAuthAccounts();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Auth misconfigured.";
    return {
      error:
        "Auth is not configured. Check `.env.local` (bcrypt hashes must escape `$` as `\\$`). " +
        message,
      redirectTo: null,
    };
  }
  const account = accounts.find(
    (a) => a.email.toLowerCase() === email.toLowerCase(),
  );

  if (!account) {
    return { error: "Invalid email or password.", redirectTo: null };
  }

  const ok = await verifyPassword(password, account.passwordHash);
  if (!ok) {
    return { error: "Invalid email or password.", redirectTo: null };
  }

  await setSessionCookie({
    sub: account.sub,
    name: account.name,
    role: account.role,
  });
  return { error: null, redirectTo: "/home" };
}
