import "server-only";
import { getServerEnv } from "@/lib/env";
import { betterAuth } from "better-auth/minimal";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { user as userTable } from "@/db/schema";
import { PASSWORD_MIN_LENGTH } from "@/lib/security/password-policy";
import { resolveIpAddressConfig } from "@/lib/security/trusted-proxies";
import {
  ACCOUNT_THROTTLE_MAX_FAILURES,
  ACCOUNT_THROTTLE_WINDOW_SECONDS,
  clearAccountFailures,
  isAccountThrottled,
  recordAccountFailure,
} from "@/lib/security/login-throttle";

function readEmail(body: unknown): string | null {
  if (!body || typeof body !== "object") {
    return null;
  }

  const value = (body as { email?: unknown }).email;

  return typeof value === "string" && value.trim().length > 0
    ? value.trim().toLowerCase()
    : null;
}

// export const auth = betterAuth({
//   appName: "LONEX Admin",
//   baseURL: new URL(getServerEnv().BETTER_AUTH_URL).origin,

//   database: drizzleAdapter(db, {
//     provider: "mysql",
//   }),

const authBaseURL = new URL(
  getServerEnv().BETTER_AUTH_URL
).origin;

export const auth = betterAuth({
  appName: "LONEX Admin",

  baseURL: authBaseURL,

  trustedOrigins: [
    authBaseURL,
    "http://localhost:3000",
    "https://*.ngrok-free.app",
    "https://*.ngrok-free.dev",
  ],

  database: drizzleAdapter(db, {
    provider: "mysql",
  }),

  // Keep all your existing configuration below unchanged.

  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    minPasswordLength: PASSWORD_MIN_LENGTH,
  },

  user: {
    additionalFields: {
      isActive: {
        type: "boolean",
        required: true,
        defaultValue: true,
        input: false,
      },
    },
  },

  // Session lifetimes are in seconds.
  // cookieCache is intentionally NOT enabled: logout and isActive changes
  // must take effect immediately (decision D-A4).
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60, // refresh at most once per hour
    freshAge: 60 * 15, // 15 minutes for sensitive operations
  },

  advanced: {
    cookiePrefix: "lonex",
    // SEC-03: do not blindly trust X-Forwarded-For. See
    // src/lib/security/trusted-proxies.ts for the policy and tests.
    ipAddress: resolveIpAddressConfig(),
  },

  // DB-backed counters so limits survive restarts and work across processes.
  rateLimit: {
    enabled: true,
    storage: "database",
    window: 60,
    max: 100,
    customRules: {
      // Per-client-IP login throttling: 10 attempts per 5 minutes.
      "/sign-in/email": { window: 300, max: 10 },
    },
  },

  hooks: {
    // SEC-03: account-scoped throttle, independent of the client IP.
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/sign-in/email") {
        return;
      }

      const email = readEmail(ctx.body);

      if (!email) {
        return;
      }

      if (await isAccountThrottled(email)) {
        throw APIError.fromStatus(429, {
          message:
            "Too many sign-in attempts for this account. Please try again later.",
        });
      }
    }),
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/sign-in/email") {
        return;
      }

      const email = readEmail(ctx.body);

      if (!email) {
        return;
      }

      const returned = ctx.context.returned;

      if (returned instanceof APIError) {
        if (returned.statusCode === 401) {
          await recordAccountFailure(email);
        }

        return;
      }

      // A successful sign-in clears prior failures for this account.
      if (
        returned &&
        typeof returned === "object" &&
        "user" in returned &&
        (returned as { user?: unknown }).user
      ) {
        await clearAccountFailures(email);
      }
    }),
  },

  databaseHooks: {
    session: {
      create: {
        // Inactive (or missing) users never get a session.
        before: async (session) => {
          const [row] = await db
            .select({ isActive: userTable.isActive })
            .from(userTable)
            .where(eq(userTable.id, session.userId))
            .limit(1);

          if (!row || !row.isActive) {
            return false;
          }
        },
      },
    },
  },
});

export const accountThrottle = {
  windowSeconds: ACCOUNT_THROTTLE_WINDOW_SECONDS,
  maxFailures: ACCOUNT_THROTTLE_MAX_FAILURES,
};
