import { and, eq } from "drizzle-orm";
import type { db } from "@/db";
import { publicPaths, urlRedirects } from "@/db/schema";
import {
  normalizePublicPath,
  validateClaimablePath,
} from "@/lib/routing/path";

/**
 * Public path registry and redirect history (decision 0001).
 *
 * Exactly one registry owns public URLs. Slug changes record a permanent
 * redirect from the old path to the new path. Redirect chains are collapsed so
 * a lookup never needs more than one hop.
 */

export type DbExecutor = Pick<typeof db, "select" | "insert" | "update" | "delete">;

export type PathOwner = {
  ownerType: string;
  ownerId: string;
};

export type PathMutationResult =
  | { ok: true; path: string; redirectCreated: boolean }
  | { ok: false; reason: string };

const BLOG_PATH = /^\/blog\/[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Blog articles live below the reserved `/blog` prefix. They still use the
 * single public_paths registry; only that specific prefix is exempted from the
 * reserved-first-segment rule.
 */
function validateOwnedPath(
  path: string,
  allowBlog: boolean,
): { ok: true; path: string } | { ok: false; reason: string } {
  if (allowBlog) {
    const normalized = normalizePublicPath(path);

    if (normalized.ok && BLOG_PATH.test(normalized.path)) {
      return { ok: true, path: normalized.path };
    }
  }

  return validateClaimablePath(path);
}

function isDuplicateKey(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "ER_DUP_ENTRY"
  );
}

export async function findPublicPath(
  executor: DbExecutor,
  path: string,
): Promise<{ ownerType: string; ownerId: string; status: string } | null> {
  const [row] = await executor
    .select({
      ownerType: publicPaths.ownerType,
      ownerId: publicPaths.ownerId,
      status: publicPaths.status,
    })
    .from(publicPaths)
    .where(eq(publicPaths.path, path))
    .limit(1);

  return row ?? null;
}

/** Claim a path for a new owner. Fails if another owner already holds it. */
export async function claimPublicPath(
  executor: DbExecutor,
  owner: PathOwner,
  input: { path: string; status: string; allowBlog?: boolean },
): Promise<PathMutationResult> {
  const validated = validateOwnedPath(input.path, input.allowBlog ?? false);

  if (!validated.ok) {
    return { ok: false, reason: validated.reason };
  }

  const existing = await findPublicPath(executor, validated.path);

  if (existing) {
    if (
      existing.ownerType === owner.ownerType &&
      existing.ownerId === owner.ownerId
    ) {
      await executor
        .update(publicPaths)
        .set({ status: input.status })
        .where(eq(publicPaths.path, validated.path));

      return { ok: true, path: validated.path, redirectCreated: false };
    }

    return {
      ok: false,
      reason: "That public URL is already used by another item.",
    };
  }

  try {
    await executor.insert(publicPaths).values({
      path: validated.path,
      ownerType: owner.ownerType,
      ownerId: owner.ownerId,
      status: input.status,
    });
  } catch (error) {
    if (isDuplicateKey(error)) {
      return {
        ok: false,
        reason: "That public URL is already used by another item.",
      };
    }

    throw error;
  }

  return { ok: true, path: validated.path, redirectCreated: false };
}

/** Update the publish status of an existing path. */
export async function setPublicPathStatus(
  executor: DbExecutor,
  owner: PathOwner,
  status: string,
): Promise<void> {
  await executor
    .update(publicPaths)
    .set({ status })
    .where(
      and(
        eq(publicPaths.ownerType, owner.ownerType),
        eq(publicPaths.ownerId, owner.ownerId),
      ),
    );
}

/**
 * Move an owner to a new path and record a redirect from the old one.
 *
 * Callers must already hold a transaction. The registry row is updated in
 * place; the unique path constraint is the final authority on collisions.
 */
export async function renamePublicPath(
  executor: DbExecutor,
  owner: PathOwner,
  input: { from: string; to: string; status: string; allowBlog?: boolean },
): Promise<PathMutationResult> {
  const validated = validateOwnedPath(input.to, input.allowBlog ?? false);

  if (!validated.ok) {
    return { ok: false, reason: validated.reason };
  }

  if (validated.path === input.from) {
    await setPublicPathStatus(executor, owner, input.status);
    return { ok: true, path: validated.path, redirectCreated: false };
  }

  const heldByOther = await findPublicPath(executor, validated.path);

  if (
    heldByOther &&
    !(
      heldByOther.ownerType === owner.ownerType &&
      heldByOther.ownerId === owner.ownerId
    )
  ) {
    return {
      ok: false,
      reason: "That public URL is already used by another item.",
    };
  }

  // The new path is live content now, so it can no longer be a redirect source.
  await executor
    .delete(urlRedirects)
    .where(eq(urlRedirects.oldPath, validated.path));

  // Collapse any existing redirect that pointed at the old path.
  await executor
    .update(urlRedirects)
    .set({ newPath: validated.path })
    .where(eq(urlRedirects.newPath, input.from));

  await executor
    .insert(urlRedirects)
    .values({ oldPath: input.from, newPath: validated.path })
    .onDuplicateKeyUpdate({ set: { newPath: validated.path } });

  try {
    await executor
      .update(publicPaths)
      .set({ path: validated.path, status: input.status })
      .where(
        and(
          eq(publicPaths.ownerType, owner.ownerType),
          eq(publicPaths.ownerId, owner.ownerId),
        ),
      );
  } catch (error) {
    if (isDuplicateKey(error)) {
      return {
        ok: false,
        reason: "That public URL is already used by another item.",
      };
    }

    throw error;
  }

  return { ok: true, path: validated.path, redirectCreated: true };
}

/** Remove every registry entry owned by an entity that is being deleted. */
export async function releasePublicPath(
  executor: DbExecutor,
  owner: PathOwner,
): Promise<void> {
  await executor
    .delete(publicPaths)
    .where(
      and(
        eq(publicPaths.ownerType, owner.ownerType),
        eq(publicPaths.ownerId, owner.ownerId),
      ),
    );
}

/**
 * Resolve a historical path to its current destination.
 *
 * Returns null for unknown paths, malformed targets and cycles. A cycle can
 * only be introduced by a manual database edit, but it is still detected.
 */
export async function resolveRedirect(
  executor: DbExecutor,
  path: string,
): Promise<string | null> {
  let current = path;
  const seen = new Set<string>();

  for (let hop = 0; hop < 5; hop += 1) {
    if (seen.has(current)) {
      return null;
    }

    seen.add(current);

    const [row] = await executor
      .select({ newPath: urlRedirects.newPath })
      .from(urlRedirects)
      .where(eq(urlRedirects.oldPath, current))
      .limit(1);

    if (!row) {
      return current === path ? null : current;
    }

    const validated = validateOwnedPath(row.newPath, true);

    if (!validated.ok) {
      return null;
    }

    current = validated.path;
  }

  return null;
}

/** Detect whether adding old -> new would create a redirect cycle. */
export async function wouldCreateRedirectLoop(
  executor: DbExecutor,
  oldPath: string,
  newPath: string,
): Promise<boolean> {
  if (oldPath === newPath) {
    return true;
  }

  let current = newPath;
  const seen = new Set<string>([oldPath]);

  for (let hop = 0; hop < 5; hop += 1) {
    if (seen.has(current)) {
      return true;
    }

    seen.add(current);

    const [row] = await executor
      .select({ newPath: urlRedirects.newPath })
      .from(urlRedirects)
      .where(eq(urlRedirects.oldPath, current))
      .limit(1);

    if (!row) {
      return false;
    }

    current = row.newPath;
  }

  return true;
}
