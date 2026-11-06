"use client";

import { ActionForm } from "@/admin/core/ui/action-form";
import { Card, CardBody, CardHeader } from "@/admin/core/ui/card";
import {
  FormField,
  Select,
  TextInput,
  Textarea,
} from "@/admin/core/ui/form-fields";
import { SubmitButton } from "@/admin/core/ui/submit-button";
import { createBlogPostAction, updateBlogPostAction } from "./actions";
import { BlogEditor } from "./blog-editor";
import { BlogCoverImagePicker } from "./cover-image-picker";

export type BlogFormValues = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  contentHtml: string;
  coverMediaId: number | null;
  seoTitle: string;
  seoDescription: string;
  status: string;
};

export function BlogForm({
  post,
  mediaOptions,
  canPublish,
}: {
  post?: BlogFormValues;
  mediaOptions: { id: number; label: string; mimeType: string }[];
  canPublish: boolean;
}) {
  const editing = Boolean(post);

  return (
    <ActionForm
      action={editing ? updateBlogPostAction : createBlogPostAction}
      className="space-y-6"
      hiddenFields={editing ? { id: post?.id } : undefined}
    >
      <Card>
        <CardHeader
          title="Article"
          description="Public URL: /blog/{slug}. Changing the slug keeps a permanent redirect."
        />
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <FormField label="Title" htmlFor="title" required>
            <TextInput
              id="title"
              name="title"
              defaultValue={post?.title ?? ""}
              maxLength={255}
              required
            />
          </FormField>
          <FormField label="Slug" htmlFor="slug" required>
            <TextInput
              id="slug"
              name="slug"
              defaultValue={post?.slug ?? ""}
              maxLength={200}
              required
            />
          </FormField>
          <FormField
            label="Excerpt"
            htmlFor="excerpt"
            className="sm:col-span-2"
            hint="Short summary used on cards and as the metadata fallback."
          >
            <Textarea
              id="excerpt"
              name="excerpt"
              defaultValue={post?.excerpt ?? ""}
              maxLength={500}
              rows={2}
            />
          </FormField>
          <FormField label="Cover image" htmlFor="coverMediaId">
            <BlogCoverImagePicker
              selectedMediaId={post?.coverMediaId ?? null}
              onSelect={() => {
                // Picker manages its own hidden form field internally.
              }}
              mediaOptions={mediaOptions}
            />
          </FormField>
          <FormField label="Status" htmlFor="status">
            {canPublish ? (
              <Select
                id="status"
                name="status"
                defaultValue={post?.status ?? "draft"}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </Select>
            ) : (
              <>
                <input
                  type="hidden"
                  name="status"
                  value={post?.status ?? "draft"}
                />
                <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  Publishing is disabled for your role.
                </p>
              </>
            )}
          </FormField>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Content"
          description="Write in Visual mode, edit the source HTML, or review the Preview. Scripts, iframes, forms, SVG and event handlers are rejected on save."
        />
        <CardBody>
          <FormField
            label="Article body"
            htmlFor="content"
            hint="Formatting is stored as safe structured blocks, never raw HTML. Switching modes keeps your unsaved content."
          >
            <BlogEditor name="content" initialHtml={post?.contentHtml ?? ""} />
          </FormField>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Search appearance"
          description="Optional overrides. Empty values fall back to the title and excerpt."
        />
        <CardBody className="grid gap-4">
          <FormField label="SEO title" htmlFor="seoTitle">
            <TextInput
              id="seoTitle"
              name="seoTitle"
              defaultValue={post?.seoTitle ?? ""}
              maxLength={255}
            />
          </FormField>
          <FormField label="SEO description" htmlFor="seoDescription">
            <Textarea
              id="seoDescription"
              name="seoDescription"
              defaultValue={post?.seoDescription ?? ""}
              maxLength={500}
              rows={2}
            />
          </FormField>
        </CardBody>
      </Card>

      <div className="flex justify-end">
        <SubmitButton
          label={editing ? "Save article" : "Create article"}
          pendingLabel="Saving..."
        />
      </div>
    </ActionForm>
  );
}
