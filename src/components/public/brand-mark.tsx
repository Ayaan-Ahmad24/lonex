import Image from "next/image";
import Link from "next/link";
import type { PublicSettings } from "@/lib/public/dto";

type BrandMarkSize = "sm" | "md" | "lg" | "header" | "footer" | "hero";

const SIZE_CLASSES: Record<BrandMarkSize, string> = {
  sm: "h-10 w-[3.77rem]",
  md: "h-14 w-[5.28rem]",
  lg: "h-24 w-36",
  header: "h-10 w-[3.77rem] sm:h-14 sm:w-[5.28rem]",
  footer: "h-16 w-[6.03rem]",
  hero: "h-40 w-[15.07rem] sm:h-56 sm:w-[21.1rem]",
};

/**
 * Official LONEX logo.
 *
 * The supplied artwork contains its own warm-grey (#F5EDED) field, so it is
 * presented on a plate of the same colour rather than recoloured for dark
 * surfaces. The source files (`public/logo.png` and `final logo.png`) are
 * untouched; the header uses a whitespace-trimmed derivative of the same
 * pixels so the wordmark stays legible at navigation size.
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
  const source = settings.logo?.url ?? "/lonex-logo.png";
  const isUploaded = Boolean(settings.logo);

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
          className={isUploaded ? "object-contain p-1" : "object-contain"}
        />
      </span>
      <span className="sr-only">{settings.siteName}</span>
    </Link>
  );
}
