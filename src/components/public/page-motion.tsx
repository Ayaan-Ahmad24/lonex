"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Shared motion for the category and product pages.
 *
 * The page is fully visible without JavaScript. GSAP writes the start values
 * only when it runs, and every entrance uses `fromTo`, so a ScrollTrigger
 * refresh can never strand an element at opacity 0. Reduced motion gets the
 * finished page with no triggers created at all.
 *
 * The vocabulary is deliberately small: a photographic settle, a line reveal
 * for display type, a short rise for supporting copy, and one scrub for the
 * storage "charge" rule.
 */
export function PageMotion({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
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
            y = 26,
            duration = 0.9,
            stagger = 0.08,
            start = "top 88%",
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

        /* ---------- Hero ---------- */

        scope.querySelectorAll<HTMLElement>("[data-hero]").forEach((hero) => {
          const media = hero.querySelector<HTMLElement>("[data-hero-media]");

          if (media) {
            gsap.fromTo(
              media,
              { scale: 1.06, autoAlpha: 0 },
              {
                scale: 1,
                autoAlpha: 1,
                duration: 1.6,
                ease: "expo.out",
              },
            );
          }

          const lines = hero.querySelectorAll<HTMLElement>("[data-hero-line]");

          if (lines.length > 0) {
            gsap.fromTo(
              lines,
              { yPercent: 42, autoAlpha: 0, clipPath: "inset(0% 0% 100% 0%)" },
              {
                yPercent: 0,
                autoAlpha: 1,
                clipPath: "inset(0% 0% 0% 0%)",
                duration: 1.15,
                ease: "expo.out",
                stagger: 0.11,
                delay: 0.18,
              },
            );
          }

          const copy = hero.querySelectorAll<HTMLElement>("[data-hero-item]");

          if (copy.length > 0) {
            gsap.fromTo(
              copy,
              { y: 22, autoAlpha: 0 },
              {
                y: 0,
                autoAlpha: 1,
                duration: 0.95,
                ease: "power3.out",
                stagger: 0.08,
                delay: 0.42,
              },
            );
          }
        });

        /* ---------- Sections ---------- */

        scope
          .querySelectorAll<HTMLElement>("[data-reveal-group]")
          .forEach((group) => {
            const items = group.querySelectorAll<HTMLElement>(
              ":scope > [data-reveal]",
            );

            if (items.length > 0) {
              rise(group, items, { y: 30, stagger: 0.09 });
            }

            const media = group.querySelector<HTMLElement>(
              "[data-reveal-image]",
            );

            if (media) {
              gsap.fromTo(
                media,
                { autoAlpha: 0, scale: 1.05 },
                {
                  autoAlpha: 1,
                  scale: 1,
                  duration: 1.25,
                  ease: "expo.out",
                  scrollTrigger: { trigger: group, start: "top 86%", once: true },
                },
              );
            }
          });

        scope
          .querySelectorAll<HTMLElement>("[data-reveal]")
          .forEach((element) => {
            // Children of a reveal group are staggered by the group itself.
            if (element.closest("[data-reveal-group]")) {
              return;
            }

            rise(element, element, { y: 26 });
          });

        scope
          .querySelectorAll<HTMLElement>("[data-reveal-image]")
          .forEach((image) => {
            if (image.closest("[data-reveal-group]")) {
              return;
            }

            gsap.fromTo(
              image,
              { autoAlpha: 0, scale: 1.05 },
              {
                autoAlpha: 1,
                scale: 1,
                duration: 1.25,
                ease: "expo.out",
                scrollTrigger: {
                  trigger: image,
                  start: "top 88%",
                  once: true,
                },
              },
            );
          });

        /* ---------- Storage charge rule ---------- */

        const charge = scope.querySelector<HTMLElement>("[data-charge-line]");

        if (charge) {
          gsap.fromTo(
            charge,
            { scaleX: 0 },
            {
              scaleX: 1,
              ease: "none",
              scrollTrigger: {
                trigger: charge.parentElement ?? charge,
                start: "top 92%",
                end: "top 38%",
                scrub: 0.5,
                invalidateOnRefresh: true,
              },
            },
          );
        }

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
    <div ref={root} className={className}>
      {children}
    </div>
  );
}
