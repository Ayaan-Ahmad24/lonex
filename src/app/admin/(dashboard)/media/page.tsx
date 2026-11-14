export const instant = false;

import { Suspense } from "react";
import Link from "next/link";
import { requireAdminModule } from "@/admin/config/access";
import {
  buildListQuery,
  parseListParams,
} from "@/admin/core/crud/list-params";
import { listMedia, formatBytes, type MediaListRow } from "@/admin/core/media/service";
import { getServerEnv } from "@/lib/env";
import { DataTable, type DataTableColumn } from "@/admin/core/ui/data-table";
import { ListToolbar, SearchInput, FilterSelect } from "@/admin/core/ui/list-toolbar";
import { Pagination } from "@/admin/core/ui/pagination";
import { Card } from "@/admin/core/ui/card";
import { PageHeader } from "@/admin/core/ui/page-header";
import { Badge } from "@/admin/core/ui/badge";
import { TableSkeleton } from "@/admin/core/ui/states";
import { formatDate } from "@/admin/core/ui/format";
import { MediaUploadForm } from "@/admin/modules/media/media-upload-form";
import { MediaThumb } from "@/admin/modules/media/media-thumb";

const SORTS = ["createdAt"] as const;

export default function MediaPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Media library"
        description="Private media library. Files are stored outside public/ and served only to authorized administrators."
      />
      <Suspense fallback={<TableSkeleton rows={4} />}>
        <MediaContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function MediaContent({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminModule("media");
  const raw = await searchParams;
  const params = parseListParams(raw, {
    allowedSorts: SORTS,
    defaultSort: "createdAt",
    filterValues: { kind: ["image", "pdf"] },
  });
  const result = await listMedia(params);
  const env = getServerEnv();

  const columns: DataTableColumn<MediaListRow>[] = [
    {
      key: "preview",
      header: "Preview",
      render: (row) =>
        row.mimeType.startsWith("image/") ? (
          <MediaThumb
            src={`/admin/media/${row.id}/file`}
            alt={row.altText || row.originalName}
            className="h-12 w-12 rounded-lg border border-lonex-line object-cover"
          />
        ) : (
          <span className="flex h-12 w-12 items-center justify-center rounded-lg border border-lonex-line bg-lonex-stone text-[10px] font-semibold text-lonex-muted">
            PDF
          </span>
        ),
    },
    {
      key: "name",
      header: "Asset",
      render: (row) => (
        <div className="min-w-0">
          <Link
            href={`/admin/media/${row.id}`}
            className="block max-w-72 truncate font-medium text-lonex-ink no-underline transition-colors hover:text-lonex-red"
          >
            {row.originalName}
          </Link>
          <p className="text-xs text-lonex-muted">
            {row.width && row.height ? `${row.width}×${row.height} · ` : ""}
            {formatBytes(row.bytes)}
          </p>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (row) => <Badge>{row.mimeType}</Badge>,
    },
    {
      key: "alt",
      header: "Alt text",
      render: (row) => (
        <span className="text-xs text-lonex-muted">
          {row.altText || <span className="text-lonex-muted">Not set</span>}
        </span>
      ),
    },
    {
      key: "created",
      header: "Uploaded",
      render: (row) => (
        <span className="text-xs text-lonex-muted">
          {formatDate(row.createdAt)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <MediaUploadForm maxBytes={env.MEDIA_MAX_UPLOAD_BYTES} />

      <Card>
        <ListToolbar action="/admin/media" resetHref="/admin/media">
          <SearchInput
            defaultValue={params.q}
            placeholder="Search filename or alt text"
          />
          <FilterSelect
            name="kind"
            label="Type"
            value={params.filters.kind}
            options={[
              { value: "", label: "All types" },
              { value: "image", label: "Images" },
              { value: "pdf", label: "PDF" },
            ]}
          />
        </ListToolbar>

        <DataTable
          columns={columns}
          rows={result.rows}
          caption="Media assets"
          emptyTitle="No media yet"
          emptyDescription="Upload a JPEG, PNG, WebP, GIF or PDF to get started."
        />

        <Pagination
          page={result.page}
          pageCount={result.pageCount}
          total={result.total}
          buildHref={(page) =>
            `/admin/media${buildListQuery(raw, { page, pageSize: params.pageSize })}`
          }
        />
      </Card>
    </div>
  );
}
