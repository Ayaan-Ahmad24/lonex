/**
 * CSRF guard for custom mutation handlers: the request must carry an Origin
 * header that matches the app's own origin (BETTER_AUTH_URL).
 */
export function isSameOrigin(
  request: Request,
  expectedOrigin: string | undefined = process.env.BETTER_AUTH_URL,
): boolean {
  const origin = request.headers.get("origin");

  if (!origin || !expectedOrigin) {
    return false;
  }

  try {
    return new URL(expectedOrigin).origin === origin;
  } catch {
    return false;
  }
}
