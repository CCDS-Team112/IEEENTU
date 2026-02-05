import "server-only";

import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "@/shared/lib/constants";
import {
  signSessionToken,
  verifySessionToken,
  type SessionPayload,
} from "@/features/auth/infrastructure/sessionTokenNode";
import { getSessionSecret } from "@/features/auth/infrastructure/env";

export async function readSessionCookie(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token, getSessionSecret());
}

export async function setSessionCookie(payload: SessionPayload) {
  const token = signSessionToken(payload, getSessionSecret());
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}
