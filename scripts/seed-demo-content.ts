import { createHash } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { config } from "dotenv";

// Load env before the DB module is imported (it reads MYSQL_* at import time).
config({ path: ".env.local", quiet: true });

/**
 * Milestone 1 demo content seed.
 *
 * This script only ADDS clearly-labelled demo content to a local development
 * database. It never changes the schema, never deletes unrelated records and
 * never writes to production: `assertLocalDatabase()` refuses to run when the
 * configured host is not a loopback address.
 *
 * Usage:
 *   npx tsx scripts/seed-demo-content.ts            # create/refresh demo data
 *   npx tsx scripts/seed-demo-content.ts --remove   # remove only demo records
 *
 * Idempotency:
 *   - Categories are matched by their approved slugs (solar, batteries,
 *     ev-bikes) and never duplicated.
 *   - Products are matched by (category_id, slug).
 *   - Public paths are matched by path.
 *   - Product images are matched by (product_id, media_id).
 *   - Specifications are only inserted when the product has none.
 *   - Blog posts are matched by slug.
 *   - Media is matched by its content-addressed storage key.
 *   - The verification code is matched by product_id.
 *
 * Removal (`--remove`) touches ONLY the demo records listed in this file:
 * demo products, their images/specifications/documents/verification codes and
 * public paths, the three demo blog posts, the demo category covers (reset to
 * null) and demo media rows that are no longer referenced. The three existing
 * categories and the two pre-existing blog posts are preserved.
 */

type SpecRow = { label: string; value: string; highlight?: boolean };
type SpecGroup = { name: string; rows: SpecRow[] };
type DemoImage = { file: string; alt: string };

type DemoProduct = {
  categorySlug: "solar" | "batteries" | "ev-bikes";
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  sortOrder: number;
  featuredSortOrder: number;
  images: DemoImage[];
  specs: SpecGroup[];
};

type DemoPost = {
  slug: string;
  title: string;
  excerpt: string;
  seoTitle: string;
  seoDescription: string;
  publishedAt: Date;
  cover: DemoImage;
  body: string;
};

const IMAGE_ROOT = path.resolve(
  process.cwd(),
  "public",
  "images",
  "lonex-generated-images",
);

const PRODUCT_DESCRIPTION =
  "A model from the LONEX range, published for homes and businesses. " +
  "Detailed specifications, documents and pricing are added once confirmed " +
  "for each model.";

/**
 * This code is deliberately demo-only. It uses the required Crockford base32
 * alphabet (0-9, A-Z minus I/L/O/U) so the existing verification rules accept
 * it. `LNX-DEMO-001` cannot be represented under those rules because the body
 * is too short and contains the excluded letter O; see the final report.
 */
const DEMO_VERIFICATION_CODE = "LNX-DEM0-2026-0001";
const DEMO_VERIFICATION_DATE = new Date("2026-11-10T09:00:00.000Z");
const DEMO_VERIFICATION_PRODUCT_SLUG = "solar-module";
const DEMO_VERIFICATION_CATEGORY_SLUG = "solar";

const CATEGORY_SEEDS = [
  {
    slug: "solar",
    name: "Solar Panels",
    description:
      "Solar modules and supporting equipment for residential and commercial generation.",
    sortOrder: 10,
    cover: {
      file: "categories/solar-panels.webp",
      alt: "Photovoltaic panel surface detail",
    },
  },
  {
    slug: "ev-bikes",
    name: "Electric Bikes",
    description:
      "Electric bikes for everyday urban travel.",
    sortOrder: 20,
    cover: {
      file: "categories/electric-mobility.webp",
      alt: "Electric scooter in a modern urban setting",
    },
  },
  {
    slug: "batteries",
    name: "Batteries",
    description:
      "Battery storage and inverter systems for homes and businesses.",
    sortOrder: 30,
    cover: {
      file: "categories/home-storage.webp",
      alt: "Home battery and inverter installation",
    },
  },
] as const;

