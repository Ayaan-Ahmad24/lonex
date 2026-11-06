import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { connection } from "next/server";

import { ButtonLink } from "@/components/public/button-link";
import { Container } from "@/components/public/container";
import { Eyebrow } from "@/components/public/eyebrow";
import { SectionHeading } from "@/components/public/section-heading";
import { createPageMetadata } from "@/lib/public/seo";
import { loadPublicSettings } from "@/lib/public/settings";

const MODEL = [
  {
    title: "Import",
    copy: "International sourcing connects products manufactured abroad with domestic purchasing requirements. LONEX evaluates specifications, supplier documentation, commercial feasibility and applicable import requirements.",
  },
  {
    title: "Distribution",
    copy: "Distribution supports access to products through appropriate purchasing and supply arrangements. Solar businesses, battery retailers and electric bike dealers each have different needs.",
  },
  {
    title: "Dealership",
    copy: "We welcome commercial discussions with suitable dealers and business buyers. Arrangements define products, quantities, prices, payment conditions and delivery responsibilities in writing.",
  },
] as const;

const VALUES = [
  {
    title: "Integrity",
    copy: "How we communicate specifications, pricing and commercial conditions.",
  },
  {
    title: "Reliability",
    copy: "Respecting agreed responsibilities and explaining uncertainties honestly.",
  },
  {
    title: "Quality consciousness",
    copy: "Attention to the technical characteristics and intended applications of the products we supply.",
  },
  {
    title: "Customer commitment",
    copy: "Understanding requirements rather than promoting one solution to everyone.",
  },
  {
    title: "Innovation",
    copy: "Remaining attentive to relevant technology without assuming that newer is always better.",
  },
  {
    title: "Partnership",
    copy: "Mutually beneficial relationships based on clarity and professional cooperation.",
  },
] as const;

const DIRECTIONS = [
  {
    index: "01",
    name: "Solar panels",
    verb: "Generate",
    copy: "Photovoltaic panels convert sunlight into direct-current electricity. Suitability depends on rated output, voltage, current, dimensions, system design and installation conditions.",
    href: "/solar",
  },
  {
    index: "02",
    name: "Batteries",
    verb: "Store",
    copy: "Batteries store energy chemically and release it when required. Suitability depends on chemistry, usable capacity, voltage, charging requirements and operating conditions.",
    href: "/batteries",
  },
  {
    index: "03",
    name: "Electric bikes",
    verb: "Move",
    copy: "Electric bikes use rechargeable batteries and electric motors for propulsion. Range, charging time and ownership cost vary with model, rider, terrain and battery condition.",
    href: "/ev-bikes",
  },
] as const;

const PUBLISHED = [
  {
    title: "Products",
    copy: "Published categories and products, with approved imagery and descriptions.",
  },
  {
    title: "Specifications",
    copy: "Technical data is shown only when supplied and approved by LONEX.",
  },
  {
    title: "Documents",
    copy: "Datasheets and PDF documents are attached to the products they describe.",
  },
  {
    title: "Sellers",
    copy: "Only seller listings confirmed and published by LONEX appear in the directory.",
  },
] as const;

export async function generateMetadata(): Promise<Metadata> {
  await connection();
  const settings = await loadPublicSettings();
  return createPageMetadata({
    settings,
    title: "About LONEX",
    description:
      "LONEX is a Pakistan-based import, distribution and dealership business connecting solar panels, batteries and electric bikes.",
    path: "/about",
  });
}

