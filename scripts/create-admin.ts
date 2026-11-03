import { randomUUID } from "node:crypto";
import { createInterface } from "node:readline/promises";
import { config } from "dotenv";

// Load env before the DB module is imported (it reads MYSQL_* at import time).
config({ path: ".env.local", quiet: true });

const MIN_PASSWORD = 3;
const MAX_PASSWORD = 128;

class UserError extends Error {}

type RoleSlug = "administrator" | "editor";

function parseRole(): RoleSlug {
  const i = process.argv.indexOf("--role");
  const value = i === -1 ? "administrator" : process.argv[i + 1];
  if (value !== "administrator" && value !== "editor") {
    throw new UserError('--role must be "administrator" or "editor".');
  }
  return value;
}

// Reads a line from the terminal without echoing it.
function promptHidden(question: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const stdin = process.stdin;
    if (!stdin.isTTY) {
      reject(new UserError("An interactive terminal is required."));
      return;
    }
    process.stdout.write(question);
    let value = "";
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");

    const cleanup = () => {
      stdin.off("data", onData);
      stdin.setRawMode(false);
      stdin.pause();
    };

    const onData = (chunk: string) => {
      for (const ch of chunk) {
        if (ch === "\r" || ch === "\n") {
          cleanup();
          process.stdout.write("\n");
          resolve(value);
          return;
        }
        if (ch === "\u0003") {
          cleanup();
          process.stdout.write("\n");
          reject(new UserError("Cancelled."));
          return;
        }
        if (ch === "\u007f" || ch === "\b") {
          value = value.slice(0, -1);
          continue;
        }
        value += ch;
      }
    };

    stdin.on("data", onData);
  });
}

async function main() {
  const role = parseRole();

  const { eq } = await import("drizzle-orm");
  const { db } = await import("../src/db");
  const { user, account, adminRoles, adminUserRoles } = await import(
    "../src/db/schema"
  );
  const { auth } = await import("../src/lib/auth");

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const name = (await rl.question("Name: ")).trim();
  const email = (await rl.question("Email: ")).trim().toLowerCase();
  rl.close();

  if (!name || name.length > 255) {
    throw new UserError("Name is required (max 255 characters).");
  }
  if (email.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new UserError("Enter a valid email address.");
  }

  const password = await promptHidden(
    `Password (${MIN_PASSWORD}-${MAX_PASSWORD} characters): `,
  );
  const confirm = await promptHidden("Confirm password: ");

  if (password !== confirm) {
    throw new UserError("Passwords do not match.");
  }
  if (password.length < MIN_PASSWORD || password.length > MAX_PASSWORD) {
    throw new UserError(
      `Password must be ${MIN_PASSWORD}-${MAX_PASSWORD} characters.`,
    );
  }

  const existing = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, email))
    .limit(1);
  if (existing.length > 0) {
    throw new UserError("A user with this email already exists.");
  }

  const [roleRow] = await db
    .select({ id: adminRoles.id })
    .from(adminRoles)
    .where(eq(adminRoles.slug, role))
    .limit(1);
  if (!roleRow) {
    throw new UserError(
      `Role "${role}" not found. Run scripts/seed-rbac.sql first.`,
    );
  }

  // Better Auth's own password hasher, so login verification matches.
  const ctx = await auth.$context;
  const passwordHash = await ctx.password.hash(password);

  const userId = randomUUID();
  const now = new Date();

  await db.transaction(async (tx) => {
    await tx.insert(user).values({
      id: userId,
      name,
      email,
      emailVerified: true,
      isActive: true,
    });
    await tx.insert(account).values({
      id: randomUUID(),
      accountId: userId,
      providerId: "credential",
      userId,
      password: passwordHash,
      createdAt: now,
      updatedAt: now,
    });
    await tx.insert(adminUserRoles).values({ userId, roleId: roleRow.id });
  });

  console.log(`Created ${role} account for ${email}.`);
}

main()
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    // Never print raw driver errors: they can contain query parameters.
    if (error instanceof UserError) {
      console.error(error.message);
    } else {
      const code =
        typeof error === "object" && error !== null && "code" in error
          ? String((error as { code: unknown }).code)
          : "unknown";
      console.error(`Unexpected error (code: ${code}). No account was created.`);
    }
    process.exit(1);
  });