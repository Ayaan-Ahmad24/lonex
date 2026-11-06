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
import {
  createCategoryAction,
  updateCategoryAction,
} from "./actions";

export type CategoryFormValues = {
  id: number;
  name: string;
  slug: string;
  description: string;
  coverMediaId: number | null;
  status: string;
  sortOrder: number;
};

export function CategoryForm({
  category,
  mediaOptions,
  canPublish,
}: {
  category?: CategoryFormValues;
  mediaOptions: { id: number; label: string }[];
  canPublish: boolean;
}) {
  const editing = Boolean(category);

  return (
    <ActionForm
      action={editing ? updateCategoryAction : createCategoryAction}
      className="space-y-6"
      hiddenFields={editing ? { id: category?.id } : undefined}
    >
      <Card>
        <CardHeader
          title="Category details"
          description="The slug becomes the public URL /{slug}. Changing it creates a permanent redirect."
        />
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <FormField label="Name" htmlFor="name" required>
            <TextInput
              id="name"
              name="name"
              defaultValue={category?.name ?? ""}
              maxLength={120}
              required
            />
          </FormField>
          <FormField
            label="Slug"
            htmlFor="slug"
            required
            hint="Lowercase letters, numbers and dashes."
          >
            <TextInput
              id="slug"
              name="slug"
              defaultValue={category?.slug ?? ""}
              maxLength={120}
              required
            />
          </FormField>
          <FormField
            label="Description"
            htmlFor="description"
            className="sm:col-span-2"
            hint="Only publish approved client copy. Leave blank until supplied."
          >
            <Textarea
              id="description"
              name="description"
              defaultValue={category?.description ?? ""}
              rows={4}
              maxLength={5000}
            />
          </FormField>
          <FormField label="Cover image" htmlFor="coverMediaId">
            <Select
              id="coverMediaId"
              name="coverMediaId"
              defaultValue={
                category?.coverMediaId ? String(category.coverMediaId) : ""
              }
            >
              <option value="">No image</option>
              {mediaOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField
            label="Priority"
            htmlFor="sortOrder"
            hint="Lower numbers appear first in the public catalogue. Whole numbers only, e.g. 10, 20, 30."
          >
            <TextInput
              id="sortOrder"
              name="sortOrder"
              type="number"
              inputMode="numeric"
              defaultValue={category?.sortOrder ?? 0}
              step={1}
              min={-100000}
              max={100000}
              required
            />
          </FormField>
          <FormField label="Status" htmlFor="status">
            {canPublish ? (
              <Select
                id="status"
                name="status"
                defaultValue={category?.status ?? "draft"}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </Select>
            ) : (
              <>
                <input
                  type="hidden"
                  name="status"
                  value={category?.status ?? "draft"}
                />
                <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  Publishing is disabled for your role.
                </p>
              </>
            )}
          </FormField>
        </CardBody>
      </Card>

      <div className="flex justify-end">
        <SubmitButton
          label={editing ? "Save category" : "Create category"}
          pendingLabel="Saving..."
        />
      </div>
    </ActionForm>
  );
}
