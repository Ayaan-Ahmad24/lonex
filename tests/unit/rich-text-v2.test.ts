import { describe, expect, it } from "vitest";
import {
  RICH_TEXT_VERSION,
  LEGACY_RICH_TEXT_VERSION,
  parseStoredRichText,
  richTextDocumentToHtml,
  safeHref,
  type RichTextBlock,
  type RichTextDocument,
} from "@/lib/content/rich-text";
import { parseRichTextHtml } from "@/lib/content/blog-content";
import type { RichTextParseResult } from "@/lib/content/rich-text";

describe("rich-text v2 schema", () => {
  it("accepts a valid v2 document", () => {
    const doc: RichTextDocument = {
      version: RICH_TEXT_VERSION,
      blocks: [
        {
          type: "paragraph",
          spans: [{ text: "Hello world" }],
        },
      ],
    };

    const result = parseStoredRichText(doc);

    expect(result).not.toBeNull();
    expect(result?.version).toBe(RICH_TEXT_VERSION);
  });

  it("rejects empty blocks", () => {
    const doc = {
      version: RICH_TEXT_VERSION,
      blocks: [],
    };

    expect(parseStoredRichText(doc)).toBeNull();
  });

  it("rejects a document with a forbidden span", () => {
    const doc: RichTextDocument = {
      version: RICH_TEXT_VERSION,
      blocks: [
        {
          type: "paragraph",
          spans: [{ text: "<script>alert(1)</script>" }],
        },
      ],
    };

    expect(parseStoredRichText(doc)).toBeNull();
  });

  it("supports all block types including H4 and hr", () => {
    const doc: RichTextDocument = {
      version: RICH_TEXT_VERSION,
      blocks: [
        { type: "heading", level: 2, spans: [{ text: "H2" }] },
        { type: "heading", level: 3, spans: [{ text: "H3" }] },
        { type: "heading", level: 4, spans: [{ text: "H4" }] },
        { type: "paragraph", spans: [{ text: "Text" }] },
        { type: "list", ordered: false, items: [[{ text: "Item" }]] },
        { type: "list", ordered: true, items: [[{ text: "Item" }]] },
        { type: "quote", spans: [{ text: "Quote" }] },
        { type: "hr" },
      ],
    };

    const result = parseStoredRichText(doc);

    expect(result).not.toBeNull();
    expect(result?.blocks).toHaveLength(8);
  });

  it("accepts an image block with alt, caption and dimensions", () => {
    const doc: RichTextDocument = {
      version: RICH_TEXT_VERSION,
      blocks: [
        {
          type: "image",
          src: "/images/v2/craft-panel.webp",
          alt: "A panel being fitted",
          caption: "Fitting a panel.",
          width: 1600,
          height: 900,
        },
      ],
    };

    const result = parseStoredRichText(doc);

    expect(result).not.toBeNull();
    const image = result?.blocks[0] as Extract<
      RichTextBlock,
      { type: "image" }
    >;
    expect(image.type).toBe("image");
    expect(image.src).toBe("/images/v2/craft-panel.webp");
    expect(image.alt).toBe("A panel being fitted");
    expect(image.caption).toBe("Fitting a panel.");
    expect(image.width).toBe(1600);
    expect(image.height).toBe(900);
  });

  it("rejects an image block without alt text", () => {
    const doc = {
      version: RICH_TEXT_VERSION,
      blocks: [
        { type: "image", src: "/images/v2/craft-panel.webp", alt: "" },
      ],
    };

    expect(parseStoredRichText(doc)).toBeNull();
  });

  it("rejects an image block with an unsafe source", () => {
    const doc = {
      version: RICH_TEXT_VERSION,
      blocks: [
        {
          type: "image",
          src: "javascript:alert(1)",
          alt: "Not allowed",
        },
      ],
    };

    expect(parseStoredRichText(doc)).toBeNull();
  });

  it("supports inline marks and links", () => {
    const doc: RichTextDocument = {
      version: RICH_TEXT_VERSION,
      blocks: [
        {
          type: "paragraph",
          spans: [
            { text: "Bold ", bold: true },
            { text: "italic ", italic: true },
            { text: "underline ", underline: true },
            { text: "link", href: "https://example.com" },
            { text: "relative", href: "/page" },
          ],
        },
      ],
    };

    const result = parseStoredRichText(doc);

    expect(result).not.toBeNull();
    const first = result?.blocks[0] as Extract<
      RichTextBlock,
      { type: "paragraph" }
    >;
    const spans = first.spans;
    expect(spans).toHaveLength(5);
    expect(spans[0].bold).toBe(true);
    expect(spans[1].italic).toBe(true);
    expect(spans[2].underline).toBe(true);
    expect(spans[3].href).toBe("https://example.com");
    expect(spans[4].href).toBe("/page");
  });

  it("rejects unsafe links", () => {
    const doc: RichTextDocument = {
      version: RICH_TEXT_VERSION,
      blocks: [
        {
          type: "paragraph",
          spans: [{ text: "bad", href: "javascript:alert(1)" }],
        },
      ],
    };

    expect(parseStoredRichText(doc)).toBeNull();
  });
});

