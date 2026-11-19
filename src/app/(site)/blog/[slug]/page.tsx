import Link from "next/link";
import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { ContentImage } from "@/components/public/content-image";
import { BlogCard } from "@/components/public/blog-card";
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
              <p className="lxad-pager__label">{ARTICLE.previousLabel}</p>

              {older ? (
                <Link href={older.path} className="lxad-pager__link">
                  <span className="lxad-pager__thumb">
                    <ContentImage
                      image={older.cover}
                      fallbackLabel={older.title}
                      sizes="(max-width: 620px) 100vw, 44vw"
                    />
                  </span>
                  <span className="lxad-pager__body">
                    <span className="lxad-pager__meta">
                      <span>{topicLabelFor(older)}</span>
                      <time dateTime={older.publishedAt}>
                        {older.publishedLabel}
                      </time>
                    </span>
                    <span className="lxad-pager__title">{older.title}</span>
                    <span className="lxad-pager__read">
                      Read article <span aria-hidden="true">→</span>
                    </span>
                  </span>
                </Link>
              ) : (
                <Link
                  href="/blog"
                  className="lxad-pager__link lxad-pager__link--plain"
                >
                  <span className="lxad-pager__title">
                    {ARTICLE.allArticles}
                  </span>
                  <span className="lxad-pager__read">
                    {ARTICLE.journalLabel} <span aria-hidden="true">→</span>
                  </span>
                </Link>
              )}
            </div>

            <div className="lxad-pager__cell lxad-pager__cell--next">
              <p className="lxad-pager__label">{ARTICLE.nextLabel}</p>

              {newer ? (
                <Link href={newer.path} className="lxad-pager__link">
                  <span className="lxad-pager__thumb">
                    <ContentImage
                      image={newer.cover}
                      fallbackLabel={newer.title}
                      sizes="(max-width: 620px) 100vw, 44vw"
                    />
                  </span>
                  <span className="lxad-pager__body">
                    <span className="lxad-pager__meta">
                      <span>{topicLabelFor(newer)}</span>
                      <time dateTime={newer.publishedAt}>
                        {newer.publishedLabel}
                      </time>
                    </span>
                    <span className="lxad-pager__title">{newer.title}</span>
                    <span className="lxad-pager__read">
                      Read article <span aria-hidden="true">→</span>
                    </span>
                  </span>
                </Link>
              ) : (
                <Link
                  href="/blog"
                  className="lxad-pager__link lxad-pager__link--plain"
                >
                  <span className="lxad-pager__title">
                    {ARTICLE.allArticles}
                  </span>
                  <span className="lxad-pager__read">
                    {ARTICLE.journalLabel} <span aria-hidden="true">→</span>
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

              <div className="lxad-related__grid">
                {related.map((item) => (
                  <div key={item.id} className="lxad-related__cell" data-reveal>
                    <BlogCard post={item} category={topicLabelFor(item)} />
                  </div>
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
