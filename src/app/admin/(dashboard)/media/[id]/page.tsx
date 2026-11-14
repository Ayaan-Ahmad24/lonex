export const instant = false;

import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { requireAdminModule } from "@/admin/config/access";
import {
  formatBytes,
  findMediaReferences,
  getMediaAsset,
} from "@/admin/core/media/service";
import { ActionForm } from "@/admin/core/ui/action-form";
import { FormField, TextInput } from "@/admin/core/ui/form-fields";
import { SubmitButton } from "@/admin/core/ui/submit-button";
import { ConfirmSubmitButton } from "@/admin/core/ui/confirm-dialog";
import { Card, CardBody, CardHeader } from "@/admin/core/ui/card";
import { PageHeader } from "@/admin/core/ui/page-header";
import { Badge } from "@/admin/core/ui/badge";
import { MediaThumb } from "@/admin/modules/media/media-thumb";
import { buttonClassName } from "@/admin/core/ui/button";
import { formatDateTime } from "@/admin/core/ui/format";
import {
  deleteMediaAction,
  updateMediaAltAction,
} from "@/admin/modules/media/actions";

const idSchema = z.coerce.number().int().positive();

export default async function MediaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminModule("media");
  const { id } = await params;
  const parsed = idSchema.safeParse(id);

  if (!parsed.success) {
    notFound();
  }

  const asset = await getMediaAsset(parsed.data);

  if (!asset) {
    notFound();
  }

  const references = await findMediaReferences(asset.id);
  const isImage = asset.mimeType.startsWith("image/");

  return (
    <div className="space-y-6">
      <PageHeader
        title={asset.originalName}
        description={`Uploaded ${formatDateTime(asset.createdAt)}`}
        actions={
          <Link
            href="/admin/media"
            className={buttonClassName("secondary", "sm")}
          >
            Back to media
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Preview" />
          <CardBody>
            {isImage ? (
              <MediaThumb
                src={`/admin/media/${asset.id}/file`}
                alt={asset.altText || asset.originalName}
                className="h-[24rem] w-full rounded-lg border border-lonex-line object-contain"
              />
            ) : (
              <a
                href={`/admin/media/${asset.id}/file`}
                target="_blank"
                rel="noreferrer"
                className={buttonClassName("secondary", "sm")}
              >
                Open PDF
              </a>
            )}
          </CardBody>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader title="File details" />
            <CardBody>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-xs text-lonex-muted">Type</dt>
                  <dd className="mt-1">
                    <Badge>{asset.mimeType}</Badge>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-lonex-muted">Size</dt>
                  <dd className="text-lonex-ink">{formatBytes(asset.bytes)}</dd>
                </div>
                {asset.width && asset.height ? (
                  <div>
                    <dt className="text-xs text-lonex-muted">Dimensions</dt>
                    <dd className="text-lonex-ink">
                      {asset.width} × {asset.height}
                    </dd>
                  </div>
                ) : null}
                <div>
                  <dt className="text-xs text-lonex-muted">Storage key</dt>
                  <dd className="break-all font-mono text-[11px] text-lonex-muted">
                    {asset.storageKey}
                  </dd>
                </div>
              </dl>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Alt text" />
            <CardBody>
              <ActionForm action={updateMediaAltAction} className="space-y-3">
                <input type="hidden" name="id" value={asset.id} />
                <FormField label="Alt text" htmlFor="altText">
                  <TextInput
                    id="altText"
                    name="altText"
                    defaultValue={asset.altText ?? ""}
                    maxLength={500}
                  />
                </FormField>
                <SubmitButton label="Save alt text" size="sm" />
              </ActionForm>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Delete" />
            <CardBody className="space-y-3">
              {references.length > 0 ? (
                <>
                  <p className="text-sm text-lonex-muted">
                    This asset is referenced and cannot be deleted:
                  </p>
                  <ul className="list-inside list-disc space-y-1 text-xs text-lonex-muted">
                    {references.map((reference) => (
                      <li key={reference}>{reference}</li>
                    ))}
                  </ul>
                </>
              ) : (
                <ActionForm action={deleteMediaAction}>
                  <input type="hidden" name="id" value={asset.id} />
                  <p className="mb-3 text-sm text-lonex-muted">
                    Permanently delete this file from private storage. This
                    cannot be undone.
                  </p>
                  <ConfirmSubmitButton
                    label="Delete media"
                    confirmTitle="Delete this file?"
                    confirmMessage="The file will be removed from private storage. Deletion is audited."
                    confirmLabel="Delete permanently"
                  />
                </ActionForm>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