export default async function AboutPage() {
  await connection();
  const settings = await loadPublicSettings();

  return (
    <>
      <section className="relative overflow-hidden bg-white">
        <div
          aria-hidden="true"
          className="lux-grid-bg pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 opacity-60 lg:block"
        />
        <Container className="relative grid gap-14 py-12 sm:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:py-20">
          <div className="space-y-7">
            <nav
              aria-label="Breadcrumb"
              className="type-eyebrow flex flex-wrap items-center gap-2 text-black/55"
            >
              <Link href="/" className="transition-colors hover:text-[#CF0A0A]">
                Home
              </Link>
              <span aria-hidden="true">/</span>
              <span className="text-black/60">About</span>
            </nav>

            <div className="intro intro-1">
              <Eyebrow>About LONEX</Eyebrow>
            </div>

            <h1 className="intro intro-2 type-hero text-black">
              Energy that
              <br />
              moves life
              <br />
              forward<span className="text-[#CF0A0A]">.</span>
            </h1>

            <p className="intro intro-3 type-lead max-w-xl text-black/60">
              LONEX is a Pakistan-based import, distribution and dealership
              business focused on solar panels, batteries and electric bikes.
            </p>

            <div className="intro intro-4 flex flex-wrap gap-3">
              <ButtonLink href="/contact">Contact LONEX</ButtonLink>
              <ButtonLink href="/authorized-sellers" variant="outline">
                Authorized sellers
              </ButtonLink>
            </div>
          </div>

          <div className="reveal relative">
            <div className="reveal-mask relative aspect-[4/5] overflow-hidden bg-[#F5EDED]">
              <div className="parallax-exit absolute inset-0">
                <Image
                  src="/lonex-logo.png"
                  alt="LONEX"
                  fill
                  sizes="(max-width: 1024px) 90vw, 44vw"
                  className="object-contain p-6 sm:p-10"
                />
              </div>
              <span
                aria-hidden="true"
                className="absolute left-0 top-0 h-20 w-1 bg-[#CF0A0A]"
              />
              <span className="type-eyebrow absolute left-5 top-5 text-black/55">
                LONEX / Company profile
              </span>
              <span className="type-eyebrow absolute bottom-5 right-5 text-black/55">
                2026
              </span>
            </div>
            <div className="absolute -bottom-6 -left-4 hidden bg-black px-5 py-4 text-white sm:block lg:-left-8">
              <p className="type-eyebrow text-white/55">Business</p>
              <p className="mt-2 text-sm font-medium">
                Import · Distribution · Dealership
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-black/10 py-20 sm:py-28">
        <Container className="grid gap-10 lg:grid-cols-[0.32fr_0.68fr]">
          <div className="reveal">
            <Eyebrow>01 — Who we are</Eyebrow>
          </div>
          <div className="space-y-9">
            <p className="reveal type-statement text-black">
              Connecting energy, technology and everyday progress.
            </p>
            <div className="reveal grid gap-8 sm:grid-cols-2">
              <div className="space-y-4 text-sm leading-7 text-black/60">
                <p>
                  LONEX is a newly established business in Pakistan focused on
                  the import, distribution and dealership of solar panels,
                  batteries and electric bikes. The three categories shape how
                  people generate power, store electricity and travel.
                </p>
                <p>
                  We operate as a trading and distribution company rather than a
                  manufacturer. Our responsibilities include product sourcing,
                  commercial coordination, clear product information and
                  relationships with suppliers and customers.
                </p>
              </div>
              <div className="space-y-4 text-sm leading-7 text-black/55">
                <p>
                  Our brand philosophy is rooted in dependable, empowering
                  everyday energy. The infinity symbol in our identity
                  represents the continuing relationship between generating,
                  moving and storing power.
                </p>
                <p>
                  As a new entrant, we understand that trust must be earned
                  through responsible commitments and consistent business
                  conduct.
                </p>
              </div>
            </div>

            <dl className="reveal grid gap-px border border-black/10 bg-black/10 sm:grid-cols-3">
              {[
                { term: "Business model", detail: "Import / Distribution / Dealership" },
                { term: "Categories", detail: "Solar panels · Batteries · Electric bikes" },
                { term: "Based in", detail: "Lahore, Pakistan" },
              ].map((item) => (
                <div key={item.term} className="bg-white p-5">
                  <dt className="type-eyebrow text-black/45">{item.term}</dt>
                  <dd className="mt-3 text-sm font-medium leading-6 text-black">
                    {item.detail}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </Container>
      </section>

      <section className="border-t border-black/10 bg-[#F5EDED] py-20 sm:py-28">
        <Container className="space-y-12">
          <SectionHeading
            index="02"
            eyebrow="Vision, mission & purpose"
            title="The principles that shape our commercial purpose."
            description="An ambition, a way of working, and a clear reason to exist."
          />

          <div className="grid gap-px bg-black/10 lg:grid-cols-3">
            <article className="reveal bg-white p-6 sm:p-8">
              <p className="type-eyebrow text-[#CF0A0A]">Vision</p>
              <h3 className="mt-6 text-xl font-semibold text-black">
                A trusted business in Pakistan&apos;s energy transition.
              </h3>
              <p className="mt-4 text-sm leading-7 text-black/55">
                To become a trusted and respected business in Pakistan&apos;s
                renewable energy, energy storage and electric mobility sectors
                by connecting customers with suitable products through
                responsible sourcing and professional distribution.
              </p>
              <p className="mt-4 text-xs leading-6 text-black/40">
                This is an ambition, not a claim about our current market
                position.
              </p>
            </article>

            <article className="reveal bg-white p-6 sm:p-8">
              <p className="type-eyebrow text-[#CF0A0A]">Mission</p>
              <h3 className="mt-6 text-xl font-semibold text-black">
                Supply with attention to each requirement.
              </h3>
              <p className="mt-4 text-sm leading-7 text-black/55">
                To import, distribute and supply solar panels, batteries and
                electric bikes with attention to technical suitability,
                transparent communication and the distinct requirements of each
                customer.
              </p>
              <p className="mt-4 text-xs leading-6 text-black/40">
                We aim to build constructive relationships with dealers,
                suppliers and commercial buyers through clear terms and mutual
                understanding.
              </p>
            </article>

            <article className="reveal bg-black p-6 text-white sm:p-8">
              <p className="type-eyebrow text-[#CF0A0A]">Purpose</p>
              <h3 className="mt-6 text-xl font-semibold">
                Connect technology with real-world needs.
              </h3>
              <p className="mt-4 text-sm leading-7 text-white/55">
                Solar panels generate electricity; batteries store it; electric
                bikes turn stored electricity into motion. Together they create
                a coherent business identity centred on power, access and
                practical progress.
              </p>
            </article>
          </div>
        </Container>
      </section>

      <section className="py-20 sm:py-28">
        <Container className="space-y-12">
          <SectionHeading
            index="03"
            eyebrow="Core values"
            title="Standards we intend to demonstrate."
            description="As a newly established company, these are standards for conduct rather than achievements already demonstrated over many years."
          />

          <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {VALUES.map((value, index) => (
              <div key={value.title} className="reveal border-t border-black/15 pt-5">
                <p className="type-eyebrow text-[#CF0A0A]">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-3 text-lg font-semibold text-black">
                  {value.title}
                </h3>
                <p className="mt-2 text-sm leading-7 text-black/55">
                  {value.copy}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="relative overflow-hidden bg-black py-20 text-white sm:py-28">
        <div
          aria-hidden="true"
          className="lux-grid-bg-dark pointer-events-none absolute inset-0 opacity-40"
        />
        <Container className="relative space-y-12">
          <SectionHeading
            index="04"
            eyebrow="Pakistan market landscape"
            title="A changing environment for electricity and mobility."
            description="Commercial context, not a guarantee of future sales."
            tone="light"
          />

          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-5 text-sm leading-7 text-white/55">
              <p className="reveal">
                Pakistan has experienced rapid solar equipment adoption. Ember
                reported approximately 17 GW of solar panel imports in 2024,
                around twice the previous year&apos;s volume. Import volumes
                indicate market activity, but do not equal installed capacity or
                final customer sales.
              </p>
              <p className="reveal">
                Battery storage is becoming more relevant as customers evaluate
                backup power, energy management and compatible solar systems.
                Market researchers estimate a multi-billion-dollar battery
                industry across several applications; these estimates should not
                be mistaken for the narrower solar storage segment.
              </p>
              <p className="reveal">
                Pakistan&apos;s New Energy Vehicles Policy 2025–2030 sets a
                target for new energy vehicles to account for 30% of new vehicle
                sales by 2030. This is a policy objective, not an achieved
                adoption rate.
              </p>
            </div>

            <div className="grid gap-px self-start bg-white/10 sm:grid-cols-2">
              {[
                { value: "≈17 GW", label: "Solar panel imports reported in 2024" },
                { value: "2×", label: "Roughly double the previous year's volume" },
                { value: "30%", label: "NEV share target by 2030 (policy objective)" },
                { value: "3", label: "Connected categories: generate, store, move" },
              ].map((stat) => (
                <div key={stat.label} className="reveal bg-black p-5">
                  <p className="type-section text-white">{stat.value}</p>
                  <p className="mt-2 text-xs leading-5 text-white/45">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-black/10 py-20 sm:py-28">
        <Container className="space-y-12">
          <SectionHeading
            index="05"
            eyebrow="What we do"
            title="Import, distribution and dealership."
            description="Three connected responsibilities, one commercial purpose."
          />

          <div className="grid gap-px bg-black/10 lg:grid-cols-3">
            {MODEL.map((item, index) => (
              <div key={item.title} className="reveal bg-white p-6 sm:p-8">
                <p className="type-eyebrow text-[#CF0A0A]">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-6 text-xl font-semibold text-black">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-black/55">
                  {item.copy}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-t border-black/10 bg-[#F5EDED] py-20 sm:py-28">
        <Container className="space-y-12">
          <SectionHeading
            index="06"
            eyebrow="Product portfolio"
            title="Three connected categories."
            description="Generate / Store / Move."
            action={
              <ButtonLink href="/#categories" variant="ghost">
                Browse the range
              </ButtonLink>
            }
          />

          <div className="grid gap-5 lg:grid-cols-3">
            {DIRECTIONS.map((direction) => (
              <Link
                key={direction.name}
                href={direction.href}
                className="group reveal flex flex-col justify-between gap-10 border border-black/10 bg-white p-6 transition-colors hover:border-black/25 sm:p-8"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="type-eyebrow text-[#CF0A0A]">
                    {direction.index}
                  </span>
                  <span className="type-eyebrow text-black/45">
                    {direction.verb}
                  </span>
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-black">
                    {direction.name}
                  </h3>
                  <p className="text-sm leading-7 text-black/55">
                    {direction.copy}
                  </p>
                  <span className="type-eyebrow inline-flex items-center gap-2 text-black/55 transition-colors group-hover:text-[#CF0A0A]">
                    Explore
                    <span aria-hidden="true" className="arrow-slide">
                      →
                    </span>
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <p className="reveal max-w-3xl text-xs leading-6 text-black/45">
            The products are complementary, but not automatically
            interoperable. Technical integration requires compatible equipment
            and qualified design. Actual brands, models, capacities and
            availability are determined by confirmed sourcing and inventory
            arrangements.
          </p>
        </Container>
      </section>

      <section className="py-20 sm:py-28">
        <Container className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div className="space-y-6">
            <Eyebrow>07 — Why LONEX</Eyebrow>
            <h2 className="type-section text-black">
              Focused products.
              <br />
              Clear communication.
            </h2>
            <p className="type-lead max-w-xl text-black/55">
              Choosing a supplier requires more than comparing prices. Product
              suitability, documentation, availability and commercial terms all
              affect purchasing decisions.
            </p>
          </div>

          <div className="space-y-6 text-sm leading-7 text-black/55">
            <p className="reveal">
              LONEX has been established with a focused identity across three
              related industries rather than an unrestricted general trading
              portfolio. Homeowners, commercial buyers, retailers and dealers
              evaluate products differently, and our objective is to provide
              relevant information and develop practical commercial
              relationships.
            </p>
            <p className="reveal">
              We do not claim decades of experience or market leadership. Our
              intended advantage is a clear business focus, responsible
              communication and a commitment to establishing appropriate
              standards from the beginning.
            </p>
            <div className="reveal grid gap-4 sm:grid-cols-2">
              <div className="border-l-2 border-[#CF0A0A] pl-4">
                <p className="text-sm font-semibold text-black">
                  Dealership &amp; distribution
                </p>
                <p className="mt-2 text-xs leading-6 text-black/55">
                  Commercial arrangements define products, quantities, prices,
                  payment conditions and delivery responsibilities. Exclusive
                  territories are never assumed without written agreement.
                </p>
              </div>
              <div className="border-l-2 border-[#CF0A0A] pl-4">
                <p className="text-sm font-semibold text-black">
                  Quality &amp; customers
                </p>
                <p className="mt-2 text-xs leading-6 text-black/55">
                  Specifications are communicated responsibly. Warranty and
                  after-sales provisions, where available, follow the written
                  terms applicable to each specific product.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-black/10 bg-[#F5EDED] py-20 sm:py-28">
        <Container className="space-y-12">
          <SectionHeading
            index="08"
            eyebrow="What we publish"
            title="Only what is confirmed."
            description="A simple rule governs the website: nothing is invented."
          />
          <div className="grid gap-px bg-black/10 sm:grid-cols-2 lg:grid-cols-4">
            {PUBLISHED.map((item, index) => (
              <div key={item.title} className="reveal bg-white p-6 sm:p-7">
                <p className="type-eyebrow text-[#CF0A0A]">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-6 text-lg font-semibold text-black">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-black/55">
                  {item.copy}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="relative overflow-hidden bg-black py-20 text-white sm:py-28">
        <div
          aria-hidden="true"
          className="lux-grid-bg-dark pointer-events-none absolute inset-0 opacity-40"
        />
        <Container className="relative grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div className="space-y-6">
            <Eyebrow tone="light">09 — Our position</Eyebrow>
            <p className="reveal type-section text-white">
              Not a manufacturer.
              <br />
              A partner in what&apos;s next.
            </p>
          </div>
          <div className="space-y-5">
            <p className="reveal text-sm leading-7 text-white/55">
              LONEX imports, distributes and represents selected energy and
              mobility products. Product model verification confirms registration
              with LONEX, not the authenticity of an individual unit.
            </p>
            <div className="reveal">
              <ButtonLink href="/verify" variant="inverse">
                Verify a model
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-5">
            <Eyebrow>10 — Connect with LONEX</Eyebrow>
            <h2 className="type-statement text-black">
              Talk to LONEX about the range.
            </h2>
            <div className="space-y-2 text-sm leading-7 text-black/55">
              <p>
                {settings.address ||
                  "84 Brandth Road, Lahore, Pakistan"}
              </p>
              <p>
                {settings.contactPhone || "0322 8888278"} · 0315 9899426
              </p>
              <p className="text-black/40">lonexglobal.com</p>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
            <ButtonLink href="/contact">Contact LONEX</ButtonLink>
            <ButtonLink href="/#categories" variant="outline">
              Explore categories
            </ButtonLink>
          </div>
        </Container>
      </section>
    </>
  );
}

export const instant = false;
