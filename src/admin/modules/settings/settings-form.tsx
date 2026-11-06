"use client";

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
import type { SiteSettings } from "@/admin/core/settings/schema";
import { saveSettingsAction } from "@/admin/modules/settings/actions";

export function SettingsForm({
  settings,
  mediaOptions,
}: {
  settings: SiteSettings;
  mediaOptions: { id: number; label: string }[];
}) {
  return (
    <ActionForm action={saveSettingsAction} className="space-y-6">
      <Card>
        <CardHeader
          title="Public identity"
          description="Shown on the public website when the Phase 04 layout consumes these values."
        />
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <FormField label="Website name" htmlFor="siteName" required>
            <TextInput
              id="siteName"
              name="siteName"
              defaultValue={settings.siteName}
              maxLength={100}
              required
            />
          </FormField>
          <FormField label="Tagline" htmlFor="tagline">
            <TextInput
              id="tagline"
              name="tagline"
              defaultValue={settings.tagline}
              maxLength={200}
            />
          </FormField>
          <FormField label="Description" htmlFor="description" className="sm:col-span-2">
            <Textarea
              id="description"
              name="description"
              defaultValue={settings.description}
              maxLength={500}
              rows={3}
            />
          </FormField>
          <FormField
            label="Logo text"
            htmlFor="logoText"
            hint="Short fallback mark when no logo image is selected."
          >
            <TextInput
              id="logoText"
              name="logoText"
              defaultValue={settings.logoText}
              maxLength={30}
            />
          </FormField>
          <FormField label="Logo image" htmlFor="logoMediaId">
            <Select
              id="logoMediaId"
              name="logoMediaId"
              defaultValue={settings.logoMediaId ? String(settings.logoMediaId) : ""}
            >
              <option value="">No image</option>
              {mediaOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </Select>
          </FormField>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Contact details"
          description="Public contact channels only. No passwords or API secrets belong here."
        />
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <FormField label="Contact email" htmlFor="contactEmail">
            <TextInput
              id="contactEmail"
              name="contactEmail"
              type="email"
              defaultValue={settings.contactEmail}
              maxLength={255}
            />
          </FormField>
          <FormField label="Contact phone" htmlFor="contactPhone">
            <TextInput
              id="contactPhone"
              name="contactPhone"
              type="tel"
              defaultValue={settings.contactPhone}
              maxLength={50}
            />
          </FormField>
          <FormField
            label="WhatsApp number"
            htmlFor="whatsapp"
            hint="Used for product enquiries. Include the country code."
          >
            <TextInput
              id="whatsapp"
              name="whatsapp"
              type="tel"
              defaultValue={settings.whatsapp}
              maxLength={50}
            />
          </FormField>
          <FormField label="Address" htmlFor="address" className="sm:col-span-2">
            <TextInput
              id="address"
              name="address"
              defaultValue={settings.address}
              maxLength={300}
            />
          </FormField>
          <FormField
            label="Google Maps URL"
            htmlFor="googleMapsUrl"
            hint="HTTPS link to the location. Leave blank if not approved."
            className="sm:col-span-2"
          >
            <TextInput
              id="googleMapsUrl"
              name="googleMapsUrl"
              type="url"
              defaultValue={settings.googleMapsUrl}
              placeholder="https://maps.google.com/..."
              maxLength={500}
            />
          </FormField>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Social links"
          description="HTTPS links only. Empty values are omitted from the public site."
        />
        <CardBody className="grid gap-4 sm:grid-cols-2">
          {(
            [
              ["facebook", "Facebook"],
              ["instagram", "Instagram"],
              ["x", "X / Twitter"],
              ["linkedin", "LinkedIn"],
              ["youtube", "YouTube"],
            ] as const
          ).map(([key, label]) => (
            <FormField key={key} label={label} htmlFor={`social-${key}`}>
              <TextInput
                id={`social-${key}`}
                name={key}
                type="url"
                defaultValue={settings.social[key]}
                placeholder="https://"
                maxLength={500}
              />
            </FormField>
          ))}
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="SEO defaults"
          description="Used when a page does not override these values."
        />
        <CardBody className="grid gap-4">
          <FormField label="Default title" htmlFor="seoTitle">
            <TextInput
              id="seoTitle"
              name="seoTitle"
              defaultValue={settings.seoTitle}
              maxLength={255}
            />
          </FormField>
          <FormField label="Default description" htmlFor="seoDescription">
            <Textarea
              id="seoDescription"
              name="seoDescription"
              defaultValue={settings.seoDescription}
              maxLength={500}
              rows={3}
            />
          </FormField>
          <Checkbox
            name="noIndex"
            label="Ask search engines not to index the public site"
            defaultChecked={settings.noIndex}
          />
        </CardBody>
      </Card>

      <div className="flex justify-end">
        <SubmitButton label="Save settings" pendingLabel="Saving settings..." />
      </div>
    </ActionForm>
  );
}
