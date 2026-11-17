"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";

import { verifyCodeAction } from "./actions";
import { initialVerifyState, type VerifyState } from "./state";

/**
 * Public registry check.
 *
 * `verifyCodeAction` is the only lookup path and its rules are unchanged. The
 * wrapper exists so a dropped connection or an unavailable database produces a
 * readable state instead of an error page, without altering any outcome the
 * server returns for a valid, invalid or throttled request.
 */
async function verifyWithFallback(
  previous: VerifyState,
  formData: FormData,
): Promise<VerifyState> {
  try {
    return await verifyCodeAction(previous, formData);
  } catch {
    return {
      status: "unavailable",
      message:
        "The registry could not be reached. Check your connection and try again, or contact LONEX and we will check the model with you.",
    };
  }
}

const STATE_TITLES: Record<
  Exclude<VerifyState["status"], "idle" | "success">,
  string
> = {
  error: "No match returned.",
  throttled: "Too many attempts.",
  unavailable: "Registry unavailable.",
};

const ERROR_CHECKS = [
  "Compare each character with the label. The 12-character body excludes I, L, O and U.",
  "Dashes and spaces are ignored, so the exact transcription does not matter.",
  "If the label is damaged, contact LONEX with the model name and a photograph.",
];

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 12.5 9.6 17 19 7.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AlertIcon({ kind }: { kind: "error" | "throttled" | "unavailable" }) {
  if (kind === "throttled") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="8.2" stroke="currentColor" strokeWidth="1.4" />
        <path
          d="M12 7.6V12l3.1 1.9"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (kind === "unavailable") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 3.5v9"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="12" cy="17.4" r="1.1" fill="currentColor" />
        <circle cx="12" cy="12" r="8.6" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8.4" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M12 7.8v5.1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="12" cy="16.2" r="1" fill="currentColor" />
    </svg>
  );
}

