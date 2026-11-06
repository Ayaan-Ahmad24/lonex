import sanitizeHtml from "sanitize-html";
import { parseDocument } from "htmlparser2";
import {
  RICH_TEXT_VERSION,
  richTextDocumentSchema,
  safeHref,
  type InlineSpan,
  type RichTextBlock,
  type RichTextDocument,
  type RichTextParseResult,
} from "./rich-text";

/**
 * Server-side HTML import for the blog editor.
 *
 * The submitted HTML is treated as untrusted. It is first checked for
 * explicitly dangerous constructs so the author gets a useful error, then run
 * through `sanitize-html` with a strict allowlist, then converted into the
 * structured block model. Nothing from the source is stored as HTML.
 */

const ALLOWED_TAGS = [
  "p",
  "h2",
  "h3",
  "h4",
  "strong",
  "em",
  "u",
  "ul",
  "ol",
  "li",
  "blockquote",
  "a",
  "hr",
  "br",
];

const UNSAFE_HTML =
  /<\s*\/?\s*(script|iframe|object|embed|form|svg|style|link|meta|input|button|textarea|select)\b|\son[a-z]+\s*=|\b(?:href|src|action|formaction)\s*=\s*["']?\s*(?:javascript|vbscript|data)\s*:/i;

type HtmlNode = {
  type?: string;
  name?: string;
  data?: string;
  attribs?: Record<string, string>;
  children?: HtmlNode[];
};

type InlineState = {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  href?: string;
};

const BLOCK_TAGS = new Set([
  "p",
  "h2",
  "h3",
  "h4",
  "ul",
  "ol",
  "blockquote",
  "hr",
  "div",
  "section",
  "article",
]);

const INLINE_TAGS = new Set(["strong", "em", "u", "a", "br", "span"]);

function tagName(node: HtmlNode): string {
  return (node.name ?? "").toLowerCase();
}

function normalizeText(value: string): string {
  return value.replace(/\s+/g, " ");
}

function sameMarks(left: InlineSpan, right: InlineState): boolean {
  return (
    Boolean(left.bold) === Boolean(right.bold) &&
    Boolean(left.italic) === Boolean(right.italic) &&
    Boolean(left.underline) === Boolean(right.underline) &&
    left.href === right.href
  );
}

function pushSpan(spans: InlineSpan[], text: string, state: InlineState): void {
  if (!text) {
    return;
  }

  const last = spans[spans.length - 1];

  if (last && sameMarks(last, state)) {
    last.text += text;
    return;
  }

  spans.push({
    text,
    ...(state.bold ? { bold: true as const } : {}),
    ...(state.italic ? { italic: true as const } : {}),
    ...(state.underline ? { underline: true as const } : {}),
    ...(state.href ? { href: state.href } : {}),
  });
}

function pushSpans(target: InlineSpan[], source: InlineSpan[]): void {
  for (const span of source) {
    pushSpan(target, span.text, span);
  }
}

function collectInline(nodes: HtmlNode[], state: InlineState): InlineSpan[] {
  const spans: InlineSpan[] = [];

  for (const node of nodes) {
    if (node.type === "text") {
      pushSpan(spans, normalizeText(node.data ?? ""), state);
      continue;
    }

    if (node.type !== "tag") {
      continue;
    }

    const tag = tagName(node);
    const children = node.children ?? [];

    if (tag === "br") {
      pushSpan(spans, " ", state);
    } else if (tag === "strong") {
      pushSpans(spans, collectInline(children, { ...state, bold: true }));
    } else if (tag === "em") {
      pushSpans(spans, collectInline(children, { ...state, italic: true }));
    } else if (tag === "u") {
      pushSpans(spans, collectInline(children, { ...state, underline: true }));
    } else if (tag === "a") {
      const href = safeHref(node.attribs?.href);
      pushSpans(
        spans,
        collectInline(children, href ? { ...state, href } : state),
      );
    } else {
      pushSpans(spans, collectInline(children, state));

      if (tag === "p" || tag === "li" || tag === "blockquote") {
        pushSpan(spans, " ", state);
      }
    }
  }

  return spans;
}

function trimSpans(spans: InlineSpan[]): InlineSpan[] {
  if (spans.length === 0) {
    return spans;
  }

  const trimmed = spans.map((span) => ({ ...span }));
  trimmed[0].text = trimmed[0].text.replace(/^\s+/, "");
  trimmed[trimmed.length - 1].text = trimmed[
    trimmed.length - 1
  ].text.replace(/\s+$/, "");

  return trimmed.filter((span) => span.text.length > 0);
}

function blockSpans(node: HtmlNode): InlineSpan[] {
  return trimSpans(collectInline(node.children ?? [], {}));
}

function appendBlocks(nodes: HtmlNode[], blocks: RichTextBlock[]): void {
  let inline: HtmlNode[] = [];

  const flushInline = () => {
    if (inline.length === 0) {
      return;
    }

    const spans = trimSpans(collectInline(inline, {}));
    inline = [];

    if (spans.length > 0) {
      blocks.push({ type: "paragraph", spans });
    }
  };

  for (const node of nodes) {
    if (node.type === "text") {
      inline.push(node);
      continue;
    }

    if (node.type !== "tag") {
      continue;
    }

    const tag = tagName(node);

    if (INLINE_TAGS.has(tag)) {
      inline.push(node);
      continue;
    }

    if (!BLOCK_TAGS.has(tag)) {
      flushInline();
      appendBlocks(node.children ?? [], blocks);
      continue;
    }

    flushInline();

    if (tag === "p") {
      const spans = blockSpans(node);

      if (spans.length > 0) {
        blocks.push({ type: "paragraph", spans });
      }
    } else if (tag === "h2" || tag === "h3" || tag === "h4") {
      const spans = blockSpans(node);
      const level = Number(tag.slice(1)) as 2 | 3 | 4;

      if (spans.length > 0) {
        blocks.push({ type: "heading", level, spans });
      }
    } else if (tag === "ul" || tag === "ol") {
      const items = (node.children ?? [])
        .filter((child) => child.type === "tag" && tagName(child) === "li")
        .map((child) => blockSpans(child))
        .filter((item) => item.length > 0);

      if (items.length > 0) {
        blocks.push({ type: "list", ordered: tag === "ol", items });
      }
    } else if (tag === "blockquote") {
      const spans = blockSpans(node);

      if (spans.length > 0) {
        blocks.push({ type: "quote", spans });
      }
    } else if (tag === "hr") {
      blocks.push({ type: "hr" });
    } else {
      // div/section/article wrappers: keep their block children.
      appendBlocks(node.children ?? [], blocks);
    }
  }

  flushInline();
}

export function sanitizeArticleHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: { a: ["href"] },
    allowedSchemes: ["https"],
    allowedSchemesByTag: { a: ["https"] },
    allowProtocolRelative: false,
    disallowedTagsMode: "discard",
    transformTags: {
      b: "strong",
      i: "em",
    },
  });
}

/**
 * Convert untrusted editor HTML into a validated structured document.
 */
export function parseRichTextHtml(input: string): RichTextParseResult {
  if (!input.trim()) {
    return { ok: false, reason: "Article content is required." };
  }

  if (UNSAFE_HTML.test(input)) {
    return {
      ok: false,
      reason:
        "Remove scripts, iframes, forms, SVG, event handlers and javascript:/data: URLs. They are not allowed in article content.",
    };
  }

  const sanitized = sanitizeArticleHtml(input);
  const root = parseDocument(sanitized) as unknown as HtmlNode;
  const blocks: RichTextBlock[] = [];

  appendBlocks(root.children ?? [], blocks);

  if (blocks.length === 0) {
    return {
      ok: false,
      reason:
        "Article content must contain text, a heading, a list, a quote or a horizontal rule.",
    };
  }

  const parsed = richTextDocumentSchema.safeParse({
    version: RICH_TEXT_VERSION,
    blocks,
  });

  if (!parsed.success) {
    return {
      ok: false,
      reason:
        parsed.error.issues[0]?.message ?? "Article content is invalid.",
    };
  }

  return { ok: true, document: parsed.data as RichTextDocument };
}
