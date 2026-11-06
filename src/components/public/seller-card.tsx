import type { PublicSeller } from "@/lib/public/dto";

function whatsappHref(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const digits = value.replace(/[^\d]/g, "");

  return digits.length >= 6 ? `https://wa.me/${digits}` : null;
}

/**
 * Authorized seller card. The monogram is typographic, not invented imagery.
 */
export function SellerCard({
  seller,
  index = 0,
}: {
  seller: PublicSeller;
  index?: number;
}) {
  const whatsapp = whatsappHref(seller.whatsapp);

  return (
    <article className="reveal lux-card flex h-full flex-col border border-black/10 bg-white p-6">
      <div className="flex items-start justify-between gap-4">
        <p className="type-eyebrow text-[#CF0A0A]">{seller.city}</p>
        <span className="type-eyebrow text-black/25">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      <div className="mt-6 grid size-14 place-items-center bg-[#F5EDED] text-2xl font-semibold text-[#CF0A0A]">
        {seller.name.charAt(0).toUpperCase()}
      </div>

      <h3 className="mt-5 text-lg font-semibold tracking-tight text-black">
        {seller.name}
      </h3>
      <p className="mt-2 text-sm leading-6 text-black/55">{seller.address}</p>

      <div className="mt-auto flex flex-wrap gap-2 pt-6">
        <a
          href={`tel:${seller.phone.replace(/\s+/g, "")}`}
          className="inline-flex items-center justify-center border border-black/15 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-black transition-colors hover:border-black hover:bg-black hover:text-white"
        >
          Call
        </a>
        {seller.googleMapsUrl ? (
          <a
            href={seller.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center border border-black/15 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-black transition-colors hover:border-black hover:bg-black hover:text-white"
          >
            Map
          </a>
        ) : null}
        {whatsapp ? (
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center bg-[#CF0A0A] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-black"
          >
            WhatsApp
          </a>
        ) : null}
      </div>
    </article>
  );
}
