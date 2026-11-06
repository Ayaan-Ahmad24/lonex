import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { config } from "dotenv";

// Load env before the DB module is imported (it reads MYSQL_* at import time).
config({ path: ".env.local", quiet: true });

type SpecRow = { label: string; value: string; highlight?: boolean };
type SpecGroup = { name: string; rows: SpecRow[] };

type SeedProduct = {
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  sortOrder: number;
  featuredSortOrder: number;
  datasheet: { file: string; title: string };
  specs: SpecGroup[];
};

const CORPORATE_ADDRESS = "84 Brandth Road, Lahore, Pakistan";
const CORPORATE_PHONE = "03228888278";
const CORPORATE_WHATSAPP = "923228888278";

const SETTINGS_FALLBACK = {
  siteName: "LONEX",
  tagline: "Solar, EV and power solutions",
  description:
    "The official LONEX website for solar, electric mobility and power solutions.",
  logoText: "LX",
  logoMediaId: null,
  contactEmail: "",
  contactPhone: "",
  whatsapp: "",
  address: "",
  googleMapsUrl: "",
  social: {
    facebook: "",
    instagram: "",
    x: "",
    linkedin: "",
    youtube: "",
  },
  seoTitle: "LONEX | Solar, EV and power solutions",
  seoDescription:
    "The official LONEX website for solar, electric mobility and power solutions.",
  noIndex: false,
};

