import Link from "next/link";
import type { Metadata } from "next";
import { connection } from "next/server";

import { ButtonLink } from "@/components/public/button-link";
import { BlogCard } from "@/components/public/blog-card";
import { Container } from "@/components/public/container";
import { Eyebrow } from "@/components/public/eyebrow";
import { SectionHeading } from "@/components/public/section-heading";
import { createPageMetadata } from "@/lib/public/seo";
import { loadPublicSettings } from "@/lib/public/settings";
import { listPublishedBlogPosts } from "@/lib/public/queries";

type SearchParams = { page?: string };

export async function generateMetadata(): Promise<Metadata> {
  await connection();
  const settings = await loadPublicSettings();
  return createPageMetadata({
    settings,
    title: "Journal",
    description: "Articles and notes published by LONEX.",
    path: "/blog",
  });
}

export default async function BlogIndexPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await connection();

  const sp = await searchParams;
  const requestedPage = Number(sp?.page ?? "1");
  const result = await listPublishedBlogPosts({
    page: Number.isFinite(requestedPage) ? requestedPage : 1,
    pageSize: 9,
  });

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
              <span className="text-black/60">Journal</span>
            </nav>

            <div className="intro intro-1">
              <Eyebrow>Journal</Eyebrow>
            </div>

            <h1 className="intro intro-2 type-hero text-black">
              The LONEX
              <br />
              journal<span className="text-[#CF0A0A]">.</span>
            </h1>

            <p className="intro intro-3 type-lead max-w-xl text-black/60">
              Published articles, product notes and company updates from LONEX.
            </p>
          </div>

          <div className="reveal grid grid-cols-2 gap-px border border-black/10 bg-black/10">
            <div className="bg-white p-6 sm:p-8">
              <p className="type-eyebrow text-black/55">Articles</p>
              <p className="type-section mt-4 text-black">
                {String(result.total).padStart(2, "0")}
              </p>
              <p className="mt-2 text-xs leading-5 text-black/55">Published</p>
            </div>
            <div className="bg-black p-6 text-white sm:p-8">
              <p className="type-eyebrow text-white/55">Editorial</p>
              <p className="mt-4 text-sm font-medium leading-6 text-white/75">
                Draft articles are never shown publicly.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-20 sm:py-28">
        <Container className="space-y-12">
          <SectionHeading
            index="01"
            eyebrow="Latest"
            title="All articles."
            description="Every article is published from the LONEX admin."
          />

          {result.items.length > 0 ? (
            result.page === 1 && result.items.length >= 3 ? (
              <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
                <div className="reveal">
                  <BlogCard post={result.items[0]} size="large" />
                </div>
                <div className="grid gap-8">
                  {result.items.slice(1, 3).map((post) => (
                    <div key={post.id} className="reveal">
                      <BlogCard post={post} />
                    </div>
                  ))}
                </div>
                {result.items.slice(3).map((post) => (
                  <div key={post.id} className="reveal lg:col-span-2">
                    <BlogCard post={post} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                {result.items.map((post) => (
                  <div key={post.id} className="reveal">
                    <BlogCard post={post} />
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="reveal flex flex-col gap-6 border border-dashed border-black/20 p-8 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2">
                <p className="text-lg font-semibold text-black">
                  No articles published yet.
                </p>
                <p className="text-sm leading-6 text-black/55">
                  Articles appear here once LONEX publishes them.
                </p>
              </div>
              <ButtonLink href="/contact" variant="outline">
                Contact LONEX
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
                    result.page === 2 ? "/blog" : `/blog?page=${result.page - 1}`
                  }
                  className="type-eyebrow mr-2 inline-flex items-center gap-2 px-2 py-2 text-black/55 transition-colors hover:text-[#CF0A0A]"
                >
                  <span aria-hidden="true">←</span> Previous
                </Link>
              ) : null}

              {Array.from({ length: result.pageCount }, (_, index) => {
                const page = index + 1;
                const href = page === 1 ? "/blog" : `/blog?page=${page}`;

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
                  href={`/blog?page=${result.page + 1}`}
                  className="type-eyebrow ml-2 inline-flex items-center gap-2 px-2 py-2 text-black/55 transition-colors hover:text-[#CF0A0A]"
                >
                  Next <span aria-hidden="true">→</span>
                </Link>
              ) : null}
            </nav>
          ) : null}
        </Container>
      </section>
    </>
  );
}

export const instant = false;
