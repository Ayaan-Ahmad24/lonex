import Link from "next/link";
import { Fragment, type ReactNode } from "react";

import type {
  InlineSpan,
  RichTextBlock,
  RichTextDocument,
} from "@/lib/content/rich-text";

import { ARTICLE, type OutlineEntry } from "./content";

/**
 * The article renderer for the public reading page.
 *
 * It is intentionally separate from the shared admin-preview renderer: this
 * one adds the editorial layer (numbered sections, a lead paragraph, list
 * markers and a presentation-level "next step" callout) while still emitting
 * only React elements from validated rich-text blocks.
 */

function renderSpan(span: InlineSpan, key: number): ReactNode {
  let node: ReactNode = span.text;

  if (span.bold) {
    node = <strong>{node}</strong>;
  }

  if (span.italic) {
    node = <em>{node}</em>;
  }

  if (span.underline) {
    node = <u>{node}</u>;
  }

  if (span.href) {
    node = span.href.startsWith("/") ? (
      <Link href={span.href} className="lxad-inline-link">
        {node}
      </Link>
    ) : (
      <a
        href={span.href}
        target="_blank"
        rel="noopener noreferrer"
        className="lxad-inline-link"
      >
        {node}
      </a>
    );
  }

  return <Fragment key={key}>{node}</Fragment>;
}

function renderSpans(spans: InlineSpan[]): ReactNode {
  return spans.map((span, index) => renderSpan(span, index));
}

/**
 * A paragraph that contains nothing but a link is the stored form of a closing
 * action ("Verify a model", "Find a seller", "Explore electric bikes"). It is
 * promoted to a labelled callout so it reads as a next step, not a stray link.
 */
function singleLink(block: RichTextBlock): InlineSpan | null {
  if (block.type !== "paragraph" || block.spans.length !== 1) {
    return null;
  }

  const [span] = block.spans;

  return span.href ? span : null;
}

export function ArticleBody({
  document,
  outline,
}: {
  document: RichTextDocument;
  outline: OutlineEntry[];
}) {
  const blocks: ReactNode[] = [];
  let leadUsed = false;
  let h2Index = 0;

  document.blocks.forEach((block, index) => {
    const key = `${block.type}-${index}`;

    if (block.type === "heading") {
      const text = renderSpans(block.spans);

      if (block.level === 2) {
        const entry = outline[h2Index];
        const id = entry?.id ?? `section-${h2Index + 1}`;
        const number = String(h2Index + 1).padStart(2, "0");
        h2Index += 1;

        blocks.push(
          <h2 key={key} id={id} className="lxad-h2">
            <span className="lxad-h2__num" aria-hidden="true">
              {number}
            </span>
            {text}
          </h2>,
        );

        return;
      }

      if (block.level === 3) {
        blocks.push(
          <h3 key={key} className="lxad-h3">
            {text}
          </h3>,
        );

        return;
      }

      blocks.push(
        <h4 key={key} className="lxad-h4">
          {text}
        </h4>,
      );

      return;
    }

    if (block.type === "list") {
      const ListTag = block.ordered ? "ol" : "ul";

      blocks.push(
        <ListTag
          key={key}
          className={`lxad-list${block.ordered ? " lxad-list--ordered" : ""}`}
        >
          {block.items.map((item, itemIndex) => (
            <li key={itemIndex}>{renderSpans(item)}</li>
          ))}
        </ListTag>,
      );

      return;
    }

    if (block.type === "quote") {
      blocks.push(
        <blockquote key={key} className="lxad-quote">
          <p>{renderSpans(block.spans)}</p>
        </blockquote>,
      );

      return;
    }

    if (block.type === "hr") {
      blocks.push(<hr key={key} className="lxad-rule" />);

      return;
    }

    const link = singleLink(block);

    if (link) {
      const external = link.href?.startsWith("http") ?? false;
      const content = (
        <>
          {link.text}
          <span aria-hidden="true">{external ? "↗" : "→"}</span>
        </>
      );

      blocks.push(
        <aside key={key} className="lxad-next">
          <p className="lxad-next__label">{ARTICLE.nextStepLabel}</p>
          {external ? (
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="lxad-next__link"
            >
              {content}
            </a>
          ) : (
            <Link href={link.href ?? "/"} className="lxad-next__link">
              {content}
            </Link>
          )}
        </aside>,
      );

      return;
    }

    const isLead = !leadUsed;
    leadUsed = true;

    blocks.push(
      <p key={key} className={`lxad-p${isLead ? " lxad-p--lead" : ""}`}>
        {renderSpans(block.spans)}
      </p>,
    );
  });

  return (
    <div className="lxad-body">
      {blocks}
      <span className="lxad-endmark" aria-hidden="true" />
    </div>
  );
}
