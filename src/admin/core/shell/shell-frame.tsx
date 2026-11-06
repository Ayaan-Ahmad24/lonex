"use client";

import { useState } from "react";
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

  if (activeModule) {
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
      <ol className="flex flex-wrap items-center gap-1 text-xs text-slate-500">
        {crumbs.map((crumb, index) => (
          <li key={`${crumb.label}-${index}`} className="flex items-center gap-1">
            {index > 0 ? <span aria-hidden="true">/</span> : null}
            {crumb.href ? (
              <Link
                href={crumb.href}
                className="truncate hover:text-slate-900 hover:underline"
              >
                {crumb.label}
              </Link>
            ) : (
              <span className="truncate font-medium text-slate-700">
                {crumb.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
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

  const nav = (
    <>
      <div className="flex items-center gap-3 px-4 py-5">
        <span
          className="flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold text-white"
          style={{ backgroundColor: brand.accentColor }}
          aria-hidden="true"
        >
          {brand.logoText}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">
            {brand.productName}
          </p>
          <p className="text-[11px] text-slate-500">Administration</p>
        </div>
      </div>

      <nav aria-label="Admin navigation" className="flex-1 space-y-5 px-2 pb-4">
        <div>
          <Link
            href={adminPath}
            onClick={() => setMobileOpen(false)}
            aria-current={pathname === adminPath ? "page" : undefined}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            style={
              pathname === adminPath
                ? {
                    backgroundColor: brand.accentSoftColor,
                    color: brand.accentColor,
                  }
                : undefined
            }
          >
            <AdminIcon name="dashboard" />
            Dashboard
          </Link>
        </div>

        {groups.map((group) => (
          <div key={group.id}>
            <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(pathname, item.href);

                return (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      style={
                        active
                          ? {
                              backgroundColor: brand.accentSoftColor,
                              color: brand.accentColor,
                            }
                          : undefined
                      }
                    >
                      <AdminIcon name={item.icon} />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-slate-200 p-3">
        <p className="px-2 text-[11px] text-slate-400">
          Single-tenant installation
        </p>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-200 bg-white lg:flex lg:flex-col">
        {nav}
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-slate-900/40"
          />
          <aside className="relative flex h-full w-72 max-w-[85%] flex-col border-r border-slate-200 bg-white shadow-xl">
            {nav}
          </aside>
        </div>
      ) : null}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex h-14 items-center gap-3 px-4 sm:px-6">
            <button
              type="button"
              aria-label="Open navigation"
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
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

            <div className="hidden items-center gap-2 sm:flex">
              <details className="relative">
                <summary className="flex cursor-pointer list-none items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-100">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="hidden text-left md:block">
                    <span className="block max-w-36 truncate text-xs font-medium text-slate-800">
                      {user.name}
                    </span>
                    <span className="block text-[10px] text-slate-500">
                      {user.roleLabel}
                    </span>
                  </span>
                </summary>
                <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {user.name}
                  </p>
                  <p className="truncate text-xs text-slate-500">{user.email}</p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    {user.roleLabel}
                  </p>
                  <div className="mt-3 border-t border-slate-100 pt-2">
                    <SignOutButton compact />
                  </div>
                </div>
              </details>

              <SignOutButton />
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mb-6 flex items-center justify-between sm:hidden">
            <p className="text-sm font-semibold text-slate-900">
              {brand.productName}
            </p>
            <SignOutButton />
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
