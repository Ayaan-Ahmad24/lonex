"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type FocusEvent as ReactFocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";

import type { PublicCategory, PublicSettings } from "@/lib/public/dto";
import { BrandMark } from "./brand-mark";
import { Container } from "./container";

type MenuKey = "products" | "company";
type OpenMenu = MenuKey | null;

const DESKTOP_QUERY = "(min-width: 960px)";

const CATEGORY_ORDER = ["solar", "batteries", "electric-scooters"] as const;

const CATEGORY_META: Record<
  string,
  { index: string; verb: string; description: string; image: string }
> = {
  solar: {
    index: "01",
    verb: "Generate",
    description:
      "Solar modules built for residential and commercial systems.",
    image: "/images/lonex-generated-images/categories/solar-panels.webp",
  },
  batteries: {
    index: "02",
    verb: "Store",
    description: "Battery systems for backup power and solar storage.",
    image: "/images/lonex-generated-images/categories/home-storage.webp",
  },
  "electric-scooters": {
    index: "03",
    verb: "Move",
    description: "Electric scooters for everyday urban travel.",
    // The category cover in the CMS is a scooter render. The range photograph
    // is the real scooter, so the dropdown always uses it for this tile.
    image: "/images/homepage/range-scooter.webp",
  },
};

type MegaItem = {
  id: number;
  name: string;
  path: string;
  index: string;
  verb: string;
  description: string;
  imageSrc: string | null;
};

function isCurrent(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function buildMegaItems(categories: PublicCategory[]): MegaItem[] {
  const rank = new Map<string, number>(
    CATEGORY_ORDER.map((slug, index) => [slug, index]),
  );

  return [...categories]
    .sort(
      (a, b) => (rank.get(a.slug) ?? 99) - (rank.get(b.slug) ?? 99),
    )
    .slice(0, CATEGORY_ORDER.length)
    .map((category, position) => {
      const meta = CATEGORY_META[category.slug];

      return {
        id: category.id,
        name: category.name,
        path: category.path,
        index: meta?.index ?? String(position + 1).padStart(2, "0"),
        verb: meta?.verb ?? "Explore",
        description:
          meta?.description ??
          category.description?.split(". ")[0] ??
          "Explore the range.",
        // The EV category cover is a scooter; use the real scooter photograph
        // for that tile.
        imageSrc:
          category.slug === "electric-scooters"
            ? (meta?.image ?? category.cover?.url ?? null)
            : (category.cover?.url ?? meta?.image ?? null),
      };
    });
}

function Chevron() {
  return (
    <svg
      aria-hidden="true"
      className="site-nav-chevron"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2.5 4.5 6 8l3.5-3.5" />
    </svg>
  );
}

function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2.5 8h11M9.5 4l4 4-4 4" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 18 18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      <path d="M4 4l10 10M14 4 4 14" />
    </svg>
  );
}

