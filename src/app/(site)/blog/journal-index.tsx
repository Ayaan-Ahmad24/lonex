"use client";

import Link from "next/link";
import { useMemo, useState, type CSSProperties } from "react";

import { ContentImage } from "@/components/public/content-image";
import type { PublicBlogCard } from "@/lib/public/dto";

import {
  EMPTY,
  INDEX,
  TOPIC_LABELS,
  TOPIC_ORDER,
  noteFor,
  topicForSlug,
  type FeatureCopy,
  type JournalTopicId,
  type SubjectTopicId,
} from "./content";

type Layout = "tall" | "wide" | "band" | "pair" | "solo";

type FeatureStory = {
  post: PublicBlogCard;
  copy: FeatureCopy;
};

type Props = {
  latest: PublicBlogCard | null;
  feature: FeatureStory | null;
  remaining: PublicBlogCard[];
  topicsEnabled: boolean;
  pagination: { page: number; pageCount: number } | null;
};

const IMAGE_SIZES: Record<Layout, string> = {
  tall: "(max-width: 900px) 100vw, 40vw",
  wide: "(max-width: 900px) 100vw, 55vw",
  band: "(max-width: 900px) 100vw, 38vw",
  pair: "(max-width: 900px) 100vw, 46vw",
  solo: "(max-width: 900px) 100vw, 56vw",
};