const PRODUCTS: DemoProduct[] = [
  {
    categorySlug: "solar",
    slug: "solar-module",
    name: "Solar Module",
    shortDescription:
      "A rooftop solar module for homes and commercial buildings.",
    description: PRODUCT_DESCRIPTION,
    seoTitle: "A rooftop solar module for homes and commercial buildings. | LONEX",
    seoDescription:
      "A rooftop solar module for homes and commercial buildings.",
    sortOrder: 10,
    featuredSortOrder: 10,
    images: [
      {
        file: "demo-products/demo-solar-module.webp",
        alt: "a solar module concept",
      },
      {
        file: "demo-products/demo-panel-detail.webp",
        alt: "a solar module detail",
      },
    ],
    specs: [],
  },
  {
    categorySlug: "solar",
    slug: "solar-panel",
    name: "Solar Panel",
    shortDescription:
      "A rooftop solar panel for homes and commercial buildings.",
    description: PRODUCT_DESCRIPTION,
    seoTitle: "A rooftop solar panel for homes and commercial buildings. | LONEX",
    seoDescription:
      "A rooftop solar panel for homes and commercial buildings.",
    sortOrder: 20,
    featuredSortOrder: 40,
    images: [
      {
        file: "demo-products/demo-panel-detail.webp",
        alt: "a solar panel detail",
      },
      {
        file: "categories/solar-panels.webp",
        alt: "Photovoltaic panel surface detail",
      },
    ],
    specs: [],
  },
  {
    categorySlug: "batteries",
    slug: "home-battery",
    name: "Home Battery",
    shortDescription:
      "A home battery system that stores generated energy for use later in the day.",
    description: PRODUCT_DESCRIPTION,
    seoTitle: "A home battery system that stores generated energy for use later in the day. | LONEX",
    seoDescription:
      "A home battery system that stores generated energy for use later in the day.",
    sortOrder: 10,
    featuredSortOrder: 20,
    images: [
      {
        file: "demo-products/demo-home-battery.webp",
        alt: "a modular home battery concept",
      },
      {
        file: "demo-products/demo-battery-detail.webp",
        alt: "a battery detail",
      },
    ],
    specs: [],
  },
  {
    categorySlug: "batteries",
    slug: "hybrid-inverter",
    name: "Hybrid Inverter",
    shortDescription:
      "An inverter for coordinating generation, stored energy and household loads.",
    description: PRODUCT_DESCRIPTION,
    seoTitle: "An inverter for coordinating generation, stored energy and household loads. | LONEX",
    seoDescription:
      "An inverter for coordinating generation, stored energy and household loads.",
    sortOrder: 20,
    featuredSortOrder: 50,
    images: [
      {
        file: "demo-products/demo-inverter.webp",
        alt: "an inverter concept",
      },
      {
        file: "demo-products/demo-home-battery.webp",
        alt: "a home battery concept",
      },
    ],
    specs: [],
  },
  {
    categorySlug: "ev-bikes",
    slug: "electric-bike",
    name: "Electric Bike",
    shortDescription:
      "An electric bike for everyday urban journeys.",
    description: PRODUCT_DESCRIPTION,
    seoTitle: "An electric bike for everyday urban journeys. | LONEX",
    seoDescription:
      "An electric bike for everyday urban journeys.",
    sortOrder: 10,
    featuredSortOrder: 30,
    images: [
      {
        file: "demo-products/demo-electric-bike.webp",
        alt: "an electric bike concept",
      },
      {
        file: "lifestyle/ev-charging.webp",
        alt: "Electric vehicle charging close-up",
      },
    ],
    specs: [],
  },
  {
    categorySlug: "ev-bikes",
    slug: "electric-commuter-bike",
    name: "Electric Commuter Bike",
    shortDescription:
      "A commuter electric bike for shorter daily journeys.",
    description: PRODUCT_DESCRIPTION,
    seoTitle: "A commuter electric bike for shorter daily journeys. | LONEX",
    seoDescription:
      "A commuter electric bike for shorter daily journeys.",
    sortOrder: 20,
    featuredSortOrder: 60,
    images: [
      {
        file: "categories/electric-mobility.webp",
        alt: "Electric scooter in a modern urban setting",
      },
      {
        file: "lifestyle/ev-charging.webp",
        alt: "Electric vehicle charging close-up",
      },
    ],
    specs: [],
  },
];

