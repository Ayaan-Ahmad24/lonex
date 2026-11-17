import Image from "next/image";
import Link from "next/link";
import type { PublicSettings } from "@/lib/public/dto";

type BrandMarkSize = "sm" | "md" | "lg" | "header" | "footer" | "hero";

const SIZE_CLASSES: Record<BrandMarkSize, string> = {
  sm: "h-10 w-[3.77rem]",
  md: "h-14 w-[5.28rem]",
  lg: "h-24 w-36",
  header: "h-10 w-[3.77rem] sm:h-14 sm:w-[5.28rem]",
  footer: "h-14 w-[5.28rem] sm:h-20 sm:w-[7.54rem]",
  hero: "h-40 w-[15.07rem] sm:h-56 sm:w-[21.1rem]",
};

/**
 * Official LONEX logo.
 *
 * The brandbook artwork is shipped with the site and always used in the public
 * shell. The settings image field stays available to the admin, but a square
 * test upload must never replace the wordmark in the header.
 *
 * The source files (`public/logo.png` and `lonex-logo.png`) are untouched; the
 * header uses the same artwork, scaled by the plate below.
 */
export function BrandMark({
  settings,
  inverse = false,
  size = "header",
  className = "",
}: {
  settings: PublicSettings;
  inverse?: boolean;
  size?: BrandMarkSize;
  className?: string;
}) {
  const source = "/lonex-logo-transparent.png";

  return (
    <Link
      href="/"
      aria-label={`${settings.siteName} home`}
      className={`inline-flex shrink-0 items-center ${className}`}
    >
      <span
        className={`logo-plate relative block overflow-hidden ${
          inverse ? "ring-1 ring-white/10" : ""
        } ${SIZE_CLASSES[size]}`}
      >
        <Image
          src={source}
          alt={`${settings.siteName} logo`}
          fill
          sizes="200px"
          priority
          className="object-contain"
        />
      </span>
      <span className="sr-only">{settings.siteName}</span>
    </Link>
  );
}
