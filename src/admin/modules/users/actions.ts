"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { authorizeAction } from "@/admin/core/guards";
import { flashPath } from "@/admin/core/ui/flash";
import type { ActionState } from "@/admin/core/crud/types";
import { failure, success } from "@/admin/core/crud/types";
import {
  deactivateUserAtomic,
  deleteUserAtomic,
  reactivateUserAtomic,
  updateUserRoleAtomic,
} from "@/lib/admin/deactivate-user";
import { userIdSchema } from "@/lib/validation/schemas";

const mutationSchema = z.object({
  id: userIdSchema,
});

const roleSchema = z.object({
  id: userIdSchema,
  role: z.enum(["administrator", "editor"]),
});

function refreshUser(id: string) {
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${id}`);
  revalidatePath("/admin");
}

export async function deactivateUserAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const access = await authorizeAction("users.manage");

  if (!access.ok) {
    return failure(
      access.status === 401
        ? "Your session expired. Sign in again."
        : "You do not have permission to manage users.",
    );
  }

  const parsed = mutationSchema.safeParse({ id: formData.get("id") });

  if (!parsed.success) {
    return failure("Invalid user id.");
  }

  if (parsed.data.id === access.user.id) {
    return failure("You cannot deactivate your own account.");
  }

  const result = await deactivateUserAtomic({
    actorUserId: access.user.id,
    targetId: parsed.data.id,
  });

  if (result === "not_found") {
    return failure("User not found.");
  }

  if (result === "last_administrator") {
    return failure("At least one active administrator must remain.");
  }

  refreshUser(parsed.data.id);

  return success("User deactivated and all sessions revoked.");
}

export async function reactivateUserAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const access = await authorizeAction("users.manage");

  if (!access.ok) {
    return failure(
      access.status === 401
        ? "Your session expired. Sign in again."
        : "You do not have permission to manage users.",
    );
  }

  const parsed = mutationSchema.safeParse({ id: formData.get("id") });

  if (!parsed.success) {
    return failure("Invalid user id.");
  }

  const result = await reactivateUserAtomic({
    actorUserId: access.user.id,
    targetId: parsed.data.id,
  });

  if (result === "not_found") {
    return failure("User not found.");
  }

  refreshUser(parsed.data.id);

  return success("User reactivated. They can sign in again.");
}

export async function updateUserRoleAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const access = await authorizeAction("users.manage");

  if (!access.ok) {
    return failure(
      access.status === 401
        ? "Your session expired. Sign in again."
        : "You do not have permission to manage users.",
    );
  }

  const parsed = roleSchema.safeParse({
    id: formData.get("id"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return failure("Invalid role change request.");
  }

  const result = await updateUserRoleAtomic({
    actorUserId: access.user.id,
    targetId: parsed.data.id,
    roleSlug: parsed.data.role,
  });

  if (!result.ok) {
    return failure(result.message);
  }

  refreshUser(parsed.data.id);

  return success(`Role updated to ${result.role}.`);
}

export async function deleteUserAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const access = await authorizeAction("users.manage");

  if (!access.ok) {
    return failure(
      access.status === 401
        ? "Your session expired. Sign in again."
        : "You do not have permission to manage users.",
    );
  }

  const parsed = mutationSchema.safeParse({ id: formData.get("id") });

  if (!parsed.success) {
    return failure("Invalid user id.");
  }

  if (parsed.data.id === access.user.id) {
    return failure("You cannot delete your own account.");
  }

  const result = await deleteUserAtomic({
    actorUserId: access.user.id,
    targetId: parsed.data.id,
  });

  if (result === "not_found") {
    return failure("User not found.");
  }

  if (result === "cannot_delete_self") {
    return failure("You cannot delete your own account.");
  }

  if (result === "last_administrator") {
    return failure("At least one active administrator must remain.");
  }

  // The detail route no longer exists. Redirect to the list with a flash
  // message so the deletion is confirmed instead of rendering a 404.
  revalidatePath("/admin/users");
  revalidatePath("/admin");

  redirect(
    flashPath(
      "/admin/users",
      "User deleted",
      "The account and all sessions were removed.",
    ),
  );
}
