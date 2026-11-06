import Link from "next/link";
import type { Metadata } from "next";
import { connection } from "next/server";

import { ButtonLink } from "@/components/public/button-link";
import { Container } from "@/components/public/container";
import { Eyebrow } from "@/components/public/eyebrow";
import { SectionHeading } from "@/components/public/section-heading";
import { SellerCard } from "@/components/public/seller-card";
import { createPageMetadata } from "@/lib/public/seo";
import { loadPublicSettings } from "@/lib/public/settings";
import { listPublishedSellers, listSellerCities } from "@/lib/public/queries";

type SearchParams = { city?: string };

export async function generateMetadata(): Promise<Metadata> {
  await connection();
  const settings = await loadPublicSettings();
  return createPageMetadata({
    settings,
    title: "Authorized sellers",
    description: "Authorized LONEX sellers confirmed and published by LONEX.",
    path: "/authorized-sellers",
  });
}

export default async function AuthorizedSellersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await connection();

  const sp = await searchParams;
  const city = sp?.city?.trim() || undefined;

  const [settings, sellers, cities] = await Promise.all([
    loadPublicSettings(),
    listPublishedSellers(city),
    listSellerCities(),
  ]);

  return (
    <>
      <section className="relative overflow-hidden border-b border-black/10 bg-[#F5EDED]">
        <div
          aria-hidden="true"
          className="lux-grid-bg pointer-events-none absolute inset-0 opacity-50"
        />
        <Container className="relative grid gap-12 py-12 sm:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-end lg:gap-16 lg:py-20">
          <div className="space-y-7">
            <nav
              aria-label="Breadcrumb"
              className="type-eyebrow flex flex-wrap items-center gap-2 text-black/55"
            >
              <Link href="/" className="transition-colors hover:text-[#CF0A0A]">
                Home
              </Link>
              <span aria-hidden="true">/</span>
              <span className="text-black/60">Authorized sellers</span>
            </nav>

            <div className="intro intro-1">
              <Eyebrow>Where to buy</Eyebrow>
            </div>

            <h1 className="intro intro-2 type-hero text-black">
              Authorized
              <br />
              sellers<span className="text-[#CF0A0A]">.</span>
            </h1>

            <p className="intro intro-3 type-lead max-w-xl text-black/60">
              Only seller listings confirmed and published by LONEX are shown.
              Each listing is published with the contact details approved by the
              seller.
            </p>
          </div>

          <div className="reveal grid grid-cols-2 gap-px border border-black/10 bg-black/10">
            <div className="bg-white p-6 sm:p-8">
              <p className="type-eyebrow text-black/55">Listings</p>
              <p className="type-section mt-4 text-black">
                {String(sellers.length).padStart(2, "0")}
              </p>
              <p className="mt-2 text-xs leading-5 text-black/55">
                {city ? `In ${city}` : "Published sellers"}
              </p>
            </div>
            <div className="bg-black p-6 text-white sm:p-8">
              <p className="type-eyebrow text-white/55">Cities</p>
              <p className="type-section mt-4 text-white">
                {String(cities.length).padStart(2, "0")}
              </p>
              <p className="mt-2 text-xs leading-5 text-white/55">
                Published locations
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-20 sm:py-28">
        <Container className="space-y-12">
          <SectionHeading
            index="01"
            eyebrow="Directory"
            title="Find a seller."
            description="Filter the published directory by city."
          />

          {cities.length > 0 ? (
            <nav aria-label="Filter by city" className="flex flex-wrap gap-2">
              <Link
                href="/authorized-sellers"
                aria-current={!city ? "page" : undefined}
                className={`inline-flex items-center border px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors ${
                  !city
                    ? "border-[#CF0A0A] bg-[#CF0A0A] text-white"
                    : "border-black/15 text-black hover:border-black"
                }`}
              >
                All cities
              </Link>
              {cities.map((item) => (
                <Link
                  key={item}
                  href={`/authorized-sellers?city=${encodeURIComponent(item)}`}
                  aria-current={city === item ? "page" : undefined}
                  className={`inline-flex items-center border px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors ${
                    city === item
                      ? "border-[#CF0A0A] bg-[#CF0A0A] text-white"
                      : "border-black/15 text-black hover:border-black"
                  }`}
                >
                  {item}
                </Link>
              ))}
            </nav>
          ) : null}

          {sellers.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {sellers.map((seller, index) => (
                <SellerCard key={seller.id} seller={seller} index={index} />
              ))}
            </div>
          ) : (
            <div className="reveal flex flex-col gap-6 border border-dashed border-black/20 p-8 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2">
                <p className="text-lg font-semibold text-black">
                  {city
                    ? `No authorized sellers listed for ${city}.`
                    : "No authorized sellers published yet."}
                </p>
                <p className="text-sm leading-6 text-black/55">
                  Listings appear here once confirmed and published by LONEX.
                </p>
              </div>
              <ButtonLink href="/contact" variant="outline">
                Contact LONEX
              </ButtonLink>
            </div>
          )}
        </Container>
      </section>

      {settings.googleMapsUrl ? (
        <section className="border-t border-black/10 bg-black py-14 text-white sm:py-16">
          <Container className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-3">
              <Eyebrow tone="light">Location</Eyebrow>
              <h2 className="type-statement text-white">Find LONEX.</h2>
              <p className="max-w-xl text-sm leading-7 text-white/55">
                Use the published map location for directions.
              </p>
            </div>
            <div className="flex lg:justify-end">
              <a
                href={settings.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-sheen group inline-flex items-center justify-center gap-3 bg-[#CF0A0A] px-6 py-3.5 text-[13px] font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-white hover:text-black sm:px-7 sm:py-4"
              >
                Open in Google Maps
                <span aria-hidden="true" className="arrow-slide">
                  →
                </span>
              </a>
            </div>
          </Container>
        </section>
      ) : null}
    </>
  );
}

export const instant = false;
