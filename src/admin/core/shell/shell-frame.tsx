"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { AdminBrand } from "../registry/types";
import type { NavigationGroup } from "../registry/navigation";
import { humanizeSegment } from "../registry/navigation";
import { AdminIcon } from "./icons";
import { SignOutButton } from "./sign-out-button";

type ShellUser = {
  name: string;
  email: string;
  roleLabel: string;
};

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function Breadcrumbs({
  pathname,
  adminPath,
  groups,
}: {
  pathname: string;
  adminPath: string;
  groups: NavigationGroup[];
}) {
  const items = groups.flatMap((group) => group.items);
  const activeModule = items.find((item) => isActive(pathname, item.href));
  const crumbs: { label: string; href?: string }[] = [
    { label: "Dashboard", href: adminPath },
  ];

  if (activeModule && activeModule.href !== adminPath) {
    crumbs.push({
      label: activeModule.label,
      href: pathname === activeModule.href ? undefined : activeModule.href,
    });

    if (pathname !== activeModule.href) {
      const rest = pathname
        .slice(activeModule.href.length)
        .replace(/^\/+/, "")
        .split("/")
        .filter(Boolean);

      let href = activeModule.href;
      for (const segment of rest) {
        href = `${href}/${segment}`;
        crumbs.push({
          label: humanizeSegment(segment),
          href: href === pathname ? undefined : href,
        });
      }
    }
  }

  return (
    <nav aria-label="Breadcrumb" className="min-w-0">
      <ol className="flex items-center gap-1.5 overflow-hidden text-[13px]">
        {crumbs.map((crumb, index) => {
          const last = index === crumbs.length - 1;
          return (
            <li key={`${crumb.label}-${index}`} className="flex min-w-0 items-center gap-1.5">
              {index > 0 ? (
                <span aria-hidden="true" className="text-lonex-line">
                  /
                </span>
              ) : null}
              {crumb.href && !last ? (
                <Link
                  href={crumb.href}
                  className="truncate rounded text-lonex-muted no-underline transition-colors hover:text-lonex-ink"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span
                  aria-current={last ? "page" : undefined}
                  className="truncate font-medium text-lonex-ink"
                >
                  {crumb.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

const NAV_LINK =
  "group relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13.5px] font-medium no-underline transition-colors";

function navLinkClass(active: boolean): string {
  return active
    ? `${NAV_LINK} bg-lonex-red-soft font-semibold text-lonex-red shadow-[inset_2px_0_0_0_var(--color-lonex-red)]`
    : `${NAV_LINK} text-lonex-ink-soft hover:bg-lonex-stone hover:text-lonex-ink`;
}

function SidebarContent({
  brand,
  groups,
  pathname,
  adminPath,
  onNavigate,
}: {
  brand: AdminBrand;
  groups: NavigationGroup[];
  pathname: string;
  adminPath: string;
  onNavigate?: () => void;
}) {
  return (
    <>
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-lonex-line px-5">
        <Link
          href={adminPath}
          onClick={onNavigate}
          className="flex min-w-0 items-center gap-3 no-underline"
          aria-label={`${brand.productName} dashboard`}
        >
          {brand.logoSrc ? (
            <img
              src={brand.logoSrc}
              alt={brand.productName}
              className="h-11 w-auto shrink-0"
            />
          ) : (
            <span
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[11px] font-bold text-white"
              style={{ backgroundColor: brand.accentColor }}
              aria-hidden="true"
            >
              {brand.logoText}
            </span>
          )}
          <span className="h-5 w-px bg-lonex-line" aria-hidden="true" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-lonex-muted">
            Admin
          </span>
        </Link>
      </div>

      <nav
        aria-label="Admin navigation"
        className="lx-scroll flex-1 overflow-y-auto px-3 py-4"
      >
        <ul className="space-y-0.5">
          <li>
            <Link
              href={adminPath}
              onClick={onNavigate}
              aria-current={pathname === adminPath ? "page" : undefined}
              className={navLinkClass(pathname === adminPath)}
            >
              <AdminIcon
                name="dashboard"
                className="h-4 w-4 shrink-0 opacity-80"
              />
              <span className="truncate">Overview</span>
            </Link>
          </li>
        </ul>

        {groups.map((group) => (
          <div key={group.id} className="mt-6 first:mt-5">
            <p className="px-3 pb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-lonex-muted">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={navLinkClass(active)}
                    >
                      <AdminIcon
                        name={item.icon}
                        className="h-4 w-4 shrink-0 opacity-80"
                      />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-lonex-line px-5 py-4">
        <p className="text-[11px] leading-4 text-lonex-muted">
          Single-tenant installation
        </p>
      </div>
    </>
  );
}

export function ShellFrame({
  brand,
  groups,
  user,
  adminPath,
  children,
}: {
  brand: AdminBrand;
  groups: NavigationGroup[];
  user: ShellUser;
  adminPath: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const displayName = user.name.trim().length > 0 ? user.name : user.email;
  const initial = displayName.charAt(0).toUpperCase();

  useEffect(() => {
    if (!mobileOpen) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileOpen]);

  return (
    <div className="min-h-screen bg-lonex-stone text-lonex-ink">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[260px] flex-col border-r border-lonex-line bg-lonex-paper lg:flex">
        <SidebarContent
          brand={brand}
          groups={groups}
          pathname={pathname}
          adminPath={adminPath}
        />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            aria-hidden="true"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-lonex-ink/45 backdrop-blur-[1px]"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            className="relative flex h-full w-[280px] max-w-[86%] flex-col border-r border-lonex-line bg-lonex-paper shadow-2xl"
          >
            <button
              type="button"
              aria-label="Close navigation"
              onClick={() => setMobileOpen(false)}
              className="absolute right-2.5 top-3 z-10 rounded-lg p-2 text-lonex-muted transition-colors hover:bg-lonex-line-soft hover:text-lonex-ink"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              >
                <path d="M19 6 5 19M5 6l14 13" />
              </svg>
            </button>
            <SidebarContent
              brand={brand}
              groups={groups}
              pathname={pathname}
              adminPath={adminPath}
              onNavigate={() => setMobileOpen(false)}
            />
          </div>
        </div>
      ) : null}

      <div className="lg:pl-[260px]">
        <header className="sticky top-0 z-20 border-b border-lonex-line bg-lonex-paper/95 backdrop-blur supports-[backdrop-filter]:bg-lonex-paper/80">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              aria-label="Open navigation"
              onClick={() => setMobileOpen(true)}
              className="-ml-1 rounded-lg p-2 text-lonex-ink-soft transition-colors hover:bg-lonex-stone hover:text-lonex-ink lg:hidden"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="min-w-0 flex-1">
              <Breadcrumbs
                pathname={pathname}
                adminPath={adminPath}
                groups={groups}
              />
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
              <details className="group relative">
                <summary className="flex cursor-pointer list-none items-center gap-2 rounded-lg py-1 pl-1 pr-1.5 transition-colors hover:bg-lonex-stone [&::-webkit-details-marker]:hidden">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-lonex-red-soft text-[12px] font-semibold text-lonex-red">
                    {initial}
                  </span>
                  <span className="hidden text-left md:block">
                    <span className="block max-w-[150px] truncate text-[13px] font-medium leading-4 text-lonex-ink">
                      {displayName}
                    </span>
                    <span className="block text-[11px] leading-4 text-lonex-muted">
                      {user.roleLabel}
                    </span>
                  </span>
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="hidden h-4 w-4 text-lonex-muted md:block"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </summary>
                <div className="absolute right-0 z-30 mt-2 w-64 overflow-hidden rounded-xl border border-lonex-line bg-lonex-paper shadow-lg">
                  <div className="border-b border-lonex-line px-4 py-3">
                    <p className="truncate text-sm font-medium text-lonex-ink">
                      {displayName}
                    </p>
                    {displayName !== user.email ? (
                      <p className="truncate text-xs text-lonex-muted">
                        {user.email}
                      </p>
                    ) : null}
                    <p className="mt-1.5 inline-flex rounded-full bg-lonex-line-soft px-2 py-0.5 text-[11px] font-medium text-lonex-ink-soft">
                      {user.roleLabel}
                    </p>
                  </div>
                  <div className="p-1.5">
                    <SignOutButton compact />
                  </div>
                </div>
              </details>

              <span className="mx-1 hidden h-6 w-px bg-lonex-line sm:block" aria-hidden="true" />

              <div className="hidden sm:block">
                <SignOutButton />
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1320px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="mb-5 flex items-center justify-between border-b border-lonex-line pb-4 sm:hidden">
            <div className="flex items-center gap-2.5">
              {brand.logoSrc ? (
                <img
                  src={brand.logoSrc}
                  alt={brand.productName}
                  className="h-9 w-auto"
                />
              ) : (
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-[11px] font-bold text-white"
                  style={{ backgroundColor: brand.accentColor }}
                  aria-hidden="true"
                >
                  {brand.logoText}
                </span>
              )}
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-lonex-muted">
                Admin
              </span>
            </div>
            <SignOutButton />
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
