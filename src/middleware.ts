import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "@/shared/lib/constants";
import { verifySessionTokenEdge } from "@/features/auth/infrastructure/sessionTokenEdge";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const secret = process.env.SESSION_SECRET;

  if (!token || !secret) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const session = await verifySessionTokenEdge(token, secret);
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/home/:path*"],
};

