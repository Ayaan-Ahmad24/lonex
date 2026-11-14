import Link from "next/link";
import { buttonClassName } from "@/admin/core/ui/button";

export default function AdminNotFound() {
  return (
    <div className="mx-auto max-w-lg py-12 text-center">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-lonex-muted">
        Error 404
      </p>
      <h1 className="mt-2 text-lonex-ink">Module or page not found</h1>
      <p className="mt-2 text-sm leading-6 text-lonex-ink-soft">
        This module may be disabled for this installation, or the record no
        longer exists.
      </p>
      <Link
        href="/admin"
        className={buttonClassName("primary", "sm", "mt-5")}
      >
        Back to dashboard
      </Link>
    </div>
  );
}
