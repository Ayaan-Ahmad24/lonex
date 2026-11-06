import Link from "next/link";
import type { PublicProductCard } from "@/lib/public/dto";
import { ContentImage } from "./content-image";

export function ProductCard({ product }: { product: PublicProductCard }) {
  return (
    <article className="group lux-card flex h-full flex-col">
      <Link
        href={product.path}
        className="lux-media relative block aspect-[4/5] overflow-hidden bg-[#F5EDED]"
        aria-label={product.name}
      >
        <ContentImage
          image={product.image}
          fallbackLabel="Product image pending"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {product.isFeatured ? (
          <span className="type-eyebrow absolute left-0 top-0 bg-white px-3 py-2 text-[#CF0A0A]">
            Featured
          </span>
        ) : null}
        <span
          aria-hidden="true"
          className="absolute bottom-0 left-0 right-0 h-[2px] origin-left scale-x-0 bg-[#CF0A0A] transition-transform duration-500 group-hover:scale-x-100"
        />
      </Link>

      <div className="flex flex-1 flex-col pt-5">
        <h3 className="text-lg font-semibold leading-6 tracking-tight text-black">
          <Link href={product.path} className="transition-colors hover:text-[#CF0A0A]">
            {product.name}
          </Link>
        </h3>

        {product.shortDescription ? (
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-black/55">
            {product.shortDescription}
          </p>
        ) : null}

        <div className="mt-auto flex items-end justify-between gap-4 border-t border-black/10 pt-4">
          <div>
            <p className="type-eyebrow text-black/55">
              {product.priceLabel ? "Price" : "Enquiry"}
            </p>
            <p className="mt-1 text-sm font-semibold text-black">
              {product.priceLabel ?? "Price on inquiry"}
            </p>
          </div>
          <span
            aria-hidden="true"
            className="grid size-9 shrink-0 place-items-center rounded-full border border-black/15 text-sm text-black transition-colors duration-300 group-hover:border-[#CF0A0A] group-hover:bg-[#CF0A0A] group-hover:text-white"
          >
            →
          </span>
        </div>
      </div>
    </article>
  );
}
