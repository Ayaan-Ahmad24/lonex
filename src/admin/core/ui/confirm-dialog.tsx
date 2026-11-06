"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { buttonClassName } from "./button";
import { useFormState } from "./action-form";
import type { ActionState } from "@/admin/core/crud/types";

/**
 * Two-step confirmation for destructive actions. Rendered inside a form, so
 * the final confirm button performs the actual submit without nested forms.
 *
 * The dialog closes automatically when the parent form returns a new action
 * state (success or failure). Feedback (the toast and inline message) is owned
 * by `ActionForm`, so every mutation reports the same way.
 *
 * Instead of an effect, the dialog compares the live action state with the
 * state captured when it was opened. A new result from the server unmatches
 * them and unmounts the dialog without an extra render pass.
 */
export function ConfirmSubmitButton({
  label,
  confirmTitle,
  confirmMessage,
  confirmLabel = "Confirm",
  pendingLabel,
  variant = "danger",
  size = "sm",
}: {
  label: string;
  confirmTitle: string;
  confirmMessage: string;
  confirmLabel?: string;
  pendingLabel?: string;
  variant?: "danger" | "primary" | "secondary";
  size?: "sm" | "md";
}) {
  const formState = useFormState();
  const [open, setOpen] = useState(false);
  const [baseline, setBaseline] = useState<ActionState | undefined>(formState);
  const visible = open && formState === baseline;

  function openDialog() {
    setBaseline(formState);
    setOpen(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={openDialog}
        className={buttonClassName(variant, size)}
      >
        {label}
      </button>

      {visible ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-xl"
          >
            <h2
              id="confirm-title"
              className="text-base font-semibold text-slate-900"
            >
              {confirmTitle}
            </h2>
            <p className="mt-2 text-sm text-slate-600">{confirmMessage}</p>
            <DialogActions
              variant={variant}
              confirmLabel={confirmLabel}
              pendingLabel={pendingLabel}
              onCancel={() => setOpen(false)}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}

function DialogActions({
  variant,
  confirmLabel,
  pendingLabel,
  onCancel,
}: {
  variant: "danger" | "primary" | "secondary";
  confirmLabel: string;
  pendingLabel?: string;
  onCancel: () => void;
}) {
  const { pending } = useFormStatus();

  return (
    <div className="mt-5 flex justify-end gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={onCancel}
        className={buttonClassName("secondary", "sm")}
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={pending}
        className={buttonClassName(
          variant === "danger" ? "danger" : "primary",
          "sm",
        )}
      >
        {pending ? (pendingLabel ?? "Working...") : confirmLabel}
      </button>
    </div>
  );
}
