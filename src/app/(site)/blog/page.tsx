import Link from "next/link";
import type { Metadata } from "next";
import { connection } from "next/server";

import { ContentImage } from "@/components/public/content-image";
import { PageMotion } from "@/components/public/page-motion";
import { createPageMetadata } from "@/lib/public/seo";
import { loadPublicSettings } from "@/lib/public/settings";
import { listAllPublishedBlogPosts } from "@/lib/public/queries";
import { JournalIndex } from "./journal-index";
import {
  CLOSING,
  JOURNAL,
  TOPIC_LABELS,
  excerptFor,
  subjectsFor,
  topicForPost,
} from "./content";
import "../../home.css";
import "../../journal.css";

export async function generateMetadata(): Promise<Metadata> {
  await connection();
  const settings = await loadPublicSettings();
  return createPageMetadata({
    settings,
    title: "Journal",
    description:
      "Careful writing on solar, battery storage and electric mobility — the numbers, trade-offs and questions behind a working energy system.",
    path: "/blog",
  });
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

export default async function BlogIndexPage() {
  // Request-time read: a newly published article is visible immediately,
  // without a redeploy, because the page is not cached as static output.
  await connection();

  const posts = await listAllPublishedBlogPosts();
  const latest = posts[0] ?? null;
  const subjects = subjectsFor(posts);
  const total = posts.length;

  return (
    <div className="lx-page lxjn-page">
      <PageMotion>
        {/* Editorial hero + featured article --------------------------- */}
        <section className="lxjn-hero" data-hero>
          <div className="lx-wrap lxjn-hero__grid">
            <div className="lxjn-hero__copy">
              <nav aria-label="Breadcrumb" className="lx-crumbs lxjn-crumbs">
                <Link href="/">Home</Link>
                <span aria-hidden="true">/</span>
                <span aria-current="page">Journal</span>
              </nav>

              <p className="lxjn-eyebrow" data-hero-item>
                {JOURNAL.eyebrow}
              </p>

              <h1 className="lxjn-hero__title">
                <span className="lxjn-hero__line" data-hero-line>
                  {JOURNAL.titleLead}
                </span>{" "}
                <span className="lxjn-hero__line" data-hero-line>
                  <em>{JOURNAL.titleAccent}</em>
                </span>
              </h1>

              <div className="lxjn-hero__intro" data-hero-item>
                {JOURNAL.intro.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>

              <dl className="lxjn-hero__facts" data-hero-item>
                <div>
                  <dt>{JOURNAL.facts.articles}</dt>
                  <dd>{pad(total)}</dd>
                </div>
                <div>
                  <dt>{JOURNAL.facts.subjects}</dt>
                  <dd>{pad(subjects.length)}</dd>
                </div>
                {latest ? (
                  <div>
                    <dt>{JOURNAL.facts.latest}</dt>
                    <dd>{latest.publishedLabel}</dd>
                  </div>
                ) : null}
              </dl>
            </div>

            {latest ? (
              <figure className="lxjn-cover" data-hero-item>
                <div className="lxjn-cover__media" data-hero-media>
                  <ContentImage
                    image={latest.cover}
                    fallbackLabel={latest.title}
                    sizes="(max-width: 900px) 100vw, 44vw"
                    preload
                    className="lxjn-img"
                  />
                </div>

                <figcaption className="lxjn-cover__body">
                  <p className="lxjn-cover__meta">
                    <span className="lxjn-cover__label">
                      {JOURNAL.featuredLabel}
                    </span>
                    <span>{TOPIC_LABELS[topicForPost(latest)]}</span>
                    <time dateTime={latest.publishedAt}>
                      {latest.publishedLabel}
                    </time>
                  </p>

                  <h2 className="lxjn-cover__title">
                    <Link href={latest.path}>{latest.title}</Link>
                  </h2>

                  <p className="lxjn-cover__excerpt">
                    {excerptFor(latest)}
                  </p>

                  <p className="lxjn-cover__more">
                    <Link href={latest.path} className="lxjn-link">
                      {JOURNAL.featureLink}
                      <span aria-hidden="true">→</span>
                    </Link>
                  </p>
                </figcaption>
              </figure>
            ) : null}
          </div>
        </section>

        {/* Complete archive -------------------------------------------- */}
        <JournalIndex posts={posts} featuredId={latest?.id ?? null} />

        {/* Closing ----------------------------------------------------- */}
        <section className="lxjn-close">
          <div className="lx-wrap lxjn-close__grid">
            <div className="lxjn-close__copy" data-reveal-group>
              <div data-reveal>
                <p className="lxjn-eyebrow lxjn-eyebrow--light">
                  {CLOSING.eyebrow}
                </p>
                <h2 className="lxjn-close__title">{CLOSING.title}</h2>
                <p className="lxjn-close__intro">{CLOSING.intro}</p>
              </div>

              <div className="lxjn-close__actions" data-reveal>
                <Link
                  href={CLOSING.primary.href}
                  className="lxjn-btn lxjn-btn--light"
                >
                  {CLOSING.primary.label}
                  <span aria-hidden="true">→</span>
                </Link>
                <Link
                  href={CLOSING.secondary.href}
                  className="lxjn-close__secondary"
                >
                  {CLOSING.secondary.label}
                  <span aria-hidden="true">↗</span>
                </Link>
              </div>
            </div>

            <nav
              aria-label="Explore the range"
              className="lxjn-close__links"
              data-reveal
            >
              <p className="lxjn-close__links-label">{CLOSING.linksLabel}</p>
              {CLOSING.links.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="lxjn-close__link"
                >
                  <span>{item.label}</span>
                  <span className="lxjn-close__link-meta">
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
