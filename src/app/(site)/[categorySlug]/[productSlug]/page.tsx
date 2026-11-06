import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { ButtonLink } from "@/components/public/button-link";
import { Container } from "@/components/public/container";
import { Eyebrow } from "@/components/public/eyebrow";
import { JsonLd } from "@/components/public/json-ld";
import { ProductCard } from "@/components/public/product-card";
import { ProductGallery } from "@/components/public/product-gallery";
import { SectionHeading } from "@/components/public/section-heading";
import { createPageMetadata, notFoundMetadata } from "@/lib/public/seo";
import { loadPublicSettings } from "@/lib/public/settings";
import {
  getPublishedProductBySlugs,
  listRelatedProducts,
} from "@/lib/public/queries";
import { redirectMovedPath } from "@/lib/public/redirects";

type Params = { categorySlug: string; productSlug: string };

function whatsappLink(value: string): string | null {
  const digits = value.replace(/[^\d]/g, "");

  return digits.length >= 6 ? `https://wa.me/${digits}` : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  await connection();
  const { categorySlug, productSlug } = await params;
  const result = await getPublishedProductBySlugs(categorySlug, productSlug);

  if (!result) {
    return notFoundMetadata("Product not found");
  }

  const settings = await loadPublicSettings();
  const { product } = result;

  return createPageMetadata({
    settings,
    title: product.seoTitle || product.name,
    description:
      product.seoDescription ||
      product.shortDescription ||
      product.description ||
      settings.seoDescription,
    path: product.path,
    image: product.image,
    type: "website",
  });
}

