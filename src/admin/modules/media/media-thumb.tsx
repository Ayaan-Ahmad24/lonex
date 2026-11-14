"use client";

import { useState } from "react";

/**
 * Media thumbnail with a graceful fallback. A database row can outlive its
 * file on disk; when that happens the row still renders as “Missing” instead
 * of a broken-image glyph.
 *
 * The ref callback also covers the case where the browser reports the error
 * before the client component hydrates, so the fallback is not timing-dependent.
 */
export function MediaThumb({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span
        title={`${alt} — file unavailable`}
        className={`flex items-center justify-center bg-lonex-line-soft text-[9px] font-semibold uppercase tracking-wide text-lonex-muted ${className}`}
      >
        Missing
      </span>
    );
  }

  return (
    // Authenticated admin-only preview; next/image cannot fetch this route.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      ref={(node) => {
        if (node && node.complete && node.naturalWidth === 0) {
          setFailed(true);
        }
      }}
      className={className}
    />
  );
}
