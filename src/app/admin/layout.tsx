import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@/app/admin.css";

export const metadata: Metadata = {
  title: {
    default: "LONEX Admin",
    template: "%s · LONEX Admin",
  },
  robots: { index: false, follow: false },
};

/**
 * Admin-only shell wrapper. The design-system stylesheet is imported here so
 * it is code-split to /admin routes and can never affect the public website.
 */
export default function AdminRootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <div className="lx-admin">{children}</div>;
}
