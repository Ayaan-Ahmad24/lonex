"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type HeroSlide = {
  id: string;
  index: string;
  verb: string;
  subject: string;
  headline: string;
  copy: string;
  cta: string;
  href: string;
  image: string;
  alt: string;
  position: string;
};

const SLIDES: HeroSlide[] = [
  {
    id: "generate",
    index: "01",
    verb: "Generate",
    subject: "Solar energy",
    headline: "Solar energy.",
    copy: "Modules built to the model and specification, with the seller named before publication.",
    cta: "Explore solar",
    href: "/solar",
    image: "/images/lonex-step-1/generate-solar.webp",
    alt: "Solar array at low sun — illustrative visual",
    position: "50% 55%",
  },
  {
    id: "store",
    index: "02",
    verb: "Store",
    subject: "Battery storage",
    headline: "Battery storage.",
    copy: "Storage that holds the day's solar and keeps essential loads running after sunset.",
    cta: "Explore storage",
    href: "/batteries",
    image: "/images/lonex-step-1/store-battery.webp",
    alt: "Home battery and inverter in a warm stone room — illustrative visual",
    position: "62% 50%",
  },
  {
    id: "move",
    index: "03",
    verb: "Move",
    subject: "Electric mobility",
    headline: "Electric mobility.",
    copy: "Electric scooters for the short trip — quiet, efficient and built for everyday city travel.",
    cta: "Explore mobility",
    href: "/electric-scooters",
    // The previous slide photograph was an electric bicycle. The range is a
    // scooter range, so the slide uses the studio scooter plate from the media
    // library (asset 264, white LONEX scooter, three-quarter view).
    image: "/media/264",
    alt: "White LONEX electric scooter, studio three-quarter view — illustrative visual",
    position: "50% 50%",
  },
];

const SLIDE_MS = 7000;

function ArrowIcon({ direction }: { direction: "prev" | "next" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="square"
      aria-hidden="true"
      focusable="false"
    >
      {direction === "prev" ? (
        <path d="M14.5 5.5 8 12l6.5 6.5" />
      ) : (
        <path d="M9.5 5.5 16 12l-6.5 6.5" />
      )}
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M8 5.5v13l10-6.5z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="7.5" y="5.5" width="2.5" height="13" />
      <rect x="14" y="5.5" width="2.5" height="13" />
    </svg>
  );
}

