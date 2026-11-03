import { betterAuth } from "better-auth/minimal";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { user as userTable } from "@/db/schema";

export const auth = betterAuth({
  appName: "LONEX Admin",

  database: drizzleAdapter(db, {
    provider: "mysql",
  }),

  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    minPasswordLength: 12,
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
  },

    // DB-backed counters so limits survive restarts and work across processes.
  rateLimit: {
    enabled: true,
    storage: "database",
    window: 60,
    max: 100,
    customRules: {
      // Login throttling: 10 attempts per 5 minutes per client IP.
      "/sign-in/email": { window: 300, max: 10 },
    },
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