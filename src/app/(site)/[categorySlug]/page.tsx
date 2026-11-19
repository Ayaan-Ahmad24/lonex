import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { PageMotion } from "@/components/public/page-motion";
import { BatteriesPage } from "@/components/public/categories/batteries-page";
import { ElectricScootersPage } from "@/components/public/categories/electric-scooters-page";
import { GenericCategoryPage } from "@/components/public/categories/generic-page";
import { SolarPage } from "@/components/public/categories/solar-page";
import { getCategoryEditorial } from "@/lib/public/editorial";
import { createPageMetadata, notFoundMetadata } from "@/lib/public/seo";
import { loadPublicSettings } from "@/lib/public/settings";
import {
  getPublishedCategoryBySlug,
  listPublishedProducts,
} from "@/lib/public/queries";
import { redirectMovedPath } from "@/lib/public/redirects";
import "../../home.css";
import "../../catalog.css";

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
    return notFoundMetadata("Page not found");
  }

  const editorial = getCategoryEditorial(
    category.slug,
    category.name,
    category.description,
  );

  return createPageMetadata({
    settings,
    title: category.name,
    description: editorial.seoDescription,
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
  const [result, settings] = await Promise.all([
    listPublishedProducts({
      categoryId: category.id,
      page: Number.isFinite(requestedPage) ? requestedPage : 1,
      pageSize: 60,
    }),
    loadPublicSettings(),
  ]);

  const editorial = getCategoryEditorial(
    category.slug,
    category.name,
    category.description,
  );

  const props = {
    category,
    products: result.items,
    settings,
    editorial,
  };

  return (
    <div className="lx-page">
      <PageMotion>
        {category.slug === "solar" ? (
          <SolarPage {...props} />
        ) : category.slug === "batteries" ? (
          <BatteriesPage {...props} />
        ) : category.slug === "electric-scooters" ? (
          <ElectricScootersPage {...props} />
        ) : (
          <GenericCategoryPage {...props} />
        )}
      </PageMotion>

      {result.pageCount > 1 ? (
        <nav aria-label="Pagination" className="lx-pager lxc-pager">
          {result.page > 1 ? (
            <Link
              href={
                result.page === 2
                  ? `/${category.slug}`
                  : `/${category.slug}?page=${result.page - 1}`
              }
            >
              Previous
            </Link>
          ) : (
            <span className="lx-pager__spacer" aria-hidden="true" />
          )}

          <div className="lx-pager__pages">
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
                >
                  {String(page).padStart(2, "0")}
                </Link>
              );
            })}
          </div>

          {result.page < result.pageCount ? (
            <Link href={`/${category.slug}?page=${result.page + 1}`}>
              Next
            </Link>
          ) : (
            <span className="lx-pager__spacer" aria-hidden="true" />
          )}
        </nav>
      ) : null}
    </div>
  );
}

export const instant = false;
