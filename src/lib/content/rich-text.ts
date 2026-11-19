import { z } from "zod";

/**
 * Safe structured rich text for blog articles.
 *
 * Articles are stored as typed blocks, never raw HTML. Version 2 adds inline
 * marks (bold, italic, underline, links), H4 headings, horizontal rules and
 * inline figures. The figure block is additive: documents written before it
 * existed still validate and render exactly as they did.
 * Version 1 documents created before Sprint 07 are still accepted and are
 * upgraded in memory when read, so no database migration is required.
 *
 * The public renderer emits React elements from validated data and never uses
 * `dangerouslySetInnerHTML`, so stored content cannot execute.
 */

export const RICH_TEXT_VERSION = 2;
export const LEGACY_RICH_TEXT_VERSION = 1;
export const RICH_TEXT_MAX_BLOCKS = 500;
export const RICH_TEXT_MAX_TEXT = 5000;
export const RICH_TEXT_MAX_DOCUMENT_TEXT = 50000;
export const RICH_TEXT_MAX_INLINE_SPANS = 400;

const FORBIDDEN_MARKUP =
  /<\s*(script|iframe|object|embed|style|link|meta)\b|javascript\s*:/i;

export const safeHrefSchema = z
  .string()
  .trim()
  .min(1)
  .max(500)
  .refine(
    (value) =>
      /^https:\/\/[^\s]+$/i.test(value) ||
      (/^\/[^/\s]/.test(value) && !value.includes("\\")),
    "Links must use https:// or a site-relative path.",
  );

/** Normalise an href from imported HTML. Returns null when it is unsafe. */
export function safeHref(value: string | undefined): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();

  if (
    /^https:\/\/[^\s]+$/i.test(trimmed) ||
    (/^\/[^/\s]/.test(trimmed) && !trimmed.includes("\\"))
  ) {
    return trimmed;
  }

  return null;
}

const imageSrcSchema = z
  .string()
  .trim()
  .min(1)
  .max(1000)
  .refine(
    (value) =>
      !FORBIDDEN_MARKUP.test(value) &&
      !value.includes("\\") &&
      !/[\s"'<>]/.test(value) &&
      (/^https:\/\/[^\s]+$/i.test(value) || /^\/[^/\s]/.test(value)),
    "Images must use https:// or a site-relative path.",
  );

/** Normalise an image source from imported HTML. Returns null when unsafe. */
export function safeImageSrc(value: string | undefined): string | null {
  if (!value) {
    return null;
  }

  const parsed = imageSrcSchema.safeParse(value);

  return parsed.success ? parsed.data : null;
}

const inlineTextSchema = z
  .string()
  .min(1)
  .max(RICH_TEXT_MAX_TEXT)
  .refine((value) => !FORBIDDEN_MARKUP.test(value), "HTML is not allowed.");

export const inlineSpanSchema = z.object({
  text: inlineTextSchema,
  bold: z.boolean().optional(),
  italic: z.boolean().optional(),
  underline: z.boolean().optional(),
  href: safeHrefSchema.optional(),
});

export type InlineSpan = z.infer<typeof inlineSpanSchema>;

const spansSchema = z
  .array(inlineSpanSchema)
  .min(1)
  .max(RICH_TEXT_MAX_INLINE_SPANS);

export const paragraphBlockSchema = z.object({
  type: z.literal("paragraph"),
  spans: spansSchema,
});

export const headingBlockSchema = z.object({
  type: z.literal("heading"),
  level: z.union([z.literal(2), z.literal(3), z.literal(4)]),
  spans: spansSchema,
});

export const listBlockSchema = z.object({
  type: z.literal("list"),
  ordered: z.boolean(),
  items: z.array(spansSchema).min(1).max(50),
});

export const quoteBlockSchema = z.object({
  type: z.literal("quote"),
  spans: spansSchema,
});

export const horizontalRuleBlockSchema = z.object({
  type: z.literal("hr"),
});

/**
 * An inline figure inside the reading column.
 *
 * `alt` is required because the public renderer never has surrounding text to
 * explain the photograph. `width` and `height` are optional: when the editor
 * knows the intrinsic size it stores them so the layout can reserve space and
 * the source is served at its real size rather than a forced large variant.
 */
export const imageBlockSchema = z.object({
  type: z.literal("image"),
  src: imageSrcSchema,
  alt: z
    .string()
    .trim()
    .min(1, "Describe the image for screen readers.")
    .max(300),
  caption: z.string().trim().max(500).optional(),
  width: z.number().int().positive().max(20000).optional(),
  height: z.number().int().positive().max(20000).optional(),
});

export const richTextBlockSchema = z.discriminatedUnion("type", [
  paragraphBlockSchema,
  headingBlockSchema,
  listBlockSchema,
  quoteBlockSchema,
  horizontalRuleBlockSchema,
  imageBlockSchema,
]);

export type RichTextBlock = z.infer<typeof richTextBlockSchema>;

export const richTextDocumentSchema = z
  .object({
    version: z.literal(RICH_TEXT_VERSION),
    blocks: z.array(richTextBlockSchema).min(1).max(RICH_TEXT_MAX_BLOCKS),
  })
  .superRefine((document, context) => {
    if (documentTextLength(document) > RICH_TEXT_MAX_DOCUMENT_TEXT) {
      context.addIssue({
        code: "custom",
        message: `Article content must be ${RICH_TEXT_MAX_DOCUMENT_TEXT} characters or fewer.`,
      });
    }
  });

export type RichTextDocument = z.infer<typeof richTextDocumentSchema>;

// ---------------------------------------------------------------------------
// Legacy version 1 documents (created before Sprint 07)
// ---------------------------------------------------------------------------

const legacyTextSchema = z
  .string()
  .trim()
  .min(1)
  .max(RICH_TEXT_MAX_TEXT)
  .refine((value) => !FORBIDDEN_MARKUP.test(value), "HTML is not allowed.");

const legacyBlockSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("paragraph"), text: legacyTextSchema }),
  z.object({
    type: z.literal("heading"),
    level: z.union([z.literal(2), z.literal(3)]),
    text: legacyTextSchema,
  }),
  z.object({
    type: z.literal("list"),
    ordered: z.boolean(),
    items: z.array(legacyTextSchema).min(1).max(50),
  }),
  z.object({ type: z.literal("quote"), text: legacyTextSchema }),
  z.object({
    type: z.literal("link"),
    text: legacyTextSchema,
    href: safeHrefSchema,
  }),
]);

