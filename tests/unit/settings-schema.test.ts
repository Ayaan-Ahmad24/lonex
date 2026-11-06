import { describe, expect, it } from "vitest";
import {
  mergeSettings,
  parseSettingsForm,
  siteSettingsSchema,
  type SiteSettings,
} from "@/admin/core/settings/schema";

const valid: SiteSettings = {
  siteName: "Example",
  tagline: "Tagline",
  description: "Description",
  logoText: "EX",
  logoMediaId: null,
  contactEmail: "hello@example.invalid",
  contactPhone: "+92 300 1234567",
  whatsapp: "+92 300 1234567",
  address: "1 Example Street",
  googleMapsUrl: "https://maps.example/1",
  social: {
    facebook: "https://facebook.com/example",
    instagram: "",
    x: "",
    linkedin: "",
    youtube: "",
  },
  seoTitle: "Example title",
  seoDescription: "Example description",
  noIndex: true,
};

function form(values: Record<string, string>): FormData {
  const data = new FormData();

  for (const [key, value] of Object.entries({
    siteName: valid.siteName,
    tagline: valid.tagline,
    description: valid.description,
    logoText: valid.logoText,
    contactEmail: valid.contactEmail,
    contactPhone: valid.contactPhone,
    address: valid.address,
    facebook: valid.social.facebook,
    instagram: "",
    x: "",
    linkedin: "",
    youtube: "",
    seoTitle: valid.seoTitle,
    seoDescription: valid.seoDescription,
    ...values,
  })) {
    data.set(key, value);
  }

  return data;
}

describe("site settings schema", () => {
  it("accepts a valid configuration and applies defaults", () => {
    const parsed = siteSettingsSchema.parse(valid);

    expect(parsed.siteName).toBe("Example");
    expect(parsed.noIndex).toBe(true);
  });

  it("rejects an empty site name", () => {
    expect(
      siteSettingsSchema.safeParse({ ...valid, siteName: "" }).success,
    ).toBe(false);
  });

  it("rejects a malformed contact email", () => {
    expect(
      siteSettingsSchema.safeParse({ ...valid, contactEmail: "not-an-email" })
        .success,
    ).toBe(false);
  });

  it("rejects a non-https social link", () => {
    expect(
      siteSettingsSchema.safeParse({
        ...valid,
        social: { ...valid.social, facebook: "http://insecure.example" },
      }).success,
    ).toBe(false);
  });

  it("rejects javascript: links even when they look like URLs", () => {
    expect(
      siteSettingsSchema.safeParse({
        ...valid,
        social: { ...valid.social, x: "javascript:alert(1)" },
      }).success,
    ).toBe(false);
  });

  it("drops unknown keys instead of storing them", () => {
    const parsed = siteSettingsSchema.parse({
      ...valid,
      databasePassword: "do-not-store",
    });

    expect("databasePassword" in parsed).toBe(false);
  });
});

describe("settings form parsing", () => {
  it("parses a complete form", () => {
    const result = parseSettingsForm(form({}));

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.data.siteName).toBe("Example");
      expect(result.data.noIndex).toBe(false);
    }
  });

  it("reports field errors for invalid input", () => {
    const result = parseSettingsForm(
      form({ siteName: "", contactEmail: "invalid" }),
    );

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(Object.keys(result.errors)).toContain("siteName");
      expect(Object.keys(result.errors)).toContain("contactEmail");
    }
  });

  it("ignores a non-numeric logo media id", () => {
    const result = parseSettingsForm(form({ logoMediaId: "not-a-number" }));

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.data.logoMediaId).toBeNull();
    }
  });
});

describe("mergeSettings", () => {
  it("returns defaults for a missing or invalid value", () => {
    expect(mergeSettings(valid, null)).toEqual(valid);
    expect(mergeSettings(valid, [])).toEqual(valid);
    expect(mergeSettings(valid, "text")).toEqual(valid);
  });

  it("overrides stored values and merges social links", () => {
    const merged = mergeSettings(valid, {
      siteName: "Stored",
      social: { facebook: "https://facebook.com/stored" },
    });

    expect(merged.siteName).toBe("Stored");
    expect(merged.social.facebook).toBe("https://facebook.com/stored");
    expect(merged.social.youtube).toBe("");
  });

  it("falls back to defaults when stored values are invalid", () => {
    expect(mergeSettings(valid, { siteName: "", social: [] })).toEqual(valid);
  });

  it("never surfaces unknown stored keys", () => {
    const merged = mergeSettings(valid, {
      apiKey: "secret",
      siteName: "Stored",
    }) as SiteSettings & Record<string, unknown>;

    expect(merged.siteName).toBe("Stored");
    expect("apiKey" in merged).toBe(false);
  });
});