describe("rich-text v1 legacy compatibility", () => {
  it("upgrades a v1 paragraph", () => {
    const doc = {
      version: LEGACY_RICH_TEXT_VERSION,
      blocks: [{ type: "paragraph", text: "Legacy paragraph" }],
    };

    const result = parseStoredRichText(doc);

    expect(result).not.toBeNull();
    expect(result?.version).toBe(RICH_TEXT_VERSION);
    expect(result?.blocks[0].type).toBe("paragraph");
    const para = result?.blocks[0] as Extract<
      RichTextBlock,
      { type: "paragraph" }
    >;
    expect(para.spans[0].text).toBe("Legacy paragraph");
  });

  it("upgrades a v1 heading", () => {
    const doc = {
      version: LEGACY_RICH_TEXT_VERSION,
      blocks: [{ type: "heading", level: 2, text: "Legacy heading" }],
    };

    const result = parseStoredRichText(doc);

    expect(result).not.toBeNull();
    expect(result?.blocks[0].type).toBe("heading");
    const heading = result?.blocks[0] as Extract<
      RichTextBlock,
      { type: "heading" }
    >;
    expect(heading.level).toBe(2);
  });

  it("upgrades a v1 list", () => {
    const doc = {
      version: LEGACY_RICH_TEXT_VERSION,
      blocks: [
        {
          type: "list",
          ordered: false,
          items: ["Item 1", "Item 2"],
        },
      ],
    };

    const result = parseStoredRichText(doc);

    expect(result).not.toBeNull();
    expect(result?.blocks[0].type).toBe("list");
    const list = result?.blocks[0] as Extract<
      RichTextBlock,
      { type: "list" }
    >;
    expect(list.items).toHaveLength(2);
  });

  it("upgrades a v1 link to a paragraph with href", () => {
    const doc = {
      version: LEGACY_RICH_TEXT_VERSION,
      blocks: [{ type: "link", text: "Click here", href: "/page" }],
    };

    const result = parseStoredRichText(doc);

    expect(result).not.toBeNull();
    expect(result?.blocks[0].type).toBe("paragraph");
    const para = result?.blocks[0] as Extract<
      RichTextBlock,
      { type: "paragraph" }
    >;
    expect(para.spans[0].href).toBe("/page");
  });

  it("rejects corrupt v1 JSON", () => {
    expect(parseStoredRichText({ version: 99, blocks: [] })).toBeNull();
    expect(parseStoredRichText("not json")).toBeNull();
    expect(parseStoredRichText(null)).toBeNull();
  });
});

describe("rich-text HTML serialization", () => {
  it("serializes all block types to HTML", () => {
    const doc: RichTextDocument = {
      version: RICH_TEXT_VERSION,
      blocks: [
        { type: "paragraph", spans: [{ text: "Hello" }] },
        { type: "heading", level: 2, spans: [{ text: "Heading" }] },
        { type: "list", ordered: false, items: [[{ text: "Item" }]] },
        { type: "quote", spans: [{ text: "Quote" }] },
        { type: "hr" },
      ],
    };

    const html = richTextDocumentToHtml(doc);

    expect(html).toContain("<p>Hello</p>");
    expect(html).toContain("<h2>Heading</h2>");
    expect(html).toContain("<ul>");
    expect(html).toContain("<blockquote>");
    expect(html).toContain("<hr>");
  });

  it("escapes text in HTML output", () => {
    const doc: RichTextDocument = {
      version: RICH_TEXT_VERSION,
      blocks: [
        { type: "paragraph", spans: [{ text: "<script>alert(1)</script>" }] },
      ],
    };

    const html = richTextDocumentToHtml(doc);

    expect(html).toContain("&lt;script&gt;");
    expect(html).not.toContain("<script>");
  });

  it("serializes an image block as a figure", () => {
    const doc: RichTextDocument = {
      version: RICH_TEXT_VERSION,
      blocks: [
        {
          type: "image",
          src: "/images/v2/craft-panel.webp",
          alt: "A panel being fitted",
          caption: "Fitting a panel.",
          width: 1600,
          height: 900,
        },
      ],
    };

    const html = richTextDocumentToHtml(doc);

    expect(html).toContain("<figure data-article-image>");
    expect(html).toContain('src="/images/v2/craft-panel.webp"');
    expect(html).toContain('alt="A panel being fitted"');
    expect(html).toContain('width="1600"');
    expect(html).toContain('height="900"');
    expect(html).toContain("<figcaption>Fitting a panel.</figcaption>");
  });

  it("round-trips an image block through HTML", () => {
    const doc: RichTextDocument = {
      version: RICH_TEXT_VERSION,
      blocks: [
        { type: "paragraph", spans: [{ text: "Before" }] },
        {
          type: "image",
          src: "/images/v2/craft-panel.webp",
          alt: "A panel being fitted",
          caption: "Fitting a panel.",
          width: 1600,
          height: 900,
        },
        { type: "paragraph", spans: [{ text: "After" }] },
      ],
    };

    const result = parseRichTextHtml(richTextDocumentToHtml(doc));

    expect(result.ok).toBe(true);
    if (result.ok) {
      const image = result.document.blocks[1] as Extract<
        RichTextBlock,
        { type: "image" }
      >;
      expect(image.type).toBe("image");
      expect(image.src).toBe("/images/v2/craft-panel.webp");
      expect(image.alt).toBe("A panel being fitted");
      expect(image.caption).toBe("Fitting a panel.");
      expect(image.width).toBe(1600);
      expect(image.height).toBe(900);
    }
  });
});

