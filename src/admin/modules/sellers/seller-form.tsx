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
import { SellerImageUploader } from "./seller-image-uploader";
import { createSellerAction, updateSellerAction } from "./actions";

export type SellerFormValues = {
  id: number;
  name: string;
  city: string;
  address: string;
  phone: string;
  whatsapp: string;
  googleMapsUrl: string;
  imageMediaId: number | null;
  imageUrl: string | null;
  imageAlt: string | null;
  sortOrder: number;
  status: string;
};

export function SellerForm({ seller }: { seller?: SellerFormValues }) {
  const editing = Boolean(seller);

  return (
    <ActionForm
      action={editing ? updateSellerAction : createSellerAction}
      className="space-y-6"
      hiddenFields={editing ? { id: seller?.id } : undefined}
    >
      <Card>
        <CardHeader
          title="Seller details"
          description="Only active sellers appear in the public directory. Use approved business details only."
        />
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <FormField label="Seller name" htmlFor="name" required>
            <TextInput
              id="name"
              name="name"
              defaultValue={seller?.name ?? ""}
              maxLength={200}
              required
            />
          </FormField>
          <FormField label="City" htmlFor="city" required>
            <TextInput
              id="city"
              name="city"
              defaultValue={seller?.city ?? ""}
              maxLength={120}
              required
            />
          </FormField>
          <FormField label="Address" htmlFor="address" className="sm:col-span-2" required>
            <Textarea
              id="address"
              name="address"
              defaultValue={seller?.address ?? ""}
              maxLength={300}
              rows={2}
              required
            />
          </FormField>
          <FormField label="Phone" htmlFor="phone" required>
            <TextInput
              id="phone"
              name="phone"
              type="tel"
              defaultValue={seller?.phone ?? ""}
              maxLength={50}
              required
            />
          </FormField>
          <FormField
            label="WhatsApp"
            htmlFor="whatsapp"
            hint="Optional. Include the country code."
          >
            <TextInput
              id="whatsapp"
              name="whatsapp"
              type="tel"
              defaultValue={seller?.whatsapp ?? ""}
              maxLength={50}
            />
          </FormField>
          <FormField
            label="Google Maps URL"
            htmlFor="googleMapsUrl"
            className="sm:col-span-2"
            hint="HTTPS link to the exact location."
          >
            <TextInput
              id="googleMapsUrl"
              name="googleMapsUrl"
              type="url"
              defaultValue={seller?.googleMapsUrl ?? ""}
              placeholder="https://maps.google.com/..."
              maxLength={500}
            />
          </FormField>
          {/* Full-width image uploader so the preview area stays large. */}
          <div className="sm:col-span-2">
            <SellerImageUploader
              imageMediaId={seller?.imageMediaId ?? null}
              imageUrl={seller?.imageUrl ?? null}
              imageAlt={seller?.imageAlt ?? null}
              onImageMediaIdChange={() => {
                // The hidden input inside SellerImageUploader submits with the form.
              }}
            />
          </div>
          <FormField label="Sort order" htmlFor="sortOrder">
            <TextInput
              id="sortOrder"
              name="sortOrder"
              type="number"
              defaultValue={seller?.sortOrder ?? 0}
            />
          </FormField>
          <FormField label="Status" htmlFor="status">
            <Select
              id="status"
              name="status"
              defaultValue={seller?.status ?? "active"}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>
          </FormField>
        </CardBody>
      </Card>

      <div className="flex justify-end">
        <SubmitButton
          label={editing ? "Save seller" : "Create seller"}
          pendingLabel="Saving..."
        />
      </div>
    </ActionForm>
  );
}
