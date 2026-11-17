import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { connection } from "next/server";

import { PageMotion } from "@/components/public/page-motion";
import { SellerCard } from "@/components/public/seller-card";
import { formatInternational, formatPhone, whatsappHref } from "@/lib/public/contact";
import { createPageMetadata } from "@/lib/public/seo";
import { loadPublicSettings } from "@/lib/public/settings";
import { listPublishedSellers, listSellerCities } from "@/lib/public/queries";
import {
  BEFORE_PURCHASE,
  LISTING_FIELDS,
  RANGE_LINKS,
  SELLER_WHY,
} from "./content";
import "../../home.css";
import "../../directory.css";

type SearchParams = { city?: string };

const HERO_IMAGE = {
  src: "/images/lonex-generated-images/editorial/city-solar.webp",
  alt: "A city skyline at golden hour seen beyond a rooftop solar array",
};

export async function generateMetadata(): Promise<Metadata> {
  await connection();
  const settings = await loadPublicSettings();
  return createPageMetadata({
    settings,
    title: "Authorized sellers",
    description:
      "Find authorized LONEX sellers, their locations and contact details, or contact LONEX directly for help.",
    path: "/authorized-sellers",
  });
}

export default async function AuthorizedSellersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await connection();

  const sp = await searchParams;
  const city = sp?.city?.trim() || undefined;

  const [settings, sellers, cities] = await Promise.all([
    loadPublicSettings(),
    listPublishedSellers(city),
    listSellerCities(),
  ]);

  const whatsapp = settings.whatsapp
    ? whatsappHref(
        settings.whatsapp,
        "Hello LONEX, I would like help finding an authorized seller.",
      )
    : null;

  const emptyTitle = city
    ? `No authorized sellers are listed in ${city} at present.`
    : "No confirmed sellers are listed at present.";

  return (
    <div className="lx-page">
      <PageMotion>
        {/* Hero ------------------------------------------------------- */}
        <section className="lxs-hero" data-hero>
          <div className="lxs-hero__media" data-hero-media>
            <Image
              src={HERO_IMAGE.src}
              alt={HERO_IMAGE.alt}
              fill
              preload
              sizes="100vw"
              className="lxs-hero__image"
            />
          </div>
          <div aria-hidden="true" className="lxs-hero__scrim" />
          <div aria-hidden="true" className="lxs-hero__rules" />

          <div className="lx-wrap lxs-hero__inner">
            <nav aria-label="Breadcrumb" className="lxs-crumbs">
              <Link href="/">Home</Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page">Authorized sellers</span>
            </nav>

            <div className="lxs-hero__copy">
              <p className="lxs-eyebrow lxs-eyebrow--light" data-hero-item>
                Authorized network
              </p>

              <h1 className="lxs-hero__title">
                <span className="lxs-hero__line" data-hero-line>
                  Find Your LONEX
                </span>{" "}
                <span className="lxs-hero__line" data-hero-line>
                  <em>Connection.</em>
                </span>
              </h1>

              <p className="lxs-hero__intro" data-hero-item>
                LONEX appoints sellers to represent its range. This directory
                lists the businesses that have been confirmed, with the contact
                details LONEX has published. If your city is not listed, speak
                to LONEX directly and we will explain the current position.
              </p>

              <div className="lxs-hero__actions" data-hero-item>
                <Link href="/contact" className="lxv-btn lxv-btn--red">
                  Contact LONEX
                  <span aria-hidden="true">→</span>
                </Link>
                <Link href="#range" className="lxv-btn lxv-btn--ghost-light">
                  Explore the range
                </Link>
              </div>

              <dl className="lxs-hero__facts" data-hero-item>
                <div>
                  <dt>Directory</dt>
                  <dd>Confirmed listings</dd>
                </div>
                <div>
                  <dt>Contact</dt>
                  <dd>Direct to the seller</dd>
                </div>
                <div>
                  <dt>Listings</dt>
                  <dd>Published by LONEX</dd>
                </div>
              </dl>
            </div>

            <div aria-hidden="true" className="lxs-hero__stamp" data-hero-item>
              <span>Authorized seller directory</span>
              <span className="lxs-hero__stamp-rule" />
              <span>Solar · Storage · Mobility</span>
            </div>
          </div>
        </section>

        {/* Directory -------------------------------------------------- */}
        <section id="directory" className="lxs-directory lxs-section">
          <div className="lx-wrap">
            <div className="lxs-head" data-reveal-group>
              <div data-reveal>
                <p className="lxs-eyebrow" data-reveal>
                  Directory
                </p>
                <h2 className="lxs-h2" data-reveal>
                  Authorized sellers.
                </h2>
              </div>

              <div className="lxs-head__aside" data-reveal>
                <p>
                  Every business listed here has been appointed by LONEX and
                  the contact details shown are the ones LONEX has confirmed. A
                  listing is a starting point, not a substitute for a written
                  agreement.
                </p>
              </div>
            </div>

            {cities.length > 1 ? (
              <nav aria-label="Filter by city" className="lxs-filter">
                <Link
                  href="/authorized-sellers"
                  aria-current={!city ? "page" : undefined}
                  className="lxs-filter__item"
                >
                  All cities
                </Link>
                {cities.map((item) => (
                  <Link
                    key={item}
                    href={`/authorized-sellers?city=${encodeURIComponent(item)}`}
                    aria-current={city === item ? "page" : undefined}
                    className="lxs-filter__item"
                  >
                    {item}
                  </Link>
                ))}
              </nav>
            ) : null}

            {sellers.length > 0 ? (
              <div className="lxs-list">
                <div aria-hidden="true" className="lxs-list__head">
                  <span>Business</span>
                  <span>Address</span>
                  <span>Contact</span>
                  <span>Actions</span>
                </div>
                {sellers.map((seller) => (
                  <SellerCard key={seller.id} seller={seller} />
                ))}
              </div>
            ) : (
              <div className="lxs-empty">
                <div className="lxs-empty__copy">
                  <p className="lxs-empty__kicker">
                    <span aria-hidden="true" className="lxs-empty__dot" />
                    Directory status
                  </p>
                  <h3 className="lxs-empty__title">{emptyTitle}</h3>
                  <p className="lxs-empty__body">
                    A business appears here only after LONEX has appointed it
                    and confirmed its details. Until then, this space stays
                    quiet rather than showing a listing that cannot be
                    confirmed.
                  </p>

                  <div className="lxs-empty__fields">
                    <p className="lxs-empty__label">What a listing includes</p>
                    <ul>
                      {LISTING_FIELDS.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  {city ? (
                    <Link
                      href="/authorized-sellers"
                      className="lxs-empty__reset"
                    >
                      View all cities
                      <span aria-hidden="true">→</span>
                    </Link>
                  ) : null}
                </div>

                <aside
                  id="contact"
                  aria-label="Contact LONEX"
                  className="lxs-empty__aside"
                >
                  <p className="lxs-empty__tag">Direct assistance</p>
                  <h3 className="lxs-empty__aside-title">
                    Looking for the right place to begin?
                  </h3>
                  <p className="lxs-empty__aside-copy">
                    Speak to LONEX directly. Tell us what you are looking for
                    and where you are. We can help with product enquiries and
                    the current seller position in your city.
                  </p>

                  <div className="lxs-empty__actions">
                    <Link href="/contact" className="lxv-btn lxv-btn--red">
                      Contact LONEX
                    </Link>
                    {whatsapp ? (
                      <a
                        href={whatsapp}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="lxv-btn lxv-btn--outline"
                      >
                        WhatsApp
                      </a>
                    ) : null}
                  </div>

                  <dl className="lxs-empty__details">
                    {settings.contactPhone ? (
                      <div>
                        <dt>Phone</dt>
                        <dd>
                          <a
                            href={`tel:${settings.contactPhone.replace(/[^\d+]/g, "")}`}
                          >
                            {formatPhone(settings.contactPhone)}
                          </a>
                        </dd>
                      </div>
                    ) : null}
                    {settings.address ? (
                      <div>
                        <dt>Office</dt>
                        <dd>{settings.address}</dd>
                      </div>
                    ) : null}
                  </dl>
                </aside>
              </div>
            )}
          </div>
        </section>

        {/* Why an authorized seller ---------------------------------- */}
        <section className="lxs-why lxs-section">
          <div className="lx-wrap lxs-why__grid" data-reveal-group>
            <div className="lxs-why__head" data-reveal>
              <p className="lxs-eyebrow" data-reveal>
                The difference
              </p>
              <h2 className="lxs-h2" data-reveal>
                Why buy through an
                <br />
                authorized seller.
              </h2>
              <p className="lxs-why__note" data-reveal>
                A directory entry is a confirmation of a business relationship.
                It is not a warranty, an authenticity certificate or a promise of
                after-sales service.
              </p>
            </div>

            <div className="lxs-why__points" data-reveal>
              {SELLER_WHY.map((point, index) => (
                <article key={point.title} className="lxs-why__point" data-reveal>
                  <span className="lxs-why__index">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="lxs-why__title">{point.title}</h3>
                    <p className="lxs-why__copy">{point.copy}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Before purchase ------------------------------------------- */}
        <section className="lxs-before lxs-section lxs-section--tight">
          <div className="lx-wrap">
            <div className="lxs-head lxs-head--stack" data-reveal-group>
              <div data-reveal>
                <p className="lxs-eyebrow" data-reveal>
                  Before you purchase
                </p>
                <h2 className="lxs-h2" data-reveal>
                  Four things to
                  <br />
                  confirm first.
                </h2>
              </div>
              <p className="lxs-head__aside lxs-head__aside--plain" data-reveal>
                These checks apply to any purchase, from any seller. They take a
                few minutes and they keep the decision in your hands.
              </p>
            </div>

            <ol className="lxs-checks" data-reveal-group>
              {BEFORE_PURCHASE.map((item, index) => (
                <li key={item.title} className="lxs-check" data-reveal>
                  <span className="lxs-check__index">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="lxs-check__title">{item.title}</h3>
                  <p className="lxs-check__copy">{item.copy}</p>
                </li>
              ))}
            </ol>

            <div className="lxs-before__foot" data-reveal>
              <p>
                A listing confirms the seller and the contact details. It does
                not replace a written commercial agreement or a check of the
                individual unit.
              </p>
              <Link href="/verify" className="lxv-btn lxv-btn--outline">
                Verify a model code
              </Link>
            </div>
          </div>
        </section>

        {/* Range ------------------------------------------------------ */}
        <section id="range" className="lxs-range lxs-section">
          <div className="lx-wrap">
            <div className="lxs-head" data-reveal-group>
              <div data-reveal>
                <p className="lxs-eyebrow" data-reveal>
                  Explore the range
                </p>
                <h2 className="lxs-h2" data-reveal>
                  Three categories.
                  <br />
                  One connected range.
                </h2>
              </div>
              <p className="lxs-head__aside lxs-head__aside--plain" data-reveal>
                The published LONEX range is organised into three categories.
                Start with the one that fits the property or the journey.
              </p>
            </div>

            <div className="lxs-range__grid" data-reveal-group>
              {RANGE_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="lxs-range__card"
                  data-reveal
                >
                  <span className="lxs-range__media">
                    <Image
                      src={item.image}
                      alt={item.alt}
                      fill
                      sizes="(max-width: 767px) 100vw, 33vw"
                      className="lxs-range__image"
                    />
                  </span>
                  <span className="lxs-range__body">
                    <span className="lxs-range__name">{item.name}</span>
                    <span className="lxs-range__line">{item.line}</span>
                    <span className="lxs-range__more">
                      Explore
                      <span aria-hidden="true">→</span>
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Close ----------------------------------------------------- */}
        <section className="lxs-close">
          <div className="lx-wrap lxs-close__grid" data-reveal-group>
            <div data-reveal>
              <p className="lxs-eyebrow lxs-eyebrow--light">Next step</p>
              <h2 className="lxs-close__title">
                Start with a
                <br />
                conversation.
              </h2>
              <p className="lxs-close__copy">
                Whether you are choosing a model, checking a seller or planning
                an installation, the quickest route is to ask. Tell us the
                property, the route or the model, and we will point you to the
                right next step.
              </p>
            </div>

            <div className="lxs-close__contact" data-reveal>
              <div className="lxs-close__actions">
                <Link href="/contact" className="lxv-btn lxv-btn--light">
                  Contact LONEX
                </Link>
                {whatsapp ? (
                  <a
                    href={whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="lxv-btn lxv-btn--ghost-light"
                  >
                    WhatsApp
                  </a>
                ) : null}
              </div>

              <dl className="lxs-close__details">
                {settings.contactPhone ? (
                  <div>
                    <dt>Phone</dt>
                    <dd>
                      <a
                        href={`tel:${settings.contactPhone.replace(/[^\d+]/g, "")}`}
                      >
                        {formatPhone(settings.contactPhone)}
                      </a>
                    </dd>
                  </div>
                ) : null}
                {settings.whatsapp && whatsapp ? (
                  <div>
                    <dt>WhatsApp</dt>
                    <dd>
                      <a
                        href={whatsapp}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {formatInternational(settings.whatsapp)}
                      </a>
                    </dd>
                  </div>
                ) : null}
                {settings.address ? (
                  <div>
                    <dt>Office</dt>
                    <dd>{settings.address}</dd>
                  </div>
                ) : null}
              </dl>
            </div>
          </div>
        </section>
      </PageMotion>
    </div>
  );
}

export const instant = false;
