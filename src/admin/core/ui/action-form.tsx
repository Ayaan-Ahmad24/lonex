"use client";

import { createContext, useContext, useActionState, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  initialActionState,
  type ServerAction,
  type ActionState,
} from "@/admin/core/crud/types";
import { ErrorState } from "./states";
import { useToast } from "./toast";

const FormStateContext = createContext<ActionState | undefined>(undefined);

/**
 * Admin mutation form.
 *
 * Feedback is handled in one place so every action (save, delete, deactivate,
 * sign-out, verification) behaves the same:
 * - a toast is shown for both success and failure,
 * - the server component is refreshed after a successful mutation so list
 *   counts, status badges and detail panels update immediately.
 *
 * Destructive actions that remove the current record redirect server-side with
 * a flash message instead (see `flashPath`), because the detail route would
 * render a 404 before a client-side redirect could run.
 */
export function ActionForm({
  action,
  children,
  className = "",
  successMessage,
  hiddenFields,
  resetOnSuccess = false,
  refreshOnSuccess = true,
  toastSuccessTitle = "Saved",
  toastErrorTitle = "Action failed",
  onSuccess,
}: {
  action: ServerAction;
  children: ReactNode;
  className?: string;
  successMessage?: string;
  hiddenFields?: Record<string, string | number | undefined | null>;
  resetOnSuccess?: boolean;
  refreshOnSuccess?: boolean;
  toastSuccessTitle?: string;
  toastErrorTitle?: string;
  /**
   * Optional callback for success-specific side effects that need the action
   * result (for example exposing a one-time raw verification code). It runs
   * once per result and must not be used for navigation or toasts.
   */
  onSuccess?: (state: ActionState) => void;
}) {
  const [state, formAction] = useActionState(action, initialActionState);
  const router = useRouter();
  const { toast } = useToast();
  const handledState = useRef<ActionState | null>(null);

  useEffect(() => {
    if (state.status === "idle" || handledState.current === state) {
      return;
    }

    handledState.current = state;

    if (state.status === "success") {
      toast({
        title: toastSuccessTitle,
        description: state.message || successMessage,
        variant: "success",
      });

      onSuccess?.(state);

      if (refreshOnSuccess) {
        router.refresh();
      }

      return;
    }

    toast({
      title: toastErrorTitle,
      description: state.message || "The action could not be completed.",
      variant: "destructive",
    });
  }, [
    state,
    toast,
    router,
    refreshOnSuccess,
    successMessage,
    toastSuccessTitle,
    toastErrorTitle,
    onSuccess,
  ]);

  return (
    <FormStateContext.Provider value={state}>
      <form
        action={formAction}
        className={className}
        key={resetOnSuccess && state.status === "success" ? state.message : "form"}
      >
        {hiddenFields
          ? Object.entries(hiddenFields).map(([name, value]) =>
              value === undefined || value === null ? null : (
                <input key={name} type="hidden" name={name} value={value} />
              ),
            )
          : null}
        {children}
        {state.status === "error" ? (
          <div className="mt-3">
            <ErrorState title="Could not save" description={state.message} />
          </div>
        ) : null}
        {state.status === "success" ? (
          <p
            role="status"
            className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700"
          >
            {state.message || successMessage}
          </p>
        ) : null}
      </form>
    </FormStateContext.Provider>
  );
}

export function useFormState() {
  const state = useContext(FormStateContext);
  return state;
}