const legacyDocumentSchema = z.object({
  version: z.literal(LEGACY_RICH_TEXT_VERSION),
  blocks: z.array(legacyBlockSchema).min(1).max(RICH_TEXT_MAX_BLOCKS),
});

export function upgradeLegacyDocument(
  document: z.infer<typeof legacyDocumentSchema>,
): RichTextDocument {
  return {
    version: RICH_TEXT_VERSION,
    blocks: document.blocks.map((block): RichTextBlock => {
      switch (block.type) {
        case "paragraph":
          return { type: "paragraph", spans: [{ text: block.text }] };
        case "heading":
          return {
            type: "heading",
            level: block.level,
            spans: [{ text: block.text }],
          };
        case "list":
          return {
            type: "list",
            ordered: block.ordered,
            items: block.items.map((item) => [{ text: item }]),
          };
        case "quote":
          return { type: "quote", spans: [{ text: block.text }] };
        case "link":
          return {
            type: "paragraph",
            spans: [{ text: block.text, href: block.href }],
          };
        default:
          return { type: "paragraph", spans: [{ text: "" }] };
      }
    }),
  };
}

export type RichTextParseResult =
  | { ok: true; document: RichTextDocument }
  | { ok: false; reason: string };

function documentTextLength(document: RichTextDocument): number {
  let total = 0;

  for (const block of document.blocks) {
    if (block.type === "list") {
      for (const item of block.items) {
        total += item.reduce((sum, span) => sum + span.text.length, 0);
      }
    } else if (block.type === "image") {
      total += block.caption?.length ?? 0;
    } else if (block.type !== "hr") {
      total += block.spans.reduce((sum, span) => sum + span.text.length, 0);
    }
  }

  return total;
}

/**
 * Validate a document loaded from the database before rendering it.
 * Version 1 documents are upgraded in memory. Corrupt or hand-edited JSON
 * fails closed instead of reaching the page.
 */
export function parseStoredRichText(value: unknown): RichTextDocument | null {
  const current = richTextDocumentSchema.safeParse(value);

  if (current.success) {
    return current.data;
  }

  const legacy = legacyDocumentSchema.safeParse(value);

  if (legacy.success) {
    const upgraded = upgradeLegacyDocument(legacy.data);
    return richTextDocumentSchema.safeParse(upgraded).success
      ? upgraded
      : null;
  }

  return null;
}

// ---------------------------------------------------------------------------
// Legacy authoring syntax (kept for backward-compatible imports/tests)
// ---------------------------------------------------------------------------

const LINK_LINE = /^\[([^\]]+)\]\(([^)\s]+)\)$/;
const HEADING_LINE = /^(#{2,3})\s+(.+)$/;
const QUOTE_LINE = /^>\s?(.+)$/;
const BULLET_LINE = /^[-*]\s+(.+)$/;
const ORDERED_LINE = /^\d+[.)]\s+(.+)$/;

/**
 * Parse the original line-based authoring syntax.
 *
 * `##` / `###` headings, `-` bullets, `1.` ordered items, `>` quotes and
 * `[text](https://…)` links. Everything else is a paragraph. Consecutive
 * lines form one paragraph until a blank line.
 */
