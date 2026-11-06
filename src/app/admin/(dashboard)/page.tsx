import { Suspense } from "react";
import Link from "next/link";
import { requireAdminContext } from "@/admin/config/access";
import { buildNavigation, permissionGranted } from "@/admin/core/registry/navigation";
import { adminRegistry } from "@/admin/config/registry";
import { Card, CardBody, CardHeader } from "@/admin/core/ui/card";
import { PageHeader } from "@/admin/core/ui/page-header";
import { StatusBadge } from "@/admin/core/ui/badge";
import { LoadingState } from "@/admin/core/ui/states";
import { formatDateTime } from "@/admin/core/ui/format";
import { buttonClassName } from "@/admin/core/ui/button";
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
        description="Catalogue, seller directory, model verification and published content. Permissions are enforced on the server."
      />
      <Suspense fallback={<LoadingState rows={6} />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}

async function DashboardContent() {
  const { user, permissions } = await requireAdminContext();
  const nav = buildNavigation(adminRegistry, permissions);
  const counts = await getDashboardCounts();

  const canContent = permissionGranted(permissions, "content.edit");
  const canVerification = permissionGranted(permissions, "model_codes.manage");
  const canUsers = permissionGranted(permissions, "users.manage");
  const canMedia = permissionGranted(permissions, "media.manage");
  const canAudit = permissionGranted(permissions, "audit.view");

  const recentProducts = canContent ? await getRecentProducts() : [];
  const recentAudit = canAudit ? await getRecentAudit() : [];

  const stats = [
    canContent
      ? {
          label: "Categories",
          value: counts.categories,
          detail: `${counts.publishedCategories} published`,
          href: "/admin/categories",
        }
      : null,
    canContent
      ? {
          label: "Products",
          value: counts.products,
          detail: `${counts.publishedProducts} published`,
          href: "/admin/products",
        }
      : null,
    canContent
      ? {
          label: "Authorized sellers",
          value: counts.activeSellers,
          detail: "Active listings",
          href: "/admin/sellers",
        }
      : null,
    canContent
      ? {
          label: "Blog posts",
          value: counts.posts,
          detail: `${counts.publishedPosts} published`,
          href: "/admin/blog",
        }
      : null,
    canVerification
      ? {
          label: "Active model codes",
          value: counts.activeCodes,
          detail: "One per model",
          href: "/admin/verification",
        }
      : null,
    canMedia
      ? {
          label: "Media assets",
          value: counts.media,
          detail: "Private storage",
          href: "/admin/media",
        }
      : null,
    canUsers
      ? {
          label: "Admin users",
          value: counts.users,
          detail: "CLI provisioned",
          href: "/admin/users",
        }
      : null,
    canAudit
      ? {
          label: "Audit events",
          value: counts.auditEvents,
          detail: "Read-only",
          href: "/admin/audit",
        }
      : null,
  ].filter((item): item is NonNullable<typeof item> => item !== null);

  return (
    <div className="space-y-6">
      <Card>
        <CardBody className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-slate-900">
              Signed in as {user.name}
            </p>
            <p className="text-xs text-slate-500">{user.email}</p>
          </div>
          <p className="text-xs text-slate-500">
            Hidden prices and drafts are filtered in the public read model, not
            in CSS.
          </p>
        </CardBody>
      </Card>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {stat.label}
            </p>
            <p className="mt-2 text-3xl font-semibold tabular-nums text-slate-900">
              {stat.value}
            </p>
            <p className="mt-1 text-xs text-slate-500">{stat.detail}</p>
          </Link>
        ))}
      </section>

      {nav.length > 0 ? (
        <Card>
          <CardHeader
            title="Quick actions"
            description="Only enabled modules you are authorized to use appear here."
          />
          <CardBody className="flex flex-wrap gap-2">
            {nav.flatMap((group) =>
              group.items.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={buttonClassName("secondary", "sm")}
                >
                  Open {item.label}
                </Link>
              )),
            )}
          </CardBody>
        </Card>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-2">
        {canContent ? (
          <Card>
            <CardHeader
              title="Recently updated products"
              action={
                <Link
                  href="/admin/products"
                  className="text-xs font-medium text-slate-600 hover:text-slate-900 hover:underline"
                >
                  View all
                </Link>
              }
            />
            {recentProducts.length === 0 ? (
              <CardBody>
                <p className="text-sm text-slate-500">
                  No products yet. Create a category, then add a product.
                </p>
              </CardBody>
            ) : (
              <ul className="divide-y divide-slate-100">
                {recentProducts.map((product) => (
                  <li
                    key={product.id}
                    className="flex items-center justify-between gap-3 px-5 py-3"
                  >
                    <div className="min-w-0">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="block truncate text-sm font-medium text-slate-800 hover:underline"
                      >
                        {product.name}
                      </Link>
                      <p className="truncate text-xs text-slate-500">
                        /{product.categorySlug}/{product.slug}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <StatusBadge status={product.status} />
                      <span className="hidden text-[11px] text-slate-400 sm:inline">
                        {formatDateTime(product.updatedAt)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        ) : null}

        {canAudit ? (
          <Card>
            <CardHeader
              title="Latest audit events"
              action={
                <Link
                  href="/admin/audit"
                  className="text-xs font-medium text-slate-600 hover:text-slate-900 hover:underline"
                >
                  View all
                </Link>
              }
            />
            {recentAudit.length === 0 ? (
              <CardBody>
                <p className="text-sm text-slate-500">No audit events yet.</p>
              </CardBody>
            ) : (
              <ul className="divide-y divide-slate-100">
                {recentAudit.map((event) => (
                  <li
                    key={event.id}
                    className="flex items-center justify-between gap-3 px-5 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-800">
                        {event.action}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {event.targetType}
                        {event.targetId ? ` #${event.targetId}` : ""}
                      </p>
                    </div>
                    <span className="shrink-0 text-[11px] text-slate-400">
                      {formatDateTime(event.createdAt)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        ) : null}
      </div>
    </div>
  );
}
