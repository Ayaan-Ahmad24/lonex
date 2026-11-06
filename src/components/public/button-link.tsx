import Link from "next/link";
import type { ReactNode } from "react";

type ButtonVariant = "solid" | "outline" | "dark" | "inverse" | "ghost";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  solid:
    "btn-sheen bg-[#CF0A0A] text-white hover:bg-black focus-visible:outline-[#CF0A0A]",
  outline:
    "border border-black/20 bg-transparent text-black hover:border-black hover:bg-black hover:text-white",
  dark: "btn-sheen bg-black text-white hover:bg-[#CF0A0A]",
  inverse:
    "border border-white/30 text-white hover:border-white hover:bg-white hover:text-black",
  ghost: "text-black hover:text-[#CF0A0A]",
};

/**
 * Consistent LONEX call to action. `ghost` is used inside text blocks; the
 * other variants carry the sheen and arrow treatment.
 */
export function ButtonLink({
  href,
  children,
  variant = "solid",
  className = "",
  arrow = true,
}: {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
  arrow?: boolean;
}) {
  const isGhost = variant === "ghost";

  return (
    <Link
      href={href}
      className={`group inline-flex items-center justify-center gap-3 font-semibold transition-colors duration-300 ${
        isGhost
          ? "type-eyebrow uppercase"
          : "px-6 py-3.5 text-[13px] uppercase tracking-[0.14em] sm:px-7 sm:py-4"
      } ${VARIANT_CLASSES[variant]} ${className}`}
    >
      <span>{children}</span>
      {arrow ? (
        <span aria-hidden="true" className="arrow-slide text-base leading-none">
          →
        </span>
      ) : null}
    </Link>
  );
}