const PRODUCTS: SeedProduct[] = [
  {
    slug: "lonex-p1-bd-650",
    name: "LONEX LNX-P1-BD 650W+ Solar Module",
    shortDescription:
      "Planned 650W+ N-Type bifacial dual-glass module family built around LONEX LBCTM Pro back-contact architecture. Preliminary concept: factory data pending.",
    description:
      "The LONEX P1-BD Series is being developed as a 650W+ premium module family built around LBCTM Pro back-contact architecture, high power density and a clean front-cell appearance for utility, commercial and industrial projects.\n\nThe platform is planned around N-Type bifacial dual-glass construction, with dual-side generation where applicable and durable module architecture for long-term deployment.\n\nThis is a preliminary concept datasheet. Final electrical, mechanical, warranty and certification data will be inserted after factory confirmation. Nothing on this page should be read as a confirmed availability, performance or certification claim.",
    seoTitle: "LONEX LNX-P1-BD 650W+ solar module (preliminary concept)",
    seoDescription:
      "Preliminary concept information for the planned LONEX LNX-P1-BD 650W+ N-Type bifacial dual-glass solar module. Factory data pending.",
    sortOrder: 10,
    featuredSortOrder: 10,
    datasheet: {
      file: "lonex-p1-bd-650-plus-preliminary-datasheet.pdf",
      title: "LONEX P1-BD 650W+ preliminary concept datasheet (PDF)",
    },
    specs: [
      {
        name: "Platform",
        rows: [
          { label: "Brand", value: "LONEX Solar", highlight: true },
          { label: "Series", value: "LNX-P1-BD", highlight: true },
          { label: "Power class", value: "650W+ (exact launch bins TBC)" },
          {
            label: "Technology",
            value: "N-Type bifacial dual-glass (planned)",
          },
          {
            label: "Back contact",
            value: "LBCTM Pro - LONEX Back Contact Technology",
          },
          { label: "Status", value: "Preliminary concept - factory data pending" },
        ],
      },
      {
        name: "Electrical characteristics",
        rows: [
          { label: "Maximum power (Pmax)", value: "TBC" },
          { label: "Open circuit voltage (Voc)", value: "TBC" },
          { label: "Short circuit current (Isc)", value: "TBC" },
          { label: "Voltage at maximum power (Vmp)", value: "TBC" },
          { label: "Current at maximum power (Imp)", value: "TBC" },
          { label: "Module efficiency", value: "TBC" },
          { label: "Power tolerance", value: "TBC" },
        ],
      },
      {
        name: "Mechanical parameters",
        rows: [
          { label: "Cell / layout", value: "TBC" },
          { label: "Dimensions", value: "TBC" },
          { label: "Weight", value: "TBC" },
          { label: "Front / rear glass", value: "TBC" },
          { label: "Frame", value: "TBC" },
          { label: "Junction box / IP rating", value: "TBC" },
          { label: "Cable / connector", value: "TBC" },
        ],
      },
      {
        name: "Warranty and certification",
        rows: [
          { label: "Product warranty", value: "TBC" },
          { label: "Linear power warranty", value: "TBC" },
          { label: "Annual degradation", value: "TBC" },
          {
            label: "Certifications",
            value:
              "To be confirmed - marks are shown only after certificates are verified for LONEX products.",
          },
        ],
      },
    ],
  },
  {
    slug: "cd-cd-g640-670-mch72dw",
    name: "C&D CD-G640-670 MCH72Dw 2382 Series+",
    shortDescription:
      "N-Type BC double-glass solar module series from 640W to 670W with up to 24.8% module efficiency, supplied through LONEX.",
    description:
      "The CD-G640-670 MCH72Dw 2382 Series+ is an N-Type back-contact (BC) double-glass photovoltaic module series with a power range of 640W to 670W and a maximum module efficiency of 24.8%.\n\nLONEX supplies this model. The technical values shown here are reproduced from the manufacturer datasheet. Installations must follow the manufacturer's installation guide and applicable local requirements.\n\nAvailability, pricing and delivery terms are confirmed by LONEX in writing for each order.",
    seoTitle: "C&D CD-G640-670 MCH72Dw 2382 Series+ solar module",
    seoDescription:
      "C&D CD-G640-670 MCH72Dw 2382 Series+ N-Type BC double-glass solar module, 640-670W, up to 24.8% efficiency, supplied through LONEX.",
    sortOrder: 20,
    featuredSortOrder: 20,
    datasheet: {
      file: "cd-cd-g640-670-mch72dw-datasheet.pdf",
      title: "C&D CD-G640-670 MCH72Dw 2382 Series+ datasheet (PDF)",
    },
    specs: [
      {
        name: "Module",
        rows: [
          { label: "Model", value: "CD-G640-670 MCH72Dw 2382 Series+", highlight: true },
          { label: "Power range", value: "640-670 W", highlight: true },
          { label: "Module efficiency", value: "Up to 24.8%", highlight: true },
          { label: "Module type", value: "N-Type BC (double glass series)" },
          { label: "Cell type", value: "N-Type BC" },
          { label: "Number of cells", value: "144 (6 x 24)" },
          { label: "Bifacial factor", value: "70 +/-5%" },
          { label: "Power tolerance", value: "0 to +3%" },
          { label: "First-year power attenuation", value: "1%" },
          { label: "Annual attenuation, years 2-30", value: "0.35%" },
        ],
      },
      {
        name: "Electrical characteristics (STC)",
        rows: [
          { label: "Maximum power (Pmax)", value: "640-670 W" },
          { label: "Open circuit voltage (Voc)", value: "53.80-54.40 V" },
          { label: "Voltage at maximum power (Vmp)", value: "45.10-45.50 V" },
          { label: "Short circuit current (Isc)", value: "14.94-15.32 A" },
          { label: "Current at maximum power (Imp)", value: "14.20-14.73 A" },
          { label: "Module efficiency", value: "23.7-24.8%" },
          { label: "Voc and Isc tolerance", value: "+/-3%" },
        ],
      },
      {
        name: "Mechanical parameters",
        rows: [
          { label: "Dimensions", value: "2382 x 1134 x 30 mm" },
          { label: "Weight", value: "32.3 kg +/-3%" },
          {
            label: "Glass",
            value: "Dual glass, 2.0 + 2.0 mm coated semi-tempered glass",
          },
          { label: "Frame", value: "Anodized aluminium" },
          { label: "Junction box", value: "IP68, 3 bypass diodes" },
          {
            label: "Connector",
            value: "MC4 compatible / original MC4-EVO2A",
          },
          {
            label: "Cable",
            value:
              "4 mm2 (IEC) / 12 AWG (UL), +400 mm, -200 mm / +/-1400 mm, or customized length",
          },
          {
            label: "Packaging",
            value: "36 pcs per pallet / 144 pcs per 20'GP / 720 pcs per 40'HC",
          },
        ],
      },
      {
        name: "Operating and safety",
        rows: [
          { label: "Operating temperature", value: "-40 C to +85 C" },
          { label: "Maximum system voltage", value: "DC1500 V" },
          { label: "Maximum series fuse rating", value: "30 A" },
          { label: "Protection class", value: "Class II" },
          { label: "Maximum static loading", value: "Front 5400 Pa / rear 2400 Pa" },
          { label: "Hail test", value: "25 mm diameter hail at 23 m/s" },
          { label: "Fire rating", value: "IEC Class A" },
          {
            label: "Temperature coefficient of Isc",
            value: "+0.05%/C",
          },
          {
            label: "Temperature coefficient of Voc",
            value: "-0.22%/C",
          },
          {
            label: "Temperature coefficient of Pmax",
            value: "-0.26%/C",
          },
        ],
      },
      {
        name: "Warranty and standards",
        rows: [
          {
            label: "Materials and processing warranty",
            value: "15 years",
          },
          {
            label: "Extra linear power output warranty",
            value: "30 years",
          },
          {
            label: "Management systems",
            value: "ISO 9001, ISO 14001, ISO 45001",
          },
          {
            label: "Environmental tests",
            value:
              "Salt spray IEC 61701, ammonia IEC 62716, sand/dust DIN EN 60068-2-68",
          },
        ],
      },
    ],
  },
  {
    slug: "longi-hi-mo-x10-lr8-66hvd",
    name: "LONGi Hi-MO X10 Scientist LR8-66HVD 640-665M",
    shortDescription:
      "LONGi Hi-MO X10 Scientist N-Type BC bifacial dual-glass module, 640-665W, up to 24.62% efficiency, supplied through LONEX.",
    description:
      "The LONGi Hi-MO X10 Scientist LR8-66HVD 640-665M is an N-Type back-contact (BC) bifacial dual-glass photovoltaic module using N-TaiRay, HPBC 2.0 and 0BB cell technology.\n\nLONEX supplies this model. The technical values shown here are reproduced from the manufacturer datasheet. Installations must follow the manufacturer's installation guide and applicable local requirements.\n\nAvailability, pricing and delivery terms are confirmed by LONEX in writing for each order.",
    seoTitle: "LONGi Hi-MO X10 Scientist LR8-66HVD 640-665M solar module",
    seoDescription:
      "LONGi Hi-MO X10 Scientist LR8-66HVD 640-665M N-Type BC bifacial solar module, 640-665W, up to 24.62% efficiency, supplied through LONEX.",
    sortOrder: 30,
    featuredSortOrder: 30,
    datasheet: {
      file: "longi-hi-mo-x10-lr8-66hvd-640-665m-datasheet.pdf",
      title: "LONGi Hi-MO X10 Scientist LR8-66HVD 640-665M datasheet (PDF)",
    },
    specs: [
      {
        name: "Module",
        rows: [
          {
            label: "Model",
            value: "Hi-MO X10 Scientist LR8-66HVD 640-665M",
            highlight: true,
          },
          { label: "Power range", value: "640-665 W", highlight: true },
          { label: "Maximum module efficiency", value: "24.62%", highlight: true },
          {
            label: "Cell technology",
            value: "N-TaiRay + HPBC 2.0 + 0BB (BC cell)",
          },
          { label: "Power tolerance", value: "0 to +3%" },
          { label: "Bifaciality", value: "75 +/-5%" },
          { label: "Cell orientation", value: "132 (6 x 22)" },
          { label: "First-year power degradation", value: "Less than 1%" },
          {
            label: "Year 2-30 annual power degradation",
            value: "0.35%",
          },
        ],
      },
      {
        name: "Electrical characteristics (STC)",
        rows: [
          { label: "Maximum power (Pmax)", value: "640-665 W" },
          { label: "Open circuit voltage (Voc)", value: "49.52-50.02 V" },
          { label: "Voltage at maximum power (Vmp)", value: "40.78-41.28 V" },
          { label: "Short circuit current (Isc)", value: "16.38-16.78 A" },
          { label: "Current at maximum power (Imp)", value: "15.69-16.11 A" },
          { label: "Module efficiency", value: "23.69-24.62%" },
        ],
      },
      {
        name: "Mechanical parameters",
        rows: [
          { label: "Dimensions", value: "2382 x 1134 x 30 mm" },
          { label: "Weight", value: "33.5 kg" },
          {
            label: "Glass",
            value: "Dual glass, 2.0 + 2.0 mm semi-tempered glass",
          },
          { label: "Frame", value: "Anodized aluminium alloy" },
          { label: "Junction box", value: "IP68, three diodes" },
          {
            label: "Output cable",
            value:
              "4 mm2, +400 mm / -200 mm, or +/-1400 mm; length can be customized",
          },
          {
            label: "Packaging",
            value: "36 pcs per pallet / 144 pcs per 20'GP / 720 pcs per 40'HC",
          },
        ],
      },
      {
        name: "Operating and safety",
        rows: [
          { label: "Operating temperature", value: "-40 C to +85 C" },
          { label: "Maximum system voltage", value: "DC1500 V (IEC)" },
          { label: "Maximum series fuse rating", value: "35 A" },
          { label: "Nominal operating cell temperature", value: "45 +/-2 C" },
          { label: "Protection class", value: "Class II" },
          { label: "Fire rating", value: "IEC Class C" },
          { label: "Front side maximum static loading", value: "5400 Pa" },
          { label: "Rear side maximum static loading", value: "2400 Pa" },
          {
            label: "Hailstone test",
            value: "25 mm hailstone at 23 m/s",
          },
          {
            label: "Temperature coefficient of Isc",
            value: "+0.050%/C",
          },
          {
            label: "Temperature coefficient of Voc",
            value: "-0.200%/C",
          },
          {
            label: "Temperature coefficient of Pmax",
            value: "-0.260%/C",
          },
        ],
      },
      {
        name: "Warranty and certification",
        rows: [
          {
            label: "Materials and processing warranty",
            value: "15 years",
          },
          {
            label: "Extra linear power output warranty",
            value: "30 years",
          },
          {
            label: "30-year power warranty",
            value: "95.85% at year 10, 92.35% at year 20, 88.85% at year 30",
          },
          {
            label: "Certifications",
            value:
              "IEC 61215, IEC 61730, IEC 62941, ISO 9001, ISO 14001, ISO 45001",
          },
          { label: "Marks", value: "TUV, CE" },
        ],
      },
    ],
  },
];

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

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
    // Another run already stored the exact same bytes.
    if (!isMissing(error)) {
      throw error;
    }
  }
}

