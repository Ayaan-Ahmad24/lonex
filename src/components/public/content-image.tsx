import Image from "next/image";
import type { PublicImage } from "@/lib/public/dto";

/**
 * Honest placeholder for imagery that LONEX has not supplied yet.
 *
 * It is labelled and carries a faint watermark of the official logo, so a
 * development build reads as an intentional empty state rather than a broken
 * image or stock photography that would misrepresent the product.
 */
export function ImagePlaceholder({
  label = "Image pending",
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      role="img"
      aria-label={label}
      className={`site-placeholder ${className}`}
    >
      <span aria-hidden="true" className="site-placeholder__grid" />
      <span aria-hidden="true" className="site-placeholder__logo">
        <Image
          src="/lonex-logo.png"
          alt=""
          width={148}
          height={100}
          sizes="148px"
          className="h-auto w-[7.5rem]"
        />
      </span>
      <span className="site-placeholder__label">
        <span>{label}</span>
        <span aria-hidden="true" className="site-placeholder__rule" />
      </span>
    </div>
  );
}

/**
 * Fill-image for a positioned parent. Falls back to a labelled placeholder
 * instead of stock photography, which would misrepresent LONEX.
 */
export function ContentImage({
  image,
  fallbackLabel,
  sizes,
  preload = false,
  alt,
  fit = "cover",
  className = "",
}: {
  image: PublicImage | null;
  fallbackLabel?: string;
  sizes: string;
  preload?: boolean;
  /** Accessible description that should replace the stored alt text. */
  alt?: string;
  fit?: "cover" | "contain";
  className?: string;
}) {
  if (!image) {
    return <ImagePlaceholder label={fallbackLabel} />;
  }

  return (
    <Image
      src={image.url}
      alt={alt ?? image.alt}
      fill
      sizes={sizes}
      preload={preload}
      className={`${fit === "contain" ? "object-contain" : "object-cover"} ${className}`}
    />
  );
}
