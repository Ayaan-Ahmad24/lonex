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
  articleCount,
  excerptFor,
  topicForPost,
  type JournalTopicId,
  type SubjectTopicId,
} from "./content";

/**
 * The archive is a complete index, so the layouts never truncate the list:
 * every published article except the one already shown above is rendered.
 *
 * Layouts are assigned by position in a five-slot row pattern:
 *   [ wide 7 | tall 5 ] [ tall 5 | wide 7 ] [ full-width band ]
 * A final card that would leave a half-empty row becomes a full-width solo.
 */
type Layout = "tall" | "wide" | "band" | "solo";

type Props = {
  posts: PublicBlogCard[];
  featuredId: number | null;
};

const IMAGE_SIZES: Record<Layout, string> = {
  tall: "(max-width: 900px) 100vw, 40vw",
  wide: "(max-width: 900px) 100vw, 58vw",
  band: "(max-width: 900px) 100vw, 52vw",
  solo: "(max-width: 900px) 100vw, 55vw",
};

const CYCLE: Layout[] = ["wide", "tall", "tall", "wide", "band"];

function spanOf(layout: Layout): number {
  if (layout === "band" || layout === "solo") return 12;
  return layout === "wide" ? 7 : 5;
}

function layoutFor(index: number, total: number): Layout {
  const base = CYCLE[index % CYCLE.length];

  if (index !== total - 1) {
    return base;
  }

  let rowWidth = 0;

  for (let position = 0; position < index; position += 1) {
    rowWidth += spanOf(CYCLE[position % CYCLE.length]);

    if (rowWidth >= 12) {
      rowWidth = 0;
    }
  }

  return rowWidth + spanOf(base) < 12 ? "solo" : base;
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
  return (
    <article
      className={`lxjn-entry lxjn-entry--${layout}`}
      data-entry={post.slug}
      data-animate={animate ? "in" : undefined}
      style={
        animate ? ({ "--lxjn-order": index } as CSSProperties) : undefined
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
          <span className="lxjn-entry__index">{pad(index + 1)}</span>
          <span className="lxjn-entry__kicker">
            {TOPIC_LABELS[topicForPost(post)]}
          </span>
          <time className="lxjn-entry__date" dateTime={post.publishedAt}>
            {post.publishedLabel}
          </time>
        </p>

        <h3 className="lxjn-entry__title">
          <Link href={post.path}>{post.title}</Link>
        </h3>

        <p className="lxjn-entry__copy">{excerptFor(post)}</p>

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

export function JournalIndex({ posts, featuredId }: Props) {
  const [topic, setTopic] = useState<JournalTopicId>("all");
  const [hasFiltered, setHasFiltered] = useState(false);

  const featured = useMemo(
    () => posts.find((post) => post.id === featuredId) ?? null,
    [posts, featuredId],
  );

  const counts = useMemo(() => {
    const map = new Map<SubjectTopicId, number>();

    posts.forEach((post) => {
      const key = topicForPost(post);
      map.set(key, (map.get(key) ?? 0) + 1);
    });

    return map;
  }, [posts]);

  const subjects = useMemo(
    () => TOPIC_ORDER.filter((item) => (counts.get(item) ?? 0) > 0),
    [counts],
  );

  const isFiltered = topic !== "all";

  const matched = useMemo(() => {
    const list = isFiltered
      ? posts.filter((post) => topicForPost(post) === topic)
      : posts;

    return [...list].sort(byNewest);
  }, [isFiltered, posts, topic]);

  const featuredMatches =
    featured !== null && (!isFiltered || topicForPost(featured) === topic);

  const archive = useMemo(
    () => matched.filter((post) => post.id !== featuredId),
    [featuredId, matched],
  );

  const zeroPublished = posts.length === 0;

  const statusText = isFiltered
    ? `${TOPIC_LABELS[topic]} — ${articleCount(matched.length)}${
        featuredMatches ? ", including the latest above" : ""
      }`
    : `All subjects — ${articleCount(posts.length)}${
        featuredMatches ? ", including the latest above" : ""
      }`;

  const select = (next: JournalTopicId) => {
    setTopic(next);

    if (next !== "all") {
      setHasFiltered(true);
    }
  };

  return (
    <>
      {subjects.length > 1 ? (
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

      <section className="lxjn-index" data-listing>
        <div className="lx-wrap">
          <div className="lxjn-index__head" data-reveal-group>
            <div data-reveal>
              <p className="lxjn-eyebrow">{INDEX.eyebrow}</p>
              <h2 className="lxjn-index__title">{INDEX.title}</h2>
            </div>

            <div className="lxjn-index__aside" data-reveal>
              <p className="lxjn-index__intro">{INDEX.intro}</p>
              <p
                className="lxjn-index__status"
                data-topic-status
                aria-live="polite"
              >
                {statusText}
              </p>
            </div>
          </div>

          {zeroPublished ? (
            <div className="lxjn-empty">
              <h3 className="lxjn-empty__title">{EMPTY.title}</h3>
              <p className="lxjn-empty__copy">{EMPTY.copy}</p>
              <Link href={EMPTY.action.href} className="lxjn-btn lxjn-btn--dark">
                {EMPTY.action.label}
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          ) : archive.length === 0 ? (
            <p className="lxjn-index__solo-note">
              This subject has one story, and it is featured above.
            </p>
          ) : (
            <div
              className={`lxjn-list${
                isFiltered ? ` lxjn-list--topic lxjn-list--${topic}` : ""
              }`}
              key={topic}
            >
              {archive.map((post, index) => (
                <Entry
                  key={post.id}
                  post={post}
                  layout={layoutFor(index, archive.length)}
                  index={index}
                  animate={hasFiltered}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
