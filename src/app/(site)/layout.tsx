import type { ReactNode } from "react";
import { connection } from "next/server";
import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";
import { listPublishedCategories } from "@/lib/public/queries";
import { loadPublicSettings } from "@/lib/public/settings";
import "../site.css";

/**
 * Public LONEX shell.
 *
 * The site is database-driven: navigation and contact details follow the CMS,
 * so the shell is rendered per request. All reads are published-only.
 */
export const instant = false;

export default async function SiteLayout({ children }: { children: ReactNode }) {
  await connection();

  const [settings, categories] = await Promise.all([
    loadPublicSettings(),
    listPublishedCategories(),
  ]);

  return (
    <div className="site-shell flex min-h-screen flex-col">
      <a href="#main-content" className="site-skip">
        Skip to content
      </a>
      <SiteHeader settings={settings} categories={categories} />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <SiteFooter settings={settings} categories={categories} />
    </div>
  );
}
