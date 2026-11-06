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
      className={`relative flex h-full w-full flex-col overflow-hidden bg-[#F5EDED] ${className}`}
    >
      <span aria-hidden="true" className="lux-grid-bg absolute inset-0 opacity-70" />
      <span aria-hidden="true" className="absolute inset-0">
        <Image
          src="/lonex-logo.png"
          alt=""
          fill
          sizes="(max-width: 768px) 80vw, 40vw"
          className="object-contain p-[12%] opacity-[0.16]"
        />
      </span>
      <span className="relative mt-auto flex items-center justify-between gap-3 border-t border-black/10 bg-[#F5EDED]/80 px-4 py-3 backdrop-blur-[1px]">
        <span className="type-eyebrow text-black/55">{label}</span>
        <span aria-hidden="true" className="size-1.5 shrink-0 rotate-45 bg-[#CF0A0A]" />
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
  priority = false,
  className = "",
}: {
  image: PublicImage | null;
  fallbackLabel?: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  if (!image) {
    return <ImagePlaceholder label={fallbackLabel} />;
  }

  return (
    <Image
      src={image.url}
      alt={image.alt}
      fill
      sizes={sizes}
      priority={priority}
      className={`object-cover ${className}`}
    />
  );
}
