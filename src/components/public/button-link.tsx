import Link from "next/link";
import type { ReactNode } from "react";

type ButtonVariant =
  | "solid"
  | "outline"
  | "dark"
  | "inverse"
  | "ghost"
  | "light"
  | "solid-light";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  solid: "site-btn site-btn--solid",
  outline: "site-btn site-btn--outline",
  dark: "site-btn site-btn--dark",
  inverse: "site-btn site-btn--light",
  ghost: "site-link",
  light: "site-btn site-btn--light",
  "solid-light": "site-btn site-btn--solid-light",
};

/**
 * The public call to action. One filled red primary per page; outlined
 * secondaries; a plain underlined link for tertiary actions. Square, 48px,
 * sentence case, no arrow glued to the label.
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
    <Link href={href} className={`${VARIANT_CLASSES[variant]} ${className}`}>
      {children}
    </Link>
  );
}
