import { failure, type ActionState } from "./types";
import { permissionGranted } from "@/admin/core/registry/navigation";

/**
 * Small shared pieces used by every admin server action.
 *
 * These helpers are deliberately brand-free and module-agnostic: the caller
 * supplies the entity-specific wording. That keeps the repeated authorization,
 * validation and publish rules in one place without coupling the core to any
 * particular CMS module.
 */

/** Standard refusal for a failed `authorizeAction` check. */
export function deniedState(
  status: 401 | 403,
  forbiddenMessage: string,
): ActionState {
  return failure(
    status === 401
      ? "Your session expired. Sign in again."
      : forbiddenMessage,
  );
}

/** Surface the first validation message, with a sensible form-level fallback. */
export function firstFieldError(
  errors: Record<string, string>,
  fallback = "Check the highlighted fields.",
): string {
  return Object.values(errors)[0] ?? fallback;
}

/** Read a positive integer entity id from a form, or null when invalid. */
export function readEntityId(formData: FormData): number | null {
  const id = Number(formData.get("id"));

  return Number.isInteger(id) && id > 0 ? id : null;
}

type PublishableStatus = { status: "draft" | "published" };

/** A new record is forced to draft when the user cannot publish. */
export function gateNewStatus<T extends PublishableStatus>(
  permissions: Set<string>,
  input: T,
): T {
  return permissionGranted(permissions, "content.publish")
    ? input
    : { ...input, status: "draft" as const };
}

/**
 * An existing published record stays published; otherwise the same publish
 * permission is required to move it out of draft.
 */
export function gateUpdatedStatus<T extends PublishableStatus>(
  permissions: Set<string>,
  input: T,
): T {
  return permissionGranted(permissions, "content.publish") ||
    input.status !== "draft"
    ? input
    : { ...input, status: "draft" as const };
}
