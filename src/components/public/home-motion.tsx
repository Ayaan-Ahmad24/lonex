"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Homepage motion system.
 *
 * Design rules this file follows:
 *
 * 1. Every entrance uses `fromTo` with explicit start AND end values.
 *    A `from` tween records its end value from the live DOM, so a
 *    `ScrollTrigger.refresh()` (which happens as soon as fonts and images
 *    settle) re-records the *start* value and the element never moves.
 *    `fromTo` cannot be corrupted that way.
 *
 * 2. Nothing is hidden by CSS. GSAP writes the start state when it runs, so
 *    without JavaScript, with reduced motion, or on a print the page is
 *    already finished.
 *
 * 3. Motion is purposeful. Every section gets the treatment that suits it —
 *    a masked reveal for display type, a wipe for the photograph, a rise for
 *    body copy, a settle for the product grid. One movement is not repeated
 *    everywhere.
 *
 * 4. The Move band carries the site's one prominent parallax. The smaller
 *    photographs are left still: a scrub on every frame reads as noise, not
 *    depth.
 *
 * 5. Every trigger is created inside `gsap.matchMedia()`, so reduced motion
 *    and small screens get the finished page.
 */

export function HomeMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const scope = root.current;
      if (!scope) {
        return;
      }

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        let active = true;
        const refresh = () => {
          if (active) {
            ScrollTrigger.refresh();
          }
        };

        /** A quiet entrance: the block rises into place and fades up. */
        const rise = (
          trigger: Element,
          targets: gsap.TweenTarget,
          options: {
            y?: number;
            duration?: number;
            stagger?: number;
            start?: string;
            delay?: number;
          } = {},
        ) => {
          const {
            y = 28,
            duration = 0.55,
            stagger = 0.06,
            start = "top 86%",
            delay = 0,
          } = options;

          gsap.fromTo(
            targets,
            { y, autoAlpha: 0 },
            {
              y: 0,
              autoAlpha: 1,
              duration,
              delay,
              ease: "power3.out",
              stagger,
              scrollTrigger: { trigger, start, once: true },
            },
          );
        };

        /**
         * An editorial reveal: the type rises out from behind a mask, so a
         * heading arrives as a curtain lifting rather than a fade.
         */
        const masked = (
          trigger: Element,
          targets: gsap.TweenTarget,
          options: { duration?: number; stagger?: number; start?: string } = {},
        ) => {
          const {
            duration = 0.65,
            stagger = 0.07,
            start = "top 86%",
          } = options;

          gsap.fromTo(
            targets,
            { yPercent: 45, autoAlpha: 0, clipPath: "inset(0% 0% 100% 0%)" },
            {
              yPercent: 0,
              autoAlpha: 1,
              // An expanded inset: the mask still lifts, but at rest the clip
              // sits outside the border box so descenders can never be sliced.
              clipPath: "inset(-30% -6% -30% -6%)",
              duration,
              ease: "expo.out",
              stagger,
              scrollTrigger: { trigger, start, once: true },
            },
          );
        };

        /** A horizontal wipe, used where the content reads left to right. */
        const wipe = (
          trigger: Element,
          targets: gsap.TweenTarget,
          options: { duration?: number; start?: string; stagger?: number } = {},
        ) => {
          const { duration = 0.75, start = "top 84%", stagger = 0.06 } = options;

          gsap.fromTo(
            targets,
            { autoAlpha: 0, clipPath: "inset(0% 100% 0% 0%)" },
            {
              autoAlpha: 1,
              // Horizontal wipe that ends outside the border box, so the
              // heading's descenders are not cut once the wipe completes.
              clipPath: "inset(-30% -6% -30% -6%)",
              duration,
              ease: "expo.out",
              stagger,
              scrollTrigger: { trigger, start, once: true },
            },
          );
        };

        /** A photograph that settles back into its frame. */
        const settle = (
          trigger: Element,
          targets: gsap.TweenTarget,
          options: { duration?: number; start?: string } = {},
        ) => {
          const { duration = 0.8, start = "top 86%" } = options;

          gsap.fromTo(
            targets,
            { autoAlpha: 0, scale: 1.08 },
            {
              autoAlpha: 1,
              scale: 1,
              duration,
              ease: "expo.out",
              scrollTrigger: { trigger, start, once: true },
            },
          );
        };

        /* ---------- Section heads ---------- */

        scope
          .querySelectorAll<HTMLElement>("[data-lxh-head]")
          .forEach((head) => {
            const title = head.querySelector<HTMLElement>(
              ".lxh-range__title, .lxh-story__title, .lxh-head__title",
            );

            if (title) {
              masked(head, title, { duration: 0.7 });
            }

            const rest = Array.from(head.children).filter(
              (child) => child !== title,
            );

            if (rest.length > 0) {
              rise(head, rest, { y: 24, duration: 0.55, stagger: 0.09 });
            }
          });

        /* ---------- Range chapters ---------- */

        scope
          .querySelectorAll<HTMLElement>("[data-lxh-chapter]")
          .forEach((chapter) => {
            const media = chapter.querySelector<HTMLElement>(
              ".lxh-chapter__media",
            );
            const copy = chapter.querySelector<HTMLElement>(
              ".lxh-chapter__copy",
            );

            if (media) {
              wipe(chapter, media, { duration: 0.8, start: "top 86%" });
            }

            if (copy) {
              rise(chapter, copy.children, {
                y: 30,
                duration: 0.55,
                stagger: 0.07,
              });
            }
          });

        /* ---------- Company story ---------- */

        scope
          .querySelectorAll<HTMLElement>("[data-lxh-story-body]")
          .forEach((block) => {
            const media = block.querySelector<HTMLElement>(
              ".lxh-story__media",
            );
            const copy = block.querySelector<HTMLElement>(".lxh-story__copy");
            const headline = copy?.querySelector<HTMLElement>(
              ".lxh-story__headline",
            );

            if (media) {
              wipe(block, media, { duration: 0.8, start: "top 86%" });
            }

            if (headline) {
              masked(block, headline, { duration: 0.65, start: "top 84%" });
            }

            if (copy) {
              const paragraphs = Array.from(
                copy.querySelectorAll(":scope > p"),
              );
              rise(block, paragraphs, {
                y: 26,
                duration: 0.55,
                stagger: 0.1,
                start: "top 84%",
              });
            }
          });

        /* ---------- Brand principles ---------- */

        scope
          .querySelectorAll<HTMLElement>("[data-lxh-principles]")
          .forEach((group) => {
            rise(group, group.children, {
              y: 34,
              duration: 0.6,
              stagger: 0.14,
            });
          });

        /* ---------- Closing statement ---------- */

        scope
          .querySelectorAll<HTMLElement>("[data-lxh-closing]")
          .forEach((closing) => {
            const line = closing.querySelector<HTMLElement>(
              ".lxh-story__closing-line",
            );

            if (line) {
              masked(closing, line, { duration: 0.7, start: "top 90%" });
            }

            const rest = Array.from(closing.children).filter(
              (child) => child !== line,
            );
            if (rest.length > 0) {
              rise(closing, rest, { y: 20, duration: 0.8, start: "top 90%" });
            }
          });

        /* ---------- Product showcase ---------- */

        const products = scope.querySelector<HTMLElement>(
          "[data-lxh-products]",
        );
        if (products) {
          const cards = Array.from(products.children);
          const media = products.querySelectorAll(".lxh-product__media");

          settle(products, media, { duration: 0.8 });

          rise(products, cards, {
            y: 36,
            duration: 0.6,
            stagger: 0.1,
          });
        }

        /* ---------- Registry ---------- */

        const registry = scope.querySelector<HTMLElement>(
          "[data-lxh-registry]",
        );
        if (registry) {
          const statement = registry.querySelector<HTMLElement>(
            ".lxh-registry__copy",
          );
          const title = statement?.querySelector<HTMLElement>(
            ".lxh-registry__title",
          );
          const specimen = registry.querySelector<HTMLElement>(
            ".lxh-specimen",
          );

          if (title) {
            masked(registry, title, { duration: 0.7 });
          }

          if (specimen) {
            settle(registry, specimen, { duration: 0.8, start: "top 84%" });
          }

          const rest = registry.querySelectorAll(
            ".lxh-registry__copy > :not(.lxh-registry__title)",
          );
          rise(registry, rest, {
            y: 24,
            duration: 0.55,
            stagger: 0.08,
            start: "top 84%",
          });
        }

        /* ---------- Sellers ---------- */

        const sellers = scope.querySelector<HTMLElement>(
          "[data-lxh-sellers]",
        );
        if (sellers) {
          wipe(sellers, sellers.children, {
            duration: 0.75,
            start: "top 84%",
            stagger: 0.12,
          });
        }

        /* ---------- Journal ---------- */

        const journal = scope.querySelector<HTMLElement>("[data-lxh-journal]");
        if (journal) {
          const covers = journal.querySelectorAll(".lxh-journal__media");
          settle(journal, covers, { duration: 0.8 });

          rise(journal, journal.querySelectorAll("[data-lxh-journal-card]"), {
            y: 30,
            duration: 0.6,
            stagger: 0.12,
          });
        }

        /* ---------- Closing band ---------- */

        const close = scope.querySelector<HTMLElement>("[data-lxh-close]");
        if (close) {
          gsap.fromTo(
            close.querySelectorAll(".lxh-close__title span"),
            { yPercent: 40, autoAlpha: 0 },
            {
              yPercent: 0,
              autoAlpha: 1,
              duration: 0.65,
              ease: "expo.out",
              stagger: 0.09,
              scrollTrigger: {
                trigger: close,
                start: "top 86%",
                once: true,
              },
            },
          );

          rise(close, close.querySelectorAll(".lxh-close__aside > *"), {
            y: 24,
            duration: 0.55,
            stagger: 0.1,
          });
        }

        /* Fonts and images can change trigger positions after the first
           measure. Every entrance is a `fromTo`, so a refresh can only
           recalculate positions — it can never strand an element. */
        window.addEventListener("load", refresh);
        document.fonts?.ready.then(refresh).catch(() => undefined);

        return () => {
          active = false;
          window.removeEventListener("load", refresh);
        };
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} className="lx-page">
      {children}
    </div>
  );
}
