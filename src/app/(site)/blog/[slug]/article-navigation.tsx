"use client";

import {
  useCallback,
  useEffect,
  useState,
  type MouseEvent,
} from "react";

import { ARTICLE, type OutlineEntry } from "./content";

const HEADER_GAP = 28;

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function headerHeight(): number {
  if (typeof window === "undefined") {
    return 76;
  }

  const value = window
    .getComputedStyle(document.documentElement)
    .getPropertyValue("--site-header-h");

  return Number.parseFloat(value) || 76;
}

function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const value = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      setProgress(value);
    };

    const request = () => {
      if (frame === 0) {
        frame = window.requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
    };
  }, []);

  return (
    <div className="lxad-progress" aria-hidden="true">
      <span style={{ transform: `scaleX(${progress})` }} />
    </div>
  );
}

function useActiveSection(outline: OutlineEntry[]): string {
  const [activeId, setActiveId] = useState(outline[0]?.id ?? "");

  useEffect(() => {
    if (outline.length === 0) {
      return;
    }

    let frame = 0;

    const update = () => {
      frame = 0;
      const marker = window.scrollY + headerHeight() + HEADER_GAP + 12;
      let next = outline[0].id;

      for (const entry of outline) {
        const element = document.getElementById(entry.id);

        if (
          element &&
          element.getBoundingClientRect().top + window.scrollY <= marker
        ) {
          next = entry.id;
        }
      }

      setActiveId(next);
    };

    const request = () => {
      if (frame === 0) {
        frame = window.requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
    };
  }, [outline]);

  return activeId;
}

/**
 * Reading navigation for one article.
 *
 * Renders three things from a single outline: the fixed progress rule, the
 * sticky desktop rail and the collapsible contents panel shown on smaller
 * screens. The anchors work without JavaScript; the click handler only adds
 * smooth scrolling, focus and an updated hash.
 */
export function ArticleNavigation({ outline }: { outline: OutlineEntry[] }) {
  const activeId = useActiveSection(outline);
  const [open, setOpen] = useState(false);

  const go = useCallback((event: MouseEvent<HTMLAnchorElement>, id: string) => {
    const target = document.getElementById(id);

    if (!target) {
      return;
    }

    event.preventDefault();
    const reduced = prefersReducedMotion();

    // Close the disclosure first. On smaller screens its panel sits above the
    // article, so collapsing it changes the target's document position; the
    // scroll has to be measured after that layout change, not before it.
    setOpen(false);

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        target.scrollIntoView({
          behavior: reduced ? "auto" : "smooth",
          block: "start",
        });

        window.history.replaceState(null, "", `#${id}`);

        window.setTimeout(
          () => {
            target.setAttribute("tabindex", "-1");
            target.focus({ preventScroll: true });
          },
          reduced ? 0 : 420,
        );
      });
    });
  }, []);

  const backToTop = useCallback((event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  }, []);

  return (
    <>
      <ReadingProgress />

      {outline.length > 0 ? (
        <>
          <nav className="lxad-rail" aria-label={ARTICLE.contentsLabel}>
            <p className="lxad-rail__label">
              <span>{ARTICLE.contentsLabel}</span>
              <span aria-hidden="true">
                {String(outline.length).padStart(2, "0")}
              </span>
            </p>

            <ol className="lxad-rail__list">
              {outline.map((entry, index) => {
                const active = entry.id === activeId;

                return (
                  <li key={entry.id}>
                    <a
                      href={`#${entry.id}`}
                      className="lxad-rail__link"
                      data-active={active ? "true" : undefined}
                      aria-current={active ? "location" : undefined}
                      onClick={(event) => go(event, entry.id)}
                    >
                      <span className="lxad-rail__num" aria-hidden="true">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="lxad-rail__text">{entry.label}</span>
                    </a>
                  </li>
                );
              })}
            </ol>

            <p className="lxad-rail__foot">
              <a href="#main-content" onClick={backToTop}>
                {ARTICLE.backToTop} <span aria-hidden="true">↑</span>
              </a>
            </p>
          </nav>

          <div className="lxad-mtoc">
            <button
              type="button"
              className="lxad-mtoc__toggle"
              aria-expanded={open}
              aria-controls="lxad-mtoc-panel"
              onClick={() => setOpen((value) => !value)}
            >
              <span>{ARTICLE.contentsLabel}</span>
              <span className="lxad-mtoc__count" aria-hidden="true">
                {String(outline.length).padStart(2, "0")}{" "}
                {ARTICLE.sectionsLabel}
              </span>
              <span className="lxad-mtoc__chev" aria-hidden="true">
                +
              </span>
            </button>

            <div
              className="lxad-mtoc__panel"
              id="lxad-mtoc-panel"
              hidden={!open}
            >
              <ol>
                {outline.map((entry, index) => {
                  const active = entry.id === activeId;

                  return (
                    <li key={entry.id}>
                      <a
                        href={`#${entry.id}`}
                        data-active={active ? "true" : undefined}
                        aria-current={active ? "location" : undefined}
                        onClick={(event) => go(event, entry.id)}
                      >
                        <span aria-hidden="true">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span>{entry.label}</span>
                      </a>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}
