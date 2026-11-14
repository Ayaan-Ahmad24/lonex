export const instant = false;

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { siteConfig } from "@/admin/config/site";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign in",
};

const SENSITIVE_PARAMS = [
  "password",
  "pass",
  "pwd",
  "email",
  "token",
  "credentials",
  "secret",
  "otp",
];

/**
 * Any credential that ends up in the query string is dropped before the page
 * renders: the browser is redirected to the clean login URL, and the values are
 * never read, logged or persisted.
 */
function hasSensitiveParams(
  params: Record<string, string | string[] | undefined>,
): boolean {
  return Object.keys(params).some((key) =>
    SENSITIVE_PARAMS.some((sensitive) => key.toLowerCase().includes(sensitive)),
  );
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  if (hasSensitiveParams(params)) {
    redirect("/admin/login");
  }

  const brand = siteConfig.admin;

  return (
    <main className="lx-auth grid min-h-screen grid-cols-1 bg-lonex-paper lg:grid-cols-[1.05fr_1fr]">
      {/* Brand side */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-lonex-ink p-10 lg:flex xl:p-14">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 top-1/3 h-72 w-72 rounded-full bg-lonex-red/25 blur-[110px]"
        />

        <div className="relative flex items-center gap-3">
          <span className="flex h-14 items-center rounded-xl bg-white px-4">
            <img
              src={brand.logoSrc}
              alt="LONEX"
              className="h-11 w-auto"
            />
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">
            Administration
          </span>
        </div>

        <div className="relative max-w-md">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-lonex-red">
            LONEX Operations
          </p>
          <p className="mt-4 text-[28px] font-semibold leading-[1.2] tracking-[-0.02em] text-white">
            One console for the catalogue, content and trust behind LONEX.
          </p>
          <p className="mt-4 text-sm leading-6 text-white/60">
            Publish products, verify sellers and keep the public site accurate.
            Every action is recorded in the audit log.
          </p>

          <ul className="mt-8 space-y-3">
            {[
              "Role-based access to every module",
              "Audited changes, never silent edits",
              "Draft previews before anything goes live",
            ].map((item) => (
              <li
                key={item}
                className="flex items-center gap-2.5 text-[13px] text-white/75"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-4 w-4 shrink-0 text-lonex-red"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m20 6-11 11-5-5" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-white/45">
          © LONEX. Internal systems — authorised personnel only.
        </p>
      </aside>

      {/* Form side */}
      <section className="flex items-center justify-center px-5 py-10 sm:px-8 lg:py-12">
        <div className="w-full max-w-[400px]">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <img
              src={brand.logoSrc}
              alt="LONEX"
              className="h-11 w-auto"
            />
            <span className="h-5 w-px bg-lonex-line" aria-hidden="true" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-lonex-muted">
              Admin
            </span>
          </div>

          <h1 className="text-lonex-ink">Sign in</h1>
          <p className="mt-2 text-sm leading-6 text-lonex-ink-soft">
            Use your LONEX staff account to open the administration workspace.
          </p>

          <div className="mt-8">
            <LoginForm />
          </div>

          <div className="mt-8 border-t border-lonex-line pt-5">
            <p className="text-xs leading-5 text-lonex-muted">
              Trouble signing in? Contact your LONEX system administrator. They
              can restore access without exposing credentials.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
