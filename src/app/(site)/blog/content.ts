/**
 * Copy and editorial structure for the journal index.
 *
 * Article titles, dates, excerpts and images come from the CMS. Everything in
 * this file is presentation copy: the standfirsts sharpen what the stored
 * excerpt already says, and the topics are derived from the slug so no schema
 * change is needed. Nothing here claims a statistic, a certification or an
 * author.
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

/** Order the strip is offered in, after "All". */
export const TOPIC_ORDER: SubjectTopicId[] = [
  "solar",
  "storage",
  "mobility",
  "verification",
];

export const TOPIC_LABELS: Record<JournalTopicId, string> = {
  all: "All",
  solar: "Solar",
  storage: "Storage",
  mobility: "Mobility",
  verification: "Verification",
  journal: "Journal",
};

/**
 * Topics are not stored in the database. The slug is the stable identity of an
 * article, so the subject map is keyed by it. An unknown slug still renders —
 * it simply joins the general "Journal" subject.
 */
export const POST_TOPICS: Record<string, SubjectTopicId> = {
  "understanding-solar-module-specifications": "solar",
  "how-to-read-a-solar-module-nameplate": "solar",
  "how-battery-storage-supports-everyday-energy-use": "storage",
  "electric-mobility-and-the-changing-urban-journey": "mobility",
  "why-the-model-code-matters": "verification",
};

export function topicForSlug(slug: string): SubjectTopicId {
  return POST_TOPICS[slug] ?? "journal";
}

/**
 * Listing order for the articles that sit below the featured story.
 *
 * Newest first. The layout slots (tall, wide, full-width band) are assigned
 * by position in the list, so the order is chronology rather than shape.
 */
export const LISTING_ORDER = [
  "electric-mobility-and-the-changing-urban-journey",
  "why-the-model-code-matters",
  "how-to-read-a-solar-module-nameplate",
];

type PostNote = { kicker: string; standfirst: string };

/**
 * A shorter kicker and a fuller standfirst for the index. These are written
 * for the listing, so they can differ from the stored excerpt that the article
 * page uses.
 */
export const POST_NOTES: Record<string, PostNote> = {
  "electric-mobility-and-the-changing-urban-journey": {
    kicker: "Mobility / City riding",
    standfirst:
      "Most city journeys are short, repeated and familiar: a commute, a school run, a trip to the market. That pattern — not the open road — is where an electric bike proves its worth.",
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
      standfirst:
        post.excerpt ??
        "A closer look at the decisions behind a working energy system.",
    }
  );
}

/** The story the index leads with, when it is published. */
export const FEATURED_SLUG =
  "how-battery-storage-supports-everyday-energy-use";

export type FeatureCopy = {
  paragraphs: string[];
  sections: string[];
  caption: string;
};

/**
 * Written from the article itself. The section list mirrors the stored
 * headings so the reader can see the shape of the piece before opening it.
 */
export const FEATURE_COPY: Record<string, FeatureCopy> = {
  "how-battery-storage-supports-everyday-energy-use": {
    paragraphs: [
      "A home battery does not generate electricity. It moves energy through time: charging when supply is plentiful, then discharging when the house needs it. Most of the decisions around storage follow from that single idea.",
      "The numbers that matter are not always the ones printed largest. Usable capacity, the power available at once, where the unit will sit and what it should do on the evening the grid goes quiet — these decide whether a battery fits the life around it.",
    ],
    sections: [
      "What storage actually does",
      "Capacity and usable capacity",
      "Power is a separate number",
      "Daily cycling is normal",
      "What to ask before buying",
    ],
    caption: "Storage is a question of timing, not generation.",
  },
};

export function featureCopyFor(post: PublicBlogCard): FeatureCopy {
  return (
    FEATURE_COPY[post.slug] ?? {
      paragraphs: [
        post.excerpt ??
          "A closer look at the detail behind a working energy system.",
      ],
      sections: [],
      caption: TOPIC_LABELS[topicForSlug(post.slug)],
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
  coverLabel: "Latest article",
  facts: {
    subjects: "Subjects",
    articles: "Articles",
    latest: "Latest",
  },
} as const;

export const INDEX = {
  eyebrow: "The index",
  title: "More from the journal.",
  intro:
    "Longer reads on the decisions behind a system: what a figure means, what it leaves out, and what to ask next.",
  filterLabel: "Browse by subject",
  featureLabel: "Featured story",
  featureLink: "Read the story",
  readLabel: "Read article",
  contentsLabel: "In this article",
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
    { label: "Electric bikes", meta: "Short urban journeys", href: "/ev-bikes" },
  ],
  latestLabel: "Most recent",
} as const;

export const EMPTY = {
  title: "The first entries are being prepared.",
  copy: "New writing on solar, storage and mobility will appear here. In the meantime, the conversation is open.",
  action: { label: "Contact LONEX", href: "/contact" },
} as const;

/** Distinct subjects present in a set of posts. */
export function subjectsFor(posts: PublicBlogCard[]): SubjectTopicId[] {
  const seen = new Set<SubjectTopicId>();

  posts.forEach((post) => seen.add(topicForSlug(post.slug)));

  return TOPIC_ORDER.filter((topic) => seen.has(topic)).concat(
    seen.has("journal") ? ["journal"] : [],
  );
}