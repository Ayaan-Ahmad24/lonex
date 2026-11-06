import Link from "next/link";
import type { Metadata } from "next";
import { connection } from "next/server";

import { ButtonLink } from "@/components/public/button-link";
import { Container } from "@/components/public/container";
import { Eyebrow } from "@/components/public/eyebrow";
import { SectionHeading } from "@/components/public/section-heading";
import { createPageMetadata } from "@/lib/public/seo";
import { loadPublicSettings } from "@/lib/public/settings";

export async function generateMetadata(): Promise<Metadata> {
  await connection();
  const settings = await loadPublicSettings();
  return createPageMetadata({
    settings,
    title: "Contact",
    description: "Contact LONEX using the published contact details.",
    path: "/contact",
  });
}

export default async function ContactPage() {
  await connection();
  const settings = await loadPublicSettings();

  const whatsappDigits = settings.whatsapp.replace(/[^\d]/g, "");
  const whatsappHref =
    whatsappDigits.length >= 6 ? `https://wa.me/${whatsappDigits}` : null;
  const social = Object.entries(settings.social).filter(([, url]) => url);

  const hasDetails =
    Boolean(settings.contactEmail) ||
    Boolean(settings.contactPhone) ||
    Boolean(whatsappHref) ||
    Boolean(settings.address);

  return (
    <>
      <section className="relative overflow-hidden border-b border-black/10 bg-[#F5EDED]">
        <div
          aria-hidden="true"
          className="lux-grid-bg pointer-events-none absolute inset-0 opacity-50"
        />
        <Container className="relative grid gap-12 py-12 sm:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:py-20">
          <div className="space-y-7">
            <nav
              aria-label="Breadcrumb"
              className="type-eyebrow flex flex-wrap items-center gap-2 text-black/55"
            >
              <Link href="/" className="transition-colors hover:text-[#CF0A0A]">
                Home
              </Link>
              <span aria-hidden="true">/</span>
              <span className="text-black/60">Contact</span>
            </nav>

            <div className="intro intro-1">
              <Eyebrow>Contact</Eyebrow>
            </div>

            <h1 className="intro intro-2 type-hero text-black">
              Talk to
              <br />
              LONEX<span className="text-[#CF0A0A]">.</span>
            </h1>

            <p className="intro intro-3 type-lead max-w-xl text-black/60">
              Product, seller and verification enquiries use the contact details
              published by LONEX.
            </p>
          </div>

          <div className="reveal border border-black/10 bg-black p-6 text-white sm:p-8">
            <p className="type-eyebrow text-white/55">Enquiries</p>
            <ul className="mt-6 divide-y divide-white/10">
              {[
                "Product specifications and availability",
                "Authorized seller information",
                "Model verification help",
              ].map((item, index) => (
                <li
                  key={item}
                  className="flex items-center justify-between gap-4 py-4"
                >
                  <span className="text-sm text-white/75">{item}</span>
                  <span className="type-eyebrow text-[#CF0A0A]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      <section className="py-20 sm:py-28">
        <Container className="space-y-12">
          <SectionHeading
            index="01"
            eyebrow="Direct lines"
            title="Published contact information."
            description="Use the details below. Nothing is displayed until confirmed by LONEX."
          />

          <div className="grid gap-10 lg:grid-cols-[0.62fr_0.38fr] lg:gap-16">
            <div>
              {hasDetails ? (
                <div className="divide-y divide-black/10 border-y border-black/10">
                  {settings.contactEmail ? (
                    <a
                      href={`mailto:${settings.contactEmail}`}
                      className="group grid grid-cols-[2.5rem_1fr_auto] items-center gap-4 py-6 transition-colors hover:text-[#CF0A0A]"
                    >
                      <span className="type-eyebrow text-[#CF0A0A]">01</span>
                      <span>
                        <span className="type-eyebrow block text-black/55">
                          Email
                        </span>
                        <span className="mt-2 block break-all text-lg font-semibold text-black transition-colors group-hover:text-[#CF0A0A] sm:text-xl">
                          {settings.contactEmail}
                        </span>
                      </span>
                      <span aria-hidden="true" className="arrow-slide text-lg">
                        →
                      </span>
                    </a>
                  ) : null}

                  {settings.contactPhone ? (
                    <a
                      href={`tel:${settings.contactPhone.replace(/\s+/g, "")}`}
                      className="group grid grid-cols-[2.5rem_1fr_auto] items-center gap-4 py-6 transition-colors hover:text-[#CF0A0A]"
                    >
                      <span className="type-eyebrow text-[#CF0A0A]">02</span>
                      <span>
                        <span className="type-eyebrow block text-black/55">
                          Phone
                        </span>
                        <span className="mt-2 block text-lg font-semibold text-black transition-colors group-hover:text-[#CF0A0A] sm:text-xl">
                          {settings.contactPhone}
                        </span>
                      </span>
                      <span aria-hidden="true" className="arrow-slide text-lg">
                        →
                      </span>
                    </a>
                  ) : null}

                  {whatsappHref ? (
                    <a
                      href={whatsappHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group grid grid-cols-[2.5rem_1fr_auto] items-center gap-4 py-6 transition-colors hover:text-[#CF0A0A]"
                    >
                      <span className="type-eyebrow text-[#CF0A0A]">03</span>
                      <span>
                        <span className="type-eyebrow block text-black/55">
                          WhatsApp
                        </span>
                        <span className="mt-2 block text-lg font-semibold text-black transition-colors group-hover:text-[#CF0A0A] sm:text-xl">
                          {settings.whatsapp}
                        </span>
                      </span>
                      <span aria-hidden="true" className="arrow-slide text-lg">
                        →
                      </span>
                    </a>
                  ) : null}

                  {settings.address ? (
                    <div className="grid grid-cols-[2.5rem_1fr] gap-4 py-6">
                      <span className="type-eyebrow text-[#CF0A0A]">04</span>
                      <span>
                        <span className="type-eyebrow block text-black/55">
                          Address
                        </span>
                        <span className="mt-2 block text-base leading-7 text-black/70">
                          {settings.address}
                        </span>
                      </span>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="border border-dashed border-black/20 p-8">
                  <p className="text-lg font-semibold text-black">
                    Contact details will be published once confirmed.
                  </p>
                  <p className="mt-2 text-sm leading-6 text-black/55">
                    LONEX has not published an email, phone number or address
                    yet. The verification and seller directories remain
                    available.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <ButtonLink href="/verify" variant="outline">
                      Verify a model
                    </ButtonLink>
                    <ButtonLink href="/authorized-sellers" variant="outline">
                      Authorized sellers
                    </ButtonLink>
                  </div>
                </div>
              )}

              {social.length > 0 ? (
                <div className="mt-10 space-y-4">
                  <p className="type-eyebrow text-black/55">Social</p>
                  <div className="flex flex-wrap gap-3">
                    {social.map(([name, url]) => (
                      <a
                        key={name}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center border border-black/15 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-black transition-colors hover:border-black hover:bg-black hover:text-white"
                      >
                        {name}
                      </a>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <aside className="space-y-6">
              <div className="border border-black/10 bg-[#F5EDED] p-6">
                <p className="type-eyebrow text-[#CF0A0A]">Location</p>
                <p className="mt-3 text-sm leading-7 text-black/60">
                  {settings.address ||
                    "A published location will appear here once confirmed by LONEX."}
                </p>
                {settings.googleMapsUrl ? (
                  <a
                    href={settings.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="type-eyebrow mt-5 inline-flex items-center gap-2 text-black transition-colors hover:text-[#CF0A0A]"
                  >
                    Open in Google Maps
                    <span aria-hidden="true">→</span>
                  </a>
                ) : (
                  <p className="mt-5 text-xs leading-5 text-black/55">
                    Map link will be published once confirmed.
                  </p>
                )}
              </div>

              <div className="border border-black/10 bg-white p-6">
                <p className="type-eyebrow text-black/55">
                  What to include
                </p>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-black/55">
                  <li>Product or category you are asking about.</li>
                  <li>The model code if you are verifying a unit.</li>
                  <li>Your city for seller information.</li>
                </ul>
              </div>

              <div className="border border-black/10 bg-black p-6 text-white">
                <p className="type-eyebrow text-white/55">Verification</p>
                <p className="mt-3 text-sm leading-7 text-white/65">
                  A model code check confirms registration with LONEX, not the
                  authenticity of an individual unit.
                </p>
                <Link
                  href="/verify"
                  className="type-eyebrow mt-5 inline-flex items-center gap-2 text-white transition-colors hover:text-[#CF0A0A]"
                >
                  Verify a model
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </aside>
          </div>
        </Container>
      </section>
    </>
  );
}

export const instant = false;
