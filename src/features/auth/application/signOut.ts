"use server";

import { redirect } from "next/navigation";
import { clearSessionCookie } from "@/features/auth/infrastructure/sessionCookie";

export async function signOut() {
  await clearSessionCookie();
  redirect("/");
}
