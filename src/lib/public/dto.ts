/**
 * Public DTOs.
 *
 * These types are the only product data that may cross into a public page,
 * client component, JSON payload or metadata. Hidden prices are represented as
 * `null` at this boundary, so a numeric price cannot leak through CSS hiding,
 * structured data or a server-to-client prop.
 */

export type PublicImage = {
  id: number;
  url: string;
  alt: string;
  width: number | null;
  height: number | null;
};

export type PublicCategory = {
  id: number;
  name: string;
  slug: string;
  path: string;
  description: string | null;
  cover: PublicImage | null;
  /** True when a product exists behind the link. */
  hasProducts: boolean;
};

export type PublicProductCard = {
  id: number;
  name: string;
  slug: string;
  path: string;
  shortDescription: string | null;
  image: PublicImage | null;
  /** Formatted PKR label, or null when the price is hidden or absent. */
  priceLabel: string | null;
  isFeatured: boolean;
};

export type PublicProductImage = PublicImage & {
  isPrimary: boolean;
};

export type PublicSpecificationGroup = {
  groupName: string;
  items: { label: string; value: string; isHighlight: boolean }[];
};

export type PublicProductDocument = {
  id: number;
  title: string;
  url: string;
  fileName: string;
};

export type PublicProduct = PublicProductCard & {
  category: PublicCategory;
  description: string | null;
  images: PublicProductImage[];
  highlights: { label: string; value: string }[];
  specificationGroups: PublicSpecificationGroup[];
  documents: PublicProductDocument[];
  seoTitle: string | null;
  seoDescription: string | null;
};

export type PublicSeller = {
  id: number;
  name: string;
  city: string;
  address: string;
  phone: string;
  whatsapp: string | null;
  googleMapsUrl: string | null;
};

export type PublicBlogCard = {
  id: number;
  title: string;
  slug: string;
  path: string;
  excerpt: string | null;
  cover: PublicImage | null;
  publishedAt: string;
  publishedLabel: string;
};

export type PublicBlogPost = PublicBlogCard & {
  seoTitle: string | null;
  seoDescription: string | null;
};

export type PublicSitemapEntry = {
  path: string;
  lastModified?: Date;
};

export type PublicSettings = {
  siteName: string;
  tagline: string;
  description: string;
  logoText: string;
  logo: PublicImage | null;
  contactEmail: string;
  contactPhone: string;
  whatsapp: string;
  address: string;
  googleMapsUrl: string;
  social: Record<string, string>;
  seoTitle: string;
  seoDescription: string;
  noIndex: boolean;
};

const PKR_FORMATTER = new Intl.NumberFormat("en-PK", {
  style: "currency",
  currency: "PKR",
  maximumFractionDigits: 0,
});

/**
 * Convert a stored decimal to a public label.
 *
 * Returns null unless the owner explicitly enabled the price AND the stored
 * value is a positive number. This is the single gate used by every public
 * query.
 */
export function publicPriceLabel(
  price: string | number | null | undefined,
  showPrice: boolean,
): string | null {
  if (!showPrice || price === null || price === undefined) {
    return null;
  }

  const numeric = typeof price === "number" ? price : Number(price);

  if (!Number.isFinite(numeric) || numeric <= 0) {
    return null;
  }

  return PKR_FORMATTER.format(numeric);
}

export function formatPublishedDate(value: Date | string | null): string {
  if (!value) {
    return "";
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}
