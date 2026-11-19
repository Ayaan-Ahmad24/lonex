import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { config } from "dotenv";

// Load env before the DB module is imported (it reads MYSQL_* at import time).
config({ path: ".env.local", quiet: true });

type SeedPost = {
  slug: string;
  title: string;
  excerpt: string;
  seoTitle: string;
  seoDescription: string;
  cover: { file: string; alt: string };
  publishedAt: Date;
  body: string;
};

const POSTS: SeedPost[] = [
  {
    slug: "how-to-read-a-solar-module-nameplate",
    title: "How to read a solar module nameplate",
    excerpt:
      "Power class, efficiency and temperature behaviour — the figures that decide what a module actually delivers on a Pakistani roof.",
    seoTitle: "How to read a solar module nameplate | LONEX",
    seoDescription:
      "A practical guide to the four figures on a solar module datasheet that change what a system actually produces.",
    cover: {
      file: "craft-panel.webp",
      alt: "A technician lifting a solar module onto a roof mounting rail",
    },
    publishedAt: new Date("2026-10-14T09:00:00.000Z"),
    body: `A solar module is sold by its nameplate, but the nameplate is a set of test conditions rather than a promise. Read it in the right order and the numbers stop being marketing.

## Start with the power class

The headline figure is Pmax, measured at Standard Test Conditions: 1,000 W/m² irradiance, a 25 °C cell temperature and the AM1.5 spectrum. Those conditions are a laboratory reference. A rooftop in Lahore rarely sits at 25 °C cell temperature in daylight, and irradiance moves all day.

A module sold as 640–670 W is a power bin, not a single number. Ask which bin is being supplied, because two modules from the same series can differ by one or two percent in output and by a whole step in price.

## Efficiency is a ratio, not a ranking

Module efficiency is power divided by module area. A high-efficiency module produces more from the same roof, which matters when area is the constraint. On a ground mount with space to spare, a slightly larger module with a lower efficiency figure can deliver the same energy for less money.

Compare efficiency only between modules of the same power class. Otherwise you are comparing roof area, not technology.

## Temperature is the hidden variable

Every datasheet carries a temperature coefficient of Pmax, usually between −0.26 %/°C and −0.35 %/°C for modern N-type modules. It describes how much output falls as the cells heat above 25 °C.

On a hot afternoon a module can reach 60–70 °C at the cell. At −0.30 %/°C, that is roughly a ten to thirteen percent reduction from the nameplate figure. Two modules with the same Pmax can behave differently here, which is why the coefficient deserves as much attention as the headline wattage.

## Read the fine print

Three details separate a datasheet from a label:

- The power tolerance, which describes how far an individual module may sit from its rated value.
- The warranty terms, split between product, power and the annual degradation curve.
- The certification list, including the standard numbers rather than a logo.

## Then check the model

A datasheet describes a model. It does not describe the unit in front of you. Before agreeing a price, confirm the exact model name, ask for the datasheet revision and check that the model is registered. A verification code confirms that the model is published by LONEX; it does not confirm the condition of a physical unit or the seller.

[Verify a model](/verify)`,
  },
  {
    slug: "why-the-model-code-matters",
    title: "Why the model code matters more than the box",
    excerpt:
      "A serial number identifies a unit. A registered model identifies what was specified, tested and shipped — and that is the part a buyer can check.",
    seoTitle: "Why the model code matters more than the box | LONEX",
    seoDescription:
      "What a product model registry can prove, what it cannot, and the four details worth checking before a solar or storage purchase.",
    cover: {
      file: "generate-installation.webp",
      alt: "An installer fixing cabling between solar modules on a rooftop",
    },
    publishedAt: new Date("2026-11-03T09:00:00.000Z"),
    body: `Most product conversations start with a photograph. A photograph shows a shape. It does not show a model number, a revision, a certificate or a warranty. The model code is the part of a product that can actually be checked.

## A unit is not a model

Every physical unit has a serial number. It is unique, it is printed on a label, and it tells you almost nothing on its own — unless someone holds a record that links it to a specification.

A model code is different. It groups everything built to the same specification: the same cell layout, the same frame, the same junction box, the same tested performance. When a supplier quotes a model, they are quoting a document, not an object.

## What a registry can prove

A model registry answers one question well: is this model published by the brand, and what does the brand say about it? That is worth having, because model names drift. Importers rename, resellers abbreviate, and marketplaces merge two series into one listing.

What a registry cannot do is inspect a crate. It cannot tell you whether the unit was stored dry, whether the glass was cracked and replaced, or whether the seller is trustworthy. Those are separate checks, and any registry that claims otherwise is overreaching.

## Four details worth checking

- The full model name, including the series and the power bin.
- The datasheet revision and its date, not just the file name.
- The seller's published listing, including the contact details they have approved.
- The verification code, if the brand issues one for the model.

## The point of the check

Verification is not a guarantee. It is a way to remove one specific uncertainty — whether the model exists and what the manufacturer publishes about it — so the rest of the conversation can be about price, warranty and installation.

[Find a seller](/authorized-sellers)`,
  },
];

