"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { PublicProductImage } from "@/lib/public/dto";

/**
 * Accessible image lightbox for the public product gallery.
 *
 * Opening an image in a lightbox prevents navigation to the raw media URL and
 * keeps the page layout intact. The modal uses Tailwind utilities for layout,
 * focus management and responsive behaviour.
 */
export function ImageLightbox({
  images,
  productName,
  initialIndex = 0,
}: {
  images: PublicProductImage[];
  productName: string;
  initialIndex?: number;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(initialIndex);

  const current = images[active];

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Escape") {
      setOpen(false);
    } else if (event.key === "ArrowLeft") {
      setActive((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    } else if (event.key === "ArrowRight") {
      setActive((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    }
  }

  if (!open) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Image preview for ${productName}`}
      onKeyDown={onKeyDown}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 sm:p-6"
      tabIndex={-1}
      onFocus={(event) => {
        // Trap focus: if focus leaves the modal, bring it back to the close button
        if (!event.currentTarget.contains(event.relatedTarget)) {
          const closeButton = event.currentTarget.querySelector(
            '[aria-label="Close image preview"]',
          );
          (closeButton as HTMLElement)?.focus();
        }
      }}
    >
      <div
        className="relative max-w-4xl max-h-[90vh] flex flex-col items-center"
        role="group"
        aria-label="Image carousel"
      >
        <button
          type="button"
          aria-label="Close image preview"
          onClick={() => setOpen(false)}
          className="absolute right-4 top-4 z-10 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
        >
          <span className="block w-6 h-6">
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              className="w-6 h-6"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </span>
        </button>

        {current ? (
          <div className="relative flex items-center justify-center max-h-[75vh]">
            <Image
              src={current.url}
              alt={current.alt}
              sizes="(max-width: 768px) 90vw, 720px"
              className="max-h-[75vh] max-w-full object-contain rounded-lg border border-white/20 shadow-2xl"
              priority
            />
            <span
              className="absolute bottom-4 left-0 right-0 text-center bg-black/40 text-white px-3 py-1.5 rounded text-xs type-eyebrow"
            >
              {String(active + 1).padStart(2, "0")} /{" "}
              {String(images.length).padStart(2, "0")}
            </span>
          </div>
        ) : null}

        {images.length > 1 ? (
          <div className="flex items-center gap-6 mt-4">
            <button
              type="button"
              onClick={() => setActive((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
              disabled={active === 0 && images.length <= 1}
              className="rounded p-2 bg-white/10 text-white hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              aria-label="Previous image"
            >
              <svg
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                className="w-8 h-8"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setActive((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
              className="rounded p-2 bg-white/10 text-white hover:bg-white/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              aria-label="Next image"
            >
              <svg
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                className="w-8 h-8"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        ) : null}
      </div>

      <button
        type="button"
        onClick={() => setOpen(false)}
        className="absolute inset-0 z-0"
        aria-hidden="true"
      />
    </div>
  );
}
