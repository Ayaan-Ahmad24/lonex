import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { connection } from "next/server";

import { ButtonLink } from "@/components/public/button-link";
import { BlogCard } from "@/components/public/blog-card";
import { Container } from "@/components/public/container";
import { ContentImage } from "@/components/public/content-image";
import { Eyebrow } from "@/components/public/eyebrow";
import { Marquee } from "@/components/public/marquee";
import { ProductCard } from "@/components/public/product-card";
import { SectionHeading } from "@/components/public/section-heading";
import { SellerCard } from "@/components/public/seller-card";
import type { PublicCategory } from "@/lib/public/dto";
import { createPageMetadata } from "@/lib/public/seo";
import { loadPublicSettings } from "@/lib/public/settings";
import {
  listFeaturedProducts,
  listLatestBlogPosts,
  listPublishedCategories,
  listPublishedSellers,
} from "@/lib/public/queries";

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

const RANGE_PILLARS = [
  {
    name: "Solar energy",
    copy: "Solar products and system components, published when confirmed by LONEX.",
  },
  {
    name: "Intelligent storage",
    copy: "Battery and storage solutions for the range LONEX supplies.",
  },
  {
    name: "Electric mobility",
    copy: "Electric bikes and mobility products from the LONEX range.",
  },
] as const;

const WHY_LONEX = [
  {
    title: "Selected range",
    copy: "Products are presented only when sourcing and details are confirmed by LONEX.",
  },
  {
    title: "Published detail",
    copy: "Specifications, documents and prices appear only when supplied and approved.",
  },
  {
    title: "Registered models",
    copy: "Model codes can be checked against the LONEX verification registry.",
  },
] as const;

function CategoryTile({
  category,
  index,
}: {
  category: PublicCategory;
  index: number;
}) {
  const variant = index % 3;
  const number = String(index + 1).padStart(2, "0");
  const description =
    category.description ||
    "Published LONEX products in this category. Details are added as they are approved.";
  const cover = category.cover;

  if (variant === 2) {
    return (
      <Link
        href={category.path}
        className="group lux-card reveal lift flex h-full flex-col overflow-hidden bg-white lg:col-span-12 lg:flex-row"
      >
        <div className="lux-media relative aspect-[16/10] overflow-hidden bg-[#F5EDED] lg:aspect-auto lg:min-h-[24rem] lg:w-1/2">
          <ContentImage
            image={cover}
            fallbackLabel={`Category image pending — ${category.name}`}
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="group-hover:scale-105"
          />
        </div>
        <div className="flex flex-1 flex-col justify-between gap-10 p-6 sm:p-9">
          <div className="flex items-start justify-between gap-6">
            <span className="type-eyebrow text-[#CF0A0A]">{number}</span>
            <span className="type-eyebrow text-black/55">Category</span>
          </div>
          <div className="space-y-4">
            <h3 className="type-statement text-black">{category.name}</h3>
            <p className="max-w-xl text-sm leading-7 text-black/55">
              {description}
            </p>
            <span className="type-eyebrow inline-flex items-center gap-2 text-black/55 transition-colors group-hover:text-[#CF0A0A]">
              Explore category
              <span aria-hidden="true" className="arrow-slide">
                →
              </span>
            </span>
          </div>
        </div>
      </Link>
    );
  }

  const dark = variant === 1;

  return (
    <Link
      href={category.path}
      className={`group lux-card reveal lift flex h-full flex-col overflow-hidden ${
        variant === 0 ? "lg:col-span-7" : "lg:col-span-5"
      } ${dark ? "bg-black text-white" : "bg-white"}`}
    >
      {dark ? (
        <div className="flex flex-1 flex-col justify-between gap-10 p-6 sm:p-9">
          <div className="flex items-start justify-between gap-6">
            <span className="type-eyebrow text-[#CF0A0A]">{number}</span>
            <span className="type-eyebrow text-white/55">Category</span>
          </div>
          <div className="space-y-4">
            <h3 className="type-statement text-white">{category.name}</h3>
            <p className="text-sm leading-7 text-white/55">{description}</p>
            <span className="type-eyebrow inline-flex items-center gap-2 text-white/50 transition-colors group-hover:text-[#CF0A0A]">
              Explore category
              <span aria-hidden="true" className="arrow-slide">
                →
              </span>
            </span>
          </div>
        </div>
      ) : (
        <div className="lux-media relative aspect-[16/10] overflow-hidden bg-[#F5EDED]">
          <ContentImage
            image={cover}
            fallbackLabel={`Category image pending — ${category.name}`}
            sizes="(max-width: 1024px) 100vw, 58vw"
            className="group-hover:scale-105"
          />
        </div>
      )}

      {dark ? (
        <div className="lux-media relative aspect-[16/10] overflow-hidden bg-[#F5EDED]">
          <ContentImage
            image={cover}
            fallbackLabel={`Category image pending — ${category.name}`}
            sizes="(max-width: 1024px) 100vw, 42vw"
            className="group-hover:scale-105"
          />
        </div>
      ) : (
        <div className="flex flex-1 flex-col justify-between gap-8 p-6 sm:p-9">
          <div className="flex items-start justify-between gap-6">
            <span className="type-eyebrow text-[#CF0A0A]">{number}</span>
            <span className="type-eyebrow text-black/55">Category</span>
          </div>
          <div className="space-y-4">
            <h3 className="type-statement text-black">{category.name}</h3>
            <p className="max-w-xl text-sm leading-7 text-black/55">
              {description}
            </p>
            <span className="type-eyebrow inline-flex items-center gap-2 text-black/55 transition-colors group-hover:text-[#CF0A0A]">
              Explore category
              <span aria-hidden="true" className="arrow-slide">
                →
              </span>
            </span>
          </div>
        </div>
      )}
    </Link>
  );
}

export default async function HomePage() {
  await connection();

  const [categories, featured, posts, sellers] = await Promise.all([
    listPublishedCategories(),
    listFeaturedProducts(4),
    listLatestBlogPosts(3),
    listPublishedSellers(),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-white">
        <div
          aria-hidden="true"
          className="lux-grid-bg pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 opacity-60 lg:block"
        />
        <Container className="relative grid items-center gap-14 pb-16 pt-12 sm:pb-20 sm:pt-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:pb-28 lg:pt-20">
          <div className="reveal-stagger">
            <div className="intro intro-1 reveal">
              <Eyebrow>LONEX · Pakistan</Eyebrow>
            </div>

            <h1 className="type-hero mt-7 text-black reveal intro-2">
              <span className="sr-only">Power for What&apos;s Next.</span>
              <span aria-hidden="true" className="block">
                <span className="line-mask">
                  <span className="line-inner">Power for</span>
                </span>
                <span className="line-mask">
                  <span className="line-inner line-delay-1">
                    What&apos;s Next<span className="text-[#CF0A0A]">.</span>
                  </span>
                </span>
              </span>
            </h1>

            <p className="intro intro-3 type-lead mt-7 max-w-lg text-black/60 reveal">
              Connecting solar energy, intelligent storage and electric
              mobility through carefully selected solutions.
            </p>

            <div className="intro intro-4 mt-9 flex flex-wrap gap-3 reveal">
              <ButtonLink href="#categories">Explore the range</ButtonLink>
              <ButtonLink href="/verify" variant="outline">
                Verify a model
              </ButtonLink>
            </div>

            <div className="intro intro-5 mt-12 flex items-end justify-between gap-6 border-t border-black/10 pt-5 reveal">
              <p className="max-w-sm text-[11px] leading-5 text-black/55">
                Product model verification confirms that a model is registered
                with LONEX. It does not by itself prove that a physical unit is
                genuine.
              </p>
              <div className="hidden shrink-0 items-center gap-3 sm:flex">
                <span className="type-eyebrow text-black/55">Scroll</span>
                <span className="scroll-cue__bar block h-10 w-px bg-black/10">
                  <span className="scroll-cue__dot block h-4 w-px bg-[#CF0A0A]" />
                </span>
              </div>
            </div>
          </div>

          <div className="intro intro-2 reveal relative parallax-hero">
            <div className="hero-image-frame relative aspect-[4/5] overflow-hidden bg-[#F5EDED] sm:aspect-[5/6]">
              <div className="parallax-exit absolute inset-0">
                {/* ─────────────────────────────────────────────
                    HERO IMAGE — replace with a real, premium photograph.
                    Drop a supplied photo URL (or /public path) below.
                    Recommended sources: Unsplash / Pexels solar & energy
                    photography (see IMAGE_GUIDE below).
                    ───────────────────────────────────────────── */}
                <Image
                  src="/lonex-logo.png"
                  alt="LONEX brand"
                  fill
                  priority
                  sizes="(max-width: 1024px) 90vw, 42vw"
                  className="object-contain p-6 sm:p-10 group-hover:scale-105"
                />
              </div>
              <span
                aria-hidden="true"
                className="absolute left-0 top-0 h-20 w-1 bg-[#CF0A0A]"
              />
              <span className="type-eyebrow absolute left-5 top-5 text-black/55">
                LONEX / 01
              </span>
              <span className="type-eyebrow absolute bottom-5 right-5 text-black/55">
                Brand
              </span>
            </div>

            <div className="absolute -bottom-6 -left-4 hidden w-48 bg-black p-5 text-white sm:block lg:-left-8 lift">
              <p className="type-eyebrow text-white/55">Positioning</p>
              <p className="mt-2 text-sm font-medium leading-6">
                Importer · Distributor · Dealership
              </p>
            </div>
          </div>
        </Container>
      </section>

      <div className="border-y border-black/10 bg-black">
        <Marquee
          items={[
            "Solar energy",
            "Intelligent storage",
            "Electric mobility",
            "Power for What's Next",
          ]}
        />
      </div>

      {/* Positioning */}
      <section className="py-20 sm:py-28">
        <Container className="grid gap-10 lg:grid-cols-[0.32fr_0.68fr]">
          <div className="reveal">
            <Eyebrow>01 — Who we are</Eyebrow>
          </div>
          <div className="space-y-9 reveal-stagger">
            <p className="reveal type-statement text-black">
              Energy that moves life forward.
            </p>
            <div className="reveal grid gap-8 sm:grid-cols-2">
              <p className="type-lead text-black/60">
                LONEX is a Pakistan-based importer, distributor and dealership
                business working across solar, storage and electric mobility.
              </p>
              <p className="text-sm leading-7 text-black/55">
                The range is presented only when sourcing and details are
                confirmed. Nothing is invented: imagery, specifications,
                documents and prices appear when LONEX has approved them.
              </p>
            </div>
            <div className="reveal">
              <ButtonLink href="/about" variant="ghost">
                More about LONEX
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>

      {/* Categories */}
      <section
        id="categories"
        className="border-t border-black/10 bg-[#F5EDED] py-20 sm:py-28"
      >
        <Container className="space-y-12">
          <SectionHeading
            index="02"
            eyebrow="The range"
            title="Three directions. One standard."
            description="Solar, storage and electric mobility — presented exactly as published by LONEX."
            action={
              <ButtonLink href="/about" variant="ghost">
                Our approach
              </ButtonLink>
            }
          />

          {categories.length > 0 ? (
            <div className="grid gap-5 lg:grid-cols-12 reveal-stagger">
              {categories.map((category, index) => (
                <CategoryTile
                  key={category.id}
                  category={category}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="grid gap-5 lg:grid-cols-3 reveal-stagger">
              {RANGE_PILLARS.map((pillar) => (
                <div
                  key={pillar.name}
                  className="reveal border border-black/10 bg-white p-7 lift"
                >
                  <span
                    aria-hidden="true"
                    className="block h-px w-10 bg-[#CF0A0A]"
                  />
                  <h3 className="mt-6 text-xl font-semibold text-black">
                    {pillar.name}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-black/55">
                    {pillar.copy}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Container>
      </section>

      {/* Catalogue / featured products */}
      {featured.length > 0 ? (
        <section className="py-20 sm:py-28">
          <Container className="space-y-12">
            <SectionHeading
              index="03"
              eyebrow="Selected products"
              title="From the catalogue."
              description="Products marked as featured in the LONEX catalogue."
            />
            <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 reveal-stagger">
              {featured.map((product, index) => (
                <div
                  key={product.id}
                  className={
                    index === 0
                      ? "reveal sm:col-span-2 lg:row-span-2"
                      : "reveal"
                  }
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </Container>
        </section>
      ) : (
        <section className="py-20 sm:py-28">
          <Container className="grid gap-10 lg:grid-cols-[0.34fr_0.66fr]">
            <div className="reveal">
              <Eyebrow>03 — Catalogue</Eyebrow>
            </div>
            <div className="space-y-8 reveal-stagger">
              <h2 className="reveal type-statement text-black">
                Products are published when the details are confirmed.
              </h2>
              <p className="reveal type-lead max-w-2xl text-black/55">
                The catalogue is populated from the LONEX admin. Every product
                carries approved imagery, specifications, documents and a price
                visibility setting controlled by LONEX.
              </p>
              <div className="reveal grid gap-5 sm:grid-cols-3">
                {categories.map((category, index) => (
                  <Link
                    key={category.id}
                    href={category.path}
                    className="group border-t border-black/15 pt-5 lift"
                  >
                    <span className="type-eyebrow text-[#CF0A0A]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="mt-3 block text-base font-semibold text-black transition-colors group-hover:text-[#CF0A0A]">
                      {category.name}
                    </span>
                    <span className="type-eyebrow mt-2 inline-flex items-center gap-2 text-black/55">
                      Browse
                      <span aria-hidden="true" className="arrow-slide">
                        →
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* Why LONEX */}
      <section className="relative overflow-hidden bg-black py-20 text-white sm:py-28">
        <div
          aria-hidden="true"
          className="lux-grid-bg-dark pointer-events-none absolute inset-0 opacity-40"
        />
        <Container className="relative space-y-12">
          <SectionHeading
            index="04"
            eyebrow="Why LONEX"
            title="Built on what we can verify."
            description="A clear, honest standard for what appears on this website."
            tone="light"
          />

          <div className="grid gap-px bg-white/10 sm:grid-cols-3 reveal-stagger">
            {WHY_LONEX.map((pillar, index) => (
              <div
                key={pillar.title}
                className="reveal group glass bg-black p-6 transition-colors duration-500 hover:bg-white/[0.04] sm:p-8 lift"
              >
                <p className="type-eyebrow text-[#CF0A0A]">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-8 text-xl font-semibold tracking-tight">
                  {pillar.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-white/55">
                  {pillar.copy}
                </p>
                <span
                  aria-hidden="true"
                  className="mt-8 block h-px w-10 bg-[#CF0A0A] transition-all duration-500 group-hover:w-20"
                />
              </div>
            ))}
          </div>

          <p className="reveal max-w-3xl text-sm leading-7 text-white/50">
            LONEX is a Pakistan-based importer, distributor and dealership
            business — not a manufacturer. Company history, certifications and
            performance claims are published only when confirmed.
          </p>
        </Container>
      </section>

      {/* Verification */}
      <section className="border-y border-black/10 bg-[#F5EDED] py-16 sm:py-20">
        <Container className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-4 reveal">
            <Eyebrow>05 — Model verification</Eyebrow>
            <h2 className="type-section text-black">
              Check a LONEX model code.
            </h2>
            <p className="type-lead max-w-xl text-black/55">
              A match confirms that the model is registered with LONEX. It does
              not by itself prove that a physical unit is genuine.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:justify-end reveal lift">
            <ButtonLink href="/verify">Verify a model</ButtonLink>
            <ButtonLink href="/authorized-sellers" variant="outline">
              Authorized sellers
            </ButtonLink>
          </div>
        </Container>
      </section>

      {/* Sellers */}
      <section className="py-20 sm:py-28">
        <Container className="space-y-12">
          <SectionHeading
            index="06"
            eyebrow="Where to buy"
            title="Authorized sellers."
            description="Only seller listings confirmed and published by LONEX are shown."
            action={
              <ButtonLink href="/authorized-sellers" variant="ghost">
                View directory
              </ButtonLink>
            }
          />

          {sellers.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 reveal-stagger">
              {sellers.slice(0, 3).map((seller, index) => (
                <SellerCard key={seller.id} seller={seller} index={index} />
              ))}
            </div>
          ) : (
            <div className="reveal flex flex-col gap-6 border border-dashed border-black/20 p-8 sm:flex-row sm:items-center sm:justify-between lift">
              <p className="type-lead max-w-xl text-black/55">
                Seller listings will be published here once confirmed by LONEX.
              </p>
              <ButtonLink href="/contact" variant="outline">
                Contact LONEX
              </ButtonLink>
            </div>
          )}
        </Container>
      </section>

      {/* Journal */}
      <section className="border-t border-black/10 py-20 sm:py-28">
        <Container className="space-y-12">
          <SectionHeading
            index="07"
            eyebrow="Journal"
            title="Notes from LONEX."
            action={
              <ButtonLink href="/blog" variant="ghost">
                All articles
              </ButtonLink>
            }
          />

          {posts.length > 0 ? (
            posts.length >= 3 ? (
              <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] reveal-stagger">
                <BlogCard post={posts[0]} size="large" />
                <div className="grid gap-8">
                  {posts.slice(1).map((post) => (
                    <BlogCard key={post.id} post={post} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 reveal-stagger">
                {posts.map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>
            )
          ) : (
            <div className="reveal grid gap-6 border-t border-black/10 pt-8 lg:grid-cols-2 reveal-stagger">
              <p className="type-lead text-black/55">
                Articles will appear here once published by LONEX.
              </p>
              <div className="flex items-end lg:justify-end">
                <ButtonLink href="/contact" variant="outline">
                  Talk to LONEX
                </ButtonLink>
              </div>
            </div>
          )}
        </Container>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden bg-[#CF0A0A] py-20 text-white sm:py-28">
        <div
          aria-hidden="true"
          className="lux-grid-bg-dark pointer-events-none absolute inset-0 opacity-30"
        />
        <Container className="relative grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end reveal-stagger">
          <div className="space-y-6 reveal">
            <p className="type-eyebrow flex items-center gap-3 text-white/60">
              <span aria-hidden="true" className="h-px w-8 bg-white/60" />
              08 — Next
            </p>
            <h2 className="type-hero text-white reveal shimmer">
              Let&apos;s talk about
              <br />
              what&apos;s next.
            </h2>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-end reveal lift">
            <ButtonLink href="/contact" variant="dark">
              Contact LONEX
            </ButtonLink>
            <ButtonLink href="/about" variant="inverse">
              About LONEX
            </ButtonLink>
          </div>
        </Container>
      </section>
    </>
  );
}

export const instant = false;
