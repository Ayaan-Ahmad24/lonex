/**
 * Copy and editorial structure for the journal index.
 *
 * Article titles, dates, excerpts and images come from the CMS. Everything in
 * this file is presentation copy: labels, the archive standfirsts and the
 * subject derivation. Categories are not a column in the blog table, so a
 * subject is derived from the article's slug and title. That keeps the filters
 * working for articles published after this code was written, without a schema
 * change and without a hardcoded list of slugs.
 *
 * Nothing here claims a statistic, a certification or an author.
 */

import type { PublicBlogCard } from "@/lib/public/dto";

export type JournalTopicId =
  | "all"
  | "solar"
  | "storage"
  | "mobility"
  | "verification"
  | "journal";

export type SubjectTopicId = Exclude<JournalTopicId, "all">;

/** Order the subject strip is offered in, after "All". */
export const TOPIC_ORDER: SubjectTopicId[] = [
  "solar",
  "storage",
  "mobility",
  "verification",
  "journal",
];

export const TOPIC_LABELS: Record<JournalTopicId, string> = {
  all: "All articles",
  solar: "Solar",
  storage: "Storage",
  mobility: "Mobility",
  verification: "Verification",
  journal: "Journal",
};

/**
 * Subjects are not stored in the database. The slug is the stable identity of
 * an article, so the subject map is keyed by it. An unknown slug still renders
 * — it simply joins the general "Journal" subject.
 */
export const POST_TOPICS: Record<string, SubjectTopicId> = {
  "understanding-solar-module-specifications": "solar",
  "how-to-read-a-solar-module-nameplate": "solar",
  "how-battery-storage-supports-everyday-energy-use": "storage",
  "electric-mobility-and-the-changing-urban-journey": "mobility",
  "why-the-model-code-matters": "verification",
};

/**
 * Fallback rules for articles that are not in the explicit map above.
 *
 * Order matters: verification is checked before solar, so a piece about
 * checking that a solar product is genuine is filed under Verification rather
 * than Solar. Anything that matches nothing becomes "Journal", which keeps new
 * subjects visible instead of dropping them from the filter strip.
 */
const TOPIC_RULES: { id: SubjectTopicId; pattern: RegExp }[] = [
  {
    id: "verification",
    pattern:
      /\b(verif\w*|genuine|authentic|counterfeit|fake|model[- ]?code|serial)\b/i,
  },
  {
    id: "storage",
    pattern: /\b(batter\w*|storage|backup|hybrid|inverter)\b/i,
  },
  {
    id: "mobility",
    pattern:
      /\b(e-?bike|bicycle|bike|mobility|scooter|electric[- ]vehicle|ev|commut\w*|riding|cycl\w*)\b/i,
  },
  {
    id: "solar",
    pattern: /\b(solar|photovoltaic|pv|panel|net[- ]?meter\w*|rooftop|module)\b/i,
  },
];

function topicFromText(text: string): SubjectTopicId {
  for (const rule of TOPIC_RULES) {
    if (rule.pattern.test(text)) {
      return rule.id;
    }
  }

  return "journal";
}

export function topicForSlug(slug: string): SubjectTopicId {
  return POST_TOPICS[slug] ?? topicFromText(slug);
}

/** Subject for a card, checking both the slug and the stored title. */
export function topicForPost(post: PublicBlogCard): SubjectTopicId {
  return POST_TOPICS[post.slug] ?? topicFromText(`${post.slug} ${post.title}`);
}

/** Distinct subjects present in a set of posts, in the canonical order. */
export function subjectsFor(posts: PublicBlogCard[]): SubjectTopicId[] {
  const seen = new Set<SubjectTopicId>();

  posts.forEach((post) => seen.add(topicForPost(post)));

  return TOPIC_ORDER.filter((topic) => seen.has(topic));
}

/**
 * The excerpt shown on the archive card. Always the stored excerpt first;
 * the fallback only appears when an article genuinely has no excerpt.
 */