async function main(): Promise<void> {
  const { and, eq } = await import("drizzle-orm");
  const { db, closeDbPool } = await import("../src/db/client");
  const {
    categories,
    mediaAssets,
    productDocuments,
    productSpecifications,
    products,
    publicPaths,
    siteSettings,
  } = await import("../src/db/schema");

  const [solar] = await db
    .select({ id: categories.id, slug: categories.slug })
    .from(categories)
    .where(eq(categories.slug, "solar"))
    .limit(1);

  if (!solar) {
    throw new Error(
      'The "Solar Panels" category (slug: solar) does not exist. Create it in the admin first.',
    );
  }

  const datasheetRoot = path.resolve(process.cwd(), "content", "datasheets");
  const storageRoot = path.resolve(
    process.cwd(),
    process.env.MEDIA_STORAGE_PATH || ".data/media",
  );

  for (const item of PRODUCTS) {
    const buffer = await readFile(path.join(datasheetRoot, item.datasheet.file));

    if (buffer.subarray(0, 5).toString("ascii") !== "%PDF-") {
      throw new Error(`${item.datasheet.file} is not a valid PDF file.`);
    }

    const digest = createHash("sha256").update(buffer).digest("hex");
    const storageKey = `seed-${digest}.pdf`;

    let [media] = await db
      .select({ id: mediaAssets.id })
      .from(mediaAssets)
      .where(eq(mediaAssets.storageKey, storageKey))
      .limit(1);

    if (!media) {
      await writeSeedFile(storageRoot, storageKey, buffer);

      const [inserted] = await db
        .insert(mediaAssets)
        .values({
          storageKey,
          originalName: item.datasheet.file,
          mimeType: "application/pdf",
          bytes: buffer.length,
          width: null,
          height: null,
          altText: `${item.name} datasheet`,
          uploadedBy: null,
        })
        .$returningId();

      media = { id: inserted.id };
      console.log(`Stored datasheet media #${media.id}: ${item.datasheet.file}`);
    } else {
      // Repair a missing file for an existing metadata row.
      await writeSeedFile(storageRoot, storageKey, buffer);
    }

    let [product] = await db
      .select({ id: products.id })
      .from(products)
      .where(and(eq(products.categoryId, solar.id), eq(products.slug, item.slug)))
      .limit(1);

    if (!product) {
      product = await db.transaction(async (tx) => {
        const [inserted] = await tx
          .insert(products)
          .values({
            categoryId: solar.id,
            name: item.name,
            slug: item.slug,
            shortDescription: item.shortDescription,
            description: item.description,
            price: null,
            showPrice: false,
            isFeatured: true,
            featuredSortOrder: item.featuredSortOrder,
            status: "published",
            sortOrder: item.sortOrder,
            seoTitle: item.seoTitle,
            seoDescription: item.seoDescription,
          })
          .$returningId();

        await tx.insert(publicPaths).values({
          path: `/${solar.slug}/${item.slug}`,
          ownerType: "product",
          ownerId: String(inserted.id),
          status: "published",
        });

        return inserted;
      });

      console.log(`Created product #${product.id}: ${item.name}`);
    } else {
      console.log(
        `Product #${product.id} already exists, content left unchanged: ${item.name}`,
      );
    }

    const publicPath = `/${solar.slug}/${item.slug}`;
    const [pathRow] = await db
      .select({
        id: publicPaths.id,
        ownerType: publicPaths.ownerType,
        ownerId: publicPaths.ownerId,
      })
      .from(publicPaths)
      .where(eq(publicPaths.path, publicPath))
      .limit(1);

    if (!pathRow) {
      await db.insert(publicPaths).values({
        path: publicPath,
        ownerType: "product",
        ownerId: String(product.id),
        status: "published",
      });
    } else if (
      pathRow.ownerType !== "product" ||
      pathRow.ownerId !== String(product.id)
    ) {
      console.warn(
        `Skipped public path ${publicPath}: it is claimed by ${pathRow.ownerType} #${pathRow.ownerId}.`,
      );
    }

    const [existingSpec] = await db
      .select({ id: productSpecifications.id })
      .from(productSpecifications)
      .where(eq(productSpecifications.productId, product.id))
      .limit(1);

    if (!existingSpec) {
      let sortOrder = 0;
      const rows = item.specs.flatMap((group) =>
        group.rows.map((row) => ({
          productId: product.id,
          groupName: group.name,
          label: row.label,
          value: row.value,
          isHighlight: row.highlight ?? false,
          sortOrder: (sortOrder += 1),
        })),
      );

      await db.insert(productSpecifications).values(rows);
      console.log(`  Added ${rows.length} specifications.`);
    } else {
      console.log("  Specifications already present; left unchanged.");
    }

    const [existingDocument] = await db
      .select({ id: productDocuments.id })
      .from(productDocuments)
      .where(
        and(
          eq(productDocuments.productId, product.id),
          eq(productDocuments.mediaId, media.id),
        ),
      )
      .limit(1);

    if (!existingDocument) {
      await db.insert(productDocuments).values({
        productId: product.id,
        mediaId: media.id,
        title: item.datasheet.title,
        sortOrder: 0,
      });
      console.log("  Linked datasheet document.");
    }

    console.log("");
  }

  // Seed contact details only where the CMS value is still empty, so an
  // administrator's later edit is never overwritten by a re-run.
  const [settingsRow] = await db
    .select({ valueJson: siteSettings.valueJson })
    .from(siteSettings)
    .where(eq(siteSettings.key, "site"))
    .limit(1);

  const current = isObject(settingsRow?.valueJson)
    ? settingsRow.valueJson
    : SETTINGS_FALLBACK;

  const currentSocial = isObject(current.social) ? current.social : {};

  const next = {
    ...SETTINGS_FALLBACK,
    ...current,
    address:
      typeof current.address === "string" && current.address.trim()
        ? current.address
        : CORPORATE_ADDRESS,
    contactPhone:
      typeof current.contactPhone === "string" && current.contactPhone.trim()
        ? current.contactPhone
        : CORPORATE_PHONE,
    whatsapp:
      typeof current.whatsapp === "string" && current.whatsapp.trim()
        ? current.whatsapp
        : CORPORATE_WHATSAPP,
    social: {
      ...SETTINGS_FALLBACK.social,
      ...currentSocial,
    },
  };

  const changed =
    next.address !== current.address ||
    next.contactPhone !== current.contactPhone ||
    next.whatsapp !== current.whatsapp;

  if (changed) {
    await db
      .insert(siteSettings)
      .values({ key: "site", valueJson: next, updatedBy: null })
      .onDuplicateKeyUpdate({
        set: { valueJson: next, updatedBy: null },
      });

    console.log(
      "Updated company contact settings (empty fields only): address, phone, WhatsApp.",
    );
  } else {
    console.log("Company contact settings already populated; left unchanged.");
  }

  await closeDbPool();
}

main()
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    // Avoid dumping raw driver errors that could contain query parameters.
    console.error(`Content seed failed: ${message}`);
    process.exit(1);
  });