export default async function ProductPage({
  params,
}: {
  params: Promise<Params>;
}) {
  await connection();

  const { categorySlug, productSlug } = await params;

  const result = await getPublishedProductBySlugs(categorySlug, productSlug);

  if (!result) {
    await redirectMovedPath(`/${categorySlug}/${productSlug}`);
    notFound();
  }

  const { product, category } = result;
  const related = await listRelatedProducts(category.id, product.id, 4);
  const settings = await loadPublicSettings();
  const whatsapp = settings.whatsapp ? whatsappLink(settings.whatsapp) : null;

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || product.shortDescription || undefined,
    image: product.image?.url,
    category: category.name,
  };

  if (product.priceLabel) {
    jsonLd.offers = {
      "@type": "Offer",
      price: product.priceLabel,
      priceCurrency: "PKR",
      availability: "https://schema.org/InStock",
    };
  }

  return (
    <>
      <JsonLd data={jsonLd} />

      <div className="border-b border-black/10 bg-white">
        <Container className="py-5">
          <nav
            aria-label="Breadcrumb"
            className="type-eyebrow flex flex-wrap items-center gap-2 text-black/55"
          >
            <Link href="/" className="transition-colors hover:text-[#CF0A0A]">
              Home
            </Link>
            <span aria-hidden="true">/</span>
            <Link
              href={category.path}
              className="transition-colors hover:text-[#CF0A0A]"
            >
              {category.name}
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-black/60">{product.name}</span>
          </nav>
        </Container>
      </div>

      <section className="bg-white pb-16 pt-10 sm:pb-20 sm:pt-14">
        <Container className="grid gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <ProductGallery
              images={product.images}
              productName={product.name}
              fallbackLabel="Product image pending"
            />
          </div>

          <div className="space-y-7">
            <div className="space-y-4">
              <Eyebrow>{category.name}</Eyebrow>
              <h1 className="type-section text-black">{product.name}</h1>
              {product.shortDescription ? (
                <p className="type-lead max-w-xl text-black/60">
                  {product.shortDescription}
                </p>
              ) : null}
            </div>

            <div className="flex flex-wrap items-end justify-between gap-4 border-y border-black/10 py-5">
              <div>
                <p className="type-eyebrow text-black/55">
                  {product.priceLabel ? "Price" : "Availability"}
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-black">
                  {product.priceLabel ?? "Price on inquiry"}
                </p>
              </div>
              <p className="type-eyebrow text-right text-black/55">
                {product.images.length > 0
                  ? `${String(product.images.length).padStart(2, "0")} images`
                  : "Imagery pending"}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {whatsapp ? (
                <a
                  href={whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-sheen inline-flex items-center justify-center gap-3 bg-[#CF0A0A] px-6 py-3.5 text-[13px] font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-black sm:px-7 sm:py-4"
                >
                  Enquire on WhatsApp
                  <span aria-hidden="true">→</span>
                </a>
              ) : (
                <ButtonLink href="/contact">Contact LONEX</ButtonLink>
              )}
              <ButtonLink href="/contact" variant="outline">
                Product enquiry
              </ButtonLink>
            </div>

            {product.highlights.length > 0 ? (
              <div className="space-y-3 pt-2">
                <p className="type-eyebrow text-black/55">Highlights</p>
                <dl className="grid gap-3 sm:grid-cols-2">
                  {product.highlights.map((item) => (
                    <div
                      key={`${item.label}-${item.value}`}
                      className="border border-black/10 bg-[#F5EDED] p-4"
                    >
                      <dt className="type-eyebrow text-black/55">
                        {item.label}
                      </dt>
                      <dd className="mt-2 text-lg font-semibold leading-tight text-black">
                        {item.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : null}

            <div className="flex flex-col gap-4 border-t border-black/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="type-eyebrow text-[#CF0A0A]">
                  Model verification
                </p>
                <p className="mt-2 max-w-md text-xs leading-5 text-black/55">
                  A code check confirms that the model is registered with LONEX,
                  not that an individual unit is genuine.
                </p>
              </div>
              <Link
                href="/verify"
                className="type-eyebrow inline-flex shrink-0 items-center gap-2 text-black transition-colors hover:text-[#CF0A0A]"
              >
                Verify a code
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {product.specificationGroups.length > 0 ? (
        <section className="border-t border-black/10 py-20 sm:py-28">
          <Container className="space-y-10">
            <SectionHeading
              index="01"
              eyebrow="Technical data"
              title="Specifications."
              description="Specifications are published only when supplied and approved by LONEX."
            />

            <div className="space-y-4">
              {product.specificationGroups.map((group, index) => (
                <details
                  key={group.groupName}
                  open={index === 0}
                  className="group border border-black/10 bg-white"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 [&::-webkit-details-marker]:hidden">
                    <span className="text-sm font-semibold uppercase tracking-[0.16em] text-black">
                      {group.groupName}
                    </span>
                    <span
                      aria-hidden="true"
                      className="text-lg leading-none text-[#CF0A0A] transition-transform duration-300 group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <dl className="divide-y divide-black/10 border-t border-black/10">
                    {group.items.map((item) => (
                      <div
                        key={`${item.label}-${item.value}`}
                        className="grid gap-1 px-5 py-4 sm:grid-cols-[13rem_1fr] sm:gap-4"
                      >
                        <dt className="text-sm font-medium text-black/55">
                          {item.label}
                        </dt>
                        <dd className="text-sm text-black">{item.value}</dd>
                      </div>
                    ))}
                  </dl>
                </details>
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      {product.documents.length > 0 ? (
        <section className="border-t border-black/10 bg-[#F5EDED] py-20 sm:py-28">
          <Container className="space-y-10">
            <SectionHeading
              index="02"
              eyebrow="Downloads"
              title="Datasheets."
              description="PDF documents are delivered as attachments."
            />
            <ul className="grid gap-4 sm:grid-cols-2">
              {product.documents.map((document) => (
                <li key={document.id} className="min-w-0">
                  <a
                    href={document.url}
                    className="group flex min-w-0 items-center justify-between gap-5 border border-black/10 bg-white p-5 transition-colors hover:border-[#CF0A0A]"
                  >
                    <span className="flex min-w-0 flex-1 items-center gap-4">
                      <span className="type-eyebrow grid h-12 w-10 shrink-0 place-items-center bg-[#F5EDED] text-[#CF0A0A]">
                        PDF
                      </span>
                      <span className="min-w-0 flex-1 overflow-hidden">
                        <span className="block truncate text-sm font-semibold text-black">
                          {document.title || document.fileName}
                        </span>
                        <span className="type-eyebrow mt-1 block truncate text-black/55">
                          {document.fileName}
                        </span>
                      </span>
                    </span>
                    <span
                      aria-hidden="true"
                      className="shrink-0 text-lg text-[#CF0A0A] transition-transform duration-300 group-hover:translate-y-1"
                    >
                      ↓
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      ) : null}

      {product.description ? (
        <section className="border-t border-black/10 py-20 sm:py-28">
          <Container className="grid gap-10 lg:grid-cols-[0.32fr_0.68fr]">
            <div>
              <Eyebrow>03 — Overview</Eyebrow>
            </div>
            <div className="space-y-6">
              <h2 className="type-statement text-black">About this product.</h2>
              <p className="whitespace-pre-line text-base leading-8 text-black/60">
                {product.description}
              </p>
            </div>
          </Container>
        </section>
      ) : null}

      <section className="border-y border-black/10 bg-[#F5EDED] py-14">
        <Container className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-3">
            <Eyebrow>Model verification</Eyebrow>
            <h2 className="type-statement text-black">
              Check the code supplied with this model.
            </h2>
            <p className="max-w-xl text-sm leading-7 text-black/55">
              Enter the verification code supplied with a LONEX product model to
              confirm it is registered in the LONEX model registry.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
            <ButtonLink href="/verify">Verify a model</ButtonLink>
            <ButtonLink href="/contact" variant="outline">
              Talk to LONEX
            </ButtonLink>
          </div>
        </Container>
      </section>

      {related.length > 0 ? (
        <section className="py-20 sm:py-28">
          <Container className="space-y-12">
            <SectionHeading
              index="04"
              eyebrow="Related"
              title="More in this category."
              action={
                <ButtonLink href={category.path} variant="ghost">
                  All {category.name}
                </ButtonLink>
              }
            />
            <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((item) => (
                <div key={item.id} className="reveal">
                  <ProductCard product={item} />
                </div>
              ))}
            </div>
          </Container>
        </section>
      ) : null}
    </>
  );
}

export const instant = false;