export function HomeHeroUI({ settings }: { settings?: unknown }) {
  void settings;

  const heroRef = useRef<HTMLElement>(null);
  const touchX = useRef<number | null>(null);
  const previousIndex = useRef(0);

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const slide = SLIDES[active];

  const goTo = useCallback((index: number) => {
    setActive(((index % SLIDES.length) + SLIDES.length) % SLIDES.length);
  }, []);

  const next = useCallback(() => goTo(active + 1), [active, goTo]);
  const previous = useCallback(() => goTo(active - 1), [active, goTo]);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);

    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (paused || reducedMotion) {
      return;
    }

    // Restart the CSS progress line from zero so it stays in step with the
    // autoplay timer after a pause or a manual change.
    const fill = heroRef.current?.querySelector<HTMLElement>(
      ".lx-hero__tab.is-active .lx-hero__tab-fill",
    );
    if (fill) {
      fill.style.animation = "none";
      void fill.offsetWidth;
      fill.style.animation = "";
    }

    const timer = window.setInterval(() => {
      if (document.hidden) {
        return;
      }
      setActive((current) => (current + 1) % SLIDES.length);
    }, SLIDE_MS);

    return () => window.clearInterval(timer);
  }, [active, paused, reducedMotion]);

  // The hero stage drifts slowly as the hero leaves the viewport, so the
  // background has depth rather than sitting flat behind the type.
  useGSAP(
    () => {
      const scope = heroRef.current;
      if (!scope) {
        return;
      }

      const mm = gsap.matchMedia();

      mm.add(
        "(min-width: 761px) and (prefers-reduced-motion: no-preference)",
        () => {
          const stage = scope.querySelector<HTMLElement>(".lx-hero__stage");
          if (!stage) {
            return;
          }

          gsap.fromTo(
            stage,
            { yPercent: -5, scale: 1.1 },
            {
              yPercent: 5,
              scale: 1.1,
              ease: "none",
              scrollTrigger: {
                trigger: scope,
                start: "top top",
                end: "bottom top",
                scrub: 0.6,
                invalidateOnRefresh: true,
              },
            },
          );
        },
      );

      return () => mm.revert();
    },
    { scope: heroRef },
  );

  // GSAP only writes start values when it runs. The first slide is already
  // visible in CSS, so the hero reads correctly without JavaScript.
  useGSAP(
    () => {
      const scope = heroRef.current;
      if (!scope) {
        return;
      }

      const slides = gsap.utils.toArray<HTMLElement>(
        "[data-hero-slide]",
        scope,
      );
      const images = slides.map((item) => item.querySelector("img"));
      const isInitial = previousIndex.current === active;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)")
        .matches;

      if (isInitial) {
        if (images[0] && !reduce) {
          gsap.fromTo(
            images[0],
            { scale: 1.06 },
            { scale: 1, duration: 8, ease: "none" },
          );
        }
        return;
      }

      const incoming = slides[active];
      const outgoing = slides[previousIndex.current];

      previousIndex.current = active;
      gsap.killTweensOf(images.filter(Boolean));

      if (!incoming) {
        return;
      }

      if (reduce) {
        gsap.set(slides, { autoAlpha: 0 });
        gsap.set(incoming, { autoAlpha: 1 });
        gsap.set(images.filter(Boolean), { scale: 1 });
        return;
      }

      // A cinematic crossfade: the incoming slide resolves out of a slight
      // push while the outgoing one drifts away underneath it.
      gsap.set(incoming, { autoAlpha: 0, zIndex: 3 });
      gsap.to(incoming, {
        autoAlpha: 1,
        duration: 1.25,
        ease: "power2.inOut",
      });

      const image = images[active];
      if (image) {
        gsap.fromTo(
          image,
          { scale: 1.06 },
          { scale: 1, duration: 7.6, ease: "none" },
        );
      }

      if (outgoing && outgoing !== incoming) {
        gsap.set(outgoing, { zIndex: 1 });
        gsap.to(outgoing, {
          autoAlpha: 0,
          duration: 1.25,
          ease: "power2.inOut",
        });

        const outgoingImage = images[previousIndex.current];
        if (outgoingImage) {
          gsap.to(outgoingImage, {
            scale: 1.04,
            duration: 7.6,
            ease: "none",
          });
        }
      }
    },
    { scope: heroRef, dependencies: [active] },
  );

  return (
    <section
      ref={heroRef}
      className={`lx-hero${paused ? " is-paused" : ""}`}
      aria-roledescription="carousel"
      aria-label="LONEX range"
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") {
          event.preventDefault();
          next();
        }

        if (event.key === "ArrowLeft") {
          event.preventDefault();
          previous();
        }
      }}
      onTouchStart={(event) => {
        touchX.current = event.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(event) => {
        const start = touchX.current;
        touchX.current = null;

        if (start === null) {
          return;
        }

        const end = event.changedTouches[0]?.clientX ?? start;
        const delta = end - start;

        if (Math.abs(delta) < 48) {
          return;
        }

        setActive((current) => {
          if (delta < 0) {
            return (current + 1) % SLIDES.length;
          }
          return (current + SLIDES.length - 1) % SLIDES.length;
        });
      }}
    >
      <div className="lx-hero__stage">
        {SLIDES.map((item, index) => (
          <figure
            key={item.id}
            className={`lx-hero__slide${index === active ? " is-active" : ""}`}
            data-hero-slide
            aria-hidden={index === active ? undefined : true}
          >
            <Image
              src={item.image}
              alt={item.alt}
              fill
              priority={index === 0}
              sizes="100vw"
              className="lx-hero__image"
              style={{ objectPosition: item.position }}
            />
          </figure>
        ))}
        <div className="lx-hero__shade" aria-hidden="true" />
      </div>

      <div className="lx-wrap lx-hero__shell">
        <div className="lx-hero__top">
          <p className="lx-hero__kicker">
            <span className="lx-hero__kicker-mark">LONEX</span>
            <span className="lx-hero__kicker-rule" aria-hidden="true" />
            <span className="lx-hero__kicker-line">Power for what&apos;s next.</span>
          </p>
        </div>

        <div className="lx-hero__main" key={slide.id}>
          <p className="lx-hero__eyebrow">
            <span className="lx-hero__eyebrow-index">{slide.verb}</span>
          </p>

          <h1 className="lx-hero__headline">{slide.headline}</h1>

          <p className="lx-hero__lead">{slide.copy}</p>

          <div className="lx-hero__actions">
            <Link href={slide.href} className="lx-hero__cta">
              {slide.cta}
              <span className="lx-hero__cta-arrow" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="square"
                  focusable="false"
                >
                  <path d="M5 12h13M13 6.5 18.5 12 13 17.5" />
                </svg>
              </span>
            </Link>
            <Link
              href="/authorized-sellers"
              className="lx-hero__cta lx-hero__cta--ghost"
            >
              Find Sellers
            </Link>
          </div>
        </div>

        <div className="lx-hero__bar">
          <div className="lx-hero__tabs" role="group" aria-label="Choose a slide">
            {SLIDES.map((item, index) => (
              <button
                key={item.id}
                type="button"
                className={`lx-hero__tab${index === active ? " is-active" : ""}`}
                aria-label={`${item.verb} — ${item.subject}`}
                aria-current={index === active ? "true" : undefined}
                onClick={() => goTo(index)}
              >
                <span className="lx-hero__tab-track" aria-hidden="true">
                  <span className="lx-hero__tab-fill" />
                </span>
                <span className="lx-hero__tab-text">
                  <span className="lx-hero__tab-label">{item.verb}</span>
                </span>
              </button>
            ))}
          </div>

          <div className="lx-hero__transport">
            <button
              type="button"
              className="lx-hero__nav"
              aria-label="Previous slide"
              onClick={previous}
            >
              <ArrowIcon direction="prev" />
            </button>
            {reducedMotion ? null : (
              <button
                type="button"
                className="lx-hero__nav"
                aria-label={paused ? "Play slideshow" : "Pause slideshow"}
                aria-pressed={paused}
                onClick={() => setPaused((current) => !current)}
              >
                {paused ? <PlayIcon /> : <PauseIcon />}
              </button>
            )}
            <button
              type="button"
              className="lx-hero__nav"
              aria-label="Next slide"
              onClick={next}
            >
              <ArrowIcon direction="next" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
