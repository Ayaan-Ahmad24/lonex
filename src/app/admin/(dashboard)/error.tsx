"use client";

import { useEffect } from "react";
import Link from "next/link";
import { buttonClassName } from "@/admin/core/ui/button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log only the digest. Error messages can contain internal details.
    console.error("Admin route error", error.digest ?? "no-digest");
  }, [error]);

  return (
    <div className="mx-auto max-w-lg py-12 text-center">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-lonex-muted">
        Error
      </p>
      <h1 className="mt-2 text-lonex-ink">This page could not be loaded</h1>
      <p className="mt-2 text-sm leading-6 text-lonex-ink-soft">
        Try again. If the problem continues, check the server logs using the
        digest below.
      </p>
      {error.digest ? (
        <p className="mt-2 font-mono text-xs text-lonex-muted">
          {error.digest}
        </p>
      ) : null}
      <div className="mt-5 flex justify-center gap-2">
        <button
          type="button"
          onClick={reset}
          className={buttonClassName("primary", "sm")}
        >
          Try again
        </button>
        <Link href="/admin" className={buttonClassName("secondary", "sm")}>
          Dashboard
        </Link>
      </div>
    </div>
  );
}
