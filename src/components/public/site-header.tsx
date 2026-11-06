import Link from "next/link";
import type { PublicCategory, PublicSettings } from "@/lib/public/dto";
import { BrandMark } from "./brand-mark";
import { Container } from "./container";

const STATIC_LINKS = [
  { href: "/authorized-sellers", label: "Authorized sellers" },
  { href: "/verify", label: "Verify" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="nav-link link-underline whitespace-nowrap text-[13px] font-medium text-black/65 transition-colors hover:text-black"
    >
      {label}
    </Link>
  );
}

export function SiteHeader({
  settings,
  categories,
}: {
  settings: PublicSettings;
  categories: PublicCategory[];
}) {
  const links = [
    { href: "/", label: "Home" },
    ...categories.map((category) => ({
      href: category.path,
      label: category.name,
    })),
    ...STATIC_LINKS.map((link) => ({ href: link.href, label: link.label })),
  ];

  return (
    <header className="site-header sticky top-0 z-40 border-b border-black/10 bg-white/90 backdrop-blur-md">
      <Container className="flex h-[4.5rem] items-center justify-between gap-6 sm:h-24">
        <BrandMark settings={settings} size="header" />

        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-5 xl:flex 2xl:gap-6"
        >
          {links.map((link) => (
            <NavLink key={link.href} href={link.href} label={link.label} />
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/verify"
            className="btn-sheen hidden items-center justify-center bg-[#CF0A0A] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-black sm:inline-flex xl:hidden"
          >
            Verify a model
          </Link>

          <details className="group relative xl:hidden">
            <summary className="flex cursor-pointer list-none items-center gap-2.5 border border-black/15 px-3.5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-black transition-colors hover:border-black [&::-webkit-details-marker]:hidden">
              <span className="group-open:hidden">Menu</span>
              <span className="hidden group-open:inline">Close</span>
              <span
                aria-hidden="true"
                className="text-sm leading-none text-[#CF0A0A] transition-transform duration-300 group-open:rotate-45"
              >
                +
              </span>
            </summary>

            <div className="menu-panel absolute right-0 top-[calc(100%+0.9rem)] max-h-[calc(100vh-7rem)] w-[min(86vw,22rem)] overflow-y-auto border border-black/10 bg-white p-5 shadow-[0_30px_70px_-40px_rgba(0,0,0,0.5)]">
              <nav aria-label="Mobile navigation" className="flex flex-col divide-y divide-black/10">
                {links.map((link, index) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="menu-link flex items-center justify-between py-3 text-sm font-medium text-black transition-colors hover:text-[#CF0A0A]"
                  >
                    <span>{link.label}</span>
                    <span aria-hidden="true" className="type-eyebrow text-black/55">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </Link>
                ))}
              </nav>

              <div className="mt-5 grid gap-2">
                <Link
                  href="/verify"
                  className="flex items-center justify-center bg-[#CF0A0A] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-black"
                >
                  Verify a model
                </Link>
                <Link
                  href="/contact"
                  className="flex items-center justify-center border border-black/15 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-black transition-colors hover:border-black"
                >
                  Contact LONEX
                </Link>
              </div>
            </div>
          </details>
        </div>
      </Container>
    </header>
  );
}
