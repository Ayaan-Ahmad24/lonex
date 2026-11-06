import { z } from "zod";

/**
 * Typed, fail-fast server environment.
 *
 * The error message lists variable names only; values (including secrets) are
 * never printed. `.env.example` documents the same names.
 */
const serverEnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  MYSQL_HOST: z.string().min(1),
  MYSQL_PORT: z.coerce.number().int().min(1).max(65535).default(3306),
  MYSQL_USER: z.string().min(1),
  MYSQL_PASSWORD: z.string().min(1),
  MYSQL_DATABASE: z.string().min(1),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.string().url(),
  TRUSTED_PROXIES: z.string().optional(),
  ENABLE_HSTS: z.enum(["0", "1"]).optional(),
  // Private media directory. Must stay outside public/ and outside .next/.
  MEDIA_STORAGE_PATH: z.string().min(1).default(".data/media"),
  // Upload ceiling enforced before reading the whole file.
  MEDIA_MAX_UPLOAD_BYTES: z.coerce
    .number()
    .int()
    .min(1024)
    .max(50 * 1024 * 1024)
    .default(5 * 1024 * 1024),
  // Dedicated key used to HMAC model verification codes. Optional in local
  // development; production must set it. Never exposed to the browser.
  MODEL_CODE_HMAC_SECRET: z.string().min(32).optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function parseServerEnv(
  input: NodeJS.ProcessEnv = process.env,
): ServerEnv {
  const result = serverEnvSchema.safeParse(input);

  if (!result.success) {
    const invalidKeys = Array.from(
      new Set(
        result.error.issues.map((issue) =>
          issue.path.length > 0 ? issue.path.join(".") : "environment",
        ),
      ),
    ).sort();

    throw new Error(
      `Invalid server environment. Check: ${invalidKeys.join(", ")}. ` +
        "See .env.example for the expected variable names.",
    );
  }

  return result.data;
}

let cached: ServerEnv | null = null;

export function getServerEnv(): ServerEnv {
  if (!cached) {
    cached = parseServerEnv();
  }

  return cached;
}

/**
 * Secret used to derive model verification digests.
 *
 * A dedicated `MODEL_CODE_HMAC_SECRET` is preferred. Local development falls
 * back to the auth secret so the feature works without editing `.env.local`;
 * production deployments are warned to set a dedicated value.
 */
export function getModelCodeSecret(env: ServerEnv = getServerEnv()): string {
  return env.MODEL_CODE_HMAC_SECRET ?? env.BETTER_AUTH_SECRET;
}

export function hasDedicatedModelCodeSecret(
  env: ServerEnv = getServerEnv(),
): boolean {
  return Boolean(env.MODEL_CODE_HMAC_SECRET);
}

export function isHttpsDeployment(env: ServerEnv): boolean {
  return env.BETTER_AUTH_URL.startsWith("https://");
}

export function isHstsEnabled(env: ServerEnv): boolean {
  return env.ENABLE_HSTS === "1" || isHttpsDeployment(env);
}