describe("safeHref", () => {
  it("accepts https URLs", () => {
    expect(safeHref("https://example.com")).toBe("https://example.com");
  });

  it("accepts site-relative paths", () => {
    expect(safeHref("/page")).toBe("/page");
  });

  it("rejects javascript URLs", () => {
    expect(safeHref("javascript:alert(1)")).toBeNull();
  });

  it("rejects data URLs", () => {
    expect(safeHref("data:text/html,<script>")).toBeNull();
  });

  it("rejects empty values", () => {
    expect(safeHref("")).toBeNull();
    expect(safeHref(undefined)).toBeNull();
  });
});

describe("parseRichTextHtml (server sanitizer)", () => {
  it("converts safe HTML to structured blocks", () => {
    const result: RichTextParseResult = parseRichTextHtml(
      "<p>Hello <strong>world</strong></p><h2>Heading</h2>",
    );

    if (!result.ok) {
      throw new Error("Expected ok result");
    }

    expect(result.document.blocks[0].type).toBe("paragraph");
    const heading1 = result.document.blocks[1] as Extract<
      RichTextBlock,
      { type: "heading" }
    >;
    expect(heading1.level).toBe(2);
  });

  it("rejects scripts", () => {
    const result: RichTextParseResult = parseRichTextHtml(
      "<p>Hello</p><script>alert(1)</script>",
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toContain("script");
    }
  });

  it("rejects iframes", () => {
    const result: RichTextParseResult = parseRichTextHtml(
      '<p>Hello</p><iframe src="x"></iframe>',
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toContain("iframe");
    }
  });

  it("rejects javascript: URLs", () => {
    const result: RichTextParseResult = parseRichTextHtml(
      '<a href="javascript:alert(1)">x</a>',
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toContain("javascript");
    }
  });

  it("rejects SVG", () => {
    const result: RichTextParseResult = parseRichTextHtml(
      '<p>Hello</p><svg onload="alert(1)"></svg>',
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toContain("SVG");
    }
  });

  it("rejects event handlers", () => {
    const result: RichTextParseResult = parseRichTextHtml(
      '<p onclick="alert(1)">x</p>',
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toContain("event");
    }
  });

  it("supports H4 and horizontal rules", () => {
    const result: RichTextParseResult = parseRichTextHtml(
      "<h4>Small heading</h4><hr>",
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      const heading2 = result.document.blocks[0] as Extract<
        RichTextBlock,
        { type: "heading" }
      >;
      expect(heading2.level).toBe(4);
      expect(result.document.blocks[1].type).toBe("hr");
    }
  });

  it("supports lists and blockquotes", () => {
    const result: RichTextParseResult = parseRichTextHtml(
      "<ul><li>Item</li></ul><blockquote><p>Quote</p></blockquote>",
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      const listBlock = result.document.blocks[0] as Extract<
        RichTextBlock,
        { type: "list" }
      >;
      expect(listBlock.ordered).toBe(false);
      expect(result.document.blocks[1].type).toBe("quote");
    }
  });

  it("supports an inline figure with a caption", () => {
    const result: RichTextParseResult = parseRichTextHtml(
      '<p>Intro</p><figure data-article-image><img src="/images/v2/craft-panel.webp" alt="A panel being fitted" width="1600" height="900"><figcaption>Fitting a panel.</figcaption></figure>',
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      const image = result.document.blocks[1] as Extract<
        RichTextBlock,
        { type: "image" }
      >;
      expect(image.type).toBe("image");
      expect(image.src).toBe("/images/v2/craft-panel.webp");
      expect(image.alt).toBe("A panel being fitted");
      expect(image.caption).toBe("Fitting a panel.");
      expect(image.width).toBe(1600);
      expect(image.height).toBe(900);
    }
  });

  it("supports a bare image element", () => {
    const result: RichTextParseResult = parseRichTextHtml(
      '<img src="https://example.com/photo.jpg" alt="A rooftop array">',
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.document.blocks[0].type).toBe("image");
    }
  });

  it("rejects an image without alt text", () => {
    const result: RichTextParseResult = parseRichTextHtml(
      '<img src="/images/v2/craft-panel.webp">',
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toContain("Describe the image");
    }
  });

  it("rejects a data: image source", () => {
    const result: RichTextParseResult = parseRichTextHtml(
      '<img src="data:image/png;base64,AAAA" alt="Inline data">',
    );

    expect(result.ok).toBe(false);
  });

  it("rejects empty input", () => {
    const result: RichTextParseResult = parseRichTextHtml("");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("Article content is required.");
    }
  });
});
