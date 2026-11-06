"use client";

import { useState } from "react";
import type { PublicProductImage } from "@/lib/public/dto";
import { ContentImage } from "./content-image";
import { ImageLightbox } from "./image-lightbox";

/**
 * Product gallery: keyboard-accessible thumbnails, a quiet hover zoom and a
 * index counter. Only the active image is tracked in the client.
 */
export function ProductGallery({
  images,
  productName,
  fallbackLabel = "Product image pending",
}: {
  images: PublicProductImage[];
  productName: string;
  fallbackLabel?: string;
}) {
  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const current = images[active] ?? null;

  return (
    <div className="space-y-4">
      <div className="group relative aspect-[4/5] overflow-hidden bg-[#F5EDED] sm:aspect-[4/3]">
        <div key={active} className="intro absolute inset-0 cursor-pointer" onClick={() => {
          if (images.length > 0) {
            setLightboxOpen(true);
          }
        }}>
          <ContentImage
            image={current}
            fallbackLabel={fallbackLabel}
            sizes="(max-width: 1024px) 100vw, 52vw"
            priority
            className="transition-transform duration-[900ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.12]"
          />
        </div>
        {images.length > 0 ? (
          <span className="type-eyebrow absolute bottom-4 left-4 bg-black px-3 py-2 text-white">
            {String(active + 1).padStart(2, "0")} /{" "}
            {String(images.length).padStart(2, "0")}
          </span>
        ) : null}
      </div>

      {images.length > 1 ? (
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`View image ${index + 1} of ${productName}`}
              aria-pressed={index === active}
              className={`relative aspect-square overflow-hidden bg-[#F5EDED] transition-shadow ${
                index === active
                  ? "ring-2 ring-[#CF0A0A]"
                  : "ring-1 ring-black/10 hover:ring-black/40"
              }`}
            >
              <ContentImage
                image={image}
                fallbackLabel="Image"
                sizes="(max-width: 768px) 25vw, 120px"
              />
            </button>
          ))}
        </div>
      ) : null}

      {images.length > 0 ? (
        <p className="type-eyebrow text-right text-black/55">
          Click to enlarge · Hover to zoom
        </p>
      ) : null}

      {lightboxOpen && images.length > 0 ? (
        <ImageLightbox
          images={images}
          productName={productName}
          initialIndex={active}
        />
      ) : null}
    </div>
  );
}
