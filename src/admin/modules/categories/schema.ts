import { z } from "zod";
import { validateCategorySlug } from "@/lib/content/slug";
import {
  formOptionalId,
  formText,
  parseForm,
  type ParsedForm,
} from "@/lib/validation/form";

export const contentStatusSchema = z.enum(["draft", "published"]);
export type ContentStatus = z.infer<typeof contentStatusSchema>;

const slugSchema = z
  .string()
  .trim()
  .min(1, "Slug is required.")
  .max(120)
  .superRefine((value, context) => {
    const result = validateCategorySlug(value);

    if (!result.ok) {
      context.addIssue({ code: "custom", message: result.reason });
    }
  })
  .transform((value) => validateCategorySlug(value))
  .transform((result) => (result.ok ? result.slug : ""));

export const categorySchema = z.object({
  name: z.string().trim().min(2, "Name is required.").max(120),
  slug: slugSchema,
  description: z.string().trim().max(5000).default(""),
  coverMediaId: z.number().int().positive().nullable().default(null),
  status: contentStatusSchema.default("draft"),
  // Parsed from the raw form string so invalid input gets a field error instead
  // of silently becoming 0. Blank means "no preference" (0).
  sortOrder: z
    .string()
    .trim()
    .refine((value) => value === "" || /^-?\d+$/.test(value), {
      message: "Priority must be a whole number.",
    })
    .transform((value) => (value === "" ? 0 : Number(value)))
    .refine((value) => value >= -100000 && value <= 100000, {
      message: "Priority must be between -100000 and 100000.",
    }),
});

export type CategoryInput = z.infer<typeof categorySchema>;

export function parseCategoryForm(formData: FormData): ParsedForm<CategoryInput> {
  return parseForm(categorySchema, {
    name: formText(formData.get("name")),
    slug: formText(formData.get("slug")),
    description: formText(formData.get("description")),
    coverMediaId: formOptionalId(formData.get("coverMediaId")),
    status: formText(formData.get("status")) || "draft",
    sortOrder: formText(formData.get("sortOrder")),
  });
}
