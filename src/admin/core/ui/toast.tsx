"use client";

import { useCallback, useMemo, type ReactNode } from "react";
import {
  ToastContainer,
  toast as toastify,
  type ToastOptions,
} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export type ToastVariant = "default" | "success" | "destructive";

export type Toast = {
  id?: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  /** Override the default auto-dismiss time in milliseconds. */
  duration?: number;
};

type ToastApi = {
  toast: (config: Toast) => void;
  dismiss: (id?: string) => void;
};

const DEFAULT_DURATION = 6000;
const ERROR_DURATION = 9000;

function toastContent(config: Toast): ReactNode {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-sm font-semibold leading-5">{config.title}</span>
      {config.description ? (
        <span className="text-xs leading-5 opacity-90">
          {config.description}
        </span>
      ) : null}
    </div>
  );
}

/**
 * Admin toast notifications powered by react-toastify.
 *
 * The `toast({ title, description, variant })` shape is kept so call sites do
 * not need to know which toast library is mounted. Success is the default;
 * destructive actions use `toastify.error`.
 */
export function useToast(): ToastApi {
  const toast = useCallback((config: Toast) => {
    const options: ToastOptions = {
      toastId: config.id,
      autoClose: config.duration ?? DEFAULT_DURATION,
    };

    if (config.variant === "destructive") {
      toastify.error(toastContent(config), {
        ...options,
        autoClose: config.duration ?? ERROR_DURATION,
      });
      return;
    }

    toastify.success(toastContent(config), options);
  }, []);

  const dismiss = useCallback((id?: string) => {
    toastify.dismiss(id);
  }, []);

  return useMemo(() => ({ toast, dismiss }), [toast, dismiss]);
}

/**
 * Mounted once in the root layout so a toast survives client-side navigation
 * (for example signing out to the login page).
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <ToastContainer
        position="top-right"
        theme="light"
        newestOnTop
        closeOnClick
        pauseOnFocusLoss={false}
        pauseOnHover
        draggable
        limit={4}
        aria-label="Notifications"
      />
    </>
  );
}
