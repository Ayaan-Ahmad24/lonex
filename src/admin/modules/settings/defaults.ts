import { siteSettingsSchema, type SiteSettings } from "@/admin/core/settings/schema";
import { siteConfig } from "@/admin/config/site";

/** Deployment defaults, editable in the CMS afterwards. */
export const settingsDefaults: SiteSettings = siteSettingsSchema.parse({
  siteName: siteConfig.name,
  tagline: siteConfig.tagline,
  description: siteConfig.description,
  logoText: siteConfig.admin.logoText,
  logoMediaId: null,
  contactEmail: "",
  contactPhone: "",
  whatsapp: "",
  address: "",
  googleMapsUrl: "",
  social: {
    facebook: "",
    instagram: "",
    x: "",
    linkedin: "",
    youtube: "",
  },
  seoTitle: `${siteConfig.name} | ${siteConfig.tagline}`,
  seoDescription: siteConfig.description,
  noIndex: false,
});
