import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { ButtonLink } from "@/components/public/button-link";
import { Container } from "@/components/public/container";
import { ContentImage } from "@/components/public/content-image";
import { Eyebrow } from "@/components/public/eyebrow";
import { ProductCard } from "@/components/public/product-card";
import { SectionHeading } from "@/components/public/section-heading";
import { createPageMetadata, notFoundMetadata } from "@/lib/public/seo";
import { loadPublicSettings } from "@/lib/public/settings";
import {
  getPublishedCategoryBySlug,
  listPublishedProducts,
} from "@/lib/public/queries";
import { redirectMovedPath } from "@/lib/public/redirects";

type Params = { categorySlug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  await connection();
  const { categorySlug } = await params;
  const [settings, category] = await Promise.all([
    loadPublicSettings(),
    getPublishedCategoryBySlug(categorySlug),
  ]);

  if (!category) {
    return notFoundMetadata("Category not found");
  }

  return createPageMetadata({
    settings,
    title: category.name,
    description:
      category.description ||
      `Published ${category.name.toLowerCase()} products from LONEX.`,
    path: `/${category.slug}`,
  });
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<{ page?: string }>;
}) {
  await connection();

  const { categorySlug } = await params;
  const sp = await searchParams;

  const category = await getPublishedCategoryBySlug(categorySlug);

  if (!category) {
    await redirectMovedPath(`/${categorySlug}`);
    notFound();
  }

  const requestedPage = Number(sp?.page ?? "1");
  const result = await listPublishedProducts({
    categoryId: category.id,
    page: Number.isFinite(requestedPage) ? requestedPage : 1,
  });

  const settings = await loadPublicSettings();

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
              <span className="text-black/60">{category.name}</span>
            </nav>

            <div className="intro intro-1">
              <Eyebrow>Category · {String(result.total).padStart(2, "0")}</Eyebrow>
            </div>

            <h1 className="intro intro-2 type-hero text-black">
              {category.name}
            </h1>

            <p className="intro intro-3 type-lead max-w-xl text-black/60">
              {category.description ||
                "Published LONEX products in this category. Details, documents and prices appear only when supplied and approved."}
            </p>

            <div className="intro intro-4 flex flex-wrap items-center gap-4">
              <ButtonLink href="#products">View products</ButtonLink>
              <ButtonLink href="/contact" variant="outline">
                Product enquiry
              </ButtonLink>
            </div>
          </div>

          <div className="reveal relative">
            <div className="reveal-mask relative aspect-[4/5] overflow-hidden bg-[#F5EDED] sm:aspect-[4/3] lg:aspect-[4/5]">
              <div className="parallax-exit absolute inset-0">
                <ContentImage
                  image={category.cover}
                  fallbackLabel="Category image pending"
                  sizes="(max-width: 1024px) 100vw, 46vw"
                  priority
                />
              </div>
              <span className="type-eyebrow absolute left-4 top-4 bg-white px-3 py-2 text-black/55">
                {category.name}
              </span>
            </div>
            <span
              aria-hidden="true"
              className="absolute -bottom-3 -right-3 h-24 w-24 border-b-2 border-r-2 border-[#CF0A0A]"
            />
          </div>
        </Container>
      </section>

      <section id="products" className="py-20 sm:py-28">
        <Container className="space-y-12">
          <SectionHeading
            index="01"
            eyebrow="Published products"
            title="The selection."
            description="Only published products in published categories are shown."
          />

          {result.items.length > 0 ? (
            <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {result.items.map((product) => (
                <div key={product.id} className="reveal">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : (
            <div className="reveal flex flex-col gap-6 border border-dashed border-black/20 p-8 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2">
                <p className="text-lg font-semibold text-black">
                  No published products yet.
                </p>
                <p className="text-sm leading-6 text-black/55">
                  Products appear here once LONEX publishes them in this
                  category.
                </p>
              </div>
              <ButtonLink href="/#categories" variant="outline">
                Browse categories
              </ButtonLink>
            </div>
          )}

          {result.pageCount > 1 ? (
            <nav
              aria-label="Pagination"
              className="flex flex-wrap items-center gap-2 border-t border-black/10 pt-8"
            >
              {result.page > 1 ? (
                <Link
                  href={
                    result.page === 2
                      ? `/${category.slug}`
                      : `/${category.slug}?page=${result.page - 1}`
                  }
                  className="type-eyebrow mr-2 inline-flex items-center gap-2 px-2 py-2 text-black/55 transition-colors hover:text-[#CF0A0A]"
                >
                  <span aria-hidden="true">←</span> Previous
                </Link>
              ) : null}

              {Array.from({ length: result.pageCount }, (_, index) => {
                const page = index + 1;
                const href =
                  page === 1
                    ? `/${category.slug}`
                    : `/${category.slug}?page=${page}`;

                return (
                  <Link
                    key={page}
                    href={href}
                    aria-current={page === result.page ? "page" : undefined}
                    className={`inline-flex h-11 min-w-11 items-center justify-center border px-3 text-sm font-semibold transition-colors ${
                      page === result.page
                        ? "border-[#CF0A0A] bg-[#CF0A0A] text-white"
                        : "border-black/15 text-black hover:border-black"
                    }`}
                  >
                    {String(page).padStart(2, "0")}
                  </Link>
                );
              })}

              {result.page < result.pageCount ? (
                <Link
                  href={`/${category.slug}?page=${result.page + 1}`}
                  className="type-eyebrow ml-2 inline-flex items-center gap-2 px-2 py-2 text-black/55 transition-colors hover:text-[#CF0A0A]"
                >
                  Next <span aria-hidden="true">→</span>
                </Link>
              ) : null}
            </nav>
          ) : null}
        </Container>
      </section>

      <section className="border-t border-black/10 bg-black py-14 text-white sm:py-16">
        <Container className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-3">
            <Eyebrow tone="light">Product enquiry</Eyebrow>
            <h2 className="type-statement text-white">
              Need specifications or availability?
            </h2>
            <p className="max-w-xl text-sm leading-7 text-white/55">
              {settings.contactEmail || settings.contactPhone
                ? "Use the contact details published by LONEX for product and seller enquiries."
                : "LONEX contact details will be published once confirmed."}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
            <ButtonLink href="/contact">Contact LONEX</ButtonLink>
            <ButtonLink href="/verify" variant="inverse">
              Verify a model
            </ButtonLink>
          </div>
        </Container>
      </section>
    </>
  );
}

export const instant = false;
