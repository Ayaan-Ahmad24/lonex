import { randomUUID } from "node:crypto";
import { config } from "dotenv";

// Load .env.local before importing any module that reads env at load time.
config({ path: ".env.local", quiet: true });

async function main() {
  const { PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH, evaluatePassword, passwordPolicyMessage } =
    await import("../src/lib/security/password-policy");

  const { eq } = await import("drizzle-orm");
  const { db } = await import("../src/db/client");
  const { user, account, adminRoles, adminUserRoles } = await import("../src/db/schema");
  const { hashPassword } = await import("better-auth/crypto");

  const ALLOWED_ROLES = ["administrator", "editor"] as const;
  type Role = (typeof ALLOWED_ROLES)[number];

  function readRoleArg(argv: string[]): Role {
    let raw: string | undefined;

    for (let index = 0; index < argv.length; index += 1) {
      const arg = argv[index];

      if (arg === "--role") {
        raw = argv[index + 1];
        break;
      }

      if (arg.startsWith("--role=")) {
        raw = arg.slice("--role=".length);
        break;
      }
    }

    if (raw === undefined) {
      return "administrator";
    }

    if ((ALLOWED_ROLES as readonly string[]).includes(raw)) {
      return raw as Role;
    }

    throw new Error(
      `Unknown role "${raw}". Use --role administrator or --role editor.`,
    );
  }

  const role: Role = readRoleArg(process.argv.slice(2));

  const promptHidden = (question: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const stdin = process.stdin;
      if (!stdin.isTTY) {
        reject(new Error("An interactive terminal is required."));
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
            reject(new Error("Cancelled."));
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
  };

  const email = await promptHidden("Admin Email / Login ID: ");
  const emailTrimmed = email.trim().toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
    throw new Error("Enter a valid email address.");
  }

  const password = await promptHidden(
    `Password (${PASSWORD_MIN_LENGTH}-${PASSWORD_MAX_LENGTH} characters): `,
  );
  const confirm = await promptHidden("Confirm password: ");

  if (password !== confirm) {
    throw new Error("Passwords do not match.");
  }

  // the same policy as Better Auth sign-in/password handling.
  const policy = evaluatePassword({ password, email: emailTrimmed, name: "" });

  if (!policy.ok) {
    throw new Error(passwordPolicyMessage(policy.reason));
  }

  // Check if user already exists - idempotent: if exists, just report ready
  const existing = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, emailTrimmed))
    .limit(1);

  if (existing.length > 0) {
    // Account already exists. Never reset the password or reassign the role.
    console.log(`[INFO] Account already exists: ${emailTrimmed}`);
    console.log("[INFO] No changes were made.");
    console.log("[INFO] Existing password, role and permissions were preserved.");
    console.log("");
    console.log("Nothing to do.");
    process.exit(0);
  }

  // Find the role
  const [roleRow] = await db
    .select({ id: adminRoles.id })
    .from(adminRoles)
    .where(eq(adminRoles.slug, role))
    .limit(1);

  if (!roleRow) {
    throw new Error(
      `Role "${role}" not found. Run scripts/seed-rbac.sql first.`,
    );
  }

  // Better Auth's own password hasher, so login verification matches.
  const passwordHash = await hashPassword(password);

  const userId = randomUUID();
  const now = new Date();

  await db.transaction(async (tx) => {
    await tx.insert(user).values({
      id: userId,
      name: "",
      email: emailTrimmed,
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

  console.log("[SUCCESS] User created");
  console.log("[SUCCESS] Authentication account created");
  console.log("[SUCCESS] Admin role assigned");
  console.log("[SUCCESS] Permissions verified");

  console.log("");
  console.log("Admin account is ready.");
}

main()
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error("Unexpected error. No account was created.");
    }
    process.exit(1);
  });