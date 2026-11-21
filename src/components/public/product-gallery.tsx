"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import type { PublicProductImage } from "@/lib/public/dto";
import { ContentImage } from "./content-image";

/**
 * Product gallery.
 *
 * The stage and the thumbnails are one controlled component so the active
 * image is never duplicated in state. The lightbox is rendered in a portal,
 * locks scrolling, traps focus at its own controls, closes on Escape and the
 * backdrop, and returns focus to the stage when it closes.
 */
export function ProductGallery({
  images,
  productName,
  fallbackLabel = "Product image pending",
  sizes = "(max-width: 900px) 100vw, 58vw",
}: {
  images: PublicProductImage[];
  productName: string;
  fallbackLabel?: string;
  sizes?: string;
}) {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const stageRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const total = images.length;
  const current = images[active] ?? null;

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const close = useCallback(() => {
    setOpen(false);
    stageRef.current?.focus();
  }, []);

  const go = useCallback(
    (direction: 1 | -1) => {
      if (total < 2) {
        return;
      }

      setActive((previous) => (previous + direction + total) % total);
    },
    [total],
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
      } else if (event.key === "ArrowLeft") {
        go(-1);
      } else if (event.key === "ArrowRight") {
        go(1);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, close, go]);

  return (
    <div className="lxp-gallery">
      <button
        ref={stageRef}
        type="button"
        className="lxp-gallery__stage"
        onClick={() => {
          if (total > 0) {
            setOpen(true);
          }
        }}
        aria-label={
          total > 0
            ? `Enlarge image ${active + 1} of ${total} for ${productName}`
            : fallbackLabel
        }
        aria-disabled={total === 0}
        data-gallery-stage
      >
        <span key={active} className="lxp-gallery__frame">
          <ContentImage
            image={current}
            fallbackLabel={fallbackLabel}
            sizes={sizes}
            preload
          />
        </span>
      </button>

      {total > 0 ? (
        <div className="lxp-gallery__bar">
          <span className="lxp-gallery__count">
            {String(active + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
          <span className="lxp-gallery__zoom" aria-hidden="true">
            Enlarge
            <span>＋</span>
          </span>
        </div>
      ) : null}

      {total > 1 ? (
        <div className="lxp-gallery__thumbs" role="group" aria-label={`${productName} images`}>
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              className="lxp-gallery__thumb"
              onClick={() => setActive(index)}
              aria-label={`View image ${index + 1} of ${total}`}
              aria-pressed={index === active}
            >
              <ContentImage
                image={image}
                fallbackLabel="Image"
                sizes="(max-width: 430px) 120px, (max-width: 768px) 180px, 200px"
                fit="contain"
              />
            </button>
          ))}
        </div>
      ) : null}

      {open && total > 0 && typeof document !== "undefined"
        ? createPortal(
            <div
              className="lxp-lightbox"
              role="dialog"
              aria-modal="true"
              aria-label={`${productName} image preview`}
            >
              <button
                type="button"
                className="lxp-lightbox__backdrop"
                aria-label="Close image preview"
                onClick={close}
                tabIndex={-1}
              />

              <div className="lxp-lightbox__bar">
                <p className="lxp-lightbox__title">
                  {productName}
                  <span>
                    {String(active + 1).padStart(2, "0")} /{" "}
                    {String(total).padStart(2, "0")}
                  </span>
                </p>
                <button
                  ref={closeRef}
                  type="button"
                  className="lxp-lightbox__close"
                  onClick={close}
                  aria-label="Close image preview"
                >
                  <span aria-hidden="true">✕</span>
                </button>
              </div>

              <div className="lxp-lightbox__stage">
                <ContentImage
                  image={current}
                  fallbackLabel={fallbackLabel}
                  sizes="92vw"
                  fit="contain"
                />
              </div>

              {total > 1 ? (
                <div className="lxp-lightbox__nav">
                  <button type="button" onClick={() => go(-1)} aria-label="Previous image">
                    <span aria-hidden="true">←</span>
                  </button>
                  <button type="button" onClick={() => go(1)} aria-label="Next image">
                    <span aria-hidden="true">→</span>
                  </button>
                </div>
              ) : null}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
