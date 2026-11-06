import type { MetadataRoute } from "next";
import { connection } from "next/server";

import { listSitemapEntries } from "@/lib/public/queries";
import { loadPublicSettings } from "@/lib/public/settings";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connection();
  const settings = await loadPublicSettings();

  if (settings.noIndex) {
    return [];
  }

  const entries = await listSitemapEntries();
  const base = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

  return entries.map((entry) => ({
    url: `${base}${entry.path}`,
    lastModified: entry.lastModified,
  }));
}
