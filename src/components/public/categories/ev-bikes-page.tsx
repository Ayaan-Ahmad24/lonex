import Image from "next/image";
import Link from "next/link";

import { ContentImage } from "@/components/public/content-image";
import { whatsappHref } from "@/lib/public/contact";
import { getProductEditorial } from "@/lib/public/editorial";
import {
  CategoryBreadcrumbs,
  CategoryClose,
  CommunityHeading,
  CommunityPillars,
  ProductPoints,
  RangeEnquiry,
  UseCaseChips,
} from "./parts";
import type { CategoryPageProps } from "./parts";

const HERO_IMAGE = {
  src: "/images/lonex-step-1/move-mobility.webp",
  alt: "An electric bicycle parked at a stainless steel rack in a covered city courtyard",
};

const COMMUNITY_IMAGE = {
  src: "/images/categories/mobility.webp",
  alt: "A rider travelling through a city street past pedestrians",
};

export function EvBikesPage({
  category,
  products,
  settings,
  editorial,
}: CategoryPageProps) {
  const whatsapp = settings.whatsapp
    ? whatsappHref(
        settings.whatsapp,
        "Hello LONEX, I would like to discuss an electric bike.",
      )
    : null;

  const views = products.map((card) => ({
    card,
    editorial: getProductEditorial(
      card.slug,
      card.name,
      card.shortDescription,
      null,
    ),
  }));

  return (
    <>
      <section className="lxe-hero" data-hero>
        <div className="lxe-hero__media" data-hero-media>
          <Image
            src={HERO_IMAGE.src}
            alt={HERO_IMAGE.alt}
            fill
            preload
            sizes="100vw"
            className="lxe-hero__image"
          />
        </div>
        <div aria-hidden="true" className="lxe-hero__wash" />

        <div className="lx-wrap lxe-hero__inner">
          <div className="lxe-hero__top">
            <CategoryBreadcrumbs categoryName={category.name} light />
            <p className="lxe-hero__tag">Mobility / Move</p>
          </div>

          <div className="lxe-plate">
            <p className="lxc-eyebrow" data-hero-item>
              <span aria-hidden="true" className="lxc-eyebrow__mark" />
              {editorial.eyebrow}
            </p>

            <h1 className="lxe-plate__title">
              {editorial.heroLines.map((line) => (
                <span className="lxe-plate__line" data-hero-line key={line}>
                  {line}
                </span>
              ))}
            </h1>

            <div className="lxe-plate__copy" data-hero-item>
              {editorial.heroIntro.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            <div className="lx-actions lxe-plate__actions" data-hero-item>
              <Link href="#models" className="lx-btn">
                {editorial.primaryCta}
              </Link>
              <Link href="/contact" className="lx-btn lx-btn--ghost">
                {editorial.secondaryCta}
              </Link>
            </div>

            <ul className="lxe-plate__meta" aria-label="Where electric bikes apply">
              {editorial.heroMeta.map((item) => (
                <li key={item} data-hero-item>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="lxe-intro">
        <div className="lx-wrap lxe-intro__grid">
          <div className="lxe-intro__lead" data-reveal-group>
            <p className="lxc-eyebrow" data-reveal>
              <span aria-hidden="true" className="lxc-eyebrow__mark" />
              {editorial.intro.eyebrow}
            </p>
            <h2 className="lxe-intro__title" data-reveal>
              {editorial.intro.title}
            </h2>
          </div>

          <div className="lxe-intro__body" data-reveal-group>
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
      </section>

      <section className="lxe-benefits">
        <div className="lx-wrap">
          <header className="lxe-benefits__head" data-reveal-group>
            <p className="lxc-eyebrow" data-reveal>
              <span aria-hidden="true" className="lxc-eyebrow__mark" />
              {editorial.benefits.eyebrow}
            </p>
            <h2 className="lxe-benefits__title" data-reveal>
              {editorial.benefits.title}
            </h2>
            <p className="lxe-benefits__lede" data-reveal>
              {editorial.benefits.lede}
            </p>
          </header>

          <div className="lxe-benefits__grid" data-reveal-group>
            {editorial.benefits.items.map((item) => (
              <article className="lxe-benefit" key={item.title} data-reveal>
                <h3 className="lxe-benefit__title">{item.title}</h3>
                <p className="lxe-benefit__copy">{item.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="lxe-products" id="models">
        <div className="lx-wrap">
          <header className="lxe-products__head" data-reveal-group>
            <p className="lxc-eyebrow" data-reveal>
              <span aria-hidden="true" className="lxc-eyebrow__mark" />
              {editorial.products.eyebrow}
            </p>
            <div className="lxe-products__head-row">
              <h2 className="lxe-products__title" data-reveal>
                {editorial.products.title}
              </h2>
              <p className="lxe-products__lede" data-reveal>
                {editorial.products.lede}
              </p>
            </div>
          </header>

          {views.length > 0 ? (
            <div className="lxe-plates">
              {views.map((view, index) => {
                const { card, editorial: product } = view;

                return (
                  <article
                    className={`lxe-plate-product${
                      index % 2 === 1 ? " lxe-plate-product--flip" : ""
                    }`}
                    key={card.id}
                    data-reveal
                  >
                    <Link
                      href={card.path}
                      className="lxe-plate-product__media"
                      data-product-image
                      aria-label={`View ${card.name}`}
                    >
                      <ContentImage
                        image={card.image}
                        fallbackLabel={`${card.name} image`}
                        sizes="(max-width: 900px) 100vw, 58vw"
                        className="lxe-plate-product__image"
                      />
                      <span className="lxe-plate-product__badge" aria-hidden="true">
                        View product
                        <span>↗</span>
                      </span>
                    </Link>

                    <div className="lxe-plate-product__copy">
                      <p className="lxe-plate-product__tagline">
                        {product.tagline}
                      </p>
                      <h3 className="lxe-plate-product__name">
                        <Link href={card.path}>{card.name}</Link>
                      </h3>
                      <p className="lxe-plate-product__price">
                        {card.priceLabel ?? "Price on inquiry"}
                      </p>
                      <p className="lxe-plate-product__summary">
                        {product.summary}
                      </p>

                      <ProductPoints editorial={product} />

                      <div className="lxe-plate-product__use">
                        <p className="lxc-card__label">Use cases</p>
                        <UseCaseChips cases={product.useCases} />
                      </div>

                      {product.note ? (
                        <p className="lxe-plate-product__note">{product.note}</p>
                      ) : null}

                      <div className="lxe-plate-product__actions">
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
              })}
            </div>
          ) : (
            <div className="lxc-empty" data-reveal>
              <h3 className="lxc-h3">Current availability</h3>
              <p className="lxc-body">
                Talk to LONEX about the electric bikes available for your
                journeys.
              </p>
              <div className="lx-actions">
                <Link href="/contact" className="lx-btn">
                  Contact LONEX
                </Link>
              </div>
            </div>
          )}

          <div className="lxe-products__foot" data-reveal>
            <p className="lxe-products__note">{editorial.products.enquiryNote}</p>
            <RangeEnquiry
              categoryName={category.name}
              note="Tell us the distance, the route and what you need to carry."
              whatsapp={whatsapp}
              phone={settings.contactPhone || null}
            />
          </div>
        </div>
      </section>

      <section className="lxe-community">
        <figure className="lxe-community__media" data-reveal-image>
          <Image
            src={COMMUNITY_IMAGE.src}
            alt={COMMUNITY_IMAGE.alt}
            fill
            sizes="100vw"
            className="lxe-community__image"
          />
          <div aria-hidden="true" className="lxe-community__scrim" />
          <figcaption className="lxe-community__caption">
            The shortest journeys are the ones a neighbourhood feels.
          </figcaption>
        </figure>

        <div className="lxe-community__panel">
          <div className="lx-wrap">
            <CommunityHeading lede={editorial.community.lede} />
            <CommunityPillars pillars={editorial.community.pillars} />
            <p className="lxc-community__note" data-reveal>
              {editorial.community.note}
            </p>
          </div>
        </div>
      </section>

      <CategoryClose
        title={editorial.closing.title}
        body={editorial.closing.body}
        categoryName={category.name}
        whatsapp={whatsapp}
      />
    </>
  );
}
