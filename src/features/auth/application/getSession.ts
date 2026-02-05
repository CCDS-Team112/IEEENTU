import "server-only";

import { readSessionCookie } from "@/features/auth/infrastructure/sessionCookie";

export type Session = {
  sub: string;
  name: string;
  role: "USER" | "ADMIN" | "DOCTOR";
};

export async function getSession(): Promise<Session | null> {
  return await readSessionCookie();
}
