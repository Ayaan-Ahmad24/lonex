import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { ContentImage } from "@/components/public/content-image";
import { JsonLd } from "@/components/public/json-ld";
import { PageMotion } from "@/components/public/page-motion";
import { ProductGallery } from "@/components/public/product-gallery";
import { formatPhone, whatsappHref } from "@/lib/public/contact";
import {
  getProductEditorial,
  productWhatsAppMessage,
} from "@/lib/public/editorial";
import { createPageMetadata, notFoundMetadata } from "@/lib/public/seo";
import { loadPublicSettings } from "@/lib/public/settings";
import {
  getPublishedProductBySlugs,
  listRelatedProducts,
} from "@/lib/public/queries";
import { redirectMovedPath } from "@/lib/public/redirects";
import "../../../home.css";
import "../../../catalog.css";

type Params = { categorySlug: string; productSlug: string };

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
  const editorial = getProductEditorial(
    product.slug,
    product.name,
    product.shortDescription,
    product.description,
  );

  return createPageMetadata({
    settings,
    title: product.seoTitle || product.name,
    description: editorial.seoDescription,
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
  const [related, settings] = await Promise.all([
    listRelatedProducts(category.id, product.id, 3),
    loadPublicSettings(),
  ]);

  const editorial = getProductEditorial(
    product.slug,
    product.name,
    product.shortDescription,
    product.description,
  );

  const whatsapp = settings.whatsapp
    ? whatsappHref(settings.whatsapp, productWhatsAppMessage(product.name))
    : null;

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: editorial.summary,
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
    <div className="lx-page">
      <JsonLd data={jsonLd} />

      <PageMotion>
        <div className="lxp-top">
          <div className="lx-wrap">
            <nav aria-label="Breadcrumb" className="lxc-crumbs">
              <Link href="/">Home</Link>
              <span aria-hidden="true">/</span>
              <Link href={category.path}>{category.name}</Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page">{product.name}</span>
            </nav>
          </div>
        </div>

        <section className="lxp-hero" data-hero>
          <div className="lx-wrap lxp-hero__grid">
            <div className="lxp-hero__copy">
              <p className="lxp-hero__eyebrow" data-hero-item>
                <Link href={category.path}>{category.name}</Link>
              </p>

              <h1 className="lxp-hero__title">
                <span className="lxp-hero__line" data-hero-line>
                  {product.name}
                </span>
              </h1>

              <p className="lxp-hero__tagline" data-hero-item>
                {editorial.tagline}
              </p>

              <p className="lxp-hero__summary" data-hero-item>
                {editorial.summary}
              </p>

              <div className="lxp-hero__intro" data-hero-item>
                {editorial.intro.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>

              <div className="lx-actions lxp-hero__actions" data-hero-item>
                <Link href="#enquire" className="lx-btn lx-btn--red">
                  Enquire about this model
                </Link>
                {whatsapp ? (
                  <a
                    href={whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="lx-btn lx-btn--ghost"
                  >
                    WhatsApp
                  </a>
                ) : null}
              </div>

              {product.priceLabel ? (
                <p className="lxp-hero__price" data-hero-item>
                  <span>Price</span> {product.priceLabel}
                </p>
              ) : null}

              <dl className="lxp-hero__meta" data-hero-item>
                <div>
                  <dt>Category</dt>
                  <dd>
                    <Link href={category.path}>{category.name}</Link>
                  </dd>
                </div>
                <div>
                  <dt>Model check</dt>
                  <dd>
                    <Link href="/verify">Verify a code</Link>
                  </dd>
                </div>
              </dl>
            </div>

            <div className="lxp-hero__media" data-hero-media>
              <ProductGallery
                images={product.images}
                productName={product.name}
                sizes="(max-width: 900px) 100vw, 58vw"
              />
            </div>
          </div>
        </section>

        <section className="lxp-advantages">
          <div className="lx-wrap">
            <header className="lxp-head" data-reveal-group>
              <p className="lxc-eyebrow" data-reveal>
                <span aria-hidden="true" className="lxc-eyebrow__mark" />
                Key advantages
              </p>
              <div className="lxp-head__row">
                <h2 className="lxp-head__title" data-reveal>
                  What this model is for.
                </h2>
                <p className="lxp-head__lede" data-reveal>
                  {editorial.benefits.length > 0
                    ? "The qualities that decide whether this model belongs in your installation or on your route."
                    : "Speak to LONEX about how this model would be planned for your property."}
                </p>
              </div>
            </header>

            <div className="lxp-advantages__grid" data-reveal-group>
              {editorial.benefits.map((benefit) => (
                <article className="lxp-advantage" key={benefit.title} data-reveal>
                  <span aria-hidden="true" className="lxp-advantage__rule" />
                  <h3 className="lxp-advantage__title">{benefit.title}</h3>
                  <p className="lxp-advantage__copy">{benefit.copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="lxp-use">
          <div className="lx-wrap lxp-use__grid">
            <div className="lxp-use__lead" data-reveal-group>
              <p className="lxc-eyebrow" data-reveal>
                <span aria-hidden="true" className="lxc-eyebrow__mark" />
                Applications
              </p>
              <h2 className="lxp-use__title" data-reveal>
                Where it fits.
              </h2>
              <p className="lxp-use__body" data-reveal>
                {editorial.note ??
                  "The right configuration is confirmed for the property or journey this model will serve."}
              </p>
            </div>

            <ul className="lxp-use__list" data-reveal-group>
              {editorial.useCases.map((item) => (
                <li className="lxp-use__item" key={item} data-reveal>
                  <span aria-hidden="true" className="lxp-use__arrow">
                    →
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {product.specificationGroups.length > 0 ? (
          <section className="lxp-specs">
            <div className="lx-wrap">
              <header className="lxp-head" data-reveal-group>
                <p className="lxc-eyebrow" data-reveal>
                  <span aria-hidden="true" className="lxc-eyebrow__mark" />
                  Specifications
                </p>
                <h2 className="lxp-head__title" data-reveal>
                  Model figures.
                </h2>
              </header>

              <div className="lxp-specs__grid" data-reveal-group>
                {product.specificationGroups.map((group) => (
                  <section
                    className="lxp-spec-group"
                    key={group.groupName}
                    data-reveal
                  >
                    <h3 className="lxp-spec-group__title">{group.groupName}</h3>
                    <dl className="lxp-spec-group__list">
                      {group.items.map((item) => (
                        <div
                          className={`lxp-spec-row${
                            item.isHighlight ? " lxp-spec-row--highlight" : ""
                          }`}
                          key={`${item.label}-${item.value}`}
                        >
                          <dt>{item.label}</dt>
                          <dd>{item.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </section>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {product.documents.length > 0 ? (
          <section className="lxp-docs">
            <div className="lx-wrap">
              <header className="lxp-head" data-reveal-group>
                <p className="lxc-eyebrow" data-reveal>
                  <span aria-hidden="true" className="lxc-eyebrow__mark" />
                  Documents
                </p>
                <h2 className="lxp-head__title" data-reveal>
                  Datasheets.
                </h2>
              </header>

              <ul className="lxp-doc-list" data-reveal-group>
                {product.documents.map((document) => (
                  <li key={document.id} data-reveal>
                    <a href={document.url} className="lxp-doc">
                      <span className="lxp-doc__type">PDF</span>
                      <span className="lxp-doc__main">
                        <span className="lxp-doc__title">
                          {document.title || document.fileName}
                        </span>
                        <span className="lxp-doc__file">{document.fileName}</span>
                      </span>
                      <span aria-hidden="true" className="lxp-doc__action">
                        Download ↗
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ) : null}

        {related.length > 0 ? (
          <section className="lxp-related">
            <div className="lx-wrap">
              <div className="lxp-related__head" data-reveal-group>
                <div>
                  <p className="lxc-eyebrow" data-reveal>
                    <span aria-hidden="true" className="lxc-eyebrow__mark" />
                    More from {category.name}
                  </p>
                  <h2 className="lxp-related__title" data-reveal>
                    Continue through the range.
                  </h2>
                </div>
                <Link
                  href={category.path}
                  className="lxc-arrow-link lxp-related__all"
                >
                  All {category.name}
                  <span aria-hidden="true">→</span>
                </Link>
              </div>

              <div
                className={`lxp-related__grid lxp-related__grid--${Math.min(
                  related.length,
                  3,
                )}`}
                data-reveal-group
              >
                {related.map((item) => {
                  const itemEditorial = getProductEditorial(
                    item.slug,
                    item.name,
                    item.shortDescription,
                    null,
                  );

                  return (
                    <Link
                      className="lxp-related__card"
                      href={item.path}
                      key={item.id}
                      data-reveal
                      data-product-image
                    >
                      <span className="lxp-related__media">
                        <ContentImage
                          image={item.image}
                          fallbackLabel={`${item.name} image`}
                          sizes="(max-width: 720px) 100vw, 32vw"
                        />
                      </span>
                      <span className="lxp-related__copy">
                        <span className="lxp-related__name">{item.name}</span>
                        <span className="lxp-related__tagline">
                          {itemEditorial.tagline}
                        </span>
                        <span className="lxp-related__more">
                          View product
                          <span aria-hidden="true">↗</span>
                        </span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        ) : null}

        <section className="lxp-enquiry" id="enquire">
          <div className="lx-wrap lxp-enquiry__grid">
            <div className="lxp-enquiry__copy" data-reveal-group>
              <p className="lxc-eyebrow lxc-eyebrow--light" data-reveal>
                <span aria-hidden="true" className="lxc-eyebrow__mark" />
                Enquiries
              </p>
              <h2 className="lxp-enquiry__title" data-reveal>
                Talk to LONEX about the {product.name}.
              </h2>
              <p className="lxp-enquiry__body" data-reveal>
                Tell us the property, the system or the journeys this model
                needs to serve. Availability, lead time and the details that
                apply to your installation are confirmed directly with LONEX.
              </p>

              <div className="lx-actions lxp-enquiry__actions" data-reveal>
                <Link href="/contact" className="lx-btn lx-btn--red">
                  Send an enquiry
                </Link>
                {whatsapp ? (
                  <a
                    href={whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="lx-btn lx-btn--ghost"
                  >
                    WhatsApp
                  </a>
                ) : null}
              </div>

              {settings.contactPhone ? (
                <p className="lxp-enquiry__phone" data-reveal>
                  <span>Call</span>
                  <a href={`tel:${settings.contactPhone.replace(/\s+/g, "")}`}>
                    {formatPhone(settings.contactPhone)}
                  </a>
                </p>
              ) : null}
            </div>

            <aside className="lxp-enquiry__panel" data-reveal-group>
              <p className="lxp-enquiry__panel-label" data-reveal>
                Model verification
              </p>
              <p className="lxp-enquiry__panel-body" data-reveal>
                Every LONEX model can be checked against the model registry using
                the verification code supplied with it.
              </p>
              <Link href="/verify" className="lxp-enquiry__panel-link" data-reveal>
                Verify a model
                <span aria-hidden="true">→</span>
              </Link>
              <p className="lxp-enquiry__panel-note" data-reveal>
                A code check confirms that the model is registered with LONEX,
                not that an individual unit is genuine.
              </p>
            </aside>
          </div>
        </section>
      </PageMotion>
    </div>
  );
}

export const instant = false;
