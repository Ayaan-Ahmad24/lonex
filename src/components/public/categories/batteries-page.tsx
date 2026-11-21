import Image from "next/image";
import Link from "next/link";

import { ContentImage } from "@/components/public/content-image";
import { categoryEnquiry } from "@/lib/public/enquiries";
import {
  CategoryBreadcrumbs,
  CategoryClose,
  CategoryHead,
  CommunityHeading,
  CommunityPillars,
  ProductPoints,
  RangeEnquiry,
  UseCaseChips,
  buildProductViews,
} from "./parts";
import type { CategoryPageProps, ProductView } from "./parts";

const HERO_IMAGE = {
  src: "/images/lonex-step-1/store-battery.webp",
  alt: "A home battery system and wall-mounted inverter in a contemporary interior",
};

const COMMUNITY_IMAGE = {
  src: "/images/lonex-generated-images/lifestyle/battery-production.webp",
  alt: "Battery modules moving along a production line",
};

const FLOW = [
  {
    step: "Generate",
    copy: "A solar array produces electricity through the day, whether or not the building is using it at that moment.",
  },
  {
    step: "Store",
    copy: "The battery holds the surplus, ready for the hours when generation falls away and demand does not.",
  },
  {
    step: "Use",
    copy: "Stored power is drawn on when it is needed — in the evening, or during an outage where backup is supported.",
  },
] as const;

function PlinthProduct({ view, flip }: { view: ProductView; flip: boolean }) {
  const { card, editorial } = view;

  return (
    <article className={`lxb-plinth${flip ? " lxb-plinth--flip" : ""}`} data-reveal>
      <Link
        href={card.path}
        className="lxb-plinth__media"
        data-product-image
        aria-label={`View ${card.name}`}
      >
        <ContentImage
          image={card.image}
          fallbackLabel={`${card.name} image`}
          sizes="(max-width: 900px) 100vw, 56vw"
        />
        <span className="lxb-plinth__badge" aria-hidden="true">
          View product
          <span>↗</span>
        </span>
      </Link>

      <div className="lxb-plinth__copy">
        <p className="lxb-plinth__tagline">{editorial.tagline}</p>
        <h3 className="lxb-plinth__name">
          <Link href={card.path}>{card.name}</Link>
        </h3>
        <p className="lxb-plinth__price">
          {card.priceLabel ?? "Price on inquiry"}
        </p>
        <p className="lxb-plinth__summary">{editorial.summary}</p>

        <ProductPoints editorial={editorial} />

        <div className="lxb-plinth__use">
          <p className="lxc-card__label">Use cases</p>
          <UseCaseChips cases={editorial.useCases} />
        </div>

        {editorial.note ? (
          <p className="lxb-plinth__note">{editorial.note}</p>
        ) : null}

        <div className="lxb-plinth__actions">
          <Link href={card.path} className="lx-btn lx-btn--light">
            View product
          </Link>
          <Link href="/contact" className="lx-btn lx-btn--ghost">
            Enquire
          </Link>
        </div>
      </div>
    </article>
  );
}

