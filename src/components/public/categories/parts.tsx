import Link from "next/link";

import { ContentImage } from "@/components/public/content-image";
import type {
  PublicCategory,
  PublicProductCard,
  PublicSettings,
} from "@/lib/public/dto";
import { formatPhone } from "@/lib/public/contact";
import type {
  CategoryEditorial,
  EditorialPoint,
  ProductEditorial,
} from "@/lib/public/editorial";
import { COMMUNITY_TITLE } from "@/lib/public/editorial";

export type ProductView = {
  card: PublicProductCard;
  editorial: ProductEditorial;
};

export type CategoryPageProps = {
  category: PublicCategory;
  products: PublicProductCard[];
  settings: PublicSettings;
  editorial: CategoryEditorial;
};

export function CategoryBreadcrumbs({
  categoryName,
  light = false,
}: {
  categoryName: string;
  light?: boolean;
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`lxc-crumbs${light ? " lxc-crumbs--light" : ""}`}
    >
      <Link href="/">Home</Link>
      <span aria-hidden="true">/</span>
      <span aria-current="page">{categoryName}</span>
    </nav>
  );
}

export function CategoryHead({
  eyebrow,
  title,
  lede,
  layout = "split",
}: {
  eyebrow: string;
  title: string;
  lede: string;
  layout?: "split" | "stack" | "centre";
}) {
  return (
    <header className={`lxc-head lxc-head--${layout}`} data-reveal-group>
      <p className="lxc-eyebrow" data-reveal>
        <span aria-hidden="true" className="lxc-eyebrow__mark" />
        {eyebrow}
      </p>
      <h2 className="lxc-h2 lxc-head__title" data-reveal>
        {title}
      </h2>
      <p className="lxc-lede lxc-head__lede" data-reveal>
        {lede}
      </p>
    </header>
  );
}

export function CommunityPillars({ pillars }: { pillars: EditorialPoint[] }) {
  return (
    <ul className="lxc-pillars">
      {pillars.map((pillar) => (
        <li className="lxc-pillar" key={pillar.title}>
          <h3 className="lxc-pillar__title">{pillar.title}</h3>
          <p className="lxc-pillar__copy">{pillar.copy}</p>
        </li>
      ))}
    </ul>
  );
}

export function CommunityHeading({ lede }: { lede: string }) {
  return (
    <div className="lxc-community__head" data-reveal-group>
      <p className="lxc-eyebrow" data-reveal>
        <span aria-hidden="true" className="lxc-eyebrow__mark" />
        Community impact
      </p>
      <h2 className="lxc-community__title" data-reveal>
        Beyond Energy.
        <span>Towards Better Communities.</span>
      </h2>
      <p className="lxc-lede lxc-community__lede" data-reveal>
        {lede}
      </p>
    </div>
  );
}

export function ProductPoints({
  editorial,
  className = "",
}: {
  editorial: ProductEditorial;
  className?: string;
}) {
  return (
    <ul className={`lxc-points ${className}`.trim()}>
      {editorial.benefits.map((benefit) => (
        <li className="lxc-point" key={benefit.title}>
          <span aria-hidden="true" className="lxc-point__mark" />
          <div>
            <h4 className="lxc-point__title">{benefit.title}</h4>
            <p className="lxc-point__copy">{benefit.copy}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function UseCaseChips({ cases }: { cases: string[] }) {
  return (
    <ul className="lxc-cases" aria-label="Applications and use cases">
      {cases.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export function RichProductCard({
  view,
  sizes = "(max-width: 860px) 100vw, 46vw",
}: {
  view: ProductView;
  sizes?: string;
}) {
  const { card, editorial } = view;

  return (
    <article className="lxc-card" data-reveal>
      <Link
        href={card.path}
        className="lxc-card__media"
        data-product-image
        aria-label={`View ${card.name}`}
      >
        <ContentImage
          image={card.image}
          fallbackLabel={`${card.name} image`}
          sizes={sizes}
        />
        <span className="lxc-card__badge" aria-hidden="true">
          View product
          <span className="lxc-card__badge-arrow">↗</span>
        </span>
      </Link>

      <div className="lxc-card__body">
        <p className="lxc-card__tagline">{editorial.tagline}</p>
        <h3 className="lxc-card__name">
          <Link href={card.path}>{card.name}</Link>
        </h3>
        <p className="lxc-card__price">
          {card.priceLabel ?? "Price on inquiry"}
        </p>
        <p className="lxc-card__summary">{editorial.summary}</p>

        <ProductPoints editorial={editorial} />

        <div className="lxc-card__use">
          <p className="lxc-card__label">Use cases</p>
          <UseCaseChips cases={editorial.useCases} />
        </div>

        <div className="lxc-card__actions">
          <Link href={card.path} className="lx-btn">
            View product
          </Link>
          <Link href="/contact" className="lx-link">
            Enquire
          </Link>
        </div>
      </div>
    </article>
  );
}

export function RangeEnquiry({
  categoryName,
  note,
  whatsapp,
  phone,
}: {
  categoryName: string;
  note: string;
  whatsapp: string | null;
  phone: string | null;
}) {
  return (
    <div className="lxc-enquiry__actions">
      <Link href="/contact" className="lx-btn lx-btn--red">
        Enquire about {categoryName}
      </Link>
      {whatsapp ? (
        <a
          href={whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="lx-btn lx-btn--ghost"
        >
          Message on WhatsApp
        </a>
      ) : null}
      {phone ? (
        <a href={`tel:${phone.replace(/\s+/g, "")}`} className="lxc-enquiry__phone">
          {formatPhone(phone)}
        </a>
      ) : null}
      <p className="lxc-enquiry__note">{note}</p>
    </div>
  );
}

export function CategoryClose({
  title,
  body,
  categoryName,
  whatsapp,
}: {
  title: string;
  body: string;
  categoryName: string;
  whatsapp: string | null;
}) {
  return (
    <section className="lxc-close">
      <div className="lx-wrap lxc-close__grid">
        <div className="lxc-close__copy" data-reveal-group>
          <p className="lxc-eyebrow lxc-eyebrow--light" data-reveal>
            <span aria-hidden="true" className="lxc-eyebrow__mark" />
            Next step
          </p>
          <h2 className="lxc-close__title" data-reveal>
            {title}
          </h2>
        </div>

        <div className="lxc-close__aside" data-reveal-group>
          <p className="lxc-close__body" data-reveal>
            {body}
          </p>
          <div className="lx-actions lxc-close__actions" data-reveal>
            <Link href="/contact" className="lx-btn lx-btn--red">
              Talk to LONEX
            </Link>
            {whatsapp ? (
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="lx-btn lx-btn--ghost"
              >
                WhatsApp
              </a>
            ) : null}
          </div>
          <p className="lxc-close__meta" data-reveal>
            {categoryName} · LONEX range
          </p>
        </div>
      </div>
    </section>
  );
}

export { COMMUNITY_TITLE };
