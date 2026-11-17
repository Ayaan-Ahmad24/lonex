import Image from "next/image";
import Link from "next/link";

import { whatsappHref } from "@/lib/public/contact";
import { getProductEditorial } from "@/lib/public/editorial";
import { CategoryClose, CategoryBreadcrumbs, CategoryHead, CommunityHeading, CommunityPillars, RangeEnquiry, RichProductCard } from "./parts";
import type { CategoryPageProps } from "./parts";

const HERO_IMAGE = {
  src: "/images/v2/hero-solar-aerial.webp",
  alt: "Aerial view of a solar array arranged in long rows across open ground",
};

const BENEFIT_IMAGE = {
  src: "/images/v2/city-rooftops.webp",
  alt: "Rooftop solar arrays across a dense city block",
};

const COMMUNITY_IMAGE = {
  src: "/images/v2/generate-installation.webp",
  alt: "A technician connecting cabling beside roof-mounted solar panels",
};

export function SolarPage({
  category,
  products,
  settings,
  editorial,
}: CategoryPageProps) {
  const whatsapp = settings.whatsapp
    ? whatsappHref(settings.whatsapp, "Hello LONEX, I would like to discuss a solar installation.")
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
      <section className="lxc-hero lxc-hero--solar" data-hero>
        <div className="lxc-hero__media" data-hero-media>
          <Image
            src={HERO_IMAGE.src}
            alt={HERO_IMAGE.alt}
            fill
            preload
            sizes="100vw"
            className="lxc-hero__image"
          />
        </div>
        <div aria-hidden="true" className="lxc-hero__scrim" />
        <div aria-hidden="true" className="lxc-hero__rules" />

        <div className="lx-wrap lxc-hero__inner">
          <div className="lxc-hero__top">
            <CategoryBreadcrumbs categoryName={category.name} light />
            <p className="lxc-hero__tag">Solar / Generate</p>
          </div>

          <div className="lxc-hero__body">
            <p className="lxc-eyebrow lxc-eyebrow--light" data-hero-item>
              <span aria-hidden="true" className="lxc-eyebrow__mark" />
              {editorial.eyebrow}
            </p>

            <h1 className="lxc-hero__title">
              {editorial.heroLines.map((line) => (
                <span className="lxc-hero__line" data-hero-line key={line}>
                  {line}
                </span>
              ))}
            </h1>

            <div className="lxc-hero__copy" data-hero-item>
              {editorial.heroIntro.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            <div className="lx-actions lxc-hero__actions" data-hero-item>
              <Link href="#models" className="lx-btn lx-btn--light">
                {editorial.primaryCta}
              </Link>
              <Link href="/contact" className="lx-btn lx-btn--ghost">
                {editorial.secondaryCta}
              </Link>
            </div>
          </div>

          <ul className="lxc-hero__meta" aria-label="Where solar applies">
            {editorial.heroMeta.map((item) => (
              <li key={item} data-hero-item>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="lxc-intro">
        <div className="lx-wrap lxc-intro__grid">
          <p className="lxc-eyebrow" data-reveal>
            <span aria-hidden="true" className="lxc-eyebrow__mark" />
            {editorial.intro.eyebrow}
          </p>

          <div className="lxc-intro__lead" data-reveal-group>
            <h2 className="lxc-intro__title" data-reveal>
              {editorial.intro.title}
            </h2>
            <div className="lxc-intro__body">
              {editorial.intro.body.map((paragraph) => (
                <p key={paragraph} data-reveal>
                  {paragraph}
                </p>
              ))}
              {editorial.intro.link ? (
                <p className="lxc-intro__link" data-reveal>
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

      <section className="lxc-benefits lxc-benefits--solar">
        <div className="lx-wrap">
          <CategoryHead
            eyebrow={editorial.benefits.eyebrow}
            title={editorial.benefits.title}
            lede={editorial.benefits.lede}
          />

          <div className="lxc-benefits__grid">
            <figure
              className="lxc-benefits__media"
              data-reveal-image
            >
              <Image
                src={BENEFIT_IMAGE.src}
                alt={BENEFIT_IMAGE.alt}
                fill
                sizes="(max-width: 900px) 100vw, 40vw"
                className="lxc-benefits__image"
              />
            </figure>

            <ol className="lxc-rows" data-reveal-group>
              {editorial.benefits.items.map((item) => (
                <li className="lxc-row" key={item.title} data-reveal>
                  <span aria-hidden="true" className="lxc-row__mark" />
                  <h3 className="lxc-row__title">{item.title}</h3>
                  <p className="lxc-row__copy">{item.copy}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="lxc-section lxc-products lxc-products--solar" id="models">
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
                Talk to LONEX about the solar models available for your
                installation.
              </p>
              <div className="lx-actions">
                <Link href="/contact" className="lx-btn">
                  Contact LONEX
                </Link>
              </div>
            </div>
          )}

          <div className="lxc-products__foot" data-reveal>
            <p className="lxc-small">{editorial.products.enquiryNote}</p>
            <RangeEnquiry
              categoryName={category.name}
              note="Share the roof, the load and the outcome you have in mind."
              whatsapp={whatsapp}
              phone={settings.contactPhone || null}
            />
          </div>
        </div>
      </section>

      <section className="lxc-community lxc-community--solar">
        <div className="lx-wrap lxc-community__grid">
          <figure
            className="lxc-community__media"
            data-reveal-image
          >
            <Image
              src={COMMUNITY_IMAGE.src}
              alt={COMMUNITY_IMAGE.alt}
              fill
              sizes="(max-width: 900px) 100vw, 38vw"
              className="lxc-community__image"
            />
            <figcaption className="lxc-community__caption">
              Installation is where a plan becomes a system.
            </figcaption>
          </figure>

          <div className="lxc-community__copy" data-reveal-group>
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