export function parseRichText(input: string): RichTextParseResult {
  const normalized = input.replace(/\r\n/g, "\n").trim();

  if (!normalized) {
    return { ok: false, reason: "Article content is required." };
  }

  if (FORBIDDEN_MARKUP.test(normalized)) {
    return {
      ok: false,
      reason: "HTML, scripts and iframes are not allowed in article content.",
    };
  }

  const lines = normalized.split("\n");
  const blocks: RichTextBlock[] = [];
  let paragraph: string[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;

  const flushParagraph = () => {
    if (paragraph.length > 0) {
      blocks.push({
        type: "paragraph",
        spans: [{ text: paragraph.join(" ").trim() }],
      });
      paragraph = [];
    }
  };

  const flushList = () => {
    if (list) {
      blocks.push({
        type: "list",
        ordered: list.ordered,
        items: list.items.map((item) => [{ text: item }]),
      });
      list = null;
    }
  };

  for (const raw of lines) {
    const line = raw.trim();

    if (line === "") {
      flushParagraph();
      flushList();
      continue;
    }

    const link = LINK_LINE.exec(line);

    if (link) {
      flushParagraph();
      flushList();
      const href = safeHref(link[2]);

      if (href) {
        blocks.push({
          type: "paragraph",
          spans: [{ text: link[1].trim(), href }],
        });
      } else {
        blocks.push({
          type: "paragraph",
          spans: [{ text: link[1].trim() }],
        });
      }
      continue;
    }

    const heading = HEADING_LINE.exec(line);

    if (heading) {
      flushParagraph();
      flushList();
      blocks.push({
        type: "heading",
        level: heading[1].length === 2 ? 2 : 3,
        spans: [{ text: heading[2].trim() }],
      });
      continue;
    }

    const quote = QUOTE_LINE.exec(line);

    if (quote) {
      flushParagraph();
      flushList();
      blocks.push({ type: "quote", spans: [{ text: quote[1].trim() }] });
      continue;
    }

    const bullet = BULLET_LINE.exec(line);
    const ordered = ORDERED_LINE.exec(line);

    if (bullet || ordered) {
      flushParagraph();
      const orderedFlag = Boolean(ordered);
      const item = (bullet ? bullet[1] : ordered?.[1] ?? "").trim();

      if (!list || list.ordered !== orderedFlag) {
        flushList();
        list = { ordered: orderedFlag, items: [] };
      }

      list.items.push(item);
      continue;
    }

    flushList();
    paragraph.push(line);
  }

  flushParagraph();
  flushList();

  const parsed = richTextDocumentSchema.safeParse({
    version: RICH_TEXT_VERSION,
    blocks,
  });

  if (!parsed.success) {
    return {
      ok: false,
      reason: parsed.error.issues[0]?.message ?? "Article content is invalid.",
    };
  }

  return { ok: true, document: parsed.data };
}

// ---------------------------------------------------------------------------
// Safe HTML serialization (editor bootstrap + previews)
// ---------------------------------------------------------------------------

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => HTML_ESCAPES[character]);
}

function spanToHtml(span: InlineSpan): string {
  let html = escapeHtml(span.text);

  if (span.bold) {
    html = `<strong>${html}</strong>`;
  }

  if (span.italic) {
    html = `<em>${html}</em>`;
  }

  if (span.underline) {
    html = `<u>${html}</u>`;
  }

  if (span.href) {
    html = `<a href="${escapeHtml(span.href)}">${html}</a>`;
  }

  return html;
}

function spansToHtml(spans: InlineSpan[]): string {
  return spans.map(spanToHtml).join("");
}

/**
 * Serialize a validated document to HTML for the editor bootstrap.
 * The output is generated from typed data with escaped text, never from
 * stored raw HTML.
 */
export function richTextDocumentToHtml(document: RichTextDocument): string {
  return document.blocks
    .map((block) => {
      switch (block.type) {
        case "paragraph":
          return `<p>${spansToHtml(block.spans)}</p>`;
        case "heading":
          return `<h${block.level}>${spansToHtml(block.spans)}</h${block.level}>`;
        case "list": {
          const tag = block.ordered ? "ol" : "ul";
          const items = block.items
            .map((item) => `<li>${spansToHtml(item)}</li>`)
            .join("");
          return `<${tag}>${items}</${tag}>`;
        }
        case "quote":
          return `<blockquote><p>${spansToHtml(block.spans)}</p></blockquote>`;
        case "hr":
          return "<hr>";
        case "image": {
          const attributes = [
            `src="${escapeHtml(block.src)}"`,
            `alt="${escapeHtml(block.alt)}"`,
          ];

          if (block.width) {
            attributes.push(`width="${block.width}"`);
          }

          if (block.height) {
            attributes.push(`height="${block.height}"`);
          }

          const caption = block.caption
            ? `<figcaption>${escapeHtml(block.caption)}</figcaption>`
            : "";

          return `<figure data-article-image><img ${attributes.join(" ")}>${caption}</figure>`;
        }
        default:
          return "";
      }
    })
    .join("\n");
}

/** Short plain-text summary for cards and metadata fallbacks. */
export function richTextToPlainText(
  document: RichTextDocument,
  maxLength = 300,
): string {
  const parts: string[] = [];

  for (const block of document.blocks) {
    if (block.type === "hr" || block.type === "image") {
      continue;
    }

    if (block.type === "list") {
      for (const item of block.items) {
        parts.push(item.map((span) => span.text).join(""));
      }
    } else {
      parts.push(block.spans.map((span) => span.text).join(""));
    }

    if (parts.join(" ").length >= maxLength) {
      break;
    }
  }

  const text = parts.join(" ").replace(/\s+/g, " ").trim();

  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;
}
