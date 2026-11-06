import Link from "next/link";
import type { PublicCategory, PublicSettings } from "@/lib/public/dto";
import { BrandMark } from "./brand-mark";
import { Container } from "./container";

function whatsappHref(value: string): string | null {
  const digits = value.replace(/[^\d]/g, "");

  return digits.length >= 6 ? `https://wa.me/${digits}` : null;
}

function FooterHeading({ children }: { children: string }) {
  return (
    <h2 className="type-eyebrow text-white/55">{children}</h2>
  );
}

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="footer-link link-underline inline-block text-sm text-white/70 transition-colors hover:text-white"
    >
      {label}
    </Link>
  );
}

export function SiteFooter({
  settings,
  categories,
}: {
  settings: PublicSettings;
  categories: PublicCategory[];
}) {
  const whatsapp = settings.whatsapp ? whatsappHref(settings.whatsapp) : null;
  const social = Object.entries(settings.social).filter(([, url]) => url);

  return (
    <footer className="border-t border-white/10 bg-black text-white">
      <Container className="pt-14 sm:pt-16">
        <p
          aria-hidden="true"
          className="reveal type-section text-outline-light select-none"
        >
          Power for What&apos;s Next.
        </p>
      </Container>

      <Container className="grid gap-12 py-14 sm:py-16 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr]">
        <div className="reveal space-y-6">
          <BrandMark settings={settings} inverse size="footer" />
          <p className="type-statement max-w-sm text-white">
            Energy That Moves Life Forward.
          </p>
          <p className="max-w-sm text-sm leading-7 text-white/55">
            {settings.description ||
              "A Pakistan-based importer, distributor and dealership business connecting solar, storage and electric mobility."}
          </p>

          {social.length > 0 ? (
            <div className="flex flex-wrap gap-x-5 gap-y-2 pt-1">
              {social.map(([name, url]) => (
                <a
                  key={name}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="type-eyebrow text-white/55 transition-colors hover:text-white"
                >
                  {name}
                </a>
              ))}
            </div>
          ) : null}
        </div>

        <div className="space-y-5">
          <FooterHeading>Explore</FooterHeading>
          <div className="flex flex-col gap-3">
            <FooterLink href="/" label="Home" />
            {categories.map((category) => (
              <FooterLink
                key={category.id}
                href={category.path}
                label={category.name}
              />
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <FooterHeading>Company</FooterHeading>
          <div className="flex flex-col gap-3">
            <FooterLink href="/about" label="About LONEX" />
            <FooterLink href="/authorized-sellers" label="Authorized sellers" />
            <FooterLink href="/verify" label="Verify a model" />
            <FooterLink href="/blog" label="Journal" />
            <FooterLink href="/contact" label="Contact" />
          </div>
        </div>

        <div className="space-y-5">
          <FooterHeading>Contact</FooterHeading>
          <div className="flex flex-col gap-3 text-sm text-white/70">
            {settings.contactEmail ? (
              <a
                href={`mailto:${settings.contactEmail}`}
                className="link-underline inline-block transition-colors hover:text-white"
              >
                {settings.contactEmail}
              </a>
            ) : null}
            {settings.contactPhone ? (
              <a
                href={`tel:${settings.contactPhone.replace(/\s+/g, "")}`}
                className="link-underline inline-block transition-colors hover:text-white"
              >
                {settings.contactPhone}
              </a>
            ) : null}
            {whatsapp ? (
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="link-underline inline-block transition-colors hover:text-white"
              >
                WhatsApp
              </a>
            ) : null}
            {settings.address ? (
              <p className="leading-6 text-white/50">{settings.address}</p>
            ) : null}
            {!settings.contactEmail &&
            !settings.contactPhone &&
            !settings.address ? (
              <p className="leading-6 text-white/55">
                Contact details will be published once confirmed.
              </p>
            ) : null}
          </div>

          <Link
            href="#main-content"
            className="type-eyebrow inline-flex items-center gap-2 pt-2 text-white/55 transition-colors hover:text-white"
          >
            Back to top
            <span aria-hidden="true">↑</span>
          </Link>
        </div>
      </Container>

      <div className="border-t border-white/10">
        <Container className="flex flex-col gap-2 py-6 text-xs text-white/55 sm:flex-row sm:items-center sm:justify-between">
          <p>© {settings.siteName}. All rights reserved.</p>
          <p>
            Product model verification confirms registration, not physical
            authenticity.
          </p>
        </Container>
      </div>
    </footer>
  );
}
