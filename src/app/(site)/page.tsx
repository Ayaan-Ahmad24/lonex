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

const HERO_PHOTO =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Phipps_Conservatory_24.jpg/1280px-Phipps_Conservatory_24.jpg";
const HERO_PHOTO_CREDIT =
  'Dllu (CC BY-SA 4.0, Wikimedia Commons)';
const SOLAR_PHOTO =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/A_photovoltaic_power_station_in_the_United_States_%2836130544874%29.jpg/1280px-A_photovoltaic_power_station_in_the_United_States_%2836130544874%29.jpg";
const SOLAR_PHOTO_CREDIT =
  'Chris Allan, U.S. Department of Energy (public domain, Wikimedia Commons)';
const EV_PHOTO =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Cycling_Amsterdam_03.jpg/1280px-Cycling_Amsterdam_03.jpg";
const EV_PHOTO_CREDIT =
  'Alfredo Borba (CC BY-SA 4.0, Wikimedia Commons)';

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
        className="fixed inset-x-0 top-0 z-[300] border-b border-[var(--color-rule)] bg-[var(--color-paper-2)] py-4"
      >
        <Container>
          <div className="flex items-center justify-between">
            <BrandMark settings={brand} size="header" inverse />
            <div className="flex items-center gap-8 text-[var(--text-sm)] font-medium">
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
      <section
        className="relative bg-[var(--color-paper)] min-[75svh]:h-[75svh]"
      >
        <Container className="relative grid grid-cols-12 gap-[var(--space-2xl)] items-center pt-24 pb-32 lg:pt-32 lg:pb-40">
          <div className="col-span-12 lg:col-span-6 reveal">
            <h1 className="text-[var(--text-display)] font-[var(--font-display)] font-[600] tracking-[var(--tracking-display)] leading-[1.02] text-[var(--color-ink)] mb-6 max-w-[20ch]">
              Power for what&apos;s next.
            </h1>
            <p className="text-[var(--text-lead)] leading-[1.6] text-[var(--color-ink-2)] mb-10 max-w-[52ch]">
              Solar power, storage and electric mobility. Every model registered.
            </p>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href="/verify" variant="solid">
                Verify a model
              </ButtonLink>
              <ButtonLink
                href="#range"
                variant="outline"
                className="border-[var(--color-rule)] text-[var(--color-ink)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
              >
                Explore the range
              </ButtonLink>
            </div>
          </div>
          <div className="col-span-12 lg:col-span-6 relative aspect-[4/5] overflow-hidden bg-[var(--color-paper-2)]">
            {/* Hero photograph — a real library photograph, credited in the footer. */}
            <Image
              src={HERO_PHOTO}
              alt="Solar panel array angled towards a soft sunset sky"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover object-center"
            />
          </div>
        </Container>
      </section>

      {/* Range — categories as split: type beside type, no empty frames. */}
      <section id="range" className="bg-[var(--color-paper)] py-[var(--section-gap)]">
        <Container>
          <SectionHeading
            title="The range"
            description="Solar, storage and electric mobility, published when LONEX confirms them."
            action={
              <Link
                href="/verify"
                className="text-[var(--text-xs)] font-medium text-[var(--color-ink)] underline underline-offset-4 hover:text-[var(--color-accent)]"
              >
                Verify a model
              </Link>
            }
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[var(--gap-columns)] mt-16">
            {categories.map((category) => {
              const isSolar = category.slug === "solar";
              const isEV = category.slug === "ev-bikes";
              return (
                <article
                  key={category.id}
                  className="border border-[var(--color-rule)] bg-[var(--color-paper-2)] p-[var(--space-lg)] hover:border-[var(--color-accent)] transition-colors duration-200"
                >
                  {isSolar ? (
                    <div className="mb-4 aspect-[4/5] overflow-hidden bg-[var(--color-paper-3)]">
                      <Image
                        src={SOLAR_PHOTO}
                        alt="Solar panels on stilts across a dry field at dusk"
                        fill
                        sizes="(max-width: 768px) 100vw, 25vw"
                        className="object-cover object-center"
                      />
                    </div>
                  ) : isEV ? (
                    <div className="mb-4 aspect-[4/5] overflow-hidden bg-[var(--color-paper-3)]">
                      <Image
                        src={EV_PHOTO}
                        alt="Woman cycling past a brick facade"
                        fill
                        sizes="(max-width: 768px) 100vw, 25vw"
                        className="object-cover object-center"
                      />
                    </div>
                  ) : (
                    <div
                      className="mb-4 aspect-[4/5] overflow-hidden bg-[var(--color-paper-3)]"
                      data-slot="battery"
                      data-alt="Battery storage — a real photograph supplied by LONEX"
                    ></div>
                  )}
                  <h3
                    className="text-[var(--text-title)] font-[var(--font-body)] font-[500] text-[var(--color-ink)] leading-1.2 mb-3 max-w-[40ch]"
                  >
                    {category.name}
                  </h3>
                  <p className="text-[var(--text-sm)] leading-[1.6] text-[var(--color-muted)] mb-6 max-w-[65ch]">
                    {category.description ?? "Published when LONEX confirms it."}
                  </p>
                  <Link
                    href={category.path}
                    className="text-[var(--text-xs)] font-medium text-[var(--color-accent)] underline underline-offset-4 hover:underline-offset-2"
                  >
                    Browse {category.name}
                  </Link>
                </article>
              );
            })}
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
            <ButtonLink href="/contact" variant="solid">
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
            Photographs: {HERO_PHOTO_CREDIT} · {SOLAR_PHOTO_CREDIT} ·
            {EV_PHOTO_CREDIT}. LONEX is an importer, distributor and
            dealership, not a manufacturer. Model codes confirm registration,
            not the authenticity of a unit.
          </p>
        </Container>
      </footer>

      <script
        dangerouslySetInnerHTML={{
          __html: `window.hallmarkSlots = (m) => { for (const [k, v] of Object.entries(m)) { const s = document.querySelector(\`[data-slot="\${k}"]\`); if (!s) continue; const im = new Image(); im.src = typeof v === 'string' ? v : v.src; im.alt = (typeof v === 'object' && v.alt) || s.dataset.alt || ''; s.querySelectorAll(':scope > img').forEach((o) => o.remove()); s.prepend(im); } }; document.querySelectorAll('[data-slot] img').forEach((i) => { if (i.complete && !i.naturalWidth) i.remove(); else i.addEventListener('error', () => i.remove(), { once: true }); });`,
        }}
      />
    </>
  );
}

export const instant = false;
