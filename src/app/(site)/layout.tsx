import type { ReactNode } from "react";
import { connection } from "next/server";
import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";
import { listPublishedCategories } from "@/lib/public/queries";
import { loadPublicSettings } from "@/lib/public/settings";

/**
 * Public LONEX shell.
 *
 * The site is database-driven: navigation and contact details follow the CMS,
 * so the shell is rendered per request. All reads are published-only.
 */
export default async function SiteLayout({ children }: { children: ReactNode }) {
  await connection();

  const [settings, categories] = await Promise.all([
    loadPublicSettings(),
    listPublishedCategories(),
  ]);

  return (
    <div className="flex min-h-screen flex-col bg-white text-black">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-[#CF0A0A] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
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