export function excerptFor(post: PublicBlogCard): string {
  const stored = post.excerpt?.trim();

  if (stored) {
    return stored;
  }

  return "A closer look at the decisions behind a working energy system.";
}

export function articleCount(count: number): string {
  return `${count} ${count === 1 ? "article" : "articles"}`;
}

type PostNote = { kicker: string; standfirst: string };

/**
 * A shorter kicker and a fuller standfirst for the article page. These are
 * written from the article itself, so they can differ from the stored excerpt
 * used on the archive.
 */
export const POST_NOTES: Record<string, PostNote> = {
  "electric-mobility-and-the-changing-urban-journey": {
    kicker: "Mobility / City riding",
    standfirst:
      "Most city journeys are short, repeated and familiar: a commute, a school run, a trip to the market. That pattern — not the open road — is where an electric scooter proves its worth.",
  },
  "how-to-read-a-solar-module-nameplate": {
    kicker: "Solar / Module data",
    standfirst:
      "A nameplate describes a set of test conditions, not a promise. Power class, efficiency and temperature behaviour are the three figures that decide what a module delivers on a hot roof.",
  },
  "why-the-model-code-matters": {
    kicker: "Verification / Model identity",
    standfirst:
      "A photograph shows a shape, and a serial number identifies one unit. Only a registered model code says what was specified, tested and shipped — and it is the part a buyer can check.",
  },
  "understanding-solar-module-specifications": {
    kicker: "Solar / Specifications",
    standfirst:
      "Rated power, efficiency and temperature behaviour are usually read out of order. Taken in the right sequence, a datasheet becomes a comparison rather than a headline.",
  },
  "how-battery-storage-supports-everyday-energy-use": {
    kicker: "Storage / Everyday use",
    standfirst:
      "Capacity, power and cycling describe three different things. Read together, they explain how stored energy fits into an ordinary evening at home.",
  },
};

export function noteFor(post: PublicBlogCard): PostNote {
  return (
    POST_NOTES[post.slug] ?? {
      kicker: TOPIC_LABELS[topicForSlug(post.slug)],
      standfirst: excerptFor(post),
    }
  );
}

export const JOURNAL = {
  eyebrow: "The LONEX journal",
  titleLead: "Energy,",
  titleAccent: "read closely.",
  intro: [
    "The details that decide how an energy system performs rarely fit on a specification sheet: the conditions behind a number, the difference between capacity and what a battery can deliver, the route a model takes before it reaches a roof.",
    "This is where we work through them — careful writing on solar, storage and electric mobility, for anyone making a decision that will outlast the brochure.",
  ],
  facts: {
    articles: "Articles",
    subjects: "Subjects",
    latest: "Latest",
  },
  featuredLabel: "Latest article",
  featureLink: "Read the article",
} as const;

export const INDEX = {
  eyebrow: "The archive",
  title: "Every entry, in one place.",
  intro:
    "The complete journal — every published article, not a truncated feed. Follow one subject, or read straight through in publication order.",
  filterLabel: "Browse by subject",
  readLabel: "Read article",
  featuredNote: "Featured above",
} as const;

export const CLOSING = {
  eyebrow: "Keep the thread",
  title: "Read the detail. Then ask the question.",
  intro:
    "An article can explain a figure, but it cannot see your roof, your evening load or the route you ride. When a detail raises something specific, that is the right moment to talk it through.",
  primary: { label: "Contact LONEX", href: "/contact" },
  secondary: { label: "Verify a model", href: "/verify" },
  linksLabel: "The range",
  links: [
    { label: "Solar", meta: "Modules for rooftops", href: "/solar" },
    { label: "Batteries", meta: "Storage for the evening", href: "/batteries" },
    { label: "Electric scooters", meta: "Short urban journeys", href: "/electric-scooters" },
  ],
  latestLabel: "Most recent",
} as const;

export const EMPTY = {
  title: "The first entries are being prepared.",
  copy: "New writing on solar, storage and mobility will appear here. In the meantime, the conversation is open.",
  action: { label: "Contact LONEX", href: "/contact" },
} as const;
