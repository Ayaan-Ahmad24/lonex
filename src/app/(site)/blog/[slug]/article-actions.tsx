"use client";

import { useEffect, useRef, useState } from "react";

import { ARTICLE } from "./content";

type Network = "x" | "linkedin" | "whatsapp";

/**
 * Share controls for the article footer.
 *
 * The URL is read at click time rather than rendered on the server, so the
 * buttons copy the address the reader is actually on — including a host that
 * is only known in the browser. There is no invented canonical domain.
 */
export function ArticleActions({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current !== null) {
        window.clearTimeout(timer.current);
      }
    };
  }, []);

  const markCopied = () => {
    setCopied(true);

    if (timer.current !== null) {
      window.clearTimeout(timer.current);
    }

    timer.current = window.setTimeout(() => {
      setCopied(false);
      timer.current = null;
    }, 2400);
  };

  const share = (network: Network) => {
    const url = window.location.href;
    const text = `${title} — LONEX Journal`;
    const encodedUrl = encodeURIComponent(url);
    const encodedText = encodeURIComponent(text);

    const targets: Record<Network, string> = {
      x: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
    };

    window.open(targets[network], "_blank", "noopener,noreferrer");
  };

  const copyLink = async () => {
    const url = window.location.href;
    let success = false;

    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(url);
        success = true;
      } catch {
        success = false;
      }
    }

    if (!success) {
      const field = document.createElement("textarea");
      field.value = url;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.top = "-1000px";
      field.style.opacity = "0";
      document.body.appendChild(field);
      field.select();

      try {
        success = document.execCommand("copy");
      } catch {
        success = false;
      }

      document.body.removeChild(field);
    }

    if (success) {
      markCopied();
    }
  };

  return (
    <section className="lxad-share" aria-labelledby="lxad-share-label">
      <div className="lxad-share__head">
        <p className="lxad-share__label" id="lxad-share-label">
          {ARTICLE.shareLabel}
        </p>
        <span className="lxad-share__status" role="status" aria-live="polite">
          {copied ? ARTICLE.copied : ""}
        </span>
      </div>

      <div className="lxad-share__row">
        <button
          type="button"
          className="lxad-share__btn"
          onClick={() => share("x")}
          aria-label="Share on X (opens in a new tab)"
        >
          {ARTICLE.shareX}
          <span aria-hidden="true">↗</span>
        </button>

        <button
          type="button"
          className="lxad-share__btn"
          onClick={() => share("linkedin")}
          aria-label="Share on LinkedIn (opens in a new tab)"
        >
          {ARTICLE.shareLinkedIn}
          <span aria-hidden="true">↗</span>
        </button>

        <button
          type="button"
          className="lxad-share__btn"
          onClick={() => share("whatsapp")}
          aria-label="Share on WhatsApp (opens in a new tab)"
        >
          {ARTICLE.shareWhatsApp}
          <span aria-hidden="true">↗</span>
        </button>

        <button
          type="button"
          className="lxad-share__btn lxad-share__btn--copy"
          data-copied={copied ? "true" : undefined}
          onClick={copyLink}
          aria-label="Copy a link to this article"
        >
          {copied ? ARTICLE.copied : ARTICLE.copyLink}
          <span aria-hidden="true">{copied ? "✓" : "⧉"}</span>
        </button>
      </div>
    </section>
  );
}
