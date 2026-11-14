import type { ReactNode } from "react";
import Link from "next/link";

export function StatCard({
  label,
  value,
  detail,
  href,
  icon,
}: {
  label: string;
  value: string | number;
  detail?: string;
  href: string;
  icon?: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group relative flex min-w-0 flex-col justify-between gap-4 rounded-xl border border-lonex-line bg-lonex-paper p-4 no-underline shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-all hover:-translate-y-0.5 hover:border-lonex-red/30 hover:shadow-[0_8px_24px_-12px_rgba(16,24,40,0.18)] sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[12.5px] font-medium leading-5 text-lonex-ink-soft">
          {label}
        </p>
        {icon ? (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-lonex-line-soft text-lonex-muted transition-colors group-hover:bg-lonex-red-soft group-hover:text-lonex-red [&>svg]:h-4 [&>svg]:w-4">
            {icon}
          </span>
        ) : null}
      </div>
      <div>
        <p className="lx-num text-[28px] font-semibold leading-none tracking-[-0.02em] text-lonex-ink">
          {value}
        </p>
        {detail ? (
          <p className="mt-1.5 text-xs text-lonex-muted">{detail}</p>
        ) : null}
      </div>
    </Link>
  );
}
