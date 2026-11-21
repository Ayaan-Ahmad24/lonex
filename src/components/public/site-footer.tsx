"use client";

import Link from "next/link";
import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import type { PublicCategory, PublicSettings } from "@/lib/public/dto";
import { formatPhone, telHref } from "@/lib/public/contact";
import { resolveSocialLinks, type SocialNetwork } from "@/lib/public/social";
import { BrandMark } from "./brand-mark";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const YEAR = new Date().getFullYear();

/** The range is listed in the order the brand tells it: generate, store, move. */
const EXPLORE_ORDER = ["solar", "batteries", "electric-scooters"];

function SocialIcon({ network }: { network: SocialNetwork }) {
  if (network === "instagram") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  const paths: Record<Exclude<SocialNetwork, "instagram">, string> = {
    facebook:
      "M13.6 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.3-1.5 1.6-1.5h1.6V3.6A21 21 0 0 0 14.3 3.5c-2.4 0-4 1.5-4 4.1v2.3H7.7V13h2.6v8z",
    linkedin:
      "M6.9 8.5H4v11h2.9zM5.5 7.4a1.7 1.7 0 1 0 0-3.4 1.7 1.7 0 0 0 0 3.4M20 13.5c0-3.1-1.7-4.5-3.9-4.5a3.3 3.3 0 0 0-3 1.7V8.5h-2.9v11h2.9v-5.6c0-1.5.3-2.9 2.1-2.9 1.8 0 1.9 1.7 1.9 3v5.5H20z",
    youtube:
      "M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.3 5 12 5 12 5s-6.3 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8c1.5.4 7.8.4 7.8.4s6.3 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8M10 15V9l5.2 3z",
  };

  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d={paths[network]} />
    </svg>
  );
}

function FooterColumn({
  title,
  className,
  children,
}: {
  title: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`site-footer__col ${className ?? ""}`.trim()}
      data-footer-reveal
    >
      <h2 className="site-footer__col-title">{title}</h2>{" "}
      {children}
    </div>
  );
}

export function SiteFooter({
  settings,
  categories,
}: {
  settings: PublicSettings;
  categories: PublicCategory[];
}) {
  const root = useRef<HTMLElement>(null);

  // The CMS wins when a profile is configured; otherwise the platform
  // landing page keeps the footer complete. No unverified LONEX profile is
  // implied by the icon alone.
  const social = resolveSocialLinks(settings.social);
  const phoneHref = settings.contactPhone
    ? telHref(settings.contactPhone)
    : null;

  const explore = [...categories].sort((a, b) => {
    const rankA = EXPLORE_ORDER.indexOf(a.slug);
    const rankB = EXPLORE_ORDER.indexOf(b.slug);

    return (
      (rankA === -1 ? EXPLORE_ORDER.length : rankA) -
      (rankB === -1 ? EXPLORE_ORDER.length : rankB)
    );
  });

  useGSAP(
    () => {
      const scope = root.current;

      if (!scope) {
        return;
      }

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          scope.querySelectorAll("[data-footer-reveal]"),
          { y: 22, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.5,
            ease: "power3.out",
            stagger: 0.05,
            scrollTrigger: {
              trigger: scope,
              start: "top 94%",
              once: true,
            },
          },
        );
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <footer className="site-footer" ref={root}>
      <div className="site-container">
        <div className="site-footer__top">
          <div className="site-footer__brand" data-footer-reveal>
            <BrandMark settings={settings} size="footer" />
            <p className="site-footer__tagline">
              Powering possibilities.{" "}
              <span>Connecting what comes next.</span>
            </p>
            <p className="site-footer__description">
              Discover a more connected approach to energy, storage and electric
              mobility. Explore the possibilities shaping tomorrow.
            </p>
          </div>

          <FooterColumn title="Explore" className="site-footer__col--explore">
            <ul className="site-footer__links">
              {explore.map((category) => (
                <li key={category.id}>
                  <Link href={category.path}>{category.name}{" "}</Link>
                </li>
              ))}
              <li>
                <Link href="/blog">Journal{" "}</Link>
              </li>
            </ul>
          </FooterColumn>

          <FooterColumn title="Company" className="site-footer__col--company">
            <ul className="site-footer__links">
              <li>
                <Link href="/about">About LONEX{" "}</Link>
              </li>
              <li>
                <Link href="/authorized-sellers">Authorized Sellers{" "}</Link>
              </li>
              <li>
                <Link href="/verify">Verify a Model{" "}</Link>
              </li>
              <li>
                <Link href="/contact">Contact{" "}</Link>
              </li>
            </ul>
          </FooterColumn>

          <div
            className="site-footer__col site-footer__col--connect"
            data-footer-reveal
          >
            <h2 className="site-footer__col-title">Connect</h2>

            <ul className="site-footer__social">
              {social.map((network) => (
                <li key={network.key}>
                  <a
                    href={network.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={network.label}
                    title={network.label}
                  >
                    <SocialIcon network={network.key} />
                  </a>
                </li>
              ))}
            </ul>

            <dl className="site-footer__contact">
              {phoneHref ? (
                <div>
                  <dt>Phone</dt>{" "}
                  <dd>
                    <a href={phoneHref}>
                      {formatPhone(settings.contactPhone)}{" "}
                    </a>
                  </dd>
                </div>
              ) : null}
              {settings.contactEmail ? (
                <div>
                  <dt>Email</dt>{" "}
                  <dd>
                    <a href={`mailto:${settings.contactEmail}`}>
                      {settings.contactEmail}{" "}
                    </a>
                  </dd>
                </div>
              ) : null}
              {settings.locationEnabled && settings.address ? (
                <div>
                  <dt>Address</dt>{" "}
                  <dd>{settings.address}{" "}</dd>
                </div>
              ) : null}
            </dl>
          </div>
        </div>

        <div className="site-footer__base" data-footer-reveal>
          <div className="site-footer__legal">
            <p className="site-footer__copyright">
              © {YEAR} {settings.siteName}
            </p>
            <p className="site-footer__credit">
              Powered by{" "}
              <a
                href="https://cubicsol.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                Cubic Solutions Inc
              </a>
            </p>
          </div>
          <a className="site-footer__top-link" href="#main-content">
            Back to top
            <span aria-hidden="true">↑</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
