import "server-only";

import { and, count, eq, ne } from "drizzle-orm";
import { db } from "@/db";
import {
  adminRoles,
  adminUserRoles,
  account,
  session,
  user,
} from "@/db/schema";
import { recordAudit } from "@/lib/audit";

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
type Executor = Transaction | typeof db;

export type DeactivateUserResult =
  | "deactivated"
  | "not_found"
  | "last_administrator";

export type DeleteUserResult =
  | "deleted"
  | "not_found"
  | "last_administrator"
  | "cannot_delete_self";

/**
 * Deactivate one user inside the caller's transaction.
 *
 * The user row, session revocation and audit row all commit or roll back
 * together. Audit failure is never swallowed. The last active administrator
 * cannot be deactivated.
 */
export async function deactivateUser(
  executor: Executor,
  input: { actorUserId: string; targetId: string },
): Promise<DeactivateUserResult> {
  const [target] = await executor
    .select({ id: user.id })
    .from(user)
    .where(eq(user.id, input.targetId))
    .limit(1);

  if (!target) {
    return "not_found";
  }

  const [administratorRole] = await executor
    .select({ id: adminRoles.id })
    .from(adminRoles)
    .where(eq(adminRoles.slug, "administrator"))
    .limit(1);

  if (administratorRole) {
    const [targetRole] = await executor
      .select({ roleId: adminUserRoles.roleId })
      .from(adminUserRoles)
      .where(
        and(
          eq(adminUserRoles.userId, input.targetId),
          eq(adminUserRoles.roleId, administratorRole.id),
        ),
      )
      .limit(1);

    if (targetRole) {
      const [remaining] = await executor
        .select({ total: count() })
        .from(adminUserRoles)
        .innerJoin(user, eq(user.id, adminUserRoles.userId))
        .where(
          and(
            eq(adminUserRoles.roleId, administratorRole.id),
            eq(user.isActive, true),
            ne(user.id, input.targetId),
          ),
        );

      if (Number(remaining?.total ?? 0) === 0) {
        return "last_administrator";
      }
    }
  }

  await executor
    .update(user)
    .set({ isActive: false })
    .where(eq(user.id, input.targetId));

  // Revoke every session so the user is signed out everywhere.
  await executor.delete(session).where(eq(session.userId, input.targetId));

  await recordAudit(executor, {
    actorUserId: input.actorUserId,
    action: "user.deactivate",
    targetType: "user",
    targetId: input.targetId,
  });

  return "deactivated";
}

/**
 * Route-facing wrapper that owns the transaction boundary.
 */
export async function deactivateUserAtomic(input: {
  actorUserId: string;
  targetId: string;
}): Promise<DeactivateUserResult> {
  return db.transaction((tx) => deactivateUser(tx, input));
}

export type ReactivateUserResult = "reactivated" | "not_found";

export async function reactivateUserAtomic(input: {
  actorUserId: string;
  targetId: string;
}): Promise<ReactivateUserResult> {
  return db.transaction(async (tx) => {
    const [target] = await tx
      .select({ id: user.id })
      .from(user)
      .where(eq(user.id, input.targetId))
      .limit(1);

    if (!target) {
      return "not_found";
    }

    await tx
      .update(user)
      .set({ isActive: true })
      .where(eq(user.id, input.targetId));

    await recordAudit(tx, {
      actorUserId: input.actorUserId,
      action: "user.reactivate",
      targetType: "user",
      targetId: input.targetId,
    });

    return "reactivated";
  });
}

/**
 * Hard-delete one user inside the caller's transaction.
 *
 * FK-safe: sessions and account identities cascade; media, settings, blog and
 * audit references are set null. Audit history is preserved. Self-deletion and
 * deletion of the last active administrator are blocked.
 */
