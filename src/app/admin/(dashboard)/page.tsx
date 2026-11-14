export const instant = false;

import { Suspense } from "react";
import Link from "next/link";
import { requireAdminContext } from "@/admin/config/access";
import {
  buildNavigation,
  permissionGranted,
} from "@/admin/core/registry/navigation";
import { adminRegistry } from "@/admin/config/registry";
import { Card, CardHeader } from "@/admin/core/ui/card";
import { PageHeader } from "@/admin/core/ui/page-header";
import { StatusBadge } from "@/admin/core/ui/badge";
import { LoadingState } from "@/admin/core/ui/states";
import { StatCard } from "@/admin/core/ui/stat-card";
import { AdminIcon } from "@/admin/core/shell/icons";
import { buttonClassName } from "@/admin/core/ui/button";
import { formatDate } from "@/admin/core/ui/format";
import {
  getDashboardCounts,
  getRecentAudit,
  getRecentProducts,
} from "@/admin/modules/dashboard/queries";

export default function AdminHomePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="LONEX dashboard"
        description="Catalogue, seller directory, model verification and published content — with permissions enforced on the server."
      />
      <Suspense fallback={<LoadingState rows={6} />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}

function RowLink({
  href,
  children,
}: {
  href?: string;
  children: React.ReactNode;
}) {
  if (!href) {
    return <div className="flex gap-3 px-5 py-3 sm:px-6">{children}</div>;
  }

  return (
    <Link
      href={href}
      className="flex gap-3 px-5 py-3 no-underline transition-colors hover:bg-lonex-stone sm:px-6"
    >
      {children}
    </Link>
  );
}

async function DashboardContent() {
  const { user, permissions } = await requireAdminContext();
  const displayName =
    user.name.trim().length > 0 ? user.name : user.email;
  const nav = buildNavigation(adminRegistry, permissions);
  const counts = await getDashboardCounts();

  const canContent = permissionGranted(permissions, "content.edit");
  const canAudit = permissionGranted(permissions, "audit.view");

  const recentProducts = canContent ? await getRecentProducts() : [];
  const recentAudit = canAudit ? await getRecentAudit() : [];

  const stats = [
    {
      label: "Products",
      value: counts.products,
      detail: `${counts.publishedProducts} published`,
      href: "/admin/products",
      icon: "products" as const,
    },
    {
      label: "Categories",
      value: counts.categories,
      detail: `${counts.publishedCategories} published`,
      href: "/admin/categories",
      icon: "categories" as const,
    },
    {
      label: "Authorised sellers",
      value: counts.activeSellers,
      detail: "Active listings",
      href: "/admin/sellers",
      icon: "sellers" as const,
    },
    {
      label: "Blog posts",
      value: counts.posts,
      detail: `${counts.publishedPosts} published`,
      href: "/admin/blog",
      icon: "blog" as const,
    },
    {
      label: "Active model codes",
      value: counts.activeCodes,
      detail: "One per verified model",
      href: "/admin/verification",
      icon: "verification" as const,
    },
    {
      label: "Media assets",
      value: counts.media,
      detail: "Private storage",
      href: "/admin/media",
      icon: "media" as const,
    },
    {
      label: "Admin users",
      value: counts.users,
      detail: "Provisioned via CLI",
      href: "/admin/users",
      icon: "users" as const,
    },
    {
      label: "Audit events",
      value: counts.auditEvents,
      detail: "Read-only history",
      href: "/admin/audit",
      icon: "audit" as const,
    },
  ];

  return (
    <div className="space-y-6">
      <section aria-labelledby="dashboard-metrics">
        <h2 id="dashboard-metrics" className="sr-only">
          Key metrics
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          {stats.map((stat) => (
            <StatCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              detail={stat.detail}
              href={stat.href}
              icon={<AdminIcon name={stat.icon} />}
            />
          ))}
        </div>
      </section>

      <div className="grid items-start gap-6 xl:grid-cols-3">
        {canContent ? (
          <Card className="xl:col-span-2">
            <CardHeader
              title="Recently updated products"
              description="The last catalogue changes made by the team."
              action={
                <Link
                  href="/admin/products"
                  className="text-[13px] font-medium text-lonex-ink-soft no-underline transition-colors hover:text-lonex-red"
                >
                  View all
                </Link>
              }
            />
            {recentProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
                <p className="text-sm font-semibold text-lonex-ink">
                  No products yet
                </p>
                <p className="mt-1 max-w-xs text-sm text-lonex-muted">
                  Create a category first, then add your first product to the
                  catalogue.
                </p>
                <Link
                  href="/admin/products/new"
                  className={buttonClassName("primary", "sm", "mt-4")}
                >
                  Add a product
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-lonex-line">
                {recentProducts.map((product) => (
                  <li key={product.id}>
                    <RowLink href={`/admin/products/${product.id}`}>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="truncate text-sm font-medium text-lonex-ink">
                            {product.name}
                          </span>
                          <StatusBadge status={product.status} />
                        </div>
                        <p className="mt-0.5 truncate font-mono text-[11px] text-lonex-muted">
                          /{product.categorySlug}/{product.slug}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs text-lonex-muted">
                        {formatDate(product.updatedAt)}
                      </span>
                    </RowLink>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        ) : null}

        {canAudit ? (
          <Card className="xl:col-span-1">
            <CardHeader title="Latest audit activity" description="Security and content events." />
            {recentAudit.length === 0 ? (
              <div className="px-6 py-14 text-center">
                <p className="text-sm font-semibold text-lonex-ink">
                  No audit events yet
                </p>
                <p className="mt-1 text-sm text-lonex-muted">
                  Changes will appear here as the team works.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-lonex-line">
                {recentAudit.map((event) => (
                  <li key={event.id}>
                    <RowLink href="/admin/audit">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-medium text-lonex-ink">
                          {event.action}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-lonex-muted">
                          {event.targetType}
                          {event.targetId ? ` #${event.targetId}` : ""}
                        </p>
                      </div>
                      <span className="shrink-0 text-[11px] text-lonex-muted">
                        {formatDate(event.createdAt)}
                      </span>
                    </RowLink>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        ) : null}
      </div>

      {nav.length > 0 ? (
        <Card>
          <CardHeader
            title="Quick actions"
            description="Only enabled modules you are authorised to use appear here."
          />
          <div className="grid gap-2 px-5 py-5 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 xl:grid-cols-4">
            {nav.flatMap((group) =>
              group.items.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={buttonClassName(
                    "secondary",
                    "sm",
                    "justify-start font-normal",
                  )}
                >
                  <AdminIcon name={item.icon} className="h-4 w-4 text-lonex-muted" />
                  {item.label}
                </Link>
              )),
            )}
          </div>
        </Card>
      ) : null}

      <p className="text-xs text-lonex-muted">
        Signed in as {displayName}
        {displayName !== user.email ? ` · ${user.email}` : ""}
      </p>
    </div>
  );
}
