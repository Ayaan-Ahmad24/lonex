import { Suspense } from "react";
import type { ReactNode } from "react";
import { requireAdmin } from "@/admin/core/guards";
import { buildNavigation } from "@/admin/core/registry/navigation";
import { ShellFrame } from "@/admin/core/shell/shell-frame";
import { ShellSkeleton } from "@/admin/core/shell/shell-skeleton";
import { FlashToast } from "@/admin/core/ui/flash-toast";
import { adminConfig, adminRegistry } from "@/admin/config/registry";
import { permissionGranted } from "@/admin/core/registry/navigation";
import { VerificationCodeProvider } from "@/admin/modules/verification/verification-code-context";

/**
 * Admin navigation is auth-gated by design: every page must verify the session
 * and current permissions before it can render. That read is intentionally
 * uncached (decision D-A4), so a navigation into the dashboard can never be
 * instant. `instant = false` is the documented opt-out for this segment; it
 * only disables the dev-time instant-navigation validation, not Cache
 * Components, Suspense streaming or any security check.
 */
export const instant = false;

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Suspense fallback={<ShellSkeleton />}>
      <DashboardChrome>{children}</DashboardChrome>
    </Suspense>
  );
}

async function DashboardChrome({ children }: { children: ReactNode }) {
  const { user, permissions } = await requireAdmin();
  const groups = buildNavigation(adminRegistry, permissions);
  const roleLabel =
    permissionGranted(permissions, "roles.manage") ||
    permissionGranted(permissions, "users.manage")
      ? "Administrator"
      : "Editor";

  return (
    <ShellFrame
      brand={adminConfig.brand}
      groups={groups}
      user={{ name: user.name, email: user.email, roleLabel }}
      adminPath={adminConfig.adminPath}
    >
      <VerificationCodeProvider>{children}</VerificationCodeProvider>
      <Suspense fallback={null}>
        <FlashToast />
      </Suspense>
    </ShellFrame>
  );
}
