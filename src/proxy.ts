import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Optimistic check only (presence of a session cookie). It is NOT
// authorization: getSessionUser() re-checks the session and isActive
// on the server for every page, action and handler.
export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/admin/login") {
    return NextResponse.next();
  }

  const sessionCookie = getSessionCookie(request, { cookiePrefix: "lonex" });

  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};