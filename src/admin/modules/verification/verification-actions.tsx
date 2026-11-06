"use client";

import { useState } from "react";
import { ActionForm, useFormState } from "@/admin/core/ui/action-form";
import { ConfirmSubmitButton } from "@/admin/core/ui/confirm-dialog";
import { SubmitButton } from "@/admin/core/ui/submit-button";
import { FormField, TextInput } from "@/admin/core/ui/form-fields";
import type { VerificationRow } from "./queries";
import {
  deactivateVerificationAction,
  activateVerificationAction,
  generateVerificationAction,
  setVerificationCodeAction,
} from "./actions";
import { useVerificationCode } from "./verification-code-context";

/**
 * Inner form rendered inside ActionForm so `useFormState()` reads the action
 * result from the provider created by that form.
 *
 * The raw code is captured by the parent through `ActionForm`'s `onSuccess`
 * callback and handed to the session context so the admin table can display
 * it. It is never persisted server-side. The form inputs are reset by the
 * `resetOnSuccess` remount, so no effect is needed here.
 */
function SetCustomCodeFormInner({
  productId,
  onCancel,
}: {
  productId: number;
  onCancel: () => void;
}) {
  const [codeInput, setCodeInput] = useState("");
  const [confirmInput, setConfirmInput] = useState("");
  const formState = useFormState();

  return (
    <div className="space-y-2">
      <FormField label="Verification code" htmlFor={`code-${productId}`}>
        <TextInput
          id={`code-${productId}`}
          name="code"
          value={codeInput}
          onChange={(e) => setCodeInput(e.currentTarget.value)}
          maxLength={50}
          placeholder="LNX-XXXX-XXXX-XXXX"
          autoComplete="off"
          required
        />
      </FormField>
      <FormField label="Confirm code" htmlFor={`confirm-${productId}`}>
        <TextInput
          id={`confirm-${productId}`}
          name="confirmCode"
          value={confirmInput}
          onChange={(e) => setConfirmInput(e.currentTarget.value)}
          maxLength={50}
          placeholder="LNX-XXXX-XXXX-XXXX"
          autoComplete="off"
          required
        />
      </FormField>
      <div className="flex gap-2">
        <SubmitButton
          label="Assign code"
          pendingLabel="Assigning..."
          size="sm"
        />
        <button
          type="button"
          onClick={onCancel}
          className="text-xs text-slate-600 underline hover:text-slate-900"
        >
          Cancel
        </button>
      </div>
      {formState?.status === "error" && formState.fieldErrors ? (
        <ul className="space-y-1 text-xs text-red-600">
          {Object.values(formState.fieldErrors).map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function VerificationActions({ row }: { row: VerificationRow }) {
  const hasCode = row.active !== null;
  const [assignMode, setAssignMode] = useState(false);
  const { showCode } = useVerificationCode();

  return (
    <div className="flex flex-wrap items-start gap-2">
      <ActionForm
        action={
          row.active
            ? deactivateVerificationAction
            : activateVerificationAction
        }
        hiddenFields={{ productId: row.productId }}
        toastSuccessTitle="Verification updated"
      >
        {row.active ? (
          <ConfirmSubmitButton
            label="Deactivate"
            confirmTitle="Deactivate this code?"
            confirmMessage="Public verification lookups for this model will fail until a new code is activated or set."
            confirmLabel="Deactivate code"
            pendingLabel="Deactivating..."
          />
        ) : (
          <SubmitButton
            label="Activate"
            pendingLabel="Activating..."
            variant="secondary"
            size="sm"
          />
        )}
      </ActionForm>

      {assignMode ? (
        <ActionForm
          action={setVerificationCodeAction}
          hiddenFields={{ productId: row.productId }}
          className="w-full space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:w-auto"
          resetOnSuccess
          toastSuccessTitle="Verification code saved"
          onSuccess={(state) => {
            if (state.code) {
              showCode(row.productId, state.code);
            }
            setAssignMode(false);
          }}
        >
          <SetCustomCodeFormInner
            productId={row.productId}
            onCancel={() => setAssignMode(false)}
          />
        </ActionForm>
      ) : (
        <>
          {!hasCode ? (
            <ActionForm
              action={generateVerificationAction}
              hiddenFields={{ productId: row.productId }}
              className="space-y-2"
              toastSuccessTitle="Verification code generated"
              onSuccess={(state) => {
                if (state.code) {
                  showCode(row.productId, state.code);
                }
              }}
            >
              <ConfirmSubmitButton
                label="Generate code"
                confirmTitle="Generate verification code?"
                confirmMessage={`A new verification code will be generated for ${row.productName}. It will be shown once.`}
                confirmLabel="Generate and show code"
                pendingLabel="Generating..."
              />
            </ActionForm>
          ) : null}

          <button
            type="button"
            onClick={() => setAssignMode(true)}
            className="text-xs font-medium text-slate-600 underline hover:text-slate-900"
          >
            Set custom code
          </button>
        </>
      )}
    </div>
  );
}
