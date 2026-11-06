"use client";

import { ActionForm } from "@/admin/core/ui/action-form";
import { ConfirmSubmitButton } from "@/admin/core/ui/confirm-dialog";
import type { ServerAction } from "@/admin/core/crud/types";

/**
 * Shared two-step delete form for admin detail pages.
 *
 * Delete actions redirect to the module list with a flash message on success
 * (the detail page would otherwise render a 404), so this form only needs to
 * confirm the intent and submit. Failures still surface inline and as a toast
 * through `ActionForm`.
 */
export function DeleteForm({
  action,
  id,
  label,
  confirmTitle,
  confirmMessage,
  confirmLabel = "Delete permanently",
}: {
  action: ServerAction;
  id: string | number;
  label: string;
  confirmTitle: string;
  confirmMessage: string;
  confirmLabel?: string;
}) {
  return (
    <ActionForm
      action={action}
      hiddenFields={{ id }}
      refreshOnSuccess={false}
      toastSuccessTitle="Deleted"
    >
      <ConfirmSubmitButton
        label={label}
        confirmTitle={confirmTitle}
        confirmMessage={confirmMessage}
        confirmLabel={confirmLabel}
        pendingLabel="Deleting..."
      />
    </ActionForm>
  );
}
