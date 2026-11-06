import type { MetadataRoute } from "next";
import { connection } from "next/server";

import { loadPublicSettings } from "@/lib/public/settings";

export default async function robots(): Promise<MetadataRoute.Robots> {
  await connection();
  const settings = await loadPublicSettings();
  const base = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

  if (settings.noIndex) {
    return {
      rules: { userAgent: "*", disallow: "/" },
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
