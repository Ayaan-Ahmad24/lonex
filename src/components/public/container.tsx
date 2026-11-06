import type { ReactNode } from "react";

/** Consistent LONEX page width: 1280–1360px content with responsive gutters. */
export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-[1360px] px-5 sm:px-8 ${className}`}>
      {children}
    </div>
  );
}
