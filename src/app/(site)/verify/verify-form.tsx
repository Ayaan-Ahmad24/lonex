"use client";

import { useActionState } from "react";
import Link from "next/link";
import { verifyCodeAction } from "./actions";
import { initialVerifyState, type VerifyState } from "./state";

export function VerifyForm() {
  const [state, formAction, pending] = useActionState<VerifyState, FormData>(
    verifyCodeAction,
    initialVerifyState,
  );

  return (
    <div className="space-y-6">
      <form action={formAction} className="space-y-5">
        <div>
          <label htmlFor="code" className="type-eyebrow block text-black/60">
            Verification code
          </label>
          <p className="mt-2 text-sm leading-6 text-black/55">
            Find the code on the product label or accompanying documentation.
          </p>
          <input
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
            className="mt-4 h-14 w-full border border-black/15 bg-white px-4 font-mono text-base uppercase tracking-[0.18em] text-black outline-none transition-colors focus:border-[#CF0A0A]"
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="btn-sheen inline-flex h-14 w-full items-center justify-center gap-3 bg-[#CF0A0A] px-7 text-[13px] font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {pending ? (
            <>
              <span
                aria-hidden="true"
                className="spinner size-4 rounded-full border-2 border-white/30 border-t-white"
              />
              Checking
            </>
          ) : (
            <>
              Verify code
              <span aria-hidden="true">→</span>
            </>
          )}
        </button>
      </form>

      <div aria-live="polite">
        {state.status === "success" && state.model ? (
          <div className="overflow-hidden border border-black/10 bg-black text-white">
            <div className="flex items-start gap-3 border-b border-white/10 px-5 py-4">
              <span
                aria-hidden="true"
                className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-[#CF0A0A] text-sm font-semibold text-white"
              >
                ✓
              </span>
              <p className="text-sm font-semibold leading-6">
                {state.message}
              </p>
            </div>
            <dl className="grid gap-4 p-5 text-sm sm:grid-cols-3">
              <div>
                <dt className="type-eyebrow text-white/55">Model</dt>
                <dd className="mt-2">
                  <Link
                    href={state.model.productPath}
                    className="font-semibold text-white underline decoration-[#CF0A0A] decoration-2 underline-offset-4"
                  >
                    {state.model.productName}
                  </Link>
                </dd>
              </div>
              <div>
                <dt className="type-eyebrow text-white/55">Category</dt>
                <dd className="mt-2 text-white/75">
                  {state.model.categoryName}
                </dd>
              </div>
              <div>
                <dt className="type-eyebrow text-white/55">Registered</dt>
                <dd className="mt-2 text-white/75">
                  {state.model.registeredLabel}
                </dd>
              </div>
            </dl>
          </div>
        ) : null}

        {state.status === "error" || state.status === "throttled" ? (
          <div
            role="alert"
            className="border border-[#CF0A0A]/30 bg-[#F5EDED] p-4 text-sm leading-6 text-[#9e0707]"
          >
            {state.message}
          </div>
        ) : null}
      </div>

      <p className="border-l-2 border-[#CF0A0A] bg-[#F5EDED] p-4 text-sm leading-6 text-black/60">
        A successful check confirms that this model is registered with LONEX. It
        does not by itself prove that a physical unit is genuine. Verification
        codes are single-model identifiers and are never displayed publicly.
      </p>
    </div>
  );
}