export async function deleteUser(
  executor: Executor,
  input: { actorUserId: string; targetId: string },
): Promise<DeleteUserResult> {
  if (input.actorUserId === input.targetId) {
    return "cannot_delete_self";
  }

  const [target] = await executor
    .select({ id: user.id, isActive: user.isActive })
    .from(user)
    .where(eq(user.id, input.targetId))
    .limit(1);

  if (!target) {
    return "not_found";
  }

  const [administratorRole] = await executor
    .select({ id: adminRoles.id })
    .from(adminRoles)
    .where(eq(adminRoles.slug, "administrator"))
    .limit(1);

  if (administratorRole) {
    const [targetRole] = await executor
      .select({ roleId: adminUserRoles.roleId })
      .from(adminUserRoles)
      .where(
        and(
          eq(adminUserRoles.userId, input.targetId),
          eq(adminUserRoles.roleId, administratorRole.id),
        ),
      )
      .limit(1);

    if (targetRole && target.isActive) {
      const [remaining] = await executor
        .select({ total: count() })
        .from(adminUserRoles)
        .innerJoin(user, eq(user.id, adminUserRoles.userId))
        .where(
          and(
            eq(adminUserRoles.roleId, administratorRole.id),
            eq(user.isActive, true),
            ne(user.id, input.targetId),
          ),
        );

      if (Number(remaining?.total ?? 0) === 0) {
        return "last_administrator";
      }
    }
  }

  // Revoke/delete all sessions and account identities for the user.
  await executor.delete(session).where(eq(session.userId, input.targetId));
  await executor
    .delete(account)
    .where(eq(account.userId, input.targetId));
  await executor
    .delete(adminUserRoles)
    .where(eq(adminUserRoles.userId, input.targetId));

  // Delete the user row itself. Related media, settings, blog and audit
  // rows reference the user with ON DELETE SET NULL, so they are preserved.
  await executor.delete(user).where(eq(user.id, input.targetId));

  await recordAudit(executor, {
    actorUserId: input.actorUserId,
    action: "user.delete",
    targetType: "user",
    targetId: input.targetId,
  });

  return "deleted";
}

/**
 * Route-facing wrapper that owns the transaction boundary.
 */
export async function deleteUserAtomic(input: {
  actorUserId: string;
  targetId: string;
}): Promise<DeleteUserResult> {
  return db.transaction((tx) => deleteUser(tx, input));
}

export type UpdateRoleResult =
  | { ok: true; role: string }
  | { ok: false; message: string };

/**
 * Replace a user's role. Self-service role changes are refused so an
 * administrator cannot accidentally lock themselves out, and the last active
 * administrator cannot be demoted.
 */
export async function updateUserRoleAtomic(input: {
  actorUserId: string;
  targetId: string;
  roleSlug: "administrator" | "editor";
}): Promise<UpdateRoleResult> {
  if (input.actorUserId === input.targetId) {
    return { ok: false, message: "You cannot change your own role." };
  }

  return db.transaction(async (tx) => {
    const [target] = await tx
      .select({ id: user.id, isActive: user.isActive })
      .from(user)
      .where(eq(user.id, input.targetId))
      .limit(1);

    if (!target) {
      return { ok: false as const, message: "User not found." };
    }

    const [role] = await tx
      .select({ id: adminRoles.id, slug: adminRoles.slug })
      .from(adminRoles)
      .where(eq(adminRoles.slug, input.roleSlug))
      .limit(1);

    if (!role) {
      return { ok: false as const, message: "Role not found." };
    }

    const [currentRole] = await tx
      .select({ roleId: adminUserRoles.roleId, slug: adminRoles.slug })
      .from(adminUserRoles)
      .innerJoin(adminRoles, eq(adminRoles.id, adminUserRoles.roleId))
      .where(eq(adminUserRoles.userId, input.targetId))
      .limit(1);

    if (currentRole?.slug === input.roleSlug) {
      return { ok: true as const, role: role.slug };
    }

    if (currentRole?.slug === "administrator" && target.isActive) {
      const [administratorRole] = await tx
        .select({ id: adminRoles.id })
        .from(adminRoles)
        .where(eq(adminRoles.slug, "administrator"))
        .limit(1);

      if (administratorRole) {
        const [remaining] = await tx
          .select({ total: count() })
          .from(adminUserRoles)
          .innerJoin(user, eq(user.id, adminUserRoles.userId))
          .where(
            and(
              eq(adminUserRoles.roleId, administratorRole.id),
              eq(user.isActive, true),
              ne(user.id, input.targetId),
            ),
          );

        if (Number(remaining?.total ?? 0) === 0) {
          return {
            ok: false as const,
            message: "At least one active administrator must remain.",
          };
        }
      }
    }

    await tx
      .delete(adminUserRoles)
      .where(eq(adminUserRoles.userId, input.targetId));
    await tx
      .insert(adminUserRoles)
      .values({ userId: input.targetId, roleId: role.id });

    await recordAudit(tx, {
      actorUserId: input.actorUserId,
      action: "user.role.update",
      targetType: "user",
      targetId: input.targetId,
      metadata: {
        from: currentRole?.slug ?? null,
        to: role.slug,
      },
    });

    return { ok: true as const, role: role.slug };
  });
}
