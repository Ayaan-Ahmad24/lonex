"use client";

import { useId, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

type FieldErrors = {
  email?: string;
  password?: string;
};

/**
 * Admin sign-in.
 *
 * Credentials are posted in the request body by the Better Auth client. This
 * component never writes them to the URL, history, storage or console.
 */
export function LoginForm() {
  const router = useRouter();
  const emailId = useId();
  const passwordId = useId();
  const errorId = useId();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  function validate(): boolean {
    const next: FieldErrors = {};

    if (email.trim().length === 0) {
      next.email = "Enter your email address.";
    }

    if (password.length === 0) {
      next.password = "Enter your password.";
    }

    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (pending) {
      return;
    }

    setFormError(null);

    if (!validate()) {
      return;
    }

    setPending(true);

    try {
      const { data, error } = await authClient.signIn.email({
        email: email.trim(),
        password,
        rememberMe: true,
      });

      if (error) {
        setFormError(messageForStatus(error.status));
        return;
      }

      if (!data) {
        setFormError(
          "We couldn't start your session. Please try again or contact an administrator.",
        );
        return;
      }

      // Full navigation keeps the server-rendered shell authoritative and
      // leaves no credential-bearing history entry behind.
      router.replace("/admin");
      router.refresh();
    } catch {
      setFormError(
        "We couldn't reach the server. Check your connection and try again.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
      {formError ? (
        <div
          id={errorId}
          role="alert"
          className="flex items-start gap-2.5 rounded-lg border border-lonex-red/20 bg-lonex-red-soft px-3.5 py-3 text-[13px] leading-5 text-lonex-red"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="mt-0.5 h-4 w-4 shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7.5v5M12 16h.01" />
          </svg>
          <span>{formError}</span>
        </div>
      ) : null}

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={emailId}
          className="text-[13px] font-medium leading-5 text-lonex-ink"
        >
          Email address
        </label>
        <input
          id={emailId}
          name="email"
          type="email"
          inputMode="email"
          autoComplete="username"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-invalid={fieldErrors.email ? true : undefined}
          aria-describedby={fieldErrors.email ? `${errorId}-email` : undefined}
          placeholder="you@lonex.com"
          className="h-10 w-full rounded-[10px] border border-lonex-line bg-lonex-paper px-3 text-sm text-lonex-ink transition-colors placeholder:text-lonex-muted hover:border-lonex-muted/50 focus:border-lonex-red focus:outline-none disabled:cursor-not-allowed disabled:bg-lonex-line-soft"
        />
        {fieldErrors.email ? (
          <p id={`${errorId}-email`} className="text-xs text-lonex-red">
            {fieldErrors.email}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={passwordId}
          className="text-[13px] font-medium leading-5 text-lonex-ink"
        >
          Password
        </label>
        <div className="relative">
          <input
            id={passwordId}
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-invalid={fieldErrors.password ? true : undefined}
            aria-describedby={
              fieldErrors.password ? `${errorId}-password` : undefined
            }
            placeholder="Enter your password"
            className="h-10 w-full rounded-[10px] border border-lonex-line bg-lonex-paper pl-3 pr-11 text-sm text-lonex-ink transition-colors placeholder:text-lonex-muted hover:border-lonex-muted/50 focus:border-lonex-red focus:outline-none disabled:cursor-not-allowed disabled:bg-lonex-line-soft"
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-[10px] text-lonex-muted transition-colors hover:text-lonex-ink"
          >
            {showPassword ? (
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 3l18 18" />
                <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                <path d="M9.4 5.2A9.7 9.7 0 0 1 12 5c5 0 9 4.5 9 7a11.6 11.6 0 0 1-2.2 3.2" />
                <path d="M6.2 6.8A12.7 12.7 0 0 0 3 12c0 2.5 4 7 9 7a9.4 9.4 0 0 0 3.6-.7" />
              </svg>
            ) : (
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 12s3.6-7 9-7 9 7 9 7-3.6 7-9 7-9-7-9-7Z" />
                <circle cx="12" cy="12" r="2.6" />
              </svg>
            )}
          </button>
        </div>
        {fieldErrors.password ? (
          <p id={`${errorId}-password`} className="text-xs text-lonex-red">
            {fieldErrors.password}
          </p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={pending}
        aria-busy={pending}
        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-[10px] bg-lonex-red px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#B30909] active:bg-[#9B0808] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {pending ? (
          <>
            <span
              aria-hidden="true"
              className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white"
            />
            Signing in…
          </>
        ) : (
          "Sign in"
        )}
      </button>

      <p className="text-center text-xs leading-5 text-lonex-muted">
        Access is limited to authorised LONEX staff. Sessions expire after seven
        days of inactivity.
      </p>
    </form>
  );
}

function messageForStatus(status: number): string {
  if (status === 401 || status === 400) {
    return "Invalid email or password.";
  }

  if (status === 403) {
    return "This account is not active. Contact an administrator to restore access.";
  }

  if (status === 429) {
    return "Too many sign-in attempts. Please wait a few minutes and try again.";
  }

  return "We couldn't sign you in. Please try again or contact an administrator.";
}
