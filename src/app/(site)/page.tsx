import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { connection } from "next/server";

import { BrandMark } from "@/components/public/brand-mark";
import { ButtonLink } from "@/components/public/button-link";
import { Container } from "@/components/public/container";
import { SectionHeading } from "@/components/public/section-heading";
import type { PublicSettings } from "@/lib/public/dto";
import { createPageMetadata } from "@/lib/public/seo";
import { loadPublicSettings } from "@/lib/public/settings";
import { listPublishedCategories } from "@/lib/public/queries";

export async function generateMetadata(): Promise<Metadata> {
  await connection();
  const settings = await loadPublicSettings();

  return createPageMetadata({
    settings,
    title: settings.seoTitle || `${settings.siteName} | Power for What's Next.`,
    description:
      settings.seoDescription ||
      "LONEX connects solar energy, intelligent storage and electric mobility through carefully selected solutions.",
    path: "/",
    absoluteTitle: true,
  });
}

const SOLAR_PHOTO =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/A_photovoltaic_power_station_in_the_United_States_%2836130544874%29.jpg/1280px-A_photovoltaic_power_station_in_the_United_States_%2836130544874%29.jpg";

const CATEGORY_FALLBACK_LINE = "Published when LONEX confirms it.";

export default async function HomePage() {
  await connection();
  const settings = await loadPublicSettings();

  const [categories] = await Promise.all([listPublishedCategories()]);

  const brand = {
    siteName: settings.siteName,
    logo: settings.logo,
  } as PublicSettings;

  return (
    <>
      {/* Nav — one line, edge aligned, wordmark and two actions. */}
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 top-0 z-sticky-nav border-b border-[var(--color-rule)] bg-[var(--color-paper-2)] py-4"
      >
        <Container>
          <div className="flex items-center justify-between">
            <Link href="/" aria-label="LONEX home" className="flex items-center gap-2">
              <BrandMark settings={brand} size="header" inverse />
            </Link>
            <div className="flex items-center gap-6 text-sm font-medium">
              <Link
                href="/verify"
                className="text-[var(--color-ink)] hover:text-[var(--color-accent)] underline underline-offset-4"
              >
                Verify a model
              </Link>
              <Link
                href="/contact"
                className="text-[var(--color-ink)] hover:text-[var(--color-accent)] underline underline-offset-4"
              >
                Contact LONEX
              </Link>
            </div>
          </div>
        </Container>
      </nav>

      {/* Hero — Settled posture, fills the screen under the nav. */}
      <section className="relative bg-[var(--color-paper)]">
        <Container className="relative min-[75svh]:h-[75svh] grid grid-cols-12 gap-[var(--space-2xl)] items-center pt-24 pb-32 lg:pt-32 lg:pb-40">
          <div className="col-span-12 lg:col-span-6">
            <h1 className="text-[var(--text-display)] font-[var(--font-display)] font-[600] tracking-[var(--tracking-display)] leading-[1.02] text-[var(--color-ink)] mb-6 max-w-[20ch]">
              Power for what&apos;s next.
            </h1>
            <p className="text-[var(--text-lead)] leading-[1.6] text-[var(--color-ink-2)] mb-10 max-w-[52ch]">
              Solar power, storage and electric mobility. Every model registered.
            </p>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href="/verify" variant="solid" arrow={false}>
                Verify a model
              </ButtonLink>
              <ButtonLink
                href="#range"
                variant="outline"
                arrow={false}
                className="border-[var(--color-rule)] text-[var(--color-ink)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
              >
                Explore the range
              </ButtonLink>
            </div>
          </div>
          <div className="col-span-12 lg:col-span-6 relative aspect-[4/5] overflow-hidden bg-[var(--color-paper-2)]">
            {/* Hero photograph — a real library photograph, credited in the footer. */}
            <Image
              src={SOLAR_PHOTO}
              alt="Solar panels on stilts across a field at dusk"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              unoptimized
              className="object-cover object-center"
            />
          </div>
        </Container>
      </section>

      {/* Range — a set of category cards, type at scale, no empty frames. */}
      <section id="range" className="bg-[var(--color-paper)] py-[var(--section-gap)]">
        <Container>
          <SectionHeading
            index="02"
            title="The range"
            description="Solar, storage and electric mobility, published when LONEX confirms them."
            action={
              <Link
                href="/verify"
                className="text-xs font-medium text-[var(--color-ink)] underline underline-offset-4 hover:text-[var(--color-accent)]"
              >
                Verify a model
              </Link>
            }
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[var(--gap-columns)] mt-16">
            {categories.map((category) => (
              <article
                key={category.id}
                className="border border-[var(--color-rule)] bg-[var(--color-paper-2)] p-[var(--space-lg)] hover:border-[var(--color-accent)] transition-colors duration-200"
              >
                <h3
                  className="text-[var(--text-title)] font-[var(--font-body)] font-[500] text-[var(--color-ink)] leading-1.2 mb-3 max-w-[40ch]"
                >
                  {category.name}
                </h3>
                <p className="text-[var(--text-sm)] leading-[1.6] text-[var(--color-muted)] mb-6 max-w-[65ch]">
                  {category.description ?? CATEGORY_FALLBACK_LINE}
                </p>
                <Link
                  href={category.path}
                  className="text-xs font-medium text-[var(--color-accent)] underline underline-offset-4 hover:underline-offset-2"
                >
                  Browse {category.name}
                </Link>
              </article>
            ))}
          </div>
        </Container>
      </section>

      {/* Why — a statement at section size. */}
      <section className="bg-[var(--color-paper-2)] py-[var(--section-gap)]">
        <Container className="grid gap-[var(--space-2xl)]">
          <div className="max-w-[60ch]">
            <h2
              className="text-[var(--text-section)] font-[var(--font-display)] font-[600] tracking-[var(--tracking-display)] leading-[1.05] text-[var(--color-ink)] mb-6 max-w-[30ch]"
            >
              Built on what we can verify
            </h2>
            <p className="text-[var(--color-ink-2)] leading-[1.6] max-w-[52ch]">
              LONEX is an importer, distributor and dealership, not a
              manufacturer. Nothing appears here until LONEX has confirmed it.
            </p>
          </div>
        </Container>
      </section>

      {/* Close — contact, the job the visitor came to do. */}
      <section className="bg-[var(--color-accent-soft)] text-[var(--color-accent-ink)] py-[var(--section-gap-l)]">
        <Container className="grid gap-[var(--space-2xl)] lg:grid-cols-2 lg:items-center">
          <div>
            <h2
              className="text-[var(--text-display-s)] font-[var(--font-display)] font-[600] tracking-[var(--tracking-display)] leading-[1.02] text-[var(--color-accent-ink)] mb-6 max-w-[24ch]"
            >
              Let&apos;s talk about what&apos;s next.
            </h2>
            <p className="text-[var(--text-lead)] leading-[1.6] max-w-[52ch] mb-8">
              LONEX is an importer, distributor and dealership based in
              Lahore, Pakistan. Solar, storage and electric mobility.
            </p>
            <ButtonLink href="/contact" variant="solid" arrow={false}>
              Contact LONEX
            </ButtonLink>
          </div>
        </Container>
      </section>

      <footer className="bg-[var(--color-paper)] border-t border-[var(--color-rule)] py-[var(--space-2xl)]">
        <Container className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between border-t border-[var(--color-rule)] pt-[var(--space-xl)]">
          <div className="flex items-center gap-2">
            <BrandMark settings={brand} size="footer" inverse />
          </div>
          <nav className="flex gap-8 text-[var(--text-sm)] text-[var(--color-muted)]">
            <Link
              href="/verify"
              className="text-[var(--color-ink)] hover:text-[var(--color-accent)]"
            >
              Verify a model
            </Link>
            <Link
              href="/authorized-sellers"
              className="text-[var(--color-ink)] hover:text-[var(--color-accent)]"
            >
              Authorized sellers
            </Link>
            <Link
              href="/about"
              className="text-[var(--color-ink)] hover:text-[var(--color-accent)]"
            >
              About LONEX
            </Link>
          </nav>
          <p className="text-[var(--text-xs)] text-[var(--color-muted)] leading-[1.6]">
            Photographs: Chris Allan, U.S. Department of Energy (public domain,
            Wikimedia Commons). LONEX is an importer, distributor and
            dealership — not a manufacturer. Model codes confirm registration,
            not the authenticity of a unit.
          </p>
        </Container>
      </footer>
    </>
  );
}

export const instant = false;
