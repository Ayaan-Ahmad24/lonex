import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { connection } from "next/server";

import { PageMotion } from "@/components/public/page-motion";
import {
  formatPhone,
  telHref,
} from "@/lib/public/contact";
import { generalEnquiry } from "@/lib/public/enquiries";
import { createPageMetadata } from "@/lib/public/seo";
import { loadPublicSettings } from "@/lib/public/settings";
import {
  CLOSING,
  DIRECT,
  ENQUIRY,
  HERO,
  LOCATION,
} from "./content";
import { EnquiryForm } from "./enquiry-form";
import "../../home.css";
import "../../contact.css";

export async function generateMetadata(): Promise<Metadata> {
  await connection();
  const settings = await loadPublicSettings();
  return createPageMetadata({
    settings,
    title: "Contact",
    description:
      "Talk to LONEX about solar, battery storage and electric mobility — by phone, email, or an enquiry prepared on this page.",
    path: "/contact",
  });
}

type ContactRow = {
  kind: "phone" | "office" | "email";
  index: string;
  label: string;
  value: string;
  meta: string;
  href: string | null;
  action: string;
  external: boolean;
};

/**
 * The configured maps URL is only the Google Maps homepage, which would drop
 * the visitor on an empty map. Fall back to a search for the confirmed address.
 */
