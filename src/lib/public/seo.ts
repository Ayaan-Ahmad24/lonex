import type { Metadata } from "next";
import type { PublicImage, PublicSettings } from "./dto";

/** Search indexing follows the owner-controlled settings switch. */
export function robotsFor(settings: PublicSettings): Metadata["robots"] {
  return settings.noIndex
    ? { index: false, follow: false }
    : { index: true, follow: true };
}

export function createPageMetadata(input: {
  settings: PublicSettings;
  title: string;
  description: string;
  path: string;
  image?: PublicImage | null;
  type?: "website" | "article";
  publishedTime?: string;
  absoluteTitle?: boolean;
}): Metadata {
  const image = input.image
    ? [{ url: input.image.url, alt: input.image.alt }]
    : undefined;

  return {
    title: input.absoluteTitle ? { absolute: input.title } : input.title,
    description: input.description,
    alternates: { canonical: input.path },
    robots: robotsFor(input.settings),
    openGraph: {
      type: input.type ?? "website",
      title: input.title,
      description: input.description,
      url: input.path,
      siteName: input.settings.siteName,
      images: image,
      ...(input.publishedTime ? { publishedTime: input.publishedTime } : {}),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: input.title,
      description: input.description,
      images: image?.map((item) => item.url),
    },
  };
}

/** Metadata for a missing or unpublished resource: never index a 404. */
export function notFoundMetadata(title = "Page not found"): Metadata {
  return {
    title,
    robots: { index: false, follow: false },
  };
}