export function SiteHeader({
  settings,
  categories,
}: {
  settings: PublicSettings;
  categories: PublicCategory[];
}) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const megaItems = buildMegaItems(categories);

  const productsActive = categories.some((category) =>
    isCurrent(pathname, category.path),
  );
  const companyActive =
    isCurrent(pathname, "/about") || isCurrent(pathname, "/authorized-sellers");
  const journalActive = isCurrent(pathname, "/blog");
  const verifyActive = isCurrent(pathname, "/verify");
  const contactActive = isCurrent(pathname, "/contact");

  const [openMenu, setOpenMenu] = useState<OpenMenu>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSection, setMobileSection] = useState<MenuKey | null>(null);
  const [headerSolid, setHeaderSolid] = useState(false);

  const headerRef = useRef<HTMLElement>(null);
  const productsTriggerRef = useRef<HTMLButtonElement>(null);
  const companyTriggerRef = useRef<HTMLButtonElement>(null);
  const mobileTriggerRef = useRef<HTMLButtonElement>(null);
  const mobileCloseRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const hoverTimer = useRef<number | null>(null);
  // Which menu the pointer opened. A click on that same trigger should keep
  // the panel open instead of toggling it straight back shut.
  const hoverOpened = useRef<MenuKey | null>(null);

  const productsPanelId = useId();
  const companyPanelId = useId();
  const mobileProductsId = useId();
  const mobileCompanyId = useId();
  const mobileDrawerId = useId();

  // Route changes can happen from browser history or programmatic
  // navigation. Adjust state during render so no menu survives a navigation.
  const [lastPathname, setLastPathname] = useState(pathname);
  if (lastPathname !== pathname) {
    setLastPathname(pathname);
    setOpenMenu(null);
    setMobileOpen(false);
  }

  useEffect(
    () => () => {
      if (hoverTimer.current !== null) {
        window.clearTimeout(hoverTimer.current);
      }
    },
    [],
  );

  // Escape and outside click for the desktop menus.
  useEffect(() => {
    if (!openMenu) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }

      event.preventDefault();
      setOpenMenu(null);
      const trigger =
        openMenu === "products"
          ? productsTriggerRef.current
          : companyTriggerRef.current;
      trigger?.focus();
    };

    const onPointerDown = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [openMenu]);

  // Drawer scroll lock, initial focus and Escape handling.
  useEffect(() => {
    if (!mobileOpen) {
      return;
    }

    const scrollbar =
      window.innerWidth - document.documentElement.clientWidth;
    const previousOverflow = document.body.style.overflow;
    const previousPadding = document.body.style.paddingRight;

    document.body.style.overflow = "hidden";
    if (scrollbar > 0) {
      document.body.style.paddingRight = `${scrollbar}px`;
    }

    // The drawer is revealed by a visibility transition, so focus only
    // lands once the panel is actually visible.
    const focusTimer = window.setTimeout(() => {
      mobileCloseRef.current?.focus();
    }, 60);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }

      event.preventDefault();
      setMobileOpen(false);
      mobileTriggerRef.current?.focus();
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPadding;
    };
  }, [mobileOpen]);

  // Never leave a drawer open behind the desktop navigation.
  useEffect(() => {
    const media = window.matchMedia(DESKTOP_QUERY);
    const onChange = () => {
      if (media.matches) {
        setMobileOpen(false);
        setOpenMenu(null);
      }
    };

    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  // On the homepage the header starts transparent over the hero and turns
  // solid as soon as the page scrolls. The listener is passive and batched
  // into an animation frame, so scrolling stays smooth.
  useEffect(() => {
    if (!isHome) {
      return;
    }

    let frame = 0;

    const sync = () => {
      frame = 0;
      setHeaderSolid(window.scrollY > 50);
    };

    const onScroll = () => {
      if (frame !== 0) {
        return;
      }
      frame = window.requestAnimationFrame(sync);
    };

    frame = window.requestAnimationFrame(sync);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      if (frame !== 0) {
        window.cancelAnimationFrame(frame);
      }
      window.removeEventListener("scroll", onScroll);
    };
  }, [isHome]);

  function clearHoverTimer() {
    if (hoverTimer.current !== null) {
      window.clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
  }

  function scheduleHoverClose() {
    clearHoverTimer();
    hoverTimer.current = window.setTimeout(() => {
      setOpenMenu(null);
      hoverTimer.current = null;
    }, 140);
  }

  function openFromPointer(event: ReactPointerEvent, key: MenuKey) {
    if (event.pointerType !== "mouse") {
      return;
    }

    clearHoverTimer();
    hoverOpened.current = key;
    setOpenMenu(key);
  }

  function focusFirstInPanel(key: MenuKey) {
    const panelId = key === "products" ? productsPanelId : companyPanelId;

    window.setTimeout(() => {
      document
        .getElementById(panelId)
        ?.querySelector<HTMLElement>("a[href]")
        ?.focus();
    }, 60);
  }

  function toggleMenu(key: MenuKey, event: ReactMouseEvent<HTMLButtonElement>) {
    clearHoverTimer();

    // A pointer already opened this panel on hover. The click that follows
    // must not read as "toggle closed" — otherwise the menu flashes shut and
    // the categories are unreachable. The next click closes it normally.
    if (hoverOpened.current === key && openMenu === key) {
      hoverOpened.current = null;
      return;
    }

    hoverOpened.current = null;
    const next = openMenu === key ? null : key;
    setOpenMenu(next);

    // event.detail is 0 for Enter and Space, which should move focus into
    // the panel. A pointer click keeps focus on the trigger.
    if (next && event.detail === 0) {
      focusFirstInPanel(key);
    }
  }

  function handleTriggerKeyDown(key: MenuKey) {
    return (event: ReactKeyboardEvent<HTMLButtonElement>) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setOpenMenu(key);
        focusFirstInPanel(key);
      }
    };
  }

  function handleNavBlur(event: ReactFocusEvent<HTMLElement>) {
    const next = event.relatedTarget as Node | null;
    if (!next || !event.currentTarget.contains(next)) {
      setOpenMenu(null);
    }
  }

  function closeMobile() {
    setMobileOpen(false);
    setMobileSection(null);
    window.requestAnimationFrame(() => mobileTriggerRef.current?.focus());
  }

  function handleDrawerKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Tab") {
      return;
    }

    const focusables = Array.from(
      drawerRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ) ?? [],
    ).filter((element) => element.offsetParent !== null);

    if (focusables.length === 0) {
      return;
    }

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <header
      ref={headerRef}
      className={`site-header${isHome ? " site-header--over-hero" : ""}${
        isHome && (headerSolid || openMenu !== null) ? " is-scrolled" : ""
      }`}
    >
      <Container className="site-header__bar">
        <BrandMark settings={settings} size="header" />

        <nav
          aria-label="Main navigation"
          className="site-header__nav"
          onBlur={handleNavBlur}
          onPointerLeave={(event) => {
            if (event.pointerType === "mouse") {
              scheduleHoverClose();
            }
          }}
        >
          <div className="site-nav-disclosure site-nav-disclosure--wide">
            <button
              ref={productsTriggerRef}
              type="button"
              className="site-nav-trigger"
              data-nav-menu="products"
              data-current={productsActive ? "true" : undefined}
              aria-expanded={openMenu === "products"}
              aria-controls={productsPanelId}
              aria-haspopup="true"
              onClick={(event) => toggleMenu("products", event)}
              onKeyDown={handleTriggerKeyDown("products")}
              onPointerEnter={(event) => openFromPointer(event, "products")}
            >
              Products
              <Chevron />
            </button>

            <div
              id={productsPanelId}
              className="site-mega"
              data-open={openMenu === "products"}
              role="group"
              aria-label="Product categories"
              aria-hidden={openMenu !== "products"}
              inert={openMenu !== "products"}
            >
              <div className="site-mega__head">
                <span className="site-mega__label">The range</span>
                <span className="site-mega__note">Generate · Store · Move</span>
              </div>

              <div className="site-mega__grid">
                {megaItems.map((item) => (
                  <Link
                    key={item.id}
                    href={item.path}
                    className="site-mega__card"
                    onClick={() => setOpenMenu(null)}
                  >
                    {item.imageSrc ? (
                      <span className="site-mega__media">
                        <Image
                          src={item.imageSrc}
                          alt=""
                          fill
                          sizes="(max-width: 1100px) 28vw, 300px"
                        />
                      </span>
                    ) : null}
                    <span className="site-mega__kicker">
                      <span className="site-mega__index">{item.index}</span>{" "}
                      {item.verb}
                    </span>
                    <span className="site-mega__title">{item.name}</span>
                    <span className="site-mega__desc">{item.description}</span>
                    <span className="site-mega__cta">
                      Explore category
                      <Arrow />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="site-nav-disclosure">
            <button
              ref={companyTriggerRef}
              type="button"
              className="site-nav-trigger"
              data-nav-menu="company"
              data-current={companyActive ? "true" : undefined}
              aria-expanded={openMenu === "company"}
              aria-controls={companyPanelId}
              aria-haspopup="true"
              onClick={(event) => toggleMenu("company", event)}
              onKeyDown={handleTriggerKeyDown("company")}
              onPointerEnter={(event) => openFromPointer(event, "company")}
            >
              Company
              <Chevron />
            </button>

            <div
              id={companyPanelId}
              className="site-flyout"
              data-open={openMenu === "company"}
              role="group"
              aria-label="Company"
              aria-hidden={openMenu !== "company"}
              inert={openMenu !== "company"}
            >
              <Link
                href="/about"
                className="site-flyout__link"
                onClick={() => setOpenMenu(null)}
              >
                <span className="site-flyout__title">About LONEX</span>
                <span className="site-flyout__desc">
                  The company, its model and its values
                </span>
              </Link>
              <Link
                href="/authorized-sellers"
                className="site-flyout__link"
                onClick={() => setOpenMenu(null)}
              >
                <span className="site-flyout__title">Authorized Sellers</span>
                <span className="site-flyout__desc">
                  The confirmed LONEX seller directory
                </span>
              </Link>
            </div>
          </div>

          <Link
            href="/blog"
            className="site-nav-link"
            aria-current={journalActive ? "page" : undefined}
            onPointerEnter={(event) => {
              if (event.pointerType === "mouse") {
                clearHoverTimer();
                setOpenMenu(null);
              }
            }}
          >
            Journal
          </Link>

          <Link
            href="/verify"
            className="site-nav-link"
            aria-current={verifyActive ? "page" : undefined}
            onPointerEnter={(event) => {
              if (event.pointerType === "mouse") {
                clearHoverTimer();
                setOpenMenu(null);
              }
            }}
          >
            Verify
          </Link>
        </nav>

        <div className="site-header__actions">
          <Link
            href="/contact"
            className="site-btn site-btn--solid site-header__cta"
            aria-current={contactActive ? "page" : undefined}
          >
            Contact LONEX
            <Arrow />
          </Link>

          <button
            ref={mobileTriggerRef}
            type="button"
            className="site-menu-toggle"
            data-nav-toggle
            aria-expanded={mobileOpen}
            aria-controls={mobileDrawerId}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen(true)}
          >
            <span>Menu</span>
            <span className="site-menu-toggle__icon" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </button>
        </div>
      </Container>

      <div
        className="site-drawer"
        data-open={mobileOpen}
        aria-hidden={!mobileOpen}
        inert={!mobileOpen}
      >
        <div
          className="site-drawer__scrim"
          aria-hidden="true"
          onClick={closeMobile}
        />

        <div
          ref={drawerRef}
          id={mobileDrawerId}
          className="site-drawer__panel"
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
          onKeyDown={handleDrawerKeyDown}
        >
          <div className="site-drawer__head">
            <BrandMark settings={settings} size="sm" />
            <button
              ref={mobileCloseRef}
              type="button"
              className="site-drawer__close"
              aria-label="Close menu"
              onClick={closeMobile}
            >
              <CloseIcon />
            </button>
          </div>

          <div className="site-drawer__body">
            <nav aria-label="Mobile navigation" className="site-drawer__nav">
              <div className="site-drawer__group">
                <button
                  type="button"
                  className="site-drawer__toggle"
                  data-drawer-accordion="products"
                  aria-expanded={mobileSection === "products"}
                  aria-controls={mobileProductsId}
                  onClick={() =>
                    setMobileSection((current) =>
                      current === "products" ? null : "products",
                    )
                  }
                >
                  <span>Products</span>
                  <span
                    className="site-drawer__toggle-icon"
                    aria-hidden="true"
                  />
                </button>

                <div
                  id={mobileProductsId}
                  className="site-drawer__section"
                  hidden={mobileSection !== "products"}
                >
                  {megaItems.map((item) => (
                    <Link
                      key={item.id}
                      href={item.path}
                      className="site-drawer__category"
                      onClick={closeMobile}
                    >
                      {item.imageSrc ? (
                        <span className="site-drawer__thumb">
                          <Image
                            src={item.imageSrc}
                            alt=""
                            fill
                            sizes="64px"
                          />
                        </span>
                      ) : null}
                      <span className="site-drawer__category-copy">
                        <span className="site-drawer__category-verb">
                          {item.index} · {item.verb}
                        </span>
                        <span className="site-drawer__category-name">
                          {item.name}
                        </span>
                      </span>
                      <Arrow />
                    </Link>
                  ))}
                </div>
              </div>

              <div className="site-drawer__group">
                <button
                  type="button"
                  className="site-drawer__toggle"
                  data-drawer-accordion="company"
                  aria-expanded={mobileSection === "company"}
                  aria-controls={mobileCompanyId}
                  onClick={() =>
                    setMobileSection((current) =>
                      current === "company" ? null : "company",
                    )
                  }
                >
                  <span>Company</span>
                  <span
                    className="site-drawer__toggle-icon"
                    aria-hidden="true"
                  />
                </button>

                <div
                  id={mobileCompanyId}
                  className="site-drawer__section"
                  hidden={mobileSection !== "company"}
                >
                  <Link
                    href="/about"
                    className="site-drawer__sublink"
                    onClick={closeMobile}
                  >
                    About LONEX
                    <Arrow />
                  </Link>
                  <Link
                    href="/authorized-sellers"
                    className="site-drawer__sublink"
                    onClick={closeMobile}
                  >
                    Authorized Sellers
                    <Arrow />
                  </Link>
                </div>
              </div>

              <Link
                href="/blog"
                className="site-drawer__link"
                aria-current={journalActive ? "page" : undefined}
                onClick={closeMobile}
              >
                Journal
                <Arrow />
              </Link>

              <Link
                href="/verify"
                className="site-drawer__link"
                aria-current={verifyActive ? "page" : undefined}
                onClick={closeMobile}
              >
                Verify
                <Arrow />
              </Link>
            </nav>

            <div className="site-drawer__cta">
              <Link
                href="/contact"
                className="site-btn site-btn--solid"
                aria-current={contactActive ? "page" : undefined}
                onClick={closeMobile}
              >
                Contact LONEX
                <Arrow />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
