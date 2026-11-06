import { z } from "zod";
import { validateProductSlug } from "@/lib/content/slug";
import {
  formCheckbox,
  formInteger,
  formOptionalId,
  formText,
  collectFieldErrors,
  type ParsedForm,
} from "@/lib/validation/form";
import { contentStatusSchema } from "@/admin/modules/categories/schema";

const slugSchema = z
  .string()
  .trim()
  .min(1, "Slug is required.")
  .max(200)
  .superRefine((value, context) => {
    const result = validateProductSlug(value);

    if (!result.ok) {
      context.addIssue({ code: "custom", message: result.reason });
    }
  })
  .transform((value) => {
    const result = validateProductSlug(value);
    return result.ok ? result.slug : "";
  });

const optionalText = (max: number) => z.string().trim().max(max).default("");

const priceSchema = z
  .string()
  .trim()
  .max(20)
  .transform((value) => value.replace(/,/g, ""))
  .transform((value) => (value === "" ? null : value))
  .superRefine((value, context) => {
    if (value === null) {
      return;
    }

    if (!/^\d{1,10}(\.\d{1,2})?$/.test(value)) {
      context.addIssue({
        code: "custom",
        message: "Enter an amount in PKR with up to two decimal places.",
      });
      return;
    }

    if (Number(value) <= 0) {
      context.addIssue({ code: "custom", message: "Price must be greater than zero." });
    }
  })
  .transform((value) => (value === null ? null : Number(value)));

export const productImageInputSchema = z.object({
  mediaId: z.number().int().positive(),
  alt: z.string().trim().max(500).default(""),
  isPrimary: z.boolean().default(false),
});

export const productSpecificationInputSchema = z.object({
  groupName: z.string().trim().max(100).default(""),
  label: z.string().trim().min(1, "Specification label is required.").max(150),
  value: z.string().trim().min(1, "Specification value is required.").max(300),
  isHighlight: z.boolean().default(false),
});

export const productDocumentInputSchema = z.object({
  mediaId: z.number().int().positive(),
  title: z.string().trim().min(1, "Document title is required.").max(200),
});

export const productSchema = z
  .object({
    categoryId: z.number().int().positive("Choose a category."),
    name: z.string().trim().min(2, "Name is required.").max(200),
    slug: slugSchema,
    shortDescription: optionalText(500),
    description: optionalText(20000),
    price: priceSchema,
    showPrice: z.boolean().default(false),
    isFeatured: z.boolean().default(false),
    featuredSortOrder: z.number().int().min(-100000).max(100000).default(0),
    status: contentStatusSchema.default("draft"),
    sortOrder: z.number().int().min(-100000).max(100000).default(0),
    seoTitle: optionalText(255),
    seoDescription: optionalText(500),
    images: z.array(productImageInputSchema).max(20).default([]),
    specifications: z.array(productSpecificationInputSchema).max(200).default([]),
    documents: z.array(productDocumentInputSchema).max(20).default([]),
  })
  .superRefine((value, context) => {
    if (value.showPrice && value.price === null) {
      context.addIssue({
        code: "custom",
        path: ["price"],
        message: "A positive price is required when the price is shown.",
      });
    }

    const highlights = value.specifications.filter((spec) => spec.isHighlight);

    if (highlights.length > 4) {
      context.addIssue({
        code: "custom",
        path: ["specifications"],
        message: "Select at most four highlighted specifications.",
      });
    }

    const imageIds = value.images.map((image) => image.mediaId);

    if (new Set(imageIds).size !== imageIds.length) {
      context.addIssue({
        code: "custom",
        path: ["images"],
        message: "The same image cannot be added twice.",
      });
    }

    const documentIds = value.documents.map((document) => document.mediaId);

    if (new Set(documentIds).size !== documentIds.length) {
      context.addIssue({
        code: "custom",
        path: ["documents"],
        message: "The same document cannot be added twice.",
      });
    }
  });

export type ProductInput = z.infer<typeof productSchema>;
export type ProductImageInput = z.infer<typeof productImageInputSchema>;
export type ProductSpecificationInput = z.infer<
  typeof productSpecificationInputSchema
>;
export type ProductDocumentInput = z.infer<typeof productDocumentInputSchema>;

type Indexed = Record<string, Record<string, string>>;

function collectIndexed(formData: FormData, prefix: string): Indexed {
  const pattern = new RegExp(`^${prefix}\\[(\\d+)\\]\\[([a-zA-Z]+)\\]$`);
  const rows: Indexed = {};

  for (const [key, value] of formData.entries()) {
    const match = pattern.exec(key);

    if (!match || typeof value !== "string") {
      continue;
    }

    const index = match[1];
    rows[index] = rows[index] ?? {};
    rows[index][match[2]] = value;
  }

  return rows;
}

function ordered(rows: Indexed): Record<string, string>[] {
  return Object.keys(rows)
    .sort((a, b) => Number(a) - Number(b))
    .map((key) => rows[key]);
}

function parseBoolean(value: string | undefined): boolean {
  return value === "on" || value === "true" || value === "1";
}

export function parseProductForm(formData: FormData): ParsedForm<ProductInput> {
  const images = ordered(collectIndexed(formData, "images"))
    .map((row) => ({
      mediaId: Number(row.mediaId),
      alt: row.alt ?? "",
      isPrimary: parseBoolean(row.isPrimary),
    }))
    .filter((row) => Number.isInteger(row.mediaId) && row.mediaId > 0);

  const specifications = ordered(collectIndexed(formData, "specifications"))
    .map((row) => ({
      groupName: row.groupName ?? "",
      label: row.label ?? "",
      value: row.value ?? "",
      isHighlight: parseBoolean(row.isHighlight),
    }))
    .filter(
      (row) =>
        row.groupName.trim() !== "" ||
        row.label.trim() !== "" ||
        row.value.trim() !== "",
    );

  const documents = ordered(collectIndexed(formData, "documents"))
    .map((row) => ({
      mediaId: Number(row.mediaId),
      title: row.title ?? "",
    }))
    .filter((row) => Number.isInteger(row.mediaId) && row.mediaId > 0);

  const candidate = {
    categoryId: formOptionalId(formData.get("categoryId")) ?? 0,
    name: formText(formData.get("name")),
    slug: formText(formData.get("slug")),
    shortDescription: formText(formData.get("shortDescription")),
    description: formText(formData.get("description")),
    price: formText(formData.get("price")),
    showPrice: formCheckbox(formData.get("showPrice")),
    isFeatured: formCheckbox(formData.get("isFeatured")),
    featuredSortOrder: formInteger(formData.get("featuredSortOrder")),
    status: formText(formData.get("status")) || "draft",
    sortOrder: formInteger(formData.get("sortOrder")),
    seoTitle: formText(formData.get("seoTitle")),
    seoDescription: formText(formData.get("seoDescription")),
    images,
    specifications,
    documents,
  };

  const parsed = productSchema.safeParse(candidate);

  if (!parsed.success) {
    const errors = collectFieldErrors(parsed.error);

    // Surface the first nested error at the top of the form too.
    return { ok: false, errors };
  }

  return { ok: true, data: parsed.data };
}
