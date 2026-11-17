import type { ReactNode } from "react";

/** Consistent public page width. Gutters grow at wide sizes; the measure does not. */
export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`site-container ${className}`}>{children}</div>
  );
}