function isMissing(error: unknown): boolean {
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
    if (!isMissing(error)) {
      throw error;
    }
  }
}

async function main(): Promise<void> {
  const { eq } = await import("drizzle-orm");
  const { db, closeDbPool } = await import("../src/db/client");
  const { blogPosts, mediaAssets } = await import("../src/db/schema");
  const { parseRichText } = await import("../src/lib/content/rich-text");
  const sharp = (await import("sharp")).default;

  const storageRoot = path.resolve(
    process.cwd(),
    process.env.MEDIA_STORAGE_PATH || ".data/media",
  );
  const imageRoot = path.resolve(process.cwd(), "public", "images", "v2");

  for (const post of POSTS) {
    const [existing] = await db
      .select({ id: blogPosts.id })
      .from(blogPosts)
      .where(eq(blogPosts.slug, post.slug))
      .limit(1);

    if (existing) {
      console.log(`Skipping ${post.slug}: already present.`);
      continue;
    }

    const parsed = parseRichText(post.body);

    if (!parsed.ok) {
      throw new Error(`${post.slug}: ${parsed.reason}`);
    }

    const image = await readFile(path.join(imageRoot, post.cover.file));
    const metadata = await sharp(image).metadata();
    const digest = createHash("sha256").update(image).digest("hex");
    const storageKey = `seed-${digest}.webp`;

    let [media] = await db
      .select({ id: mediaAssets.id })
      .from(mediaAssets)
      .where(eq(mediaAssets.storageKey, storageKey))
      .limit(1);

    if (!media) {
      await writeSeedFile(storageRoot, storageKey, image);

      const [inserted] = await db
        .insert(mediaAssets)
        .values({
          storageKey,
          originalName: post.cover.file,
          mimeType: "image/webp",
          bytes: image.length,
          width: metadata.width ?? null,
          height: metadata.height ?? null,
          altText: post.cover.alt,
          uploadedBy: null,
        })
        .$returningId();

      media = { id: inserted.id };
      console.log(`Stored cover media #${media.id}: ${post.cover.file}`);
    }

    await db.insert(blogPosts).values({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      contentJson: parsed.document,
      coverMediaId: media.id,
      seoTitle: post.seoTitle,
      seoDescription: post.seoDescription,
      status: "published",
      publishedAt: post.publishedAt,
      createdBy: null,
      updatedBy: null,
    });

    console.log(`Published ${post.slug}`);
  }

  // Fail loudly if the data we just wrote does not read back.
  const rows = await db
    .select({ slug: blogPosts.slug, status: blogPosts.status })
    .from(blogPosts)
    .where(eq(blogPosts.status, "published"));

  console.log("\nPublished posts:", rows.map((row) => row.slug).join(", "));

  await closeDbPool();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
