"use client";

import { formatPhone, whatsappHref } from "@/lib/public/contact";
import type { PublicSeller } from "@/lib/public/dto";
import { ImagePlaceholder } from "@/components/public/content-image";
import { useState } from "react";

/**
 * Authorized seller card.
 *
 * Shows the seller's uploaded logo or business photograph when one exists,
 * cropped with `object-fit: contain` so a logo is never distorted. Falls back
 * to an honest placeholder (never a broken image icon) when no image is
 * uploaded or the file is unavailable.
 */
export function SellerCard({ seller }: { seller: PublicSeller }) {
  const tel = `tel:${seller.phone.replace(/[^\d+]/g, "")}`;
  const whatsapp = seller.whatsapp ? whatsappHref(seller.whatsapp) : null;
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <article className="lxs-entry">
      <div className="lxs-entry__media">
        {seller.image && !imageFailed ? (
          // Dynamically loaded from the database via /media/:id.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={seller.image.url}
            alt={seller.image.alt ?? seller.name}
            width={seller.image.width ?? 400}
            height={seller.image.height ?? 300}
            sizes="(max-width: 767px) 100vw, 120px"
            className="h-20 w-24 rounded-lg border border-lonex-line object-contain bg-lonex-paper"
            onError={() => setImageFailed(true)}
          />
        ) : null}
        {(!seller.image || imageFailed) && (
          <ImagePlaceholder
            label="Seller image pending"
            className="h-20 w-24 rounded-lg border border-lonex-line bg-lonex-paper"
          />
        )}
      </div>

      <div className="lxs-entry__identity">
        <span className="lxs-entry__status">
          <span aria-hidden="true" className="lxs-entry__dot" />
          Authorized
        </span>
        <h3 className="lxs-entry__name">{seller.name}</h3>
        <p className="lxs-entry__city">{seller.city}</p>
      </div>

      <div className="lxs-entry__field">
        <span className="lxs-entry__label">Address</span>
        <p className="lxs-entry__value">{seller.address}</p>
      </div>

      <div className="lxs-entry__field">
        <span className="lxs-entry__label">Contact</span>
        <a href={tel} className="lxs-entry__phone">
          {formatPhone(seller.phone)}
        </a>
      </div>

      <div className="lxs-entry__actions">
        <a href={tel} className="lxs-entry__action">
          Call
          <span aria-hidden="true">↗</span>
        </a>
        {whatsapp ? (
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="lxs-entry__action"
          >
            WhatsApp
            <span aria-hidden="true">↗</span>
          </a>
        ) : null}
        {seller.googleMapsUrl ? (
          <a
            href={seller.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="lxs-entry__action"
          >
            Map
            <span aria-hidden="true">↗</span>
          </a>
        ) : null}
      </div>
    </article>
  );
}