function layoutFor(index: number, total: number): Layout {
  if (total === 1) {
    return "solo";
  }

  if (total === 2) {
    return "pair";
  }

  return (["tall", "wide", "band"] as const)[index % 3];
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function byNewest(a: PublicBlogCard, b: PublicBlogCard): number {
  const delta = b.publishedAt.localeCompare(a.publishedAt);
  return delta !== 0 ? delta : b.id - a.id;
}

function Entry({
  post,
  layout,
  index,
  animate,
}: {
  post: PublicBlogCard;
  layout: Layout;
  index: number;
  animate: boolean;
}) {
  const note = noteFor(post);

  return (
    <article
      className={`lxjn-entry lxjn-entry--${layout}`}
      data-entry={post.slug}
      data-animate={animate ? "in" : undefined}
      style={
        animate
          ? ({ "--lxjn-order": index } as CSSProperties)
          : undefined
      }
    >
      <Link
        href={post.path}
        className="lxjn-entry__media"
        tabIndex={-1}
        aria-hidden="true"
      >
        <span className="lxjn-entry__frame">
          <ContentImage
            image={post.cover}
            fallbackLabel={post.title}
            sizes={IMAGE_SIZES[layout]}
            className="lxjn-img"
          />
        </span>
      </Link>

      <div className="lxjn-entry__body">
        <p className="lxjn-entry__meta">
          <span className="lxjn-entry__index">{pad(index)}</span>
          <span className="lxjn-entry__kicker">{note.kicker}</span>
          <time className="lxjn-entry__date" dateTime={post.publishedAt}>
            {post.publishedLabel}
          </time>
        </p>

        <h3 className="lxjn-entry__title">
          <Link href={post.path}>{post.title}</Link>
        </h3>

        <p className="lxjn-entry__copy">{note.standfirst}</p>

        <p className="lxjn-entry__more">
          <Link href={post.path} className="lxjn-link">
            {INDEX.readLabel}
            <span aria-hidden="true">→</span>
          </Link>
        </p>
      </div>
    </article>
  );
}

function Feature({
  post,
  copy,
}: {
  post: PublicBlogCard;
  copy: FeatureCopy;
}) {
  return (
    <section
      className="lxjn-feature"
      data-feature
      aria-labelledby="lxjn-feature-title"
    >
      <div className="lx-wrap">
        <div className="lxjn-feature__grid">
          <figure className="lxjn-feature__figure">
            <span className="lxjn-feature__frame" data-reveal-image>
              <ContentImage
                image={post.cover}
                fallbackLabel={post.title}
                sizes="(max-width: 900px) 100vw, 58vw"
                className="lxjn-img"
              />
            </span>
            <span aria-hidden="true" className="lxjn-feature__plate">
              01
            </span>
            <figcaption className="lxjn-feature__caption">
              <span>{copy.caption}</span>
              <span className="lxjn-feature__caption-topic">
                {TOPIC_LABELS[topicForSlug(post.slug)]}
              </span>
            </figcaption>
          </figure>

          <div className="lxjn-feature__body" data-reveal-group>
            <p className="lxjn-eyebrow" data-reveal>
              {INDEX.featureLabel}
            </p>

            <p className="lxjn-feature__meta" data-reveal>
              <span>{TOPIC_LABELS[topicForSlug(post.slug)]}</span>
              <time dateTime={post.publishedAt}>{post.publishedLabel}</time>
            </p>

            <h2
              className="lxjn-feature__title"
              id="lxjn-feature-title"
              data-reveal
            >
              {post.title}
            </h2>

            {copy.paragraphs.map((paragraph) => (
              <p className="lxjn-feature__copy" key={paragraph} data-reveal>
                {paragraph}
              </p>
            ))}

            <p className="lxjn-feature__action" data-reveal>
              <Link href={post.path} className="lxjn-btn lxjn-btn--red">
                {INDEX.featureLink}
                <span aria-hidden="true">→</span>
              </Link>
            </p>
          </div>
        </div>

        {copy.sections.length > 0 ? (
          <div className="lxjn-feature__contents" data-reveal>
            <p className="lxjn-feature__contents-label">
              {INDEX.contentsLabel}
            </p>
            <ol className="lxjn-feature__sections">
              {copy.sections.map((section) => (
                <li key={section}>{section}</li>
              ))}
            </ol>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function JournalIndex({
  latest,
  feature,
  remaining,
  topicsEnabled,
  pagination,
}: Props) {
  const [topic, setTopic] = useState<JournalTopicId>("all");
  const [hasFiltered, setHasFiltered] = useState(false);

  const posts = useMemo(() => {
    const seen = new Set<number>();
    const all: PublicBlogCard[] = [];

    [latest, feature?.post ?? null, ...remaining].forEach((post) => {
      if (post && !seen.has(post.id)) {
        seen.add(post.id);
        all.push(post);
      }
    });

    return all;
  }, [latest, feature, remaining]);

  const counts = useMemo(() => {
    const map = new Map<SubjectTopicId, number>();

    posts.forEach((post) => {
      const key = topicForSlug(post.slug);
      map.set(key, (map.get(key) ?? 0) + 1);
    });

    return map;
  }, [posts]);

  const subjects = useMemo(() => {
    const ordered = TOPIC_ORDER.filter((item) => (counts.get(item) ?? 0) > 0);
    return counts.get("journal") ? [...ordered, "journal" as const] : ordered;
  }, [counts]);

  const isFiltered = topic !== "all";
  const showTopics = topicsEnabled && subjects.length > 1;

  const visible = useMemo(() => {
    if (!isFiltered) {
      return remaining;
    }

    return posts
      .filter((post) => topicForSlug(post.slug) === topic)
      .sort(byNewest);
  }, [isFiltered, posts, remaining, topic]);

  const startIndex = isFiltered || !feature ? 1 : 2;

  const select = (next: JournalTopicId) => {
    setTopic(next);

    if (next !== "all") {
      setHasFiltered(true);
    }
  };

  const statusText = isFiltered
    ? `${TOPIC_LABELS[topic]} — ${visible.length} ${
        visible.length === 1 ? "article" : "articles"
      }.`
    : `All subjects — ${posts.length} ${
        posts.length === 1 ? "article" : "articles"
      }.`;

  return (
    <>
      {showTopics ? (
        <section className="lxjn-filter" aria-label={INDEX.filterLabel}>
          <div className="lx-wrap lxjn-filter__inner">
            <p className="lxjn-filter__label">{INDEX.filterLabel}</p>

            <div
              className="lxjn-filter__row"
              role="group"
              aria-label={INDEX.filterLabel}
            >
              <button
                type="button"
                className="lxjn-topic"
                data-topic="all"
                aria-pressed={topic === "all"}
                onClick={() => select("all")}
              >
                <span>{TOPIC_LABELS.all}</span>
                <span aria-hidden="true" className="lxjn-topic__count">
                  {pad(posts.length)}
                </span>
              </button>

              {subjects.map((subject) => (
                <button
                  key={subject}
                  type="button"
                  className="lxjn-topic"
                  data-topic={subject}
                  aria-pressed={topic === subject}
                  onClick={() => select(subject)}
                >
                  <span>{TOPIC_LABELS[subject]}</span>
                  <span aria-hidden="true" className="lxjn-topic__count">
                    {pad(counts.get(subject) ?? 0)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {!isFiltered && feature ? (
        <Feature post={feature.post} copy={feature.copy} />
      ) : null}

      <section className="lxjn-index" data-listing>
        <div className="lx-wrap">
          <div className="lxjn-index__head" data-reveal-group>
            <div data-reveal>
              <p className="lxjn-eyebrow">{INDEX.eyebrow}</p>
              <h2 className="lxjn-index__title">{INDEX.title}</h2>
            </div>

            <div className="lxjn-index__aside" data-reveal>
              <p className="lxjn-index__intro">{INDEX.intro}</p>
              <p className="lxjn-index__status" data-topic-status aria-live="polite">
                {statusText}
              </p>
            </div>
          </div>

          {posts.length === 0 ? (
            <div className="lxjn-empty">
              <h3 className="lxjn-empty__title">{EMPTY.title}</h3>
              <p className="lxjn-empty__copy">{EMPTY.copy}</p>
              <Link href={EMPTY.action.href} className="lxjn-btn lxjn-btn--dark">
                {EMPTY.action.label}
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          ) : (
            <div
              className={`lxjn-list lxjn-list--${
                isFiltered ? `topic lxjn-list--${topic}` : "all"
              }`}
              key={topic}
            >
              {visible.map((post, index) => (
                <Entry
                  key={post.id}
                  post={post}
                  layout={layoutFor(index, visible.length)}
                  index={startIndex + index}
                  animate={hasFiltered}
                />
              ))}
            </div>
          )}

          {pagination && pagination.pageCount > 1 ? (
            <nav aria-label="Pagination" className="lx-pager lxjn-pager">
              {pagination.page > 1 ? (
                <Link
                  href={
                    pagination.page === 2
                      ? "/blog"
                      : `/blog?page=${pagination.page - 1}`
                  }
                >
                  Previous
                </Link>
              ) : (
                <span className="lx-pager__spacer" aria-hidden="true" />
              )}

              <div className="lx-pager__pages">
                {Array.from({ length: pagination.pageCount }, (_, position) => {
                  const page = position + 1;
                  const href = page === 1 ? "/blog" : `/blog?page=${page}`;

                  return (
                    <Link
                      key={page}
                      href={href}
                      aria-current={page === pagination.page ? "page" : undefined}
                    >
                      {pad(page)}
                    </Link>
                  );
                })}
              </div>

              {pagination.page < pagination.pageCount ? (
                <Link href={`/blog?page=${pagination.page + 1}`}>Next</Link>
              ) : (
                <span className="lx-pager__spacer" aria-hidden="true" />
              )}
            </nav>
          ) : null}
        </div>
      </section>
    </>
  );
}