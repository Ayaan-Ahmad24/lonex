import { cache } from "react";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

/**
 * Returns the signed-in, active user, or null.
 *
 * Runs uncached at request time (decision D-A4). React's cache() only
 * de-duplicates calls within a single request. isActive is read from the
 * database on every request because session.cookieCache is disabled.
 */
export const getSessionUser = cache(async () => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || !session.user.isActive) {
    return null;
  }

  return session.user;
});