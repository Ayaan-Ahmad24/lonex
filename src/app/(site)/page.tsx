import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { connection } from "next/server";

import { HomeMotion } from "@/components/public/home-motion";
import { createPageMetadata } from "@/lib/public/seo";
import { loadPublicSettings } from "@/lib/public/settings";
import {
  listFeaturedProducts,
  listLatestBlogPosts,
  listPublishedCategories,
} from "@/lib/public/queries";
import type {
  PublicBlogCard,
  PublicCategory,
  PublicProductCard,
} from "@/lib/public/dto";
import "../home.css";
import "../hero.css";
import { HomeHeroUI } from "@/components/public/hero-ui";
import { ContentImage } from "@/components/public/content-image";

const STORY_PHOTO = "/images/lonex-story/story-architecture.webp";

const PRINCIPLES = [
  {
    title: "CONNECTED THINKING",
    copy: "Energy generation, storage and mobility belong to a wider ecosystem. We look at how these possibilities work together rather than treating them as separate conversations.",
  },
  {
    title: "CLARITY IN EVERY DETAIL",
    copy: "Understanding matters. Product information, technical details and meaningful comparisons should make exploring energy solutions easier and more informed.",
  },
  {
    title: "BUILT AROUND TOMORROW",
    copy: "Technology continues to evolve. Our perspective stays focused on the opportunities shaping more efficient homes, smarter spaces and changing everyday journeys.",
  },
] as const;

const RANGE = [
  {
    slug: "solar",
    verb: "Generate",
    label: "Solar Panels",
    composition: "generate",
    image: "/images/homepage/range-solar.webp",
    alt: "Ground-mounted solar modules in a dry field at low sun — illustrative visual",
    sizes: "(max-width: 900px) 100vw, (max-width: 1440px) 31vw, 420px",
    copy: "Solar modules for homes and commercial sites, imported to specification.",
  },
  {
    slug: "batteries",
    verb: "Store",
    label: "Batteries",
    composition: "store",
    image: "/images/homepage/range-battery.webp",
    alt: "A white wall-mounted home battery unit on a stone wall — illustrative visual",
    sizes: "(max-width: 900px) 100vw, (max-width: 1440px) 31vw, 420px",
    copy: "Battery systems that hold the day's solar and keep essential loads running after sunset.",
  },
  {
    slug: "ev-bikes",
    verb: "Move",
    label: "Electric Bikes",
    composition: "move",
    image: "/images/homepage/range-ev.webp",
    alt: "A black electric bike, full side view, parked on a city street — illustrative visual",
    sizes: "(max-width: 900px) 100vw, (max-width: 1440px) 31vw, 420px",
    copy: "Electric bikes for everyday urban travel — quiet, efficient and built around the short trip.",
  },
] as const;

function SectionHead({
  index,
  label,
  title,
  children,
  dark = false,
}: {
  index?: string;
  label?: string;
  title: ReactNode;
  children?: ReactNode;
  dark?: boolean;
}) {
  return (
    <div className={`lxh-head${dark ? " lxh-head--dark" : ""}`} data-lxh-head>
      {index || label ? (
        <p className="lxh-eyebrow lxh-head__eyebrow">
          {index ? <span>{index}</span> : null}
          {index && label ? " / " : null}
          {label}
        </p>
      ) : null}
      <h2 className="lxh-h2 lxh-head__title">{title}</h2>
      {children ? <div className="lxh-head__aside">{children}</div> : null}
    </div>
  );
}

function categoryForProduct(
  product: PublicProductCard,
  categories: PublicCategory[],
) {
  return categories.find((category) =>
    product.path.startsWith(`${category.path}/`),
  );
}

function trimToWord(text: string, max: number): string {
  const cleaned = text.trim();

  if (cleaned.length <= max) {
    return cleaned;
  }

  const cut = cleaned.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  const trimmed = (lastSpace > 0 ? cut.slice(0, lastSpace) : cut).replace(
    /[,.;:—–-]+$/,
    "",
  );

  return `${trimmed}…`;
}

function JournalCard({
  post,
  variant,
  index,
}: {
  post: PublicBlogCard;
  variant: "feature" | "side";
  index: number;
}) {
  const isFeature = variant === "feature";

  return (
    <Link
      href={post.path}
      className={
        isFeature ? "lxh-journal__feature" : "lxh-journal__side-card"
      }
      data-lxh-journal-card
    >
      <figure className="lxh-journal__media">
        {post.cover ? (
          <Image
            src={post.cover.url}
            alt={post.cover.alt}
            fill
            sizes={
              isFeature
                ? "(max-width: 820px) 100vw, 56vw"
                : "(max-width: 520px) 100vw, 20vw"
            }
            className="lxh-journal__image"
          />
        ) : null}
      </figure>

      <div className="lxh-journal__body">
        <div className="lxh-journal__meta">
          <time dateTime={post.publishedAt}>{post.publishedLabel}</time>
          <span aria-hidden="true">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>
        <h3 className="lxh-journal__title">{post.title}</h3>
        {post.excerpt ? (
          <p className="lxh-journal__excerpt">
            {isFeature ? post.excerpt : trimToWord(post.excerpt, 120)}
          </p>
        ) : null}
        <span className="lxh-journal__read">
          Read the article
          <span aria-hidden="true"> →</span>
        </span>
      </div>
    </Link>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  await connection();
  const settings = await loadPublicSettings();

  return createPageMetadata({
    settings,
    title: settings.seoTitle || `${settings.siteName} | Power for what's Next.`,
    description:
      settings.seoDescription ||
      "LONEX connects solar energy, intelligent storage and electric mobility through carefully selected solutions.",
    path: "/",
    absoluteTitle: true,
  });
}

export default async function HomePage() {
  await connection();

  const [categories, featured, latestPosts] = await Promise.all([
    listPublishedCategories(),
    listFeaturedProducts(6),
    listLatestBlogPosts(5),
  ]);

  const coreRange = RANGE.map((item) => ({
    ...item,
    category: categories.find((category) => category.slug === item.slug) ?? null,
  }));

  const categoryCounts = categories.map((category) => ({
    ...category,
    count: featured.filter((product) =>
      product.path.startsWith(`${category.path}/`),
    ).length,
  }));

  // A one-option index is not a filter — it is a label pretending to be one.
  const shownCategories = categoryCounts.filter(
    (category) => category.count > 0,
  );

  // Use the latest editorial-ratio covers so the journal reads as a
  // photographic spread rather than a list of portrait thumbnails.
  const posts = latestPosts
    .filter((post) => {
      if (!post.cover?.width || !post.cover.height) {
        return false;
      }

      const ratio = post.cover.width / post.cover.height;
      return ratio >= 1.3 && ratio <= 1.9;
    })
    .slice(0, 3);

  return (
    <HomeMotion>
      <HomeHeroUI settings={null} />

      <div className="lxh-home">
        {/* A — Generate / Store / Move */}
        <section className="lxh-intro lxh-range" id="range">
          <div className="lx-wrap">
            <div className="lxh-range__head" data-lxh-head>
              <h2 className="lxh-range__title">Three ways to use power.</h2>
              <p className="lxh-range__lede">
                Generate it. Store it. Move with it. One range, held to one
                standard — three connected possibilities, one forward-looking
                perspective.
              </p>
            </div>

            <div className="lxh-range__chapters">
              {coreRange.map((item) => {
                const href = item.category?.path;

                return (
                  <article
                    key={item.slug}
                    className={`lxh-chapter lxh-chapter--${item.composition}`}
                    data-lxh-chapter
                  >
                    <figure className="lxh-chapter__media">
                      <Image
                        src={item.image}
                        alt={item.alt}
                        fill
                        sizes={item.sizes}
                        className="lxh-chapter__image"
                      />
                    </figure>

                    <div className="lxh-chapter__copy">
                      <h3 className="lxh-chapter__verb">{item.verb}</h3>
                      <p className="lxh-chapter__desc">{item.copy}</p>
                      {href ? (
                        <Link href={href} className="lxh-chapter__cta">
                          Explore {item.label.toLowerCase()}
                          <span aria-hidden="true" className="lxh-chapter__arrow">
                            →
                          </span>
                        </Link>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* B — The LONEX story */}
        <section className="lxh-section lxh-story-section" id="story">
          <div className="lx-wrap">
            <div className="lxh-story__intro" data-lxh-head>
              <p className="lxh-story__eyebrow">THE LONEX PERSPECTIVE</p>
              <h2 className="lxh-story__title">
                A clearer way to power what comes next.
              </h2>
              <div className="lxh-story__lede">
                <p>
                  Energy is changing the way we live, work and move. From the
                  rooftops that capture sunlight to the systems that keep energy
                  within reach and the journeys that connect our everyday lives,
                  a new energy landscape is taking shape.
                </p>
                <p>
                  LONEX brings solar energy, intelligent storage and electric
                  mobility together in one considered experience, shaped by how
                  each part supports the others.
                </p>
              </div>
            </div>

            <div className="lxh-story__body" data-lxh-story-body>
              <div className="lxh-story__copy">
                <h3 className="lxh-story__headline">
                  More than energy.
                  <span>A different way forward.</span>
                </h3>
                <p>
                  We believe the future of energy should feel more connected,
                  more understandable and more accessible. Generating power,
                  storing it for when it matters and using it to move through
                  everyday life are not isolated ideas. They are parts of a much
                  bigger picture.
                </p>
                <p>
                  That is the perspective behind LONEX. We bring together
                  technologies and solutions that reflect the changing needs of
                  modern homes, businesses and communities. Every category has
                  its own purpose, yet each contributes to a more connected
                  approach to how energy is experienced.
                </p>
                <p>
                  Our focus is on thoughtful selection, meaningful information
                  and a clear experience that helps people explore possibilities
                  with confidence. Because progress is not simply about what
                  technology can do. It is about how naturally it becomes part of
                  everyday life.
                </p>
              </div>

              <figure className="lxh-story__media">
                <Image
                  src={STORY_PHOTO}
                  alt="Solar panels integrated into the tiled roof of a contemporary home"
                  fill
                  sizes="(max-width: 900px) 100vw, 52vw"
                  className="lxh-story__image"
                />
              </figure>
            </div>

            <div className="lxh-principles" data-lxh-principles>
              {PRINCIPLES.map((principle) => (
                <div className="lxh-principle" key={principle.title}>
                  <h3 className="lxh-principle__title">{principle.title}</h3>
                  <p className="lxh-principle__copy">{principle.copy}</p>
                </div>
              ))}
            </div>

            <div className="lxh-story__closing" data-lxh-closing>
              <p className="lxh-story__closing-line">
                Built to work{" "}
                <span>together.</span>
              </p>
              <Link href="/about" className="lxh-story__cta">
                About LONEX
                <span aria-hidden="true"> →</span>
              </Link>
            </div>
          </div>
        </section>

        {/* C — Product showcase */}
        {featured.length > 0 ? (
          <section className="lxh-section" id="models">
            <div className="lx-wrap">
              <SectionHead
                label="Selected models"
                title="Models across the range."
              >
                <p className="lxh-body">
                  A selection of models from across solar, storage and electric
                  mobility. Specifications, documents and pricing are published
                  only once confirmed for each model.
                </p>
                {shownCategories.length > 1 ? (
                  <ul className="lxh-cat-index" aria-label="Product categories">
                    {shownCategories.map((category) => (
                      <li key={category.id}>
                        <Link href={category.path}>
                          <span>{category.name}</span>
                          <span className="lxh-cat-index__count">
                            {String(category.count).padStart(2, "0")}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </SectionHead>

              <div className="lxh-products" data-lxh-products>
                {featured.map((product) => {
                  const category = categoryForProduct(product, categories);

                  return (
                    <Link
                      key={product.id}
                      href={product.path}
                      className="lxh-product"
                    >
                      <figure className="lxh-product__media">
                        <ContentImage
                          image={product.image}
                          fallbackLabel="Product image"
                          sizes="(max-width: 900px) 100vw, 50vw"
                        />
                      </figure>

                      <div className="lxh-product__body">
                        <p className="lxh-product__cat">{category?.name}</p>
                        <h3 className="lxh-product__name">{product.name}</h3>
                        <p className="lxh-product__price">
                          {product.priceLabel ?? "Price on inquiry"}
                        </p>
                        {product.shortDescription ? (
                          <p className="lxh-product__note">
                            {product.shortDescription}
                          </p>
                        ) : null}
                        <span className="lxh-product__cta">
                          View model
                          <span aria-hidden="true"> →</span>
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        ) : null}

        {/* D — Model registry */}
        <section className="lxh-registry" id="registry">
          <div className="lx-wrap">
            <div className="lxh-registry__grid" data-lxh-registry>
              <div className="lxh-registry__copy">
                <p className="lxh-eyebrow lxh-eyebrow--light">
                  Model registry
                </p>
                <h2 className="lxh-registry__title">
                  A code confirms the model.
                  <span>Not the unit.</span>
                </h2>
                <p className="lxh-registry__body">
                  Enter the verification code supplied with a LONEX product
                  model. A match confirms that the model is registered — not the
                  condition of a physical unit, and not the seller.
                </p>
                <div className="lxh-registry__action">
                  <Link href="/verify" className="lx-btn lx-btn--red">
                    Verify a model
                  </Link>
                </div>
              </div>

              <div className="lxh-specimen">
                <div className="lxh-specimen__head">
                  <span>Registry check</span>
                  <span>Illustrative format</span>
                </div>
                <p className="lxh-specimen__code">LNX—••••—••••—••••</p>
                <dl className="lxh-specimen__rows">
                  <div>
                    <dt>Record type</dt>
                    <dd>Product model</dd>
                  </div>
                  <div>
                    <dt>Confirmation</dt>
                    <dd>Registered model</dd>
                  </div>
                  <div>
                    <dt>Does not confirm</dt>
                    <dd>Unit condition or seller</dd>
                  </div>
                </dl>
                <p className="lxh-specimen__foot">
                  Unknown, inactive and malformed codes return the same message.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* E — Authorized sellers */}
        <section className="lxh-sellers" id="sellers">
          <div className="lx-wrap">
            <div className="lxh-sellers__grid" data-lxh-sellers>
              <div className="lxh-sellers__copy">
                <h2 className="lxh-h2 lxh-sellers__title">
                  Find your next step.
                </h2>
                <p className="lxh-body lxh-sellers__body">
                  Whether you are exploring solar, energy storage or electric
                  mobility, discover the possibilities that fit your needs.
                  Connect with LONEX to discuss where to begin.
                </p>
                <div className="lxh-sellers__actions">
                  <Link href="/#range" className="lx-btn">
                    Explore the range
                  </Link>
                  <Link href="/contact" className="lx-link">
                    Contact LONEX
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* F — Journal */}
        <section className="lxh-section" id="journal">
          <div className="lx-wrap">
            <SectionHead
              label="Journal"
              title="From the journal."
            >
              <p className="lxh-body">
                Product notes, company updates and articles from LONEX.
              </p>
              <div className="lxh-head__link">
                <Link href="/blog" className="lx-link">
                  All articles
                </Link>
              </div>
            </SectionHead>

            {posts.length > 0 ? (
              <div className="lxh-journal" data-lxh-journal>
                <JournalCard post={posts[0]} variant="feature" index={0} />
                {posts.length > 1 ? (
                  <div className="lxh-journal__side">
                    {posts.slice(1).map((post, index) => (
                      <JournalCard
                        key={post.id}
                        post={post}
                        variant="side"
                        index={index + 1}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="lxh-body">
                The journal is published when LONEX has something confirmed to
                say.
              </p>
            )}
          </div>
        </section>

        {/* G — Closing */}
        <section className="lxh-close" data-lxh-close>
          <div className="lx-wrap lxh-close__inner">
            <div className="lxh-close__grid">
              <h2 className="lxh-close__title">
                <span>Generate.</span>
                <span>Store.</span>
                <span className="lxh-close__move">Move.</span>
              </h2>
              <div className="lxh-close__aside">
                <p className="lxh-close__copy">
                  Tell us what you are powering. We will tell you what the range
                  can do — and what it cannot.
                </p>
                <div className="lxh-close__actions">
                  <Link href="/contact" className="lx-btn lx-btn--red">
                    Talk to LONEX
                  </Link>
                  <Link href="/verify" className="lx-btn lx-btn--ghost">
                    Verify a model
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </HomeMotion>
  );
}

export const instant = false;
