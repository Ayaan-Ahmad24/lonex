/**
 * Presentation copy for a single journal article.
 *
 * Everything with a factual basis — title, date, excerpt, body and cover —
 * comes from the CMS. This file only supplies the framing around it: a
 * standfirst reused from the journal index, a factual cover caption, and the
 * labels that turn the stored document into a reading experience.
 *
 * Nothing here invents an author, a statistic or a claim. Where the stored
 * cover does not describe the article (the mobility piece), the caption says
 * so rather than replacing the editor's image.
 */

import type { RichTextDocument } from "@/lib/content/rich-text";
import { parseStoredRichText } from "@/lib/content/rich-text";
import type { PublicBlogCard } from "@/lib/public/dto";

import { TOPIC_LABELS, noteFor, topicForSlug } from "../content";

export type OutlineEntry = {
  id: string;
  label: string;
};

export type CoverNote = {
  caption: string;
  /** object-position for the hero crop, tuned per photograph. */
  focus: string;
  /** Shown beneath the caption when the stored image needs a word of context. */
  caveat?: string;
};

/**
 * Cover captions describe what the stored photograph actually shows. They are
 * deliberately plain: a caption is not the place for a claim the article does
 * not make.
 */
export const COVER_NOTES: Record<string, CoverNote> = {
  "understanding-solar-module-specifications": {
    caption: "Rooftop solar across an urban skyline.",
    focus: "center 58%",
  },
  "how-battery-storage-supports-everyday-energy-use": {
    caption: "A consultation on home energy use.",
    focus: "center 42%",
  },
  "electric-mobility-and-the-changing-urban-journey": {
    caption: "A leaf in natural light.",
    focus: "center 46%",
  },
  "why-the-model-code-matters": {
    caption: "An installer fixes cabling between modules on a rooftop.",
    focus: "center 36%",
  },
  "how-to-read-a-solar-module-nameplate": {
    caption: "A technician lifts a module onto a roof mounting rail.",
    focus: "center 42%",
  },
};

export function coverNoteFor(post: PublicBlogCard): CoverNote {
  return (
    COVER_NOTES[post.slug] ?? {
      caption: post.cover?.alt || "The article cover.",
      focus: "center",
    }
  );
}

/** The index standfirst, reused so the article opens with the same promise. */
export function standfirstFor(post: PublicBlogCard): string {
  return noteFor(post).standfirst;
}

/** Short editorial label for the hero meta line. */
export function kickerFor(post: PublicBlogCard): string {
  return noteFor(post).kicker;
}

/** Top-level subject, used for the "Filed under" block. */
export function topicLabelFor(post: PublicBlogCard): string {
  return TOPIC_LABELS[topicForSlug(post.slug)];
}

export const ARTICLE = {
  contentsLabel: "Contents",
  sectionsLabel: "sections",
  backToTop: "Back to top",
  nextStepLabel: "Next step",
  shareLabel: "Share this article",
  shareX: "X",
  shareLinkedIn: "LinkedIn",
  shareWhatsApp: "WhatsApp",
  copyLink: "Copy link",
  copied: "Link copied",
  pagerLabel: "Article navigation",
  previousLabel: "Previous article",
  nextLabel: "Next article",
  journalLabel: "The journal",
  allArticles: "All articles",
  relatedLabel: "Related reading",
  relatedTitle: "Continue the thread.",
  relatedIntro:
    "More notes from the journal on the figures, systems and checks behind a decision.",
} as const;

export const CLOSING = {
  eyebrow: "Talk it through",
  title: "Bring the question to LONEX.",
  intro:
    "An article can explain the numbers, but it cannot see your roof, your evening load or the route you ride. When a detail raises something specific, that is the moment to ask.",
  primary: { label: "Contact LONEX", href: "/contact" },
  secondary: { label: "All articles", href: "/blog" },
  noteLabel: "On verification",
  note: "A model code confirms registration with LONEX. It does not authenticate an individual unit.",
  noteLink: { label: "Verify a model", href: "/verify" },
} as const;

function slugifyHeading(label: string): string {
  return label
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
}

function spanHasContent(span: unknown): boolean {
  if (!span || typeof span !== "object") {
    return false;
  }

  const candidate = span as { text?: unknown };

  return typeof candidate.text === "string" && candidate.text.trim().length > 0;
}

/**
 * Remove zero-length paragraphs and list items before validating the stored
 * document.
 *
 * Three of the five published articles contain an empty paragraph at the top
 * and bottom of the body. The strict rich-text schema rejects an empty span, so
 * the whole document used to fail closed and the old page showed only "no
 * readable content". Empty blocks carry no words, so dropping them changes no
 * meaning; every remaining block is passed through untouched.
 */
function cleanBlock(block: unknown): unknown[] {
  if (!block || typeof block !== "object") {
    return [block];
  }

  const candidate = block as Record<string, unknown>;

  if (
    candidate.type === "paragraph" ||
    candidate.type === "heading" ||
    candidate.type === "quote"
  ) {
    if (!Array.isArray(candidate.spans)) {
      return [block];
    }

    const spans = candidate.spans.filter(spanHasContent);

    return spans.length > 0 ? [{ ...candidate, spans }] : [];
  }

  if (candidate.type === "list") {
    if (!Array.isArray(candidate.items)) {
      return [block];
    }

    const items = candidate.items
      .filter((item): item is unknown[] => Array.isArray(item))
      .map((item) => item.filter(spanHasContent))
      .filter((item) => item.length > 0);

    return items.length > 0 ? [{ ...candidate, items }] : [];
  }

  return [block];
}

export function parseArticleDocument(value: unknown): RichTextDocument | null {
  if (!value || typeof value !== "object") {
    return parseStoredRichText(value);
  }

  const document = value as Record<string, unknown>;

  if (!Array.isArray(document.blocks)) {
    return parseStoredRichText(value);
  }

  return parseStoredRichText({
    ...document,
    blocks: document.blocks.flatMap(cleanBlock),
  });
}

/**
 * Build the table of contents from the H2 blocks that are actually stored.
 *
 * The id is derived from the heading text with a stable suffix for repeats, so
 * the renderer and the reading navigation resolve the same anchors without
 * storing anything extra in the database.
 */
export function buildArticleOutline(
  document: RichTextDocument | null,
): OutlineEntry[] {
  if (!document) {
    return [];
  }

  const used = new Map<string, number>();
  const entries: OutlineEntry[] = [];

  for (const block of document.blocks) {
    if (block.type !== "heading" || block.level !== 2) {
      continue;
    }

    const label = block.spans
      .map((span) => span.text)
      .join("")
      .trim();

    if (!label) {
      continue;
    }

    const base = `section-${slugifyHeading(label) || entries.length + 1}`;
    const seen = used.get(base) ?? 0;
    used.set(base, seen + 1);

    entries.push({
      id: seen === 0 ? base : `${base}-${seen + 1}`,
      label,
    });
  }

  return entries;
}
