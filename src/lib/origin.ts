/**
 * CSRF guard for custom mutation handlers: the request must carry an Origin
 * header that matches the app's own origin (BETTER_AUTH_URL).
 */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const base = process.env.BETTER_AUTH_URL;

  if (!origin || !base) {
    return false;
  }

  try {
    return new URL(base).origin === origin;
  } catch {
    return false;
  }
}