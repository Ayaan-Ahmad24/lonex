import type { ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

const BASE =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[10px] font-medium no-underline transition-colors focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 [&>svg]:h-4 [&>svg]:w-4 [&>svg]:shrink-0";

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-lonex-red text-white shadow-sm hover:bg-[#B30909] active:bg-[#9B0808]",
  secondary:
    "border border-lonex-line bg-lonex-paper text-lonex-ink shadow-xs hover:bg-lonex-stone",
  danger:
    "border border-lonex-red/25 bg-lonex-paper text-lonex-red hover:border-lonex-red/40 hover:bg-lonex-red-soft",
  outline:
    "border border-lonex-line bg-transparent text-lonex-ink-soft hover:bg-lonex-stone hover:text-lonex-ink",
  ghost:
    "bg-transparent text-lonex-ink-soft hover:bg-lonex-line-soft hover:text-lonex-ink",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-[13px]",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-sm",
};

export function buttonClassName(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  extra?: string,
): string {
  return [BASE, VARIANTS[variant], SIZES[size], extra]
    .filter(Boolean)
    .join(" ");
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  type = "button",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}) {
  return (
    <button
      type={type}
      className={buttonClassName(variant, size, className)}
      {...props}
    >
      {children}
    </button>
  );
}

export function IconButton({
  children,
  variant = "ghost",
  size = "sm",
  className,
  type = "button",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}) {
  return (
    <button
      type={type}
      className={buttonClassName(
        variant,
        size,
        ["!px-0 w-9", className].filter(Boolean).join(" "),
      )}
      {...props}
      aria-label={typeof children === "string" ? children : undefined}
    >
      {children}
    </button>
  );
}
