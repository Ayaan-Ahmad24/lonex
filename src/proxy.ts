import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Any query key that could carry a credential. Matched case-insensitively.
const CREDENTIAL_PARAM = /(pass|pwd|email|token|secret|otp|credential)/i;

/**
 * Drop credential-bearing query parameters before anything can read them.
 * The values are never logged, echoed or stored — the browser is simply sent to
 * the same path without those keys.
 */
function withoutCredentialParams(url: URL): URL | null {
  const keys = [...url.searchParams.keys()].filter((key) =>
    CREDENTIAL_PARAM.test(key),
  );

  if (keys.length === 0) {
    return null;
  }

  const clean = new URL(url.toString());

  for (const key of keys) {
    clean.searchParams.delete(key);
  }

  return clean;
}

// Optimistic check only (presence of a session cookie). It is NOT
// authorization: getSessionUser() re-checks the session and isActive
// on the server for every page, action and handler.
export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/admin/login") {
    const clean = withoutCredentialParams(request.nextUrl);

    if (clean) {
      return NextResponse.redirect(clean, 303);
    }

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