export function VerifyForm() {
  const [state, formAction, pending] = useActionState<VerifyState, FormData>(
    verifyWithFallback,
    initialVerifyState,
  );

  // A result can be dismissed without clearing the action state, so the panel
  // returns to its input state until the next submission.
  const [dismissed, setDismissed] = useState(false);
  const active = dismissed ? initialVerifyState : state;

  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const lastStatus = useRef<VerifyState["status"]>("idle");
  // React resets the uncontrolled field once an action completes, so remember
  // the submitted code to make "Retry the check" possible after a dropped
  // connection.
  const lastCode = useRef("");

  useEffect(() => {
    if (active.status === "idle" || active.status === lastStatus.current) {
      return;
    }

    lastStatus.current = active.status;

    // A failed check should leave an empty field, so the next code can be
    // typed straight away instead of editing the rejected one.
    if (active.status === "error" && inputRef.current) {
      inputRef.current.value = "";
    }

    resultRef.current?.focus({ preventScroll: true });
  }, [active.status]);

  const reset = () => {
    setDismissed(true);
    lastStatus.current = "idle";
    lastCode.current = "";

    if (inputRef.current) {
      inputRef.current.value = "";
    }

    inputRef.current?.focus({ preventScroll: true });
  };

  const retry = () => {
    if (inputRef.current && !inputRef.current.value) {
      inputRef.current.value = lastCode.current;
    }

    formRef.current?.requestSubmit();
  };

  return (
    <div className="lxv-panel" id="verify">
      <div className="lxv-panel__top">
        <span className="lxv-panel__label">
          <span aria-hidden="true" className="lxv-pulse" />
          Model registry
        </span>
        <span className="lxv-panel__tag">Public check</span>
      </div>
      <span
        aria-hidden="true"
        className={`lxv-panel__progress${pending ? " is-active" : ""}`}
      />

      <div className="lxv-panel__body">
        <p className="lxv-eyebrow">Verification</p>
        <h2 className="lxv-panel__title">Check a model code.</h2>
        <p className="lxv-panel__intro">
          Enter the code supplied with the model. The registry returns a match,
          a generic response, or a message that the check could not run.
        </p>

        <form
          ref={formRef}
          action={formAction}
          className="lxv-form"
          onSubmit={() => {
            lastCode.current = inputRef.current?.value ?? "";
            setDismissed(false);
          }}
        >
          <div className="lxv-field">
            <div className="lxv-field__head">
              <label htmlFor="code">Verification code</label>
              <span className="lxv-field__format">LNX-XXXX-XXXX-XXXX</span>
            </div>

            <div className="lxv-input">
              <span aria-hidden="true" className="lxv-input__sigil">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M7 11V8.6a5 5 0 0 1 10 0V11"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                  <rect
                    x="4.6"
                    y="10.8"
                    width="14.8"
                    height="9.4"
                    stroke="currentColor"
                    strokeWidth="1.3"
                  />
                  <path
                    d="M12 14.3v2.4"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <input
                ref={inputRef}
                id="code"
                name="code"
                type="text"
                inputMode="text"
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                placeholder="LNX-XXXX-XXXX-XXXX"
                maxLength={40}
                required
                aria-describedby="code-help"
                aria-invalid={active.status === "error"}
                disabled={pending}
                className="lxv-input__control"
              />
            </div>

            <p id="code-help" className="lxv-field__help">
              Case-insensitive. Dashes and spaces are optional.
            </p>
          </div>

          <button
            type="submit"
            disabled={pending}
            className="lxv-submit"
            aria-disabled={pending}
          >
            {pending ? (
              <>
                <span aria-hidden="true" className="lxv-spinner" />
                Checking registry
              </>
            ) : (
              <>
                Verify model
                <span aria-hidden="true" className="lxv-submit__arrow">
                  →
                </span>
              </>
            )}
          </button>

          <p className="lxv-form__note">
            <span aria-hidden="true" className="lxv-form__dot" />
            A match confirms model registration, not the authenticity of a
            physical unit.
          </p>
        </form>

        <div
          ref={resultRef}
          tabIndex={-1}
          aria-live="polite"
          aria-atomic="true"
          aria-busy={pending}
          className="lxv-live"
        >
          {active.status === "success" && active.model ? (
            <div className="lxv-result">
              <div className="lxv-result__status">
                <span aria-hidden="true" className="lxv-result__icon">
                  <CheckIcon />
                </span>
                <div>
                  <p className="lxv-result__kicker">Registry match</p>
                  <p className="lxv-result__message">{active.message}</p>
                </div>
              </div>

              <div className="lxv-result__model">
                <div className="lxv-result__media">
                  {active.model.image ? (
                    <Image
                      src={active.model.image.url}
                      alt={active.model.image.alt}
                      fill
                      sizes="112px"
                      className="object-cover"
                    />
                  ) : (
                    <span className="lxv-result__fallback" aria-hidden="true">
                      LX
                    </span>
                  )}
                </div>

                <div className="lxv-result__id">
                  <p className="lxv-result__label">Registered model</p>
                  <Link
                    href={active.model.productPath}
                    className="lxv-result__name"
                  >
                    {active.model.productName}
                    <span aria-hidden="true">↗</span>
                  </Link>
                </div>
              </div>

              <dl className="lxv-result__meta">
                <div>
                  <dt>Category</dt>
                  <dd>{active.model.categoryName}</dd>
                </div>
                <div>
                  <dt>Registered</dt>
                  <dd>{active.model.registeredLabel}</dd>
                </div>
              </dl>

              <p className="lxv-result__caveat">
                Registration confirms the model. Condition, history and the
                seller remain separate checks.
              </p>

              <div className="lxv-result__actions">
                <Link
                  href={active.model.productPath}
                  className="lxv-result__button"
                >
                  View product
                  <span aria-hidden="true">↗</span>
                </Link>
                <button type="button" onClick={reset} className="lxv-link">
                  Check another code
                </button>
              </div>
            </div>
          ) : null}

          {active.status === "error" ||
          active.status === "throttled" ||
          active.status === "unavailable" ? (
            <div
              className={`lxv-state lxv-state--${active.status}`}
              role={active.status === "error" ? "alert" : "status"}
            >
              <span aria-hidden="true" className="lxv-state__icon">
                <AlertIcon kind={active.status} />
              </span>
              <div className="lxv-state__copy">
                <p className="lxv-state__title">
                  {STATE_TITLES[active.status]}
                </p>
                <p className="lxv-state__message">{active.message}</p>

                {active.status === "error" ? (
                  <ul className="lxv-state__checks">
                    {ERROR_CHECKS.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : null}

                <div className="lxv-state__actions">
                  {active.status === "error" ? (
                    <button type="button" onClick={reset} className="lxv-link">
                      Try another code
                    </button>
                  ) : null}
                  {active.status === "unavailable" ? (
                    <button type="button" onClick={retry} className="lxv-link">
                      Retry the check
                    </button>
                  ) : null}
                  <Link href="/contact" className="lxv-link">
                    Contact LONEX
                  </Link>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
