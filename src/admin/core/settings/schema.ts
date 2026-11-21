import { z } from "zod";
import {
  formCheckbox,
  formOptionalId,
  formText,
  parseForm,
  type ParsedForm,
} from "@/lib/validation/form";
import {
  optionalHttpsUrlSchema,
  optionalPhoneSchema,
} from "@/lib/validation/schemas";

/**
 * Allowlisted public site settings.
 *
 * Secrets, database credentials, API keys, SMTP passwords and authentication
 * keys are deliberately absent. Deployment configuration stays in `.env.local`
 * and is never editable through the CMS.
 */

export const socialLinksSchema = z.object({
  facebook: optionalHttpsUrlSchema,
  instagram: optionalHttpsUrlSchema,
  x: optionalHttpsUrlSchema,
  linkedin: optionalHttpsUrlSchema,
  youtube: optionalHttpsUrlSchema,
});

export type SocialLinks = z.infer<typeof socialLinksSchema>;

export const siteSettingsSchema = z.object({
  siteName: z.string().trim().min(1, "Site name is required.").max(100),
  tagline: z.string().trim().max(200).default(""),
  description: z.string().trim().max(500).default(""),
  logoText: z.string().trim().max(30).default(""),
  logoMediaId: z.number().int().positive().nullable().default(null),

  contactEmail: z
    .string()
    .trim()
    .max(255)
    .refine(
      (value) => value === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      "Enter a valid email address or leave this blank.",
    )
    .default(""),
  contactPhone: optionalPhoneSchema({
    message: "Enter a valid phone number or leave this blank.",
  }),
  whatsapp: optionalPhoneSchema({
    message: "Enter a valid WhatsApp number or leave this blank.",
  }),
  address: z.string().trim().max(300).default(""),
  googleMapsUrl: optionalHttpsUrlSchema,

  /** When false, WhatsApp number and links are hidden from the public site.
   *  The stored number is preserved and can be re-enabled at any time. */
  whatsappEnabled: z.boolean().default(false),

  /** When false, the office address and map links are hidden from the public
   *  site. The stored address is preserved and can be re-enabled at any time. */
  locationEnabled: z.boolean().default(false),

  social: socialLinksSchema,

  seoTitle: z.string().trim().max(255).default(""),
  seoDescription: z.string().trim().max(500).default(""),
  noIndex: z.boolean().default(false),
});

export type SiteSettings = z.infer<typeof siteSettingsSchema>;

export const SETTINGS_KEY = "site";

export function parseSettingsForm(formData: FormData): ParsedForm<SiteSettings> {
  const candidate = {
    siteName: formText(formData.get("siteName")),
    tagline: formText(formData.get("tagline")),
    description: formText(formData.get("description")),
    logoText: formText(formData.get("logoText")),
    logoMediaId: formOptionalId(formData.get("logoMediaId")),
    contactEmail: formText(formData.get("contactEmail")),
    contactPhone: formText(formData.get("contactPhone")),
    whatsapp: formText(formData.get("whatsapp")),
    address: formText(formData.get("address")),
    googleMapsUrl: formText(formData.get("googleMapsUrl")),
    social: {
      facebook: formText(formData.get("facebook")),
      instagram: formText(formData.get("instagram")),
      x: formText(formData.get("x")),
      linkedin: formText(formData.get("linkedin")),
      youtube: formText(formData.get("youtube")),
    },
    seoTitle: formText(formData.get("seoTitle")),
    seoDescription: formText(formData.get("seoDescription")),
    noIndex: formCheckbox(formData.get("noIndex")),
  };

  return parseForm(siteSettingsSchema, candidate);
}

/** Merge stored settings over deployment defaults without accepting extra keys. */
export function mergeSettings(
  defaults: SiteSettings,
  stored: unknown,
): SiteSettings {
  if (!stored || typeof stored !== "object" || Array.isArray(stored)) {
    return defaults;
  }

  const value = stored as Record<string, unknown>;
  const social =
    value.social && typeof value.social === "object" && !Array.isArray(value.social)
      ? (value.social as Record<string, unknown>)
      : {};

  const parsed = siteSettingsSchema.safeParse({
    ...defaults,
    ...value,
    social: { ...defaults.social, ...social },
  });

  return parsed.success ? parsed.data : defaults;
}
