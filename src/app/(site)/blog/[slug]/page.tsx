import Link from "next/link";
import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { ContentImage } from "@/components/public/content-image";
import { JsonLd } from "@/components/public/json-ld";
import { PageMotion } from "@/components/public/page-motion";
import { createPageMetadata, notFoundMetadata } from "@/lib/public/seo";
import { loadPublicSettings } from "@/lib/public/settings";
import {
  getPublishedBlogPostBySlug,
  listPublishedBlogPosts,
} from "@/lib/public/queries";
import { redirectMovedPath } from "@/lib/public/redirects";
import { ArticleActions } from "./article-actions";
import { ArticleBody } from "./article-body";
import { ArticleNavigation } from "./article-navigation";
import {
  ARTICLE,
  CLOSING,
  buildArticleOutline,
  coverNoteFor,
  kickerFor,
  parseArticleDocument,
  standfirstFor,
  topicLabelFor,
} from "./content";
import { topicForSlug } from "../content";
import "../../../home.css";
import "../../../article.css";

type Params = { slug: string };

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  await connection();
  const { slug } = await params;
  const post = await getPublishedBlogPostBySlug(slug);

  if (!post) {
    return notFoundMetadata("Article not found");
  }

  const settings = await loadPublicSettings();
  const description =
    post.seoDescription || post.excerpt || settings.seoDescription;

  return createPageMetadata({
    settings,
    title: post.seoTitle || post.title,
    description: description || settings.seoDescription,
    path: post.path,
    image: post.cover,
    type: "article",
    publishedTime: post.publishedAt,
  });
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  await connection();

  const { slug } = await params;
  const [post, listing] = await Promise.all([
    getPublishedBlogPostBySlug(slug),
    listPublishedBlogPosts({ page: 1, pageSize: 20 }),
  ]);

  if (!post) {
    await redirectMovedPath(`/blog/${slug}`);
    notFound();
  }

  const document = parseArticleDocument(post.contentJson);
  const outline = buildArticleOutline(document);
  const cover = coverNoteFor(post);
  const topic = topicLabelFor(post);
  const topicId = topicForSlug(post.slug);

  const index = listing.items.findIndex((item) => item.id === post.id);
  const newer = index > 0 ? listing.items[index - 1] : null;
  const older =
    index >= 0 && index < listing.items.length - 1
      ? listing.items[index + 1]
      : null;

  const others = listing.items.filter((item) => item.id !== post.id);
  const related = [
    ...others.filter((item) => topicForSlug(item.slug) === topicId),
    ...others.filter((item) => topicForSlug(item.slug) !== topicId),
  ].slice(0, 3);

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    datePublished: post.publishedAt,
    image: post.cover?.url,
  };

  return (
    <div className="lx-page lxad-page">
      <JsonLd data={jsonLd} />

      <PageMotion>
        <header className="lxad-hero" data-hero>
          <div className="lx-wrap">
            <nav aria-label="Breadcrumb" className="lx-crumbs lxad-crumbs">
              <Link href="/">Home</Link>
              <span aria-hidden="true">/</span>
              <Link href="/blog">Journal</Link>
              <span aria-hidden="true">/</span>
              <span className="lxad-crumbs__current" aria-current="page">
                {post.title}
              </span>
            </nav>

            <div className="lxad-hero__grid">
              <div className="lxad-hero__head">
                <p className="lxad-meta" data-hero-item>
                  <span className="lxad-meta__kicker">{kickerFor(post)}</span>
                  <time dateTime={post.publishedAt}>
                    {post.publishedLabel}
                  </time>
                </p>

                <h1 className="lxad-title" data-hero-line>
                  {post.title}
                </h1>

                <p className="lxad-standfirst" data-hero-item>
                  {standfirstFor(post)}
                </p>
              </div>

              <aside className="lxad-hero__aside" data-hero-item>
                <p className="lxad-hero__aside-label">Filed under</p>
                <p className="lxad-hero__topic">{topic}</p>

                <dl className="lxad-hero__facts">
                  <div>
                    <dt>Published</dt>
                    <dd>
                      <time dateTime={post.publishedAt}>
                        {post.publishedLabel}
                      </time>
                    </dd>
                  </div>
                </dl>

                <p className="lxad-hero__link">
                  <Link href="/blog" className="lxad-textlink">
                    {ARTICLE.allArticles}
                    <span aria-hidden="true">→</span>
                  </Link>
                </p>
              </aside>
            </div>
          </div>

          {post.cover ? (
            <figure className="lxad-cover">
              <div className="lx-wrap">
                <div
                  className="lxad-cover__frame"
                  data-hero-media
                  style={{ "--lxad-focus": cover.focus } as CSSProperties}
                >
                  <ContentImage
                    image={post.cover}
                    fallbackLabel={post.title}
                    sizes="(max-width: 900px) 100vw, 92vw"
                    preload
                    className="lxad-cover__img"
                  />
                </div>

                <figcaption className="lxad-cover__cap">
                  <span className="lxad-cover__caption">{cover.caption}</span>
                  {cover.caveat ? (
                    <span className="lxad-cover__caveat">{cover.caveat}</span>
                  ) : null}
                  <span className="lxad-cover__tag">{topic}</span>
                </figcaption>
              </div>
            </figure>
          ) : null}
        </header>

        <section className="lxad-read" aria-label="Article">
          <div className="lx-wrap lxad-read__grid">
            <ArticleNavigation outline={outline} />

            <article className="lxad-article">
              {document ? (
                <ArticleBody document={document} outline={outline} />
              ) : (
                <p className="lxad-p lxad-p--lead">
                  This article has no readable content.
                </p>
              )}

              <ArticleActions title={post.title} />
            </article>
          </div>
        </section>

        <nav className="lxad-pager" aria-label={ARTICLE.pagerLabel}>
          <div className="lx-wrap lxad-pager__grid">
            <div className="lxad-pager__cell">
              {older ? (
                <Link href={older.path} className="lxad-pager__link">
                  <span className="lxad-pager__label">
                    {ARTICLE.previousLabel}
                  </span>
                  <span className="lxad-pager__title">{older.title}</span>
                  <span className="lxad-pager__meta">
                    {topicLabelFor(older)} · {older.publishedLabel}
                  </span>
                </Link>
              ) : (
                <Link href="/blog" className="lxad-pager__link">
                  <span className="lxad-pager__label">
                    {ARTICLE.journalLabel}
                  </span>
                  <span className="lxad-pager__title">
                    {ARTICLE.allArticles}
                  </span>
                </Link>
              )}
            </div>

            <div className="lxad-pager__cell lxad-pager__cell--next">
              {newer ? (
                <Link href={newer.path} className="lxad-pager__link">
                  <span className="lxad-pager__label">{ARTICLE.nextLabel}</span>
                  <span className="lxad-pager__title">{newer.title}</span>
                  <span className="lxad-pager__meta">
                    {topicLabelFor(newer)} · {newer.publishedLabel}
                  </span>
                </Link>
              ) : (
                <Link href="/blog" className="lxad-pager__link">
                  <span className="lxad-pager__label">
                    {ARTICLE.journalLabel}
                  </span>
                  <span className="lxad-pager__title">
                    {ARTICLE.allArticles}
                  </span>
                </Link>
              )}
            </div>
          </div>
        </nav>

        {related.length > 0 ? (
          <section
            className="lxad-related"
            aria-labelledby="lxad-related-title"
          >
            <div className="lx-wrap">
              <div className="lxad-related__head">
                <div data-reveal>
                  <p className="lxad-eyebrow">{ARTICLE.relatedLabel}</p>
                  <h2 className="lxad-related__title" id="lxad-related-title">
                    {ARTICLE.relatedTitle}
                  </h2>
                </div>

                <p className="lxad-related__intro" data-reveal>
                  {ARTICLE.relatedIntro}
                </p>
              </div>

              <div className="lxad-related__list">
                {related.map((item, position) => (
                  <article
                    key={item.id}
                    className="lxad-related__item"
                    data-reveal
                  >
                    <Link href={item.path} className="lxad-related__link">
                      <span className="lxad-related__num" aria-hidden="true">
                        {pad(position + 1)}
                      </span>

                      <span className="lxad-related__body">
                        <span className="lxad-related__meta">
                          <span>{topicLabelFor(item)}</span>
                          <time dateTime={item.publishedAt}>
                            {item.publishedLabel}
                          </time>
                        </span>
                        <span className="lxad-related__name">{item.title}</span>
                      </span>

                      <span className="lxad-related__thumb">
                        <ContentImage
                          image={item.cover}
                          fallbackLabel={item.title}
                          sizes="(max-width: 620px) 96px, 200px"
                        />
                      </span>
                    </Link>
                  </article>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section className="lxad-close">
          <div className="lx-wrap lxad-close__grid">
            <div className="lxad-close__copy">
              <div data-reveal>
                <p className="lxad-eyebrow lxad-eyebrow--light">
                  {CLOSING.eyebrow}
                </p>
                <h2 className="lxad-close__title">{CLOSING.title}</h2>
                <p className="lxad-close__intro">{CLOSING.intro}</p>
              </div>

              <div className="lxad-close__actions" data-reveal>
                <Link
                  href={CLOSING.primary.href}
                  className="lxad-btn lxad-btn--light"
                >
                  {CLOSING.primary.label}
                  <span aria-hidden="true">→</span>
                </Link>
                <Link
                  href={CLOSING.secondary.href}
                  className="lxad-close__secondary"
                >
                  {CLOSING.secondary.label}
                  <span aria-hidden="true">↗</span>
                </Link>
              </div>
            </div>

            <aside className="lxad-close__note" data-reveal>
              <p className="lxad-close__note-label">{CLOSING.noteLabel}</p>
              <p className="lxad-close__note-copy">{CLOSING.note}</p>
              <Link
                href={CLOSING.noteLink.href}
                className="lxad-close__note-link"
              >
                {CLOSING.noteLink.label}
                <span aria-hidden="true">→</span>
              </Link>
            </aside>
          </div>
        </section>
      </PageMotion>
    </div>
  );
}

export const instant = false;
