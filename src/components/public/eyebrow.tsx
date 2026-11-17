import type { ReactNode } from "react";

/**
 * Editorial eyebrow: a red rule and a small tracked label. Used to introduce
 * sections without repeating the same markup on every page.
 */
export function Eyebrow({
  children,
  tone = "dark",
  className = "",
}: {
  children: ReactNode;
  tone?: "dark" | "light";
  className?: string;
}) {
  return (
    <p
      className={`type-eyebrow flex items-center gap-3 ${
        tone === "light" ? "text-white/55" : "text-black/55"
      } ${className}`}
    >
      <span
        aria-hidden="true"
        className="h-px w-8 shrink-0 bg-[var(--site-red,var(--lonex-red))]"
      />
      {children}
    </p>
  );
}
