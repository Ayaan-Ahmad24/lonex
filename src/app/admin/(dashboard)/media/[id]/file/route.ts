import { z } from "zod";
import { authorize } from "@/lib/rbac";
import { readMediaFile } from "@/admin/core/media/service";

const idSchema = z.coerce.number().int().positive();

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const access = await authorize("media.manage");

  if (!access.ok) {
    return new Response(access.status === 401 ? "Unauthorized" : "Forbidden", {
      status: access.status,
      headers: { "Cache-Control": "no-store" },
    });
  }

  const parsed = idSchema.safeParse((await params).id);

  if (!parsed.success) {
    return new Response("Not found", { status: 404 });
  }

  const file = await readMediaFile(parsed.data);

  if (!file) {
    return new Response("Not found", { status: 404 });
  }

  const safeName = file.originalName.replace(/["\\\r\n]/g, "_");
  const encodedName = encodeURIComponent(file.originalName);
  // Never render a PDF inline from this origin. Images may be previewed inline.
  const disposition =
    file.mimeType === "application/pdf" ? "attachment" : "inline";

  return new Response(new Uint8Array(file.data), {
    status: 200,
    headers: {
      "Content-Type": file.mimeType,
      "Content-Length": String(file.data.length),
      "Content-Disposition": `${disposition}; filename="${safeName}"; filename*=UTF-8''${encodedName}`,
      "Cache-Control": "private, no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
