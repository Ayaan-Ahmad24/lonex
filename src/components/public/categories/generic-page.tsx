import Image from "next/image";
import Link from "next/link";

import { whatsappHref } from "@/lib/public/contact";
import { getProductEditorial } from "@/lib/public/editorial";
import {
  CategoryBreadcrumbs,
  CategoryClose,
  CategoryHead,
  CommunityHeading,
  CommunityPillars,
  RangeEnquiry,
  RichProductCard,
} from "./parts";
import type { CategoryPageProps } from "./parts";

/**
 * A category that the CMS publishes but this build has no bespoke experience
 * for. The composition is deliberately plain: it reads as a considered range
 * page rather than an empty template, and it falls back to a typographic hero
 * when no cover image exists.
 */
export function GenericCategoryPage({
  category,
  products,
  settings,
  editorial,
}: CategoryPageProps) {
  const whatsapp = settings.whatsapp
    ? whatsappHref(
        settings.whatsapp,
        `Hello LONEX, I would like to discuss ${category.name}.`,
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
      <section
        className={`lxg-hero${category.cover ? " lxg-hero--media" : ""}`}
        data-hero
      >
        {category.cover ? (
          <>
            <div className="lxg-hero__media" data-hero-media>
              <Image
                src={category.cover.url}
                alt={category.cover.alt || category.name}
                fill
                preload
                sizes="100vw"
                className="lxg-hero__image"
              />
            </div>
            <div aria-hidden="true" className="lxg-hero__veil" />
          </>
        ) : null}

        <div className="lx-wrap lxg-hero__inner">
          <div className="lxg-hero__top">
            <CategoryBreadcrumbs categoryName={category.name} light={Boolean(category.cover)} />
          </div>

          <div className="lxg-hero__body">
            <p
              className={`lxc-eyebrow${category.cover ? " lxc-eyebrow--light" : ""}`}
              data-hero-item
            >
              <span aria-hidden="true" className="lxc-eyebrow__mark" />
              {editorial.eyebrow}
            </p>

            <h1 className="lxg-hero__title">
              {editorial.heroLines.map((line) => (
                <span className="lxg-hero__line" data-hero-line key={line}>
                  {line}
                </span>
              ))}
            </h1>

            <div className="lxg-hero__copy" data-hero-item>
              {editorial.heroIntro.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            <div className="lx-actions lxg-hero__actions" data-hero-item>
              <Link
                href="#models"
                className={category.cover ? "lx-btn lx-btn--light" : "lx-btn"}
              >
                {editorial.primaryCta}
              </Link>
              <Link href="/contact" className="lx-btn lx-btn--ghost">
                {editorial.secondaryCta}
              </Link>
            </div>
          </div>

          <ul className="lxg-hero__meta" data-hero-item>
            {editorial.heroMeta.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="lxg-intro">
        <div className="lx-wrap lxg-intro__grid">
          <div className="lxg-intro__lead" data-reveal-group>
            <p className="lxc-eyebrow" data-reveal>
              <span aria-hidden="true" className="lxc-eyebrow__mark" />
              {editorial.intro.eyebrow}
            </p>
            <h2 className="lxg-intro__title" data-reveal>
              {editorial.intro.title}
            </h2>
          </div>

          <div className="lxg-intro__body" data-reveal-group>
            {editorial.intro.body.map((paragraph) => (
              <p key={paragraph} data-reveal>
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="lxg-benefits">
        <div className="lx-wrap">
          <CategoryHead
            eyebrow={editorial.benefits.eyebrow}
            title={editorial.benefits.title}
            lede={editorial.benefits.lede}
            layout="stack"
          />

          <ul className="lxg-benefits__grid" data-reveal-group>
            {editorial.benefits.items.map((item) => (
              <li className="lxg-benefit" key={item.title} data-reveal>
                <h3 className="lxg-benefit__title">{item.title}</h3>
                <p className="lxg-benefit__copy">{item.copy}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="lxg-products" id="models">
        <div className="lx-wrap">
          <CategoryHead
            eyebrow={editorial.products.eyebrow}
            title={editorial.products.title}
            lede={editorial.products.lede}
          />

          {views.length > 0 ? (
            <div className="lxc-cards" data-reveal-group>
              {views.map((view) => (
                <RichProductCard key={view.card.id} view={view} />
              ))}
            </div>
          ) : (
            <div className="lxc-empty" data-reveal>
              <h3 className="lxc-h3">Current availability</h3>
              <p className="lxc-body">
                Talk to LONEX about the models available in this range.
              </p>
              <div className="lx-actions">
                <Link href="/contact" className="lx-btn">
                  Contact LONEX
                </Link>
              </div>
            </div>
          )}

          <div className="lxg-products__foot" data-reveal>
            <p className="lxg-products__note">
              {editorial.products.enquiryNote}
            </p>
            <RangeEnquiry
              categoryName={category.name}
              note="Tell us what you need the system to do."
              whatsapp={whatsapp}
              phone={settings.contactPhone || null}
            />
          </div>
        </div>
      </section>

      <section className="lxg-community">
        <div className="lx-wrap lxg-community__grid">
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
        whatsapp={whatsapp}
      />
    </>
  );
}
