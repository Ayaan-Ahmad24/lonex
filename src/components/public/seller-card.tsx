"use client";

import { formatPhone, telHref } from "@/lib/public/contact";
import { sellerEnquiry } from "@/lib/public/enquiries";
import type { PublicSeller, PublicSettings } from "@/lib/public/dto";
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
export function SellerCard({
  seller,
  settings,
}: {
  seller: PublicSeller;
  settings: PublicSettings;
}) {
  const tel = telHref(seller.phone);
  const emailEnquiry = sellerEnquiry(settings.contactEmail, {
    name: seller.name,
    city: seller.city,
    address: seller.address,
  });
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <article className="lxs-entry">
      <div className="lxs-entry__media">
        {seller.image && !imageFailed ? (
          <span className="lxs-entry__logo">
            {/* Dynamically loaded from the database via /media/:id. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={seller.image.url}
              alt={seller.image.alt ?? seller.name}
              width={seller.image.width ?? 400}
              height={seller.image.height ?? 300}
              className="lxs-entry__logo-img"
              onError={() => setImageFailed(true)}
            />
          </span>
        ) : null}
        {(!seller.image || imageFailed) && (
          <ImagePlaceholder
            label="Seller image pending"
            className="lxs-entry__logo"
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
        {tel ? (
          <a href={tel} className="lxs-entry__phone">
            {formatPhone(seller.phone)}
          </a>
        ) : null}
      </div>

      <div className="lxs-entry__actions">
        {tel ? (
          <a href={tel} className="lxs-entry__action">
            Call
            <span aria-hidden="true">↗</span>
          </a>
        ) : null}
        {emailEnquiry ? (
          <a
            href={emailEnquiry}
            target="_blank"
            rel="noopener noreferrer"
            className="lxs-entry__action"
          >
            Email Enquiry
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
