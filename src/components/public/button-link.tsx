import Link from "next/link";
import type { ReactNode } from "react";

type ButtonVariant = "solid" | "outline" | "dark" | "inverse" | "ghost";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  solid:
    "bg-[var(--color-accent)] text-[var(--color-accent-ink)] hover:bg-[var(--color-accent-deep)] focus-visible:outline-[var(--color-focus)]",
  outline:
    "border border-[var(--color-rule)] bg-transparent text-[var(--color-ink)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]",
  dark:
    "bg-[var(--color-ink)] text-[var(--color-paper)] hover:bg-[var(--color-accent)] hover:text-[var(--color-accent-ink)]",
  inverse:
    "border border-[var(--color-rule-2)] text-[var(--color-ink)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]",
  ghost: "text-[var(--color-ink)] hover:text-[var(--color-accent)]",
};

/**
 * Consistent LONEX call to action. Typographic: one filled primary, outlined
 * secondaries, underlined ghosts. No tracked capitals, no arrows glued to
 * text. Marketing controls 44 to 52px; one primary style per page.
 */
export function ButtonLink({
  href,
  children,
  variant = "solid",
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`group inline-flex items-center justify-center gap-3 font-semibold transition-colors duration-200 ${
        variant === "ghost" ? "text-sm" : "px-6 py-3.5 text-sm sm:px-7 sm:py-4"
      } ${VARIANT_CLASSES[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}
