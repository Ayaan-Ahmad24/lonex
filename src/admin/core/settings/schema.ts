import { z } from "zod";

/**
 * Allowlisted public site settings.
 *
 * Secrets, database credentials, API keys, SMTP passwords and authentication
 * keys are deliberately absent. Deployment configuration stays in `.env.local`
 * and is never editable through the CMS.
 */

const optionalHttpsUrl = z
  .string()
  .trim()
  .max(500)
  .refine(
    (value) => value === "" || /^https:\/\/[^\s]+$/i.test(value),
    "Use an https:// URL or leave this blank.",
  )
  .default("");

export const socialLinksSchema = z.object({
  facebook: optionalHttpsUrl,
  instagram: optionalHttpsUrl,
  x: optionalHttpsUrl,
  linkedin: optionalHttpsUrl,
  youtube: optionalHttpsUrl,
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
  contactPhone: z
    .string()
    .trim()
    .max(50)
    .refine(
      (value) => value === "" || /^[0-9+()\-.\s]{3,50}$/.test(value),
      "Enter a valid phone number or leave this blank.",
    )
    .default(""),
  whatsapp: z
    .string()
    .trim()
    .max(50)
    .refine(
      (value) => value === "" || /^[0-9+()\-.\s]{3,50}$/.test(value),
      "Enter a valid WhatsApp number or leave this blank.",
    )
    .default(""),
  address: z.string().trim().max(300).default(""),
  googleMapsUrl: optionalHttpsUrl,

  social: socialLinksSchema,

  seoTitle: z.string().trim().max(255).default(""),
  seoDescription: z.string().trim().max(500).default(""),
  noIndex: z.boolean().default(false),
});

export type SiteSettings = z.infer<typeof siteSettingsSchema>;

export const SETTINGS_KEY = "site";

function text(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value : "";
}

function optionalId(value: FormDataEntryValue | null): number | null {
  const raw = text(value);
  const parsed = Number(raw);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export function parseSettingsForm(
  formData: FormData,
):
  | { ok: true; data: SiteSettings }
  | { ok: false; errors: Record<string, string> } {
  const candidate = {
    siteName: text(formData.get("siteName")),
    tagline: text(formData.get("tagline")),
    description: text(formData.get("description")),
    logoText: text(formData.get("logoText")),
    logoMediaId: optionalId(formData.get("logoMediaId")),
    contactEmail: text(formData.get("contactEmail")),
    contactPhone: text(formData.get("contactPhone")),
    whatsapp: text(formData.get("whatsapp")),
    address: text(formData.get("address")),
    googleMapsUrl: text(formData.get("googleMapsUrl")),
    social: {
      facebook: text(formData.get("facebook")),
      instagram: text(formData.get("instagram")),
      x: text(formData.get("x")),
      linkedin: text(formData.get("linkedin")),
      youtube: text(formData.get("youtube")),
    },
    seoTitle: text(formData.get("seoTitle")),
    seoDescription: text(formData.get("seoDescription")),
    noIndex: formData.get("noIndex") === "on",
  };

  const parsed = siteSettingsSchema.safeParse(candidate);

  if (!parsed.success) {
    const errors: Record<string, string> = {};

    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".");
      if (!errors[key]) {
        errors[key] = issue.message;
      }
    }

    return { ok: false, errors };
  }

  return { ok: true, data: parsed.data };
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
