import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { connection } from "next/server";

import { PageMotion } from "@/components/public/page-motion";
import { formatPhone, telHref } from "@/lib/public/contact";
import { createPageMetadata } from "@/lib/public/seo";
import { loadPublicSettings } from "@/lib/public/settings";
import {
  APPROACH,
  COMMITMENTS,
  PILLARS,
  RANGE_LINKS,
  STORY,
} from "./content";
import "../../home.css";
import "../../about.css";

export async function generateMetadata(): Promise<Metadata> {
  await connection();
  const settings = await loadPublicSettings();
  return createPageMetadata({
    settings,
    title: "About LONEX",
    description:
      "LONEX brings solar generation, battery storage and electric mobility into one connected view — products chosen for real use and explained with clarity.",
    path: "/about",
  });
}

export default async function AboutPage() {
  await connection();
  const settings = await loadPublicSettings();
  const [generate, store, move] = PILLARS;
  const phoneHref = settings.contactPhone
    ? telHref(settings.contactPhone)
    : null;

  return (
    <div className="lx-page lxa-page">
      <PageMotion>
        {/* Hero ------------------------------------------------------- */}
        <section className="lxa-hero" data-hero>
          <div className="lx-wrap lxa-hero__grid">
            <div className="lxa-hero__copy">
              <nav aria-label="Breadcrumb" className="lx-crumbs lxa-crumbs">
                <Link href="/">Home</Link>
                <span aria-hidden="true">/</span>
                <span aria-current="page">About</span>
              </nav>

              <p className="lxa-eyebrow" data-hero-item>
                About LONEX
              </p>

              <h1 className="lxa-hero__title">
                <span className="lxa-hero__line" data-hero-line>
                  One current.
                </span>{" "}
                <span className="lxa-hero__line" data-hero-line>
                  <em>Three directions.</em>
                </span>
              </h1>

              <div className="lxa-hero__intro" data-hero-item>
                <p>
                  LONEX is an energy brand built around the way power actually
                  reaches a home: sunlight a roof can collect, a battery that
                  keeps it available, and an electric ride that turns it into
                  movement. We bring those three needs into one conversation, so
                  a decision about energy is made with the whole picture in
                  view.
                </p>
                <p>
                  Based in Lahore, our work spans solar generation, battery
                  storage and electric mobility — building the range,
                  explaining its limits, and helping each customer find the
                  combination that fits.
                </p>
              </div>

              <div className="lxa-hero__actions" data-hero-item>
                <Link href="#pillars" className="lxa-btn lxa-btn--red">
                  Explore the range
                  <span aria-hidden="true">→</span>
                </Link>
                <Link href="/contact" className="lxa-btn lxa-btn--outline">
                  Contact LONEX
                </Link>
              </div>

              <dl className="lxa-hero__facts" data-hero-item>
                <div>
                  <dt>Range</dt>
                  <dd>Generate · Store · Move</dd>
                </div>
                <div>
                  <dt>Based</dt>
                  <dd>Lahore, Pakistan</dd>
                </div>
                <div>
                  <dt>Approach</dt>
                  <dd>Clarity before choice</dd>
                </div>
              </dl>
            </div>

            <figure className="lxa-hero__figure" data-hero-item>
              <div className="lxa-hero__media">
                <Image
                  src="/images/about2nd.png"
                  alt="A house with solar panels across its terracotta roof, surrounded by trees beneath a blue sky"
                  fill
                  preload
                  sizes="(max-width: 900px) 100vw, 46vw"
                  className="lxa-hero__image"
                />
              </div>
              <figcaption className="lxa-hero__caption">
                <span className="lxa-hero__caption-index">01</span>
                <span>Rooftop solar, in detail</span>
              </figcaption>
            </figure>
          </div>
        </section>

        {/* Our story -------------------------------------------------- */}
        <section id="story" className="lxa-story lxa-section">
          <div className="lx-wrap">
            <div className="lxa-story__head" data-reveal-group>
              <div data-reveal>
                <p className="lxa-eyebrow">Our story</p>
                <h2 className="lxa-story__title">
                  Energy is a system,
                  <br />
                  <em>not a shelf.</em>
                </h2>
              </div>

              <p className="lxa-story__lede" data-reveal>
                {STORY.intro}
              </p>
            </div>

            <div className="lxa-story__grid">
              <div className="lxa-story__body" data-reveal-group>
                <p data-reveal>{STORY.vision}</p>
                <p data-reveal>{STORY.mark}</p>
              </div>

              <aside className="lxa-story__note" data-reveal>
                <p className="lxa-story__note-label">The loop</p>
                <ol className="lxa-story__chain">
                  <li>
                    <span>01</span>
                    Generate
                  </li>
                  <li>
                    <span>02</span>
                    Store
                  </li>
                  <li>
                    <span>03</span>
                    Move
                  </li>
                </ol>
                <p className="lxa-story__note-copy">
                  The same electricity, at three points in its life.
                </p>
              </aside>
            </div>
          </div>

          <figure className="lxa-story__figure">
            <div className="lxa-story__frame" data-reveal-image>
              <Image
                src="/images/v2/city-rooftops.webp"
                alt="An aerial view of city rooftops with solar arrays among terracotta tiles"
                fill
                sizes="100vw"
                className="lxa-story__image"
              />
            </div>
            <div className="lx-wrap lxa-story__caption" data-reveal>
              <p>A city of small power stations.</p>
              <p className="lxa-story__caption-meta">Distributed generation</p>
            </div>
          </figure>
        </section>

        {/* Product pillars -------------------------------------------- */}
        <section id="pillars" className="lxa-pillars lxa-section">
          <div className="lx-wrap">
            <div className="lxa-pillars__head" data-reveal-group>
              <div data-reveal>
                <p className="lxa-eyebrow">The range</p>
                <h2 className="lxa-h2">
                  Three directions.
                  <br />
                  One connected idea.
                </h2>
              </div>
              <p className="lxa-pillars__intro" data-reveal>
                Each category has its own purpose. None of them works best in
                isolation.
              </p>
            </div>

            <article
              className="lxa-pillar lxa-pillar--generate"
              data-reveal-group
            >
              <Link
                href={generate.href}
                aria-label={`Explore ${generate.name}`}
                className="lxa-pillar__media"
              >
                <Image
                  src={generate.image}
                  alt={generate.alt}
                  fill
                  sizes="(max-width: 900px) 100vw, 58vw"
                  className="lxa-pillar__image"
                />
                <span className="lxa-pillar__tag">{generate.index}</span>
              </Link>

              <div className="lxa-pillar__body" data-reveal>
                <p className="lxa-pillar__kicker">
                  <span>{generate.index}</span>
                  {generate.shortName} / {generate.name}
                </p>
                <h3 className="lxa-pillar__title">{generate.title}</h3>
                <p className="lxa-pillar__copy">{generate.copy}</p>
                <p className="lxa-pillar__detail">{generate.detail}</p>
                <ul className="lxa-pillar__points">
                  {generate.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
                <Link href={generate.href} className="lxa-link">
                  Explore {generate.name}
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </article>
          </div>

          <div className="lxa-pillars__band">
            <div className="lx-wrap">
              <article
                className="lxa-pillar lxa-pillar--store"
                data-reveal-group
              >
                <Link
                  href={store.href}
                  aria-label={`Explore ${store.name}`}
                  className="lxa-pillar__media"
                >
                  <Image
                    src={store.image}
                    alt={store.alt}
                    fill
                    sizes="(max-width: 900px) 100vw, 58vw"
                    className="lxa-pillar__image"
                  />
                  <span className="lxa-pillar__tag">{store.index}</span>
                </Link>

                <div className="lxa-pillar__body" data-reveal>
                  <p className="lxa-pillar__kicker">
                    <span>{store.index}</span>
                    {store.shortName} / {store.name}
                  </p>
                  <h3 className="lxa-pillar__title">{store.title}</h3>
                  <p className="lxa-pillar__copy">{store.copy}</p>
                  <p className="lxa-pillar__detail">{store.detail}</p>
                  <ul className="lxa-pillar__points">
                    {store.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                  <Link href={store.href} className="lxa-link">
                    Explore {store.name}
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </article>
            </div>
          </div>

          <div className="lx-wrap">
            <article className="lxa-pillar lxa-pillar--move" data-reveal-group>
              <Link
                href={move.href}
                aria-label={`Explore ${move.name}`}
                className="lxa-pillar__media"
              >
                <Image
                  src={move.image}
                  alt={move.alt}
                  fill
                  sizes="100vw"
                  className="lxa-pillar__image"
                />
                <span className="lxa-pillar__tag">{move.index}</span>
              </Link>

              <div className="lxa-pillar__body" data-reveal>
                <p className="lxa-pillar__kicker">
                  <span>{move.index}</span>
                  {move.shortName} / {move.name}
                </p>
                <h3 className="lxa-pillar__title">{move.title}</h3>
                <p className="lxa-pillar__copy">{move.copy}</p>
                <p className="lxa-pillar__detail">{move.detail}</p>
                <ul className="lxa-pillar__points">
                  {move.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
                <Link href={move.href} className="lxa-link">
                  Explore {move.name}
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </article>

            <p className="lxa-pillars__chain" data-reveal>
              <span>Generate</span>
              <span aria-hidden="true">→</span>
              <span>Store</span>
              <span aria-hidden="true">→</span>
              <span>Move</span>
              <em>The same electricity, at three points in its life.</em>
            </p>
          </div>
        </section>

        {/* Our approach ------------------------------------------------ */}
        <section id="approach" className="lxa-approach">
          <div className="lx-wrap lxa-approach__grid">
            <div className="lxa-approach__aside">
              <div data-reveal-group>
                <div data-reveal>
                  <p className="lxa-eyebrow lxa-eyebrow--light">
                    Our approach
                  </p>
                  <h2 className="lxa-approach__title">
                    Clarity is part
                    <br />
                    of the product.
                  </h2>
                </div>
                <p className="lxa-approach__intro" data-reveal>
                  A specification can be accurate and still leave someone
                  unsure. Our approach is to make the decision legible: what a
                  product is for, what it needs, and what it will not do.
                </p>
              </div>

              <figure className="lxa-approach__figure" data-reveal-image>
                <Image
                  src="/images/lonex-generated-images/editorial/energy-consultation.webp"
                  alt="Three people reviewing information together in front of a solar array"
                  fill
                  sizes="(max-width: 900px) 100vw, 34vw"
                  className="lxa-approach__image"
                />
                <figcaption>
                  The conversation is part of the system.
                </figcaption>
              </figure>
            </div>

            <div className="lxa-approach__list">
              {APPROACH.map((principle, index) => (
                <article key={principle.title} className="lxa-principle" data-reveal>
                  <span className="lxa-principle__index">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="lxa-principle__title">{principle.title}</h3>
                    <p className="lxa-principle__copy">{principle.copy}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="lx-wrap">
            <div className="lxa-approach__quote" data-reveal>
              <span aria-hidden="true" className="lxa-approach__mark" />
              <p>The right system is the one that fits the life around it.</p>
            </div>
          </div>
        </section>

        {/* Community and responsibility -------------------------------- */}
        <section id="community" className="lxa-community lxa-section">
          <div className="lx-wrap lxa-community__grid">
            <div className="lxa-community__copy">
              <div data-reveal-group>
                <div data-reveal>
                  <p className="lxa-eyebrow">Community &amp; responsibility</p>
                  <h2 className="lxa-h2">
                    Knowledge should travel further than a quotation.
                  </h2>
                </div>
                <p className="lxa-community__lede" data-reveal>
                  Energy decisions are often made with half the picture: a price
                  without context, a specification without a translation, a
                  benefit without its limit. We believe people choose better
                  when the subject is explained clearly, in their terms, before
                  anything is recommended.
                </p>
                <p data-reveal>
                  Our responsibility is practical rather than promotional. It is
                  to describe the range honestly, answer the question behind the
                  question, and leave room for a customer to decide at their own
                  pace. Generation, storage and movement are long-term
                  decisions; the conversation should be worth returning to.
                </p>
              </div>

              <ul className="lxa-commitments">
                {COMMITMENTS.map((commitment, index) => (
                  <li key={commitment.title} data-reveal>
                    <span className="lxa-commitments__index">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="lxa-commitments__title">
                        {commitment.title}
                      </h3>
                      <p className="lxa-commitments__copy">
                        {commitment.copy}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="lxa-community__actions" data-reveal>
                <Link href="/contact" className="lxa-btn lxa-btn--dark">
                  Ask a question
                  <span aria-hidden="true">→</span>
                </Link>
                <Link href="/blog" className="lxa-link">
                  Read the journal
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>

            <figure className="lxa-community__figure" data-reveal-image>
              <div className="lxa-community__frame">
                <Image
                  src="/images/v2/generate-installation.webp"
                  alt="A technician connecting wiring beside a solar module on a corrugated roof"
                  fill
                  sizes="(max-width: 900px) 100vw, 40vw"
                  className="lxa-community__image"
                />
              </div>
              <figcaption>Practical work, in progress.</figcaption>
            </figure>
          </div>
        </section>

        {/* Closing ----------------------------------------------------- */}
        <section className="lxa-close">
          <div aria-hidden="true" className="lxa-close__media">
            <Image
              src="/images/lonex-generated-images/about/mountain-energy-landscape.webp"
              alt=""
              fill
              sizes="100vw"
              className="lxa-close__image"
            />
          </div>
          <div aria-hidden="true" className="lxa-close__scrim" />

          <div className="lx-wrap lxa-close__grid">
            <div className="lxa-close__copy" data-reveal-group>
              <div data-reveal>
                <p className="lxa-eyebrow lxa-eyebrow--light">Next step</p>
                <h2 className="lxa-close__title">
                  Start with the
                  <br />
                  whole picture.
                </h2>
                <p className="lxa-close__intro">
                  A roof, a battery and a bike are separate purchases. They are
                  also one way of thinking about power. Tell us what you are
                  trying to solve, and we will start there.
                </p>
              </div>

              <div className="lxa-close__actions" data-reveal>
                <Link href="/contact" className="lxa-btn lxa-btn--light">
                  Contact LONEX
                  <span aria-hidden="true">→</span>
                </Link>
                {phoneHref ? (
                  <a
                    href={phoneHref}
                    className="lxa-close__phone"
                  >
                    {formatPhone(settings.contactPhone)}
                  </a>
                ) : null}
              </div>
            </div>

            <nav
              aria-label="Explore the range"
              className="lxa-close__range"
              data-reveal
            >
              <p className="lxa-close__range-label">The range</p>
              {RANGE_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="lxa-close__range-link"
                >
                  <span>{item.label}</span>
                  <span className="lxa-close__range-meta">
                    {item.meta}
                    <span aria-hidden="true">↗</span>
                  </span>
                </Link>
              ))}
            </nav>
          </div>
        </section>
      </PageMotion>
    </div>
  );
}

export const instant = false;