export function BatteriesPage({
  category,
  products,
  settings,
  editorial,
}: CategoryPageProps) {
  const emailEnquiry = categoryEnquiry(settings.contactEmail, {
    label: "Batteries",
    name: "Batteries",
    path: category.path,
    intro: "I would like to discuss a home battery system.",
    closing: "Please share details about the battery models available.",
  });

  const views = buildProductViews(category, products);

  return (
    <>
      <section className="lxb-hero" data-hero>
        <div className="lxb-hero__media" data-hero-media>
          <Image
            src={HERO_IMAGE.src}
            alt={HERO_IMAGE.alt}
            fill
            preload
            sizes="100vw"
            className="lxb-hero__image"
          />
        </div>
        <div aria-hidden="true" className="lxb-hero__veil" />

        <div className="lx-wrap lxb-hero__inner">
          <div className="lxb-hero__top">
            <CategoryBreadcrumbs categoryName={category.name} light />
            <p className="lxb-hero__tag">Storage / Store</p>
          </div>

          <div className="lxb-hero__centre">
            <p className="lxc-eyebrow lxc-eyebrow--light" data-hero-item>
              <span aria-hidden="true" className="lxc-eyebrow__mark" />
              {editorial.eyebrow}
            </p>

            <h1 className="lxb-hero__title">
              {editorial.heroLines.map((line) => (
                <span className="lxb-hero__line" data-hero-line key={line}>
                  {line}
                </span>
              ))}
            </h1>

            <div className="lxb-hero__copy" data-hero-item>
              {editorial.heroIntro.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            <div className="lx-actions lxb-hero__actions" data-hero-item>
              <Link href="#models" className="lx-btn lx-btn--light">
                {editorial.primaryCta}
              </Link>
              <Link href="/contact" className="lx-btn lx-btn--ghost">
                {editorial.secondaryCta}
              </Link>
            </div>
          </div>

          <div className="lxb-hero__flow" data-hero-item>
            <div className="lxb-hero__flow-steps">
              {editorial.heroMeta.map((step, index) => (
                <span key={step} className="lxb-hero__step">
                  {step}
                  {index < editorial.heroMeta.length - 1 ? (
                    <span aria-hidden="true" className="lxb-hero__arrow">
                      →
                    </span>
                  ) : null}
                </span>
              ))}
            </div>
            <div className="lxb-charge" aria-hidden="true">
              <span className="lxb-charge__fill" data-charge-line />
            </div>
          </div>
        </div>
      </section>

      <section className="lxb-flow">
        <div className="lx-wrap">
          <div className="lxb-flow__grid" data-reveal-group>
            {FLOW.map((item) => (
              <article className="lxb-flow__cell" key={item.step} data-reveal>
                <h2 className="lxb-flow__step">{item.step}</h2>
                <p className="lxb-flow__copy">{item.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="lxb-intro">
        <div className="lx-wrap lxb-intro__grid">
          <p className="lxc-eyebrow lxc-eyebrow--light" data-reveal>
            <span aria-hidden="true" className="lxc-eyebrow__mark" />
            {editorial.intro.eyebrow}
          </p>

          <div className="lxb-intro__lead" data-reveal-group>
            <h2 className="lxb-intro__title" data-reveal>
              {editorial.intro.title}
            </h2>
            <div className="lxb-intro__body">
              {editorial.intro.body.map((paragraph) => (
                <p key={paragraph} data-reveal>
                  {paragraph}
                </p>
              ))}
              {editorial.intro.link ? (
                <p data-reveal>
                  <Link href={editorial.intro.link.href} className="lxc-arrow-link">
                    {editorial.intro.link.label}
                    <span aria-hidden="true">→</span>
                  </Link>
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="lxb-benefits">
        <div className="lx-wrap">
          <CategoryHead
            eyebrow={editorial.benefits.eyebrow}
            title={editorial.benefits.title}
            lede={editorial.benefits.lede}
            layout="stack"
          />

          <ol className="lxb-stack" data-reveal-group>
            {editorial.benefits.items.map((item) => (
              <li className="lxb-stack__row" key={item.title} data-reveal>
                <span aria-hidden="true" className="lxb-stack__mark" />
                <h3 className="lxb-stack__title">{item.title}</h3>
                <p className="lxb-stack__copy">{item.copy}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="lxb-products" id="models">
        <div className="lx-wrap">
          <header className="lxb-products__head" data-reveal-group>
            <p className="lxc-eyebrow lxc-eyebrow--light" data-reveal>
              <span aria-hidden="true" className="lxc-eyebrow__mark" />
              {editorial.products.eyebrow}
            </p>
            <h2 className="lxc-h2 lxb-products__title" data-reveal>
              {editorial.products.title}
            </h2>
            <p className="lxb-products__lede" data-reveal>
              {editorial.products.lede}
            </p>
          </header>

          {views.length > 0 ? (
            <div className="lxb-plinths" data-reveal-group>
              {views.map((view, index) => (
                <PlinthProduct
                  key={view.card.id}
                  view={view}
                  flip={index % 2 === 1}
                />
              ))}
            </div>
          ) : (
            <div className="lxc-empty lxc-empty--dark" data-reveal>
              <h3 className="lxc-h3">Current availability</h3>
              <p className="lxb-products__lede">
                Talk to LONEX about the storage models available for your
                installation.
              </p>
              <div className="lx-actions">
                <Link href="/contact" className="lx-btn lx-btn--light">
                  Contact LONEX
                </Link>
              </div>
            </div>
          )}

          <div className="lxb-products__foot" data-reveal>
            <p className="lxb-products__note">{editorial.products.enquiryNote}</p>
            <RangeEnquiry
              categoryName={category.name}
              note="Tell us when the building uses the most power."
              email={emailEnquiry}
              phone={settings.contactPhone || null}
            />
          </div>
        </div>
      </section>

      <section className="lxb-community">
        <div
          className="lxb-community__banner"
          data-reveal-image
        >
          <Image
            src={COMMUNITY_IMAGE.src}
            alt={COMMUNITY_IMAGE.alt}
            fill
            sizes="100vw"
            className="lxb-community__image"
          />
          <div aria-hidden="true" className="lxb-community__scrim" />
        </div>

        <div className="lx-wrap lxb-community__inner">
          <CommunityHeading lede={editorial.community.lede} />
          <CommunityPillars pillars={editorial.community.pillars} />
          <p className="lxc-community__note" data-reveal>
            {editorial.community.note}
          </p>
        </div>
      </section>

      <CategoryClose
        title={editorial.closing.title}
        body={editorial.closing.body}
        categoryName={category.name}
        email={emailEnquiry}
      />
    </>
  );
}
