"use client";

import { useEffect, useRef, useState } from "react";
import { ActionForm } from "@/admin/core/ui/action-form";
import { Card, CardBody, CardHeader } from "@/admin/core/ui/card";
import {
  Checkbox,
  FormField,
  Select,
  TextInput,
  Textarea,
} from "@/admin/core/ui/form-fields";
import { SubmitButton } from "@/admin/core/ui/submit-button";
import { buttonClassName } from "@/admin/core/ui/button";
import type { ProductDetail } from "./queries";
import { createProductAction, updateProductAction } from "./actions";

type ImageRow = {
  key: number;
  mediaId: string;
  alt: string;
  isPrimary: boolean;
};

type SpecRow = {
  key: number;
  groupName: string;
  label: string;
  value: string;
  isHighlight: boolean;
};

type DocumentRow = {
  key: number;
  mediaId: string;
  title: string;
};

export function ProductForm({
  product,
  categoryOptions,
  imageOptions,
  pdfOptions,
  canPublish,
}: {
  product?: ProductDetail;
  categoryOptions: { id: number; name: string; status: string }[];
  imageOptions: { id: number; label: string }[];
  pdfOptions: { id: number; label: string }[];
  canPublish: boolean;
}) {
  const editing = Boolean(product);
  const nextKey = useRef(1);

  useEffect(() => {
    nextKey.current =
      Math.max(
        product?.images.length ?? 0,
        product?.specifications.length ?? 0,
        product?.documents.length ?? 0,
      ) + 1;
  }, [product]);

  const [images, setImages] = useState<ImageRow[]>(
    product?.images.map((image, index) => ({
      key: index + 1,
      mediaId: String(image.mediaId),
      alt: image.alt,
      isPrimary: image.isPrimary,
    })) ?? [],
  );

  const [specifications, setSpecifications] = useState<SpecRow[]>(
    product?.specifications.map((spec, index) => ({
      key: index + 1,
      groupName: spec.groupName,
      label: spec.label,
      value: spec.value,
      isHighlight: spec.isHighlight,
    })) ?? [],
  );

  const [documents, setDocuments] = useState<DocumentRow[]>(
    product?.documents.map((document, index) => ({
      key: index + 1,
      mediaId: String(document.mediaId),
      title: document.title,
    })) ?? [],
  );

  function makePrimary(key: number) {
    setImages((rows) =>
      rows.map((row) => ({ ...row, isPrimary: row.key === key })),
    );
  }

  return (
    <ActionForm
      action={editing ? updateProductAction : createProductAction}
      className="space-y-6"
      hiddenFields={editing ? { id: product?.id } : undefined}
    >
      <Card>
        <CardHeader
          title="Product details"
          description="The public URL is /{category-slug}/{product-slug}. Moving the product to another category keeps an old-URL redirect."
        />
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <FormField label="Category" htmlFor="categoryId" required>
            <Select
              id="categoryId"
              name="categoryId"
              defaultValue={product ? String(product.categoryId) : ""}
              required
            >
              <option value="">Choose a category</option>
              {categoryOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                  {option.status === "draft" ? " (draft)" : ""}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Name" htmlFor="name" required>
            <TextInput
              id="name"
              name="name"
              defaultValue={product?.name ?? ""}
              maxLength={200}
              required
            />
          </FormField>
          <FormField label="Slug" htmlFor="slug" required>
            <TextInput
              id="slug"
              name="slug"
              defaultValue={product?.slug ?? ""}
              maxLength={200}
              required
            />
          </FormField>
          <FormField label="Sort order" htmlFor="sortOrder">
            <TextInput
              id="sortOrder"
              name="sortOrder"
              type="number"
              defaultValue={product?.sortOrder ?? 0}
            />
          </FormField>
          <FormField
            label="Short description"
            htmlFor="shortDescription"
            className="sm:col-span-2"
            hint="Used on cards and as a metadata fallback. Leave blank until approved copy exists."
          >
            <Textarea
              id="shortDescription"
              name="shortDescription"
              defaultValue={product?.shortDescription ?? ""}
              maxLength={500}
              rows={2}
            />
          </FormField>
          <FormField
            label="Full description"
            htmlFor="description"
            className="sm:col-span-2"
            hint="Plain text. Do not publish specifications or claims that the client has not approved."
          >
            <Textarea
              id="description"
              name="description"
              defaultValue={product?.description ?? ""}
              maxLength={20000}
              rows={6}
            />
          </FormField>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Pricing"
          description="Prices are optional and hidden by default. When hidden, the amount never enters the public page, props, metadata or structured data."
        />
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="Price (PKR)"
            htmlFor="price"
            hint="Required only when 'Show price' is enabled."
          >
            <TextInput
              id="price"
              name="price"
              inputMode="decimal"
              defaultValue={product?.price ?? ""}
              placeholder="e.g. 125000"
              maxLength={20}
            />
          </FormField>
          <div className="flex items-end pb-2">
            <Checkbox
              name="showPrice"
              label="Show this price publicly"
              defaultChecked={product?.showPrice ?? false}
            />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Featured placement"
          description="Featured products can appear on the homepage spotlight."
        />
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-end pb-2">
            <Checkbox
              name="isFeatured"
              label="Featured product"
              defaultChecked={product?.isFeatured ?? false}
            />
          </div>
          <FormField label="Featured order" htmlFor="featuredSortOrder">
            <TextInput
              id="featuredSortOrder"
              name="featuredSortOrder"
              type="number"
              defaultValue={product?.featuredSortOrder ?? 0}
            />
          </FormField>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Image gallery"
          description="Choose validated uploads from the media library. The primary image is used on cards."
          action={
            <button
              type="button"
              className={buttonClassName("secondary", "sm")}
              onClick={() =>
                setImages((rows) => [
                  ...rows,
                  {
                    key: nextKey.current++,
                    mediaId: "",
                    alt: "",
                    isPrimary: rows.length === 0,
                  },
                ])
              }
            >
              Add image
            </button>
          }
        />
        <CardBody className="space-y-4">
          {images.length === 0 ? (
            <p className="text-sm text-slate-500">
              No gallery images. Product cards fall back to a labelled
              development placeholder.
            </p>
          ) : null}
          {images.map((image, index) => (
            <div
              key={image.key}
              className="grid gap-3 rounded-lg border border-slate-200 p-3 sm:grid-cols-[1fr_1fr_auto]"
            >
              <FormField label={`Image ${index + 1}`} htmlFor={`image-${image.key}`}>
                <Select
                  id={`image-${image.key}`}
                  name={`images[${image.key}][mediaId]`}
                  value={image.mediaId}
                  onChange={(event) =>
                    setImages((rows) =>
                      rows.map((row) =>
                        row.key === image.key
                          ? { ...row, mediaId: event.target.value }
                          : row,
                      ),
                    )
                  }
                >
                  <option value="">Choose media</option>
                  {imageOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Alt text" htmlFor={`image-alt-${image.key}`}>
                <TextInput
                  id={`image-alt-${image.key}`}
                  name={`images[${image.key}][alt]`}
                  value={image.alt}
                  maxLength={500}
                  onChange={(event) =>
                    setImages((rows) =>
                      rows.map((row) =>
                        row.key === image.key
                          ? { ...row, alt: event.target.value }
                          : row,
                      ),
                    )
                  }
                />
              </FormField>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 text-xs text-slate-600">
                  <input
                    type="checkbox"
                    name={`images[${image.key}][isPrimary]`}
                    checked={image.isPrimary}
                    onChange={() => makePrimary(image.key)}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  Primary
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setImages((rows) => {
                      const remaining = rows.filter(
                        (row) => row.key !== image.key,
                      );

                      if (
                        image.isPrimary &&
                        remaining.length > 0 &&
                        !remaining.some((row) => row.isPrimary)
                      ) {
                        remaining[0] = { ...remaining[0], isPrimary: true };
                      }

                      return remaining;
                    })
                  }
                  className="text-xs font-medium text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Technical specifications"
          description="Grouped label/value rows. At most four rows can be highlighted."
          action={
            <button
              type="button"
              className={buttonClassName("secondary", "sm")}
              onClick={() =>
                setSpecifications((rows) => [
                  ...rows,
                  {
                    key: nextKey.current++,
                    groupName: "",
                    label: "",
                    value: "",
                    isHighlight: false,
                  },
                ])
              }
            >
              Add specification
            </button>
          }
        />
        <CardBody className="space-y-3">
          {specifications.length === 0 ? (
            <p className="text-sm text-slate-500">
              No specifications. Do not invent values; add approved data only.
            </p>
          ) : null}
          {specifications.map((spec, index) => (
            <div
              key={spec.key}
              className="grid gap-3 rounded-lg border border-slate-200 p-3 sm:grid-cols-4"
            >
              <FormField label={`Group ${index + 1}`} htmlFor={`spec-group-${spec.key}`}>
                <TextInput
                  id={`spec-group-${spec.key}`}
                  name={`specifications[${spec.key}][groupName]`}
                  value={spec.groupName}
                  maxLength={100}
                  placeholder="General"
                  onChange={(event) =>
                    setSpecifications((rows) =>
                      rows.map((row) =>
                        row.key === spec.key
                          ? { ...row, groupName: event.target.value }
                          : row,
                      ),
                    )
                  }
                />
              </FormField>
              <FormField label="Label" htmlFor={`spec-label-${spec.key}`}>
                <TextInput
                  id={`spec-label-${spec.key}`}
                  name={`specifications[${spec.key}][label]`}
                  value={spec.label}
                  maxLength={150}
                  onChange={(event) =>
                    setSpecifications((rows) =>
                      rows.map((row) =>
                        row.key === spec.key
                          ? { ...row, label: event.target.value }
                          : row,
                      ),
                    )
                  }
                />
              </FormField>
              <FormField label="Value" htmlFor={`spec-value-${spec.key}`}>
                <TextInput
                  id={`spec-value-${spec.key}`}
                  name={`specifications[${spec.key}][value]`}
                  value={spec.value}
                  maxLength={300}
                  onChange={(event) =>
                    setSpecifications((rows) =>
                      rows.map((row) =>
                        row.key === spec.key
                          ? { ...row, value: event.target.value }
                          : row,
                      ),
                    )
                  }
                />
              </FormField>
              <div className="flex items-end justify-between gap-2 pb-2">
                <label className="flex items-center gap-1.5 text-xs text-slate-600">
                  <input
                    type="checkbox"
                    name={`specifications[${spec.key}][isHighlight]`}
                    checked={spec.isHighlight}
                    onChange={(event) =>
                      setSpecifications((rows) =>
                        rows.map((row) =>
                          row.key === spec.key
                            ? { ...row, isHighlight: event.target.checked }
                            : row,
                        ),
                      )
                    }
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  Highlight
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setSpecifications((rows) =>
                      rows.filter((row) => row.key !== spec.key),
                    )
                  }
                  className="text-xs font-medium text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="PDF datasheets"
          description="Only validated PDF uploads are accepted and served as attachments."
          action={
            <button
              type="button"
              className={buttonClassName("secondary", "sm")}
              onClick={() =>
                setDocuments((rows) => [
                  ...rows,
                  { key: nextKey.current++, mediaId: "", title: "" },
                ])
              }
            >
              Add datasheet
            </button>
          }
        />
        <CardBody className="space-y-3">
          {documents.length === 0 ? (
            <p className="text-sm text-slate-500">
              No documents attached.
            </p>
          ) : null}
          {documents.map((document, index) => (
            <div
              key={document.key}
              className="grid gap-3 rounded-lg border border-slate-200 p-3 sm:grid-cols-[1fr_1fr_auto]"
            >
              <FormField label={`PDF ${index + 1}`} htmlFor={`doc-${document.key}`}>
                <Select
                  id={`doc-${document.key}`}
                  name={`documents[${document.key}][mediaId]`}
                  value={document.mediaId}
                  onChange={(event) =>
                    setDocuments((rows) =>
                      rows.map((row) =>
                        row.key === document.key
                          ? { ...row, mediaId: event.target.value }
                          : row,
                      ),
                    )
                  }
                >
                  <option value="">Choose PDF</option>
                  {pdfOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Title" htmlFor={`doc-title-${document.key}`}>
                <TextInput
                  id={`doc-title-${document.key}`}
                  name={`documents[${document.key}][title]`}
                  value={document.title}
                  maxLength={200}
                  onChange={(event) =>
                    setDocuments((rows) =>
                      rows.map((row) =>
                        row.key === document.key
                          ? { ...row, title: event.target.value }
                          : row,
                      ),
                    )
                  }
                />
              </FormField>
              <div className="flex items-end pb-2">
                <button
                  type="button"
                  onClick={() =>
                    setDocuments((rows) =>
                      rows.filter((row) => row.key !== document.key),
                    )
                  }
                  className="text-xs font-medium text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Search appearance"
          description="Optional overrides. Empty values fall back to the product name and short description."
        />
        <CardBody className="grid gap-4">
          <FormField label="SEO title" htmlFor="seoTitle">
            <TextInput
              id="seoTitle"
              name="seoTitle"
              defaultValue={product?.seoTitle ?? ""}
              maxLength={255}
            />
          </FormField>
          <FormField label="SEO description" htmlFor="seoDescription">
            <Textarea
              id="seoDescription"
              name="seoDescription"
              defaultValue={product?.seoDescription ?? ""}
              maxLength={500}
              rows={2}
            />
          </FormField>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Publication" />
        <CardBody>
          <FormField label="Status" htmlFor="status">
            {canPublish ? (
              <Select
                id="status"
                name="status"
                defaultValue={product?.status ?? "draft"}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </Select>
            ) : (
              <>
                <input
                  type="hidden"
                  name="status"
                  value={product?.status ?? "draft"}
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
          label={editing ? "Save product" : "Create product"}
          pendingLabel="Saving..."
        />
      </div>
    </ActionForm>
  );
}
