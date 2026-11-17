import Link from "next/link";
import type { PublicProductCard } from "@/lib/public/dto";
import { ContentImage } from "./content-image";

export function ProductCard({ product }: { product: PublicProductCard }) {
  return (
    <article className="site-card">
      <Link
        href={product.path}
        className="site-card__media"
        aria-label={product.name}
      >
        <ContentImage
          image={product.image}
          fallbackLabel="Product image pending"
          sizes="(max-width: 768px) 100vw, (max-width: 1100px) 50vw, 33vw"
        />
        {product.isFeatured ? (
          <span className="site-card__flag">Selected</span>
        ) : null}
      </Link>

      <div className="site-card__body">
        <h3 className="site-card__title">
          <Link href={product.path}>{product.name}</Link>
        </h3>

        {product.shortDescription ? (
          <p className="site-card__copy">{product.shortDescription}</p>
        ) : null}

        <div className="site-card__foot">
          <span className="site-card__price">
            {product.priceLabel ?? "Price on inquiry"}
          </span>
          <Link href={product.path} className="site-underline">
            View model
          </Link>
        </div>
      </div>
    </article>
  );
}
