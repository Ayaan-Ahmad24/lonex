import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { ButtonLink } from "@/components/public/button-link";
import { Container } from "@/components/public/container";
import { ContentImage } from "@/components/public/content-image";
import { Eyebrow } from "@/components/public/eyebrow";
import { JsonLd } from "@/components/public/json-ld";
import { RichTextRenderer } from "@/components/public/rich-text";
import { createPageMetadata, notFoundMetadata } from "@/lib/public/seo";
import { loadPublicSettings } from "@/lib/public/settings";
import { getPublishedBlogPostBySlug } from "@/lib/public/queries";
import { redirectMovedPath } from "@/lib/public/redirects";
import { parseStoredRichText } from "@/lib/content/rich-text";

type Params = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  await connection();
  const { slug } = await params;
  const post = await getPublishedBlogPostBySlug(slug);

  if (!post) {
    return notFoundMetadata("Article not found");
  }

  const settings = await loadPublicSettings();
  const document = parseStoredRichText(post.contentJson);
  const description =
    post.seoDescription ||
    (document ? post.excerpt || "" : post.excerpt || settings.seoDescription);

  return createPageMetadata({
    settings,
    title: post.seoTitle || post.title,
    description: description || settings.seoDescription,
    path: post.path,
    image: post.cover,
    type: "article",
    publishedTime: post.publishedAt,
  });
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  await connection();

  const { slug } = await params;
  const post = await getPublishedBlogPostBySlug(slug);

  if (!post) {
    await redirectMovedPath(`/blog/${slug}`);
    notFound();
  }

  const document = parseStoredRichText(post.contentJson);

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    datePublished: post.publishedAt,
    image: post.cover?.url,
  };

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
            <Link href="/blog" className="transition-colors hover:text-[#CF0A0A]">
              Journal
            </Link>
            <span aria-hidden="true">/</span>
            <span className="line-clamp-1 text-black/60">{post.title}</span>
          </nav>
        </Container>
      </div>

      <article>
        <section className="relative overflow-hidden border-b border-black/10 bg-[#F5EDED]">
          <div
            aria-hidden="true"
            className="lux-grid-bg pointer-events-none absolute inset-0 opacity-40"
          />
          <Container className="relative space-y-7 py-12 sm:py-16 lg:py-20">
            <Eyebrow>
              {post.publishedLabel ? `Journal · ${post.publishedLabel}` : "Journal"}
            </Eyebrow>
            <h1 className="intro intro-2 max-w-4xl text-4xl font-semibold leading-[1.02] tracking-[-0.03em] text-black sm:text-6xl">
              {post.title}
            </h1>
            {post.excerpt ? (
              <p className="intro intro-3 type-lead max-w-2xl text-black/60">
                {post.excerpt}
              </p>
            ) : null}
          </Container>
        </section>

        {post.cover ? (
          <section className="border-b border-black/10 bg-white">
            <Container className="py-8 sm:py-10">
              <div className="reveal-mask relative aspect-[16/9] overflow-hidden bg-[#F5EDED]">
                <ContentImage
                  image={post.cover}
                  fallbackLabel="Article image pending"
                  sizes="100vw"
                  priority
                />
              </div>
            </Container>
          </section>
        ) : null}

        <section className="py-16 sm:py-24">
          <Container className="max-w-3xl">
            {document ? (
              <RichTextRenderer document={document} />
            ) : (
              <p className="text-sm text-black/55">
                This article has no readable content.
              </p>
            )}

            <div className="mt-14 flex flex-col gap-4 border-t border-black/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-black/55">Published by LONEX.</p>
              <ButtonLink href="/blog" variant="outline">
                All articles
              </ButtonLink>
            </div>
          </Container>
        </section>
      </article>

      <section className="border-t border-black/10 bg-black py-14 text-white sm:py-16">
        <Container className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-3">
            <Eyebrow tone="light">Journal</Eyebrow>
            <h2 className="type-statement text-white">
              More notes from LONEX.
            </h2>
            <p className="max-w-xl text-sm leading-7 text-white/55">
              Product notes, company updates and published articles.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
            <ButtonLink href="/blog">All articles</ButtonLink>
            <ButtonLink href="/contact" variant="inverse">
              Contact LONEX
            </ButtonLink>
          </div>
        </Container>
      </section>
    </>
  );
}

export const instant = false;
