import type { ReactNode } from "react";
import type {
  InlineSpan,
  RichTextDocument,
} from "@/lib/content/rich-text";

/**
 * Safe article renderer.
 *
 * Every block and inline span is emitted as a React element. No raw HTML is
 * injected, so stored or imported markup cannot execute even if the database
 * were tampered with.
 */

function linkProps(href: string) {
  return href.startsWith("http")
    ? { href, target: "_blank" as const, rel: "noopener noreferrer" }
    : { href };
}

function renderSpan(span: InlineSpan, key: number): ReactNode {
  let node: ReactNode = span.text;

  if (span.bold) {
    node = <strong className="font-semibold text-black/85">{node}</strong>;
  }

  if (span.italic) {
    node = <em>{node}</em>;
  }

  if (span.underline) {
    node = <u className="underline underline-offset-4">{node}</u>;
  }

  if (span.href) {
    node = (
      <a
        {...linkProps(span.href)}
        className="font-medium text-[#CF0A0A] underline decoration-2 underline-offset-4 transition-colors hover:text-black"
      >
        {node}
      </a>
    );
  }

  return <span key={key}>{node}</span>;
}

function renderSpans(spans: InlineSpan[]): ReactNode {
  return spans.map((span, index) => renderSpan(span, index));
}

export function RichTextRenderer({ document }: { document: RichTextDocument }) {
  return (
    <div className="space-y-6 text-base leading-8 text-black/65 sm:text-[17px] sm:leading-9">
      {document.blocks.map((block, index) => {
        switch (block.type) {
          case "heading":
            if (block.level === 2) {
              return (
                <h2
                  key={index}
                  className="pt-6 text-3xl font-semibold tracking-tight text-black sm:text-4xl"
                >
                  {renderSpans(block.spans)}
                </h2>
              );
            }

            if (block.level === 3) {
              return (
                <h3
                  key={index}
                  className="pt-3 text-2xl font-semibold tracking-tight text-black"
                >
                  {renderSpans(block.spans)}
                </h3>
              );
            }

            return (
              <h4
                key={index}
                className="pt-2 text-xl font-semibold tracking-tight text-black"
              >
                {renderSpans(block.spans)}
              </h4>
            );
          case "list":
            return block.ordered ? (
              <ol
                key={index}
                className="list-decimal space-y-2 pl-6 marker:text-[#CF0A0A]"
              >
                {block.items.map((item, itemIndex) => (
                  <li key={itemIndex}>{renderSpans(item)}</li>
                ))}
              </ol>
            ) : (
              <ul
                key={index}
                className="list-disc space-y-2 pl-6 marker:text-[#CF0A0A]"
              >
                {block.items.map((item, itemIndex) => (
                  <li key={itemIndex}>{renderSpans(item)}</li>
                ))}
              </ul>
            );
          case "quote":
            return (
              <blockquote
                key={index}
                className="border-l-2 border-[#CF0A0A] pl-6 text-xl italic leading-9 text-black/75"
              >
                {renderSpans(block.spans)}
              </blockquote>
            );
          case "hr":
            return (
              <hr
                key={index}
                className="border-0 border-t border-black/15"
              />
            );
          case "paragraph":
          default:
            return <p key={index}>{renderSpans(block.spans)}</p>;
        }
      })}
    </div>
  );
}