const POSTS: DemoPost[] = [
  {
    slug: "understanding-solar-module-specifications",
    title: "Understanding Solar Module Specifications",
    excerpt:
      "A plain-language walk through the numbers on a solar module datasheet, and what each of them means for a rooftop installation.",
    seoTitle:
      "Understanding Solar Module Specifications | LONEX",
    seoDescription:
      "What the numbers on a solar module datasheet mean for a rooftop installation.",
    publishedAt: new Date("2026-11-09T09:00:00.000Z"),
    cover: {
      file: "editorial/city-solar.webp",
      alt: "an urban skyline with rooftop solar",
    },
    body: `

A solar module datasheet is a description of test conditions. Read it in the right order and the numbers become a useful comparison rather than a headline.

## Start with the nameplate

The headline figure is the rated power, usually measured at standard test conditions: a fixed irradiance, a 25 °C cell temperature and a defined light spectrum. Those conditions are a laboratory reference. A roof in full sun will not sit at the same cell temperature, and irradiance moves through the day.

Treat the rated power as a class, not a promise. Two modules from the same series can differ slightly in output even when the label looks identical.

## Efficiency is about area

Module efficiency is power divided by module area. A higher-efficiency module produces more from the same roof, which matters when space is the constraint. On a ground mount with room to spare, a larger module with a lower efficiency figure can be the more practical choice.

Compare efficiency only between modules of a similar power class. Otherwise the comparison is really about roof area.

## Temperature changes the result

Every datasheet includes a temperature coefficient. It describes how much output falls as the cells heat above the reference temperature. A module on a hot afternoon can be considerably warmer than the laboratory figure, so the coefficient deserves attention alongside the headline wattage.

## Read the fine print

Three details separate a datasheet from a label:

- The power tolerance, which describes how far an individual module may sit from its rated value.
- The product and power documentation, including how any degradation is described.
- The list of standards the manufacturer says the model has been tested against.

## Compare before you buy

A datasheet describes a model. It does not describe the individual unit in front of you. Confirm the exact model name, ask for the current revision and check the registration route the supplier offers for that model.

[Verify a model](/verify)
`,
  },
  {
    slug: "how-battery-storage-supports-everyday-energy-use",
    title: "How Battery Storage Supports Everyday Energy Use",
    excerpt:
      "What home battery capacity, power and cycling mean in practice, and how stored energy fits into a day at home.",
    seoTitle:
      "How Battery Storage Supports Everyday Energy Use | LONEX",
    seoDescription:
      "What the numbers on a solar module datasheet mean for a rooftop installation.",
    publishedAt: new Date("2026-11-07T09:00:00.000Z"),
    cover: {
      file: "editorial/energy-consultation.webp",
      alt: "an energy consultation meeting",
    },
    body: `

A home battery does not generate electricity. It moves energy through time: charging when supply is plentiful and discharging when the house needs it. That simple idea explains most of the decisions around storage.

## What storage actually does

A battery can absorb surplus solar production during the day and release it in the evening. It can also provide a limited backup supply during an outage, but only if the system is designed for that mode and the connected circuits are chosen carefully.

Storage is not a substitute for a reliable grid connection or for a correctly sized solar array. It is a way to shift and shape the energy already available.

## Capacity and usable capacity

The headline capacity of a battery is an energy figure, usually in kilowatt-hours. The usable capacity is smaller, because most systems keep a reserve to protect the cells and to support backup operation.

When comparing two batteries, ask for the usable figure rather than the headline figure. A larger nominal number with a deep reserve can deliver less than a smaller system with a conservative reserve.

## Power is a separate number

Capacity describes how much energy the battery can hold. Power describes how quickly it can deliver that energy. A battery with plenty of capacity but modest power may struggle to run several high-demand appliances at once.

The inverter is part of this picture. A storage system is only as capable as the combination of battery and inverter allows.

## Daily cycling is normal

A battery designed for daily cycling is expected to charge and discharge regularly. The important question is how the system manages that cycle: how deeply it discharges, how it treats high temperatures and how it reports its own state of health.

## What to ask before buying

- The usable capacity and the power rating, not just the headline numbers.
- The operating temperature range and where the unit will be installed.
- The backup behaviour, including which circuits remain powered.
- The documentation supplied with the model and the registration route for it.

[Find a seller](/authorized-sellers)
`,
  },
  {
    slug: "electric-mobility-and-the-changing-urban-journey",
    title: "Electric Mobility and the Changing Urban Journey",
    excerpt:
      "How shorter trips, charging habits and maintenance shape the way electric bikes are used in a city.",
    seoTitle:
      "Electric Mobility and the Changing Urban Journey | LONEX",
    seoDescription:
      "What the numbers on a solar module datasheet mean for a rooftop installation.",
    publishedAt: new Date("2026-11-05T09:00:00.000Z"),
    cover: {
      file: "editorial/sustainability-leaf.webp",
      alt: "a green leaf in natural light",
    },
    body: `

Most urban journeys are short. A commute, a school run, a trip to the market: each is often a few kilometres, made at a predictable time and over a familiar route. Electric bikes are interesting because they fit that pattern rather than trying to replace every car journey.

## The short trip is the useful unit

A bike that is easy to start, easy to park and easy to charge can remove a surprising number of short car trips. The benefit is not only energy use. It is also the time spent finding parking and the space a car occupies at each end of the journey.

## Range depends on context

A published range figure is a useful starting point, but it is not a promise for every rider. Rider weight, hills, wind, tyre pressure and how much assistance is used all change the result.

For daily use, the more practical question is whether the bike can complete the usual round trip with a comfortable margin. That margin matters more than the best-case number on a specification sheet.

## Charging habits matter

Most electric bike batteries are removable or can be charged where the bike is parked. A consistent routine — charge after use, avoid leaving the pack empty for long periods, keep it away from extreme heat — is more useful than occasional deep charging.

## Maintenance is familiar

An electric bike still has tyres, brakes, a chain or belt and a frame. The electric parts add a motor, a battery, a controller and a display, but the routine checks remain recognisable to anyone who has owned a bicycle.

## What to look for

- A motor and battery combination that suits the route, not just the headline power.
- Brakes and tyres that match the weight of the bike and the rider.
- A removable pack if charging access is limited.
- Clear documentation and a registration route for the model.

[Explore electric bikes](/ev-bikes)
`,
  },
];

const PRODUCT_SLUGS = PRODUCTS.map((product) => product.slug);
const POST_SLUGS = POSTS.map((post) => post.slug);

function assertLocalDatabase(): void {
  const host = (process.env.MYSQL_HOST ?? "").trim().toLowerCase();
  const database = (process.env.MYSQL_DATABASE ?? "").trim();

  const loopback =
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "::1" ||
    host === "[::1]";

  if (!loopback) {
    throw new Error(
      `Refusing to seed: MYSQL_HOST is "${host || "(empty)"}", not a loopback ` +
        "development host. This script must never run against production.",
    );
  }

  if (!database) {
    throw new Error("MYSQL_DATABASE is not configured.");
  }

  if (/prod/i.test(database)) {
    throw new Error(
      `Refusing to seed: MYSQL_DATABASE is "${database}", which looks like a ` +
        "production database. Use a local development database.",
    );
  }

  console.log(`Database check passed: ${database} on ${host} (local).`);
}

function isEexist(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "EEXIST"
  );
}

async function writeSeedFile(
  storageRoot: string,
  storageKey: string,
  data: Buffer,
): Promise<void> {
  const full = path.join(storageRoot, storageKey);
  await mkdir(storageRoot, { recursive: true });

  try {
    await writeFile(full, data, { flag: "wx" });
  } catch (error) {
    if (!isEexist(error)) {
      throw error;
    }
  }
}

function storageKeyFor(data: Buffer): string {
  const digest = createHash("sha256").update(data).digest("hex");

  return `seed-${digest}.webp`;
}

function specRowsFor(product: DemoProduct) {
  let sortOrder = 0;

  return product.specs.flatMap((group) =>
    group.rows.map((row) => ({
      productId: 0,
      groupName: group.name,
      label: row.label,
      value: row.value,
      isHighlight: row.highlight ?? false,
      sortOrder: (sortOrder += 1),
    })),
  );
}

async function main(): Promise<void> {
  assertLocalDatabase();

  const { and, eq } = await import("drizzle-orm");
  const { db, closeDbPool } = await import("../src/db/client");
  const {
    blogPosts,
    categories,
    mediaAssets,
    productDocuments,
    productImages,
    productSpecifications,
    productVerificationCodes,
    products,
    publicPaths,
    siteSettings,
  } = await import("../src/db/schema");
  const { parseRichText } = await import("../src/lib/content/rich-text");
  const { digestModelCode, normalizeModelCode } = await import(
    "../src/lib/verification/code"
  );
  const sharp = (await import("sharp")).default;

  const storageRoot = path.resolve(
    process.cwd(),
    process.env.MEDIA_STORAGE_PATH || ".data/media",
  );

  if (process.argv.includes("--remove")) {
    await removeDemoContent({
      db,
      closeDbPool,
      categories,
      products,
      productImages,
      productSpecifications,
      productDocuments,
      productVerificationCodes,
      blogPosts,
      publicPaths,
      mediaAssets,
      siteSettings,
      storageRoot,
    });
    return;
  }

  const mediaCache = new Map<string, number>();

  async function ensureMedia(asset: DemoImage): Promise<number> {
    const cached = mediaCache.get(asset.file);

    if (cached) {
      return cached;
    }

    const buffer = await readFile(path.join(IMAGE_ROOT, asset.file));
    const metadata = await sharp(buffer).metadata();
    const storageKey = storageKeyFor(buffer);

    let [media] = await db
      .select({ id: mediaAssets.id, altText: mediaAssets.altText })
      .from(mediaAssets)
      .where(eq(mediaAssets.storageKey, storageKey))
      .limit(1);

    if (!media) {
      await writeSeedFile(storageRoot, storageKey, buffer);

      const [inserted] = await db
        .insert(mediaAssets)
        .values({
          storageKey,
          originalName: path.basename(asset.file),
          mimeType: "image/webp",
          bytes: buffer.length,
          width: metadata.width ?? null,
          height: metadata.height ?? null,
          altText: asset.alt,
          uploadedBy: null,
        })
        .$returningId();

      media = { id: inserted.id, altText: asset.alt };
      console.log(`Stored demo media #${media.id}: ${asset.file}`);
    } else {
      // Repair a missing file for an existing metadata row without rewriting
      // an administrator's later alt-text edit.
      await writeSeedFile(storageRoot, storageKey, buffer);

      if (!media.altText?.trim()) {
        await db
          .update(mediaAssets)
          .set({ altText: asset.alt })
          .where(eq(mediaAssets.id, media.id));
      }
    }

    mediaCache.set(asset.file, media.id);

    return media.id;
  }

  const summary = {
    categoriesCreated: 0,
    categoriesUpdated: 0,
    productsCreated: 0,
    productsExisting: 0,
    imagesLinked: 0,
    specificationsAdded: 0,
    postsCreated: 0,
    postsExisting: 0,
    verificationUpserted: false,
  };

  // ---- Categories -------------------------------------------------------
  const categoryIds = new Map<string, number>();

  for (const seed of CATEGORY_SEEDS) {
    const coverId = await ensureMedia(seed.cover);
    const [existing] = await db
      .select({
        id: categories.id,
        name: categories.name,
        description: categories.description,
        coverMediaId: categories.coverMediaId,
      })
      .from(categories)
      .where(eq(categories.slug, seed.slug))
      .limit(1);

    if (!existing) {
      const [inserted] = await db
        .insert(categories)
        .values({
          name: seed.name,
          slug: seed.slug,
          description: seed.description,
          coverMediaId: coverId,
          status: "published",
          sortOrder: seed.sortOrder,
        })
        .$returningId();

      categoryIds.set(seed.slug, inserted.id);
      summary.categoriesCreated += 1;
      console.log(`Created category #${inserted.id}: ${seed.name}`);
      continue;
    }

    categoryIds.set(seed.slug, existing.id);

    const updates: {
      name?: string;
      description?: string;
      coverMediaId?: number;
    } = {};

    // Preserve the approved slugs. Only refresh the legacy display label and
    // empty descriptions; an administrator's later copy is never overwritten.
    if (seed.slug === "ev-bikes" && existing.name === "EV Bikes") {
      updates.name = seed.name;
    }

    if (!existing.description?.trim()) {
      updates.description = seed.description;
    }

    if (existing.coverMediaId === null) {
      updates.coverMediaId = coverId;
    } else if (existing.coverMediaId !== coverId) {
      console.warn(
        `Category ${seed.slug} already has a different cover (media #${existing.coverMediaId}); left unchanged.`,
      );
    }

    if (Object.keys(updates).length > 0) {
      await db
        .update(categories)
        .set(updates)
        .where(eq(categories.id, existing.id));
      summary.categoriesUpdated += 1;
      console.log(`Updated category #${existing.id}: ${seed.slug}`);
    }
  }

  // ---- Products ---------------------------------------------------------
  for (const product of PRODUCTS) {
    const categoryId = categoryIds.get(product.categorySlug);

    if (!categoryId) {
      throw new Error(
        `Category ${product.categorySlug} was not available for ${product.slug}.`,
      );
    }

    const publicPath = `/${product.categorySlug}/${product.slug}`;
    const mediaIds: number[] = [];

    for (const image of product.images) {
      mediaIds.push(await ensureMedia(image));
    }

    const specRows = specRowsFor(product);

    let [existing] = await db
      .select({ id: products.id })
      .from(products)
      .where(
        and(eq(products.categoryId, categoryId), eq(products.slug, product.slug)),
      )
      .limit(1);

    if (!existing) {
      const productId = await db.transaction(async (tx) => {
        const [inserted] = await tx
          .insert(products)
          .values({
            categoryId,
            name: product.name,
            slug: product.slug,
            shortDescription: product.shortDescription,
            description: product.description,
            price: null,
            showPrice: false,
            isFeatured: true,
            featuredSortOrder: product.featuredSortOrder,
            status: "published",
            sortOrder: product.sortOrder,
            seoTitle: product.seoTitle,
            seoDescription: product.seoDescription,
          })
          .$returningId();

        await tx.insert(publicPaths).values({
          path: publicPath,
          ownerType: "product",
          ownerId: String(inserted.id),
          status: "published",
        });

        if (product.images.length > 0) {
          await tx.insert(productImages).values(
            product.images.map((image, index) => ({
              productId: inserted.id,
              mediaId: mediaIds[index],
              alt: image.alt,
              isPrimary: index === 0,
              sortOrder: index,
            })),
          );
        }

        if (specRows.length > 0) {
          await tx.insert(productSpecifications).values(
            specRows.map((row) => ({
              ...row,
              productId: inserted.id,
            })),
          );
        }

        return inserted.id;
      });

      existing = { id: productId };
      summary.productsCreated += 1;
      summary.imagesLinked += product.images.length;
      summary.specificationsAdded += specRows.length;
      console.log(`Created product #${productId}: ${product.name}`);
    } else {
      summary.productsExisting += 1;
      console.log(`Product #${existing.id} already exists: ${product.name}`);
    }

    const productId = existing.id;

    // Ensure the public path exists and belongs to this product.
    const [pathRow] = await db
      .select({
        id: publicPaths.id,
        ownerType: publicPaths.ownerType,
        ownerId: publicPaths.ownerId,
        status: publicPaths.status,
      })
      .from(publicPaths)
      .where(eq(publicPaths.path, publicPath))
      .limit(1);

    if (!pathRow) {
      await db.insert(publicPaths).values({
        path: publicPath,
        ownerType: "product",
        ownerId: String(productId),
        status: "published",
      });
    } else if (
      pathRow.ownerType !== "product" ||
      pathRow.ownerId !== String(productId)
    ) {
      console.warn(
        `Skipped public path ${publicPath}: it is claimed by ${pathRow.ownerType} #${pathRow.ownerId}.`,
      );
    } else if (pathRow.status !== "published") {
      await db
        .update(publicPaths)
        .set({ status: "published" })
        .where(eq(publicPaths.id, pathRow.id));
    }

    // Link any missing demo images without removing administrator additions.
    for (let index = 0; index < product.images.length; index += 1) {
      const image = product.images[index];
      const mediaId = mediaIds[index];
      const [linked] = await db
        .select({ id: productImages.id })
        .from(productImages)
        .where(
          and(
            eq(productImages.productId, productId),
            eq(productImages.mediaId, mediaId),
          ),
        )
        .limit(1);

      if (!linked) {
        await db.insert(productImages).values({
          productId,
          mediaId,
          alt: image.alt,
          isPrimary: index === 0,
          sortOrder: index,
        });
        summary.imagesLinked += 1;
      }
    }

    // Only add specifications when the product has none. This keeps a re-run
    // from duplicating rows and never wipes an existing record.
    const existingSpecs = await db
      .select({ id: productSpecifications.id })
      .from(productSpecifications)
      .where(eq(productSpecifications.productId, productId))
      .limit(1);

    if (existingSpecs.length === 0 && specRows.length > 0) {
      await db
        .insert(productSpecifications)
        .values(specRows.map((row) => ({ ...row, productId })));
      summary.specificationsAdded += specRows.length;
    }
  }

  // ---- Blog posts -------------------------------------------------------
  for (const post of POSTS) {
    const [existing] = await db
      .select({ id: blogPosts.id })
      .from(blogPosts)
      .where(eq(blogPosts.slug, post.slug))
      .limit(1);

    if (existing) {
      summary.postsExisting += 1;
      console.log(`Blog post already exists: ${post.slug}`);
      continue;
    }

    const parsed = parseRichText(post.body);

    if (!parsed.ok) {
      throw new Error(`${post.slug}: ${parsed.reason}`);
    }

    const coverId = await ensureMedia(post.cover);

    await db.insert(blogPosts).values({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      contentJson: parsed.document,
      coverMediaId: coverId,
      seoTitle: post.seoTitle,
      seoDescription: post.seoDescription,
      status: "published",
      publishedAt: post.publishedAt,
      createdBy: null,
      updatedBy: null,
    });

    summary.postsCreated += 1;
    console.log(`Published demo blog post: ${post.slug}`);
  }

  // ---- Demo verification code ------------------------------------------
  const normalized = normalizeModelCode(DEMO_VERIFICATION_CODE);

  if (!normalized) {
    throw new Error(
      `Demo verification code ${DEMO_VERIFICATION_CODE} does not normalize.`,
    );
  }

  const [verificationProduct] = await db
    .select({ id: products.id })
    .from(products)
    .innerJoin(categories, eq(categories.id, products.categoryId))
    .where(
      and(
        eq(categories.slug, DEMO_VERIFICATION_CATEGORY_SLUG),
        eq(products.slug, DEMO_VERIFICATION_PRODUCT_SLUG),
      ),
    )
    .limit(1);

  if (!verificationProduct) {
    throw new Error("The demo verification product is missing.");
  }

  const digest = digestModelCode(normalized);

  const [existingCode] = await db
    .select({
      id: productVerificationCodes.id,
      codeDigest: productVerificationCodes.codeDigest,
    })
    .from(productVerificationCodes)
    .where(eq(productVerificationCodes.productId, verificationProduct.id))
    .limit(1);

  if (existingCode) {
    await db
      .update(productVerificationCodes)
      .set({
        codeDigest: digest,
        active: true,
        registeredAt: DEMO_VERIFICATION_DATE,
      })
      .where(eq(productVerificationCodes.id, existingCode.id));
  } else {
    await db.insert(productVerificationCodes).values({
      productId: verificationProduct.id,
      codeDigest: digest,
      active: true,
      registeredAt: DEMO_VERIFICATION_DATE,
    });
  }

  summary.verificationUpserted = true;

  console.log("\n=== DEMO SEED SUMMARY ===");
  console.log(JSON.stringify(summary, null, 2));
  console.log(`Demo verification code: ${DEMO_VERIFICATION_CODE}`);
  console.log(
    "Verification result links to: Demo Solar Module 01 (illustrative demo record).",
  );
  console.log(
    "\nNote: the requested LNX-DEMO-001 cannot be represented under the " +
      "existing Crockford-base32 rules (7-character body, excluded letter O). " +
      "The rules were NOT changed; the format-valid code above is used instead.",
  );

  await closeDbPool();
}

type RemovalContext = {
  db: any;
  closeDbPool: () => Promise<void>;
  categories: any;
  products: any;
  productImages: any;
  productSpecifications: any;
  productDocuments: any;
  productVerificationCodes: any;
  blogPosts: any;
  publicPaths: any;
  mediaAssets: any;
  siteSettings: any;
  storageRoot: string;
};

async function removeDemoContent(ctx: RemovalContext): Promise<void> {
  const { and, eq, inArray } = await import("drizzle-orm");
  const {
    db,
    categories,
    products,
    productImages,
    productSpecifications,
    productDocuments,
    productVerificationCodes,
    blogPosts,
    publicPaths,
    mediaAssets,
    siteSettings,
    storageRoot,
  } = ctx;

  // Resolve the content-addressed keys used by this demo pack. Fall back to
  // the original file names so `--remove` still works if the pack was deleted.
  const mediaKeys = new Set<string>();
  const mediaNames = new Set<string>();

  for (const asset of [
    ...CATEGORY_SEEDS.map((seed) => seed.cover),
    ...PRODUCTS.flatMap((product) => product.images),
    ...POSTS.map((post) => post.cover),
  ]) {
    mediaNames.add(path.basename(asset.file));

    try {
      const buffer = await readFile(path.join(IMAGE_ROOT, asset.file));
      mediaKeys.add(storageKeyFor(buffer));
    } catch {
      // The database rows can still be identified by original_name.
    }
  }

  const demoMediaRows = await db
    .select({
      id: mediaAssets.id,
      storageKey: mediaAssets.storageKey,
      originalName: mediaAssets.originalName,
    })
    .from(mediaAssets);
  const demoMediaIds = demoMediaRows
    .filter(
      (row: { storageKey: string; originalName: string }) =>
        mediaKeys.has(row.storageKey) || mediaNames.has(row.originalName),
    )
    .map((row: { id: number }) => row.id);

  const demoProducts = await db
    .select({ id: products.id, name: products.name })
    .from(products)
    .innerJoin(categories, eq(categories.id, products.categoryId))
    .where(
      and(
        inArray(categories.slug, ["solar", "batteries", "ev-bikes"]),
        inArray(products.slug, PRODUCT_SLUGS),
      ),
    );

  const productIds = demoProducts.map((row: { id: number }) => row.id);

  await db.transaction(async (tx: any) => {
    if (productIds.length > 0) {
      const ownerIds = productIds.map((id: number) => String(id));

      await tx
        .delete(productVerificationCodes)
        .where(inArray(productVerificationCodes.productId, productIds));
      await tx
        .delete(productDocuments)
        .where(inArray(productDocuments.productId, productIds));
      await tx
        .delete(productImages)
        .where(inArray(productImages.productId, productIds));
      await tx
        .delete(productSpecifications)
        .where(inArray(productSpecifications.productId, productIds));
      await tx
        .delete(publicPaths)
        .where(
          and(
            eq(publicPaths.ownerType, "product"),
            inArray(publicPaths.ownerId, ownerIds),
          ),
        );
      await tx.delete(products).where(inArray(products.id, productIds));
    }

    await tx.delete(blogPosts).where(inArray(blogPosts.slug, POST_SLUGS));

    // Reset only category covers that point at demo media.
    if (demoMediaIds.length > 0) {
      await tx
        .update(categories)
        .set({ coverMediaId: null })
        .where(inArray(categories.coverMediaId, demoMediaIds));
    }
  });

  // Delete demo media rows only when nothing else references them.
  let removedMedia = 0;

  for (const mediaId of demoMediaIds) {
    const [categoryRef] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.coverMediaId, mediaId))
      .limit(1);
    const [imageRef] = await db
      .select({ id: productImages.id })
      .from(productImages)
      .where(eq(productImages.mediaId, mediaId))
      .limit(1);
    const [documentRef] = await db
      .select({ id: productDocuments.id })
      .from(productDocuments)
      .where(eq(productDocuments.mediaId, mediaId))
      .limit(1);
    const [blogRef] = await db
      .select({ id: blogPosts.id })
      .from(blogPosts)
      .where(eq(blogPosts.coverMediaId, mediaId))
      .limit(1);
    const [settingsRow] = await db
      .select({ valueJson: siteSettings.valueJson })
      .from(siteSettings)
      .where(eq(siteSettings.key, "site"))
      .limit(1);

    const logoMediaId =
      settingsRow && typeof settingsRow.valueJson === "object"
        ? (settingsRow.valueJson as Record<string, unknown>).logoMediaId
        : null;

    if (
      categoryRef ||
      imageRef ||
      documentRef ||
      blogRef ||
      Number(logoMediaId) === mediaId
    ) {
      continue;
    }

    const [row] = await db
      .select({ storageKey: mediaAssets.storageKey })
      .from(mediaAssets)
      .where(eq(mediaAssets.id, mediaId))
      .limit(1);

    if (!row) {
      continue;
    }

    await db.delete(mediaAssets).where(eq(mediaAssets.id, mediaId));

    try {
      await unlink(path.join(storageRoot, row.storageKey));
    } catch {
      // The row is gone; a missing file is harmless.
    }

    removedMedia += 1;
  }

  console.log("=== DEMO REMOVAL SUMMARY ===");
  console.log(`Products removed: ${productIds.length}`);
  console.log(`Blog posts removed: ${POST_SLUGS.length} (where present)`);
  console.log(`Demo media rows removed: ${removedMedia}`);
  console.log(
    "Categories, existing blog posts, settings and all unrelated records were preserved.",
  );

  await ctx.closeDbPool();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
