import "server-only";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { mediaAssets } from "@/db/schema";
import { getSiteSettings } from "@/admin/core/settings/service";
import { settingsDefaults } from "@/admin/modules/settings/defaults";
import type { PublicSettings } from "./dto";

/** Public projection of website settings. Secrets never enter this object. */
export async function loadPublicSettings(): Promise<PublicSettings> {
  const settings = await getSiteSettings(settingsDefaults);

  let logo: PublicSettings["logo"] = null;

  if (settings.logoMediaId) {
    const [row] = await db
      .select({
        id: mediaAssets.id,
        altText: mediaAssets.altText,
        width: mediaAssets.width,
        height: mediaAssets.height,
      })
      .from(mediaAssets)
      .where(eq(mediaAssets.id, settings.logoMediaId))
      .limit(1);

    if (row) {
      logo = {
        id: row.id,
        url: `/media/${row.id}`,
        alt: row.altText?.trim() || `${settings.siteName} logo`,
        width: row.width,
        height: row.height,
      };
    }
  }

  return {
    siteName: settings.siteName,
    tagline: settings.tagline,
    description: settings.description,
    logoText: settings.logoText,
    logo,
    contactEmail: settings.contactEmail,
    contactPhone: settings.contactPhone,
    whatsapp: settings.whatsapp,
    address: settings.address,
    googleMapsUrl: settings.googleMapsUrl,
    whatsappEnabled: settings.whatsappEnabled,
    locationEnabled: settings.locationEnabled,
    social: settings.social,
    seoTitle: settings.seoTitle,
    seoDescription: settings.seoDescription,
    noIndex: settings.noIndex,
  };
}
