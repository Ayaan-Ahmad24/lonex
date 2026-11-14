"use client";

import { createAuthClient } from "better-auth/react";

/**
 * Browser-side Better Auth client.
 *
 * Every call made through this client is a POST to /api/auth/*. Credentials are
 * serialised into the request body only — never into the URL, a form GET, a
 * router call or window.location.
 */
export const authClient = createAuthClient({
  basePath: "/api/auth",
});
