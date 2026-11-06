import Link from "next/link";
import { ButtonLink } from "@/components/public/button-link";
import { Container } from "@/components/public/container";
import { Eyebrow } from "@/components/public/eyebrow";

export default function NotFound() {
  return (
    <section className="relative overflow-hidden bg-white">
      <div
        aria-hidden="true"
        className="lux-grid-bg pointer-events-none absolute inset-0 opacity-60"
      />
      <Container className="relative grid gap-12 py-20 sm:py-28 lg:grid-cols-[1fr_0.7fr] lg:items-end">
        <div className="space-y-7">
          <Eyebrow>Error 404</Eyebrow>
          <p
            aria-hidden="true"
            className="type-hero text-outline-dark select-none leading-none"
          >
            404
          </p>
          <h1 className="type-section text-black">
            This page has moved
            <br />
            beyond the map<span className="text-[#CF0A0A]">.</span>
          </h1>
          <p className="type-lead max-w-xl text-black/55">
            The page you requested does not exist or is no longer published.
            Explore the range, verify a model or contact LONEX.
          </p>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/">Back to home</ButtonLink>
            <ButtonLink href="/contact" variant="outline">
              Contact LONEX
            </ButtonLink>
          </div>
        </div>

        <nav aria-label="Helpful links" className="border-t border-black/10">
          {[
            { href: "/#categories", label: "Explore the range" },
            { href: "/verify", label: "Verify a model" },
            { href: "/authorized-sellers", label: "Authorized sellers" },
            { href: "/blog", label: "Journal" },
          ].map((link, index) => (
            <Link
              key={link.href}
              href={link.href}
              className="group flex items-center justify-between gap-4 border-b border-black/10 py-5 transition-colors hover:text-[#CF0A0A]"
            >
              <span className="flex items-center gap-4">
                <span className="type-eyebrow text-[#CF0A0A]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-sm font-semibold">{link.label}</span>
              </span>
              <span aria-hidden="true" className="arrow-slide text-lg">
                →
              </span>
            </Link>
          ))}
        </nav>
      </Container>
    </section>
  );
}
