import "server-only";

import { cache } from "react";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

type SessionLike = {
  user: {
    isActive?: boolean;
  };
} | null;

/**
 * Pure active-user filter. Exported so the rule can be tested without a
 * request context.
 */
export function selectActiveUser<T extends { isActive?: boolean }>(
  session: { user: T } | null | undefined,
): T | null {
  if (!session || !session.user.isActive) {
    return null;
  }

  return session.user;
}

/**
 * Returns the signed-in, active user, or null.
 *
 * Runs uncached at request time (decision D-A4). React's cache() only
 * de-duplicates calls within a single request. isActive is read from the
 * database on every request because session.cookieCache is disabled.
 */
export const getSessionUser = cache(async () => {
  const session = await auth.api.getSession({ headers: await headers() });

  return selectActiveUser(session as SessionLike) as NonNullable<
    typeof session
  >["user"] | null;
});