function resolveMapHref(address: string, configured: string): string | null {
  const trimmed = configured.trim();

  if (
    trimmed &&
    !/^https?:\/\/(www\.)?maps\.google\.com\/?$/i.test(trimmed)
  ) {
    return trimmed;
  }

  if (address.trim()) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      address.trim(),
    )}`;
  }

  return null;
}

export default async function ContactPage() {
  await connection();
  const settings = await loadPublicSettings();

  const emailLink = generalEnquiry(settings.contactEmail);
  const mapHref = resolveMapHref(settings.address, settings.googleMapsUrl);
  const phoneHref = settings.contactPhone
    ? telHref(settings.contactPhone)
    : null;

  const rows: ContactRow[] = [];

  if (settings.contactPhone && phoneHref) {
    rows.push({
      kind: "phone",
      index: "",
      label: "Phone",
      value: formatPhone(settings.contactPhone),
      meta: "Calls to the Lahore office",
      href: phoneHref,
      action: "Call",
      external: false,
    });
  }

  // WhatsApp is intentionally not exposed on the public site. The stored
  // number remains in the CMS and can be re-enabled through settings.
  if (settings.contactEmail && emailLink) {
    rows.push({
      kind: "email",
      index: "",
      label: "Email",
      value: settings.contactEmail,
      meta: "Written enquiries",
      href: emailLink,
      action: "Write",
      external: false,
    });
  }

  if (settings.locationEnabled && settings.address) {
    rows.push({
      kind: "office",
      index: "",
      label: "Office",
      value: settings.address,
      meta: mapHref ? "Map opens in Google Maps" : "Lahore, Pakistan",
      href: mapHref,
      action: "Map",
      external: true,
    });
  }

  rows.forEach((row, position) => {
    row.index = String(position + 1).padStart(2, "0");
  });

  const [street, ...localityParts] = settings.address.split(",");
  const locality = localityParts.join(",").trim();

  return (
    <div className="lx-page lxct-page">
      <PageMotion>
        {/* Hero ------------------------------------------------------- */}
        <section className="lxct-hero" data-hero>
          <div className="lx-wrap lxct-hero__grid">
            <div className="lxct-hero__copy">
              <nav aria-label="Breadcrumb" className="lx-crumbs lxct-crumbs">
                <Link href="/">Home</Link>
                <span aria-hidden="true">/</span>
                <span aria-current="page">Contact</span>
              </nav>

              <p className="lxct-eyebrow" data-hero-item>
                {HERO.eyebrow}
              </p>

              <h1 className="lxct-hero__title">
                <span className="lxct-hero__line" data-hero-line>
                  {HERO.lineOne}
                </span>{" "}
                <span className="lxct-hero__line" data-hero-line>
                  {HERO.lineTwo} <em>{HERO.lineTwoAccent}</em>
                </span>
              </h1>

              <div className="lxct-hero__intro" data-hero-item>
                {HERO.intro.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>

              <div className="lxct-hero__actions" data-hero-item>
                {emailLink ? (
                  <a
                    href={emailLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="lxct-btn lxct-btn--red"
                  >
                    Send an Email Enquiry
                    <span aria-hidden="true">→</span>
                  </a>
                ) : null}
                {phoneHref ? (
                  <a href={phoneHref} className="lxct-btn lxct-btn--outline">
                    Call {formatPhone(settings.contactPhone)}
                  </a>
                ) : null}
                <Link href="#enquiry" className="lxct-hero__form-link">
                  Use the form <span aria-hidden="true">↓</span>
                </Link>
              </div>

              <dl className="lxct-hero__facts" data-hero-item>
                {HERO.facts
                  .filter(
                    (fact) =>
                      fact.label !== "Based" || settings.locationEnabled,
                  )
                  .map((fact) => (
                    <div key={fact.label}>
                      <dt>{fact.label}</dt>
                      <dd>{fact.value}</dd>
                    </div>
                  ))}
              </dl>
            </div>

            <figure className="lxct-hero__figure" data-hero-item>
              <div className="lxct-hero__media" data-hero-media>
                <Image
                  src="/images/lonex-generated-images/lifestyle/family-energy.png"
                  alt={HERO.imageAlt}
                  fill
                  preload
                  sizes="(max-width: 900px) 100vw, 46vw"
                  className="lxct-hero__image"
                />
                <span className="lxct-hero__stamp" aria-hidden="true">
                  LONEX
                  {settings.locationEnabled && <span>Lahore</span>}
                </span>
                <div className="lxct-hero__inset">
                  <Image
                    src="/images/lonex-generated-images/lifestyle/ev-charging.webp"
                    alt={HERO.insetAlt}
                    fill
                    sizes="200px"
                    className="lxct-hero__inset-image"
                  />
                </div>
              </div>
              <figcaption className="lxct-hero__caption">
                <span className="lxct-hero__caption-index" aria-hidden="true">
                  {HERO.captionIndex}
                </span>
                <span>{HERO.caption}</span>
              </figcaption>
            </figure>
          </div>
        </section>

        {/* Direct contact --------------------------------------------- */}
        <section className="lxct-direct" aria-labelledby="direct-title">
          <div className="lx-wrap">
            <div className="lxct-direct__head" data-reveal-group>
              <div data-reveal>
                <p className="lxct-eyebrow">{DIRECT.eyebrow}</p>
                <h2 className="lxct-h2" id="direct-title">
                  {DIRECT.title}
                </h2>
              </div>
              <p className="lxct-direct__intro" data-reveal>
                {DIRECT.intro}
              </p>
            </div>

            <dl className="lxct-register" data-reveal-group>
              {rows.map((row) => (
                <div
                  key={row.kind}
                  className={`lxct-register__row lxct-register__row--${row.kind}`}
                  data-reveal
                >
                  <dt>
                    <span aria-hidden="true" className="lxct-register__index">
                      {row.index}
                    </span>
                    {row.label}
                  </dt>
                  <dd className="lxct-register__detail">
                    {row.href && row.kind !== "office" ? (
                      <a
                        href={row.href}
                        className="lxct-register__value"
                        {...(row.external
                          ? {
                              target: "_blank",
                              rel: "noopener noreferrer",
                            }
                          : {})}
                      >
                        {row.value}
                      </a>
                    ) : (
                      <span className="lxct-register__value">{row.value}</span>
                    )}
                    <span className="lxct-register__meta">{row.meta}</span>
                  </dd>
                  <dd className="lxct-register__action-cell">
                    {row.href ? (
                      <a
                        href={row.href}
                        className="lxct-register__action"
                        {...(row.external
                          ? {
                              target: "_blank",
                              rel: "noopener noreferrer",
                            }
                          : {})}
                      >
                        {row.action}
                        <span aria-hidden="true">
                          {row.external ? "↗" : "→"}
                        </span>
                      </a>
                    ) : null}
                  </dd>
                </div>
              ))}
            </dl>

            <p className="lxct-direct__note" data-reveal>
              {DIRECT.note}
            </p>
          </div>
        </section>

        {/* Enquiry ---------------------------------------------------- */}
        <section
          id="enquiry"
          className="lxct-enquiry"
          aria-labelledby="enquiry-title"
        >
          <div className="lx-wrap lxct-enquiry__grid" data-reveal-group>
            <div className="lxct-enquiry__aside" data-reveal>
              <p className="lxct-eyebrow">{ENQUIRY.eyebrow}</p>
              <h2 className="lxct-enquiry__title" id="enquiry-title">
                {ENQUIRY.title}
              </h2>
              <p className="lxct-enquiry__intro">{ENQUIRY.intro}</p>

              <ol className="lxct-steps">
                {ENQUIRY.steps.map((step) => (
                  <li key={step.index}>
                    <span className="lxct-steps__index">{step.index}</span>
                    <div>
                      <h3 className="lxct-steps__title">{step.title}</h3>
                      <p className="lxct-steps__copy">{step.copy}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="lxct-enquiry__form" data-reveal>
              <EnquiryForm
                email={settings.contactEmail}
                phone={settings.contactPhone}
              />
            </div>
          </div>
        </section>

        {/* Location --------------------------------------------------- */}
        {settings.locationEnabled && (
          <section
            id="location"
            className="lxct-location"
            aria-labelledby="location-title"
          >
            <div className="lx-wrap lxct-location__grid" data-reveal-group>
              <div className="lxct-location__copy" data-reveal>
                <p className="lxct-eyebrow">{LOCATION.eyebrow}</p>
                <h2 className="lxct-location__title" id="location-title">
                  {LOCATION.title}
                </h2>
                <p className="lxct-location__intro">{LOCATION.intro}</p>
              </div>

              <div className="lxct-location__plate" data-reveal>
                <div className="lxct-location__plate-head">
                  <span>Office address</span>
                  <span aria-hidden="true" className="lxct-location__mark">
                    <span />
                  </span>
                </div>

                <address className="lxct-location__address">
                  <span className="lxct-location__street">{street}</span>{" "}
                  {locality ? (
                    <span className="lxct-location__locality">{locality}</span>
                  ) : null}
                </address>

                <div className="lxct-location__actions">
                  {mapHref ? (
                    <a
                      href={mapHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="lxct-btn lxct-btn--dark"
                    >
                      {LOCATION.mapLabel}
                      <span aria-hidden="true">↗</span>
                    </a>
                  ) : null}
                  {phoneHref ? (
                    <a href={phoneHref} className="lxct-link">
                      Call {formatPhone(settings.contactPhone)}
                    </a>
                  ) : null}
                </div>
                <p className="lxct-location__note">{LOCATION.mapNote}</p>
              </div>
            </div>
          </section>
        )}

        {/* Closing ---------------------------------------------------- */}
        <section className="lxct-close" aria-labelledby="closing-title">
          <div className="lxct-close__media" data-reveal-image>
            <Image
              src="/images/lonex-generated-images/hero/hero-solar-home-wide.webp"
              alt=""
              fill
              sizes="100vw"
              className="lxct-close__image"
            />
          </div>
          <div aria-hidden="true" className="lxct-close__scrim" />

          <div className="lx-wrap lxct-close__grid" data-reveal-group>
            <div data-reveal>
              <p className="lxct-eyebrow lxct-eyebrow--light">
                {CLOSING.eyebrow}
              </p>
              <h2 className="lxct-close__title" id="closing-title">
                {CLOSING.title}
              </h2>
              <p className="lxct-close__copy">{CLOSING.copy}</p>
            </div>

            <div className="lxct-close__actions" data-reveal>
              {emailLink ? (
                <a
                  href={emailLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="lxct-btn lxct-btn--light"
                >
                  Send an Email Enquiry
                  <span aria-hidden="true">→</span>
                </a>
              ) : null}
              {phoneHref ? (
                <a
                  href={phoneHref}
                  className="lxct-btn lxct-btn--outline-light"
                >
                  Call the office
                </a>
              ) : null}
            </div>
          </div>
        </section>
      </PageMotion>
    </div>
  );
}

export const instant = false;
