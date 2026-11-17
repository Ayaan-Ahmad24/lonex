import { formatPhone, whatsappHref } from "@/lib/public/contact";
import type { PublicSeller } from "@/lib/public/dto";

/**
 * Authorized seller row.
 *
 * Only confirmed fields are shown: name, city, address, phone, and the optional
 * WhatsApp and map links the record supplies. No shopfront photograph is used,
 * because LONEX has not photographed these businesses.
 */
export function SellerCard({ seller }: { seller: PublicSeller }) {
  const tel = `tel:${seller.phone.replace(/[^\d+]/g, "")}`;
  const whatsapp = seller.whatsapp ? whatsappHref(seller.whatsapp) : null;

  return (
    <article className="lxs-entry">
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
