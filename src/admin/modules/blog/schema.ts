import { z } from "zod";
import { validateBlogSlug } from "@/lib/content/slug";
import {
  type RichTextDocument,
} from "@/lib/content/rich-text";
import { parseRichTextHtml } from "@/lib/content/blog-content";
import {
  collectFieldErrors,
  formOptionalId,
  formText,
  type ParsedForm,
} from "@/lib/validation/form";
import { contentStatusSchema } from "@/admin/modules/categories/schema";

const slugSchema = z
  .string()
  .trim()
  .min(1, "Slug is required.")
  .max(200)
  .superRefine((value, context) => {
    const result = validateBlogSlug(value);

    if (!result.ok) {
      context.addIssue({ code: "custom", message: result.reason });
    }
  })
  .transform((value) => {
    const result = validateBlogSlug(value);
    return result.ok ? result.slug : "";
  });

const baseSchema = z.object({
  title: z.string().trim().min(3, "Title is required.").max(255),
  slug: slugSchema,
  excerpt: z.string().trim().max(500).default(""),
  content: z.string().trim().min(1, "Article content is required.").max(50000),
  coverMediaId: z.number().int().positive().nullable().default(null),
  seoTitle: z.string().trim().max(255).default(""),
  seoDescription: z.string().trim().max(500).default(""),
  status: contentStatusSchema.default("draft"),
});

export type BlogInput = Omit<z.infer<typeof baseSchema>, "content"> & {
  document: RichTextDocument;
};

export function parseBlogForm(formData: FormData): ParsedForm<BlogInput> {
  const parsed = baseSchema.safeParse({
    title: formText(formData.get("title")),
    slug: formText(formData.get("slug")),
    excerpt: formText(formData.get("excerpt")),
    content: formText(formData.get("content")),
    coverMediaId: formOptionalId(formData.get("coverMediaId")),
    seoTitle: formText(formData.get("seoTitle")),
    seoDescription: formText(formData.get("seoDescription")),
    status: formText(formData.get("status")) || "draft",
  });

  if (!parsed.success) {
    return { ok: false, errors: collectFieldErrors(parsed.error) };
  }

  const content = parseRichTextHtml(parsed.data.content);

  if (!content.ok) {
    return { ok: false, errors: { content: content.reason } };
  }

  return {
    ok: true,
    data: {
      title: parsed.data.title,
      slug: parsed.data.slug,
      excerpt: parsed.data.excerpt,
      coverMediaId: parsed.data.coverMediaId,
      seoTitle: parsed.data.seoTitle,
      seoDescription: parsed.data.seoDescription,
      status: parsed.data.status,
      document: content.document,
    },
  };
}
