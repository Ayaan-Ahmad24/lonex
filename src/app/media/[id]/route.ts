import { z } from "zod";
import { getDeliverableMedia } from "@/lib/public/media";

const idSchema = z.coerce.number().int().positive();

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const parsed = idSchema.safeParse((await params).id);

  if (!parsed.success) {
    return new Response("Not found", { status: 404 });
  }

  const file = await getDeliverableMedia(parsed.data);

  if (!file) {
    return new Response("Not found", { status: 404 });
  }

  const safeName = file.fileName.replace(/["\\\r\n]/g, "_");
  const encodedName = encodeURIComponent(file.fileName);
  const disposition = `${file.disposition}; filename="${safeName}"; filename*=UTF-8''${encodedName}`;

  const cacheControl = file.mimeType.startsWith("image/")
    ? "public, max-age=31536000, immutable"
    : "private, no-store, max-age=0";

  return new Response(new Uint8Array(file.data), {
    status: 200,
    headers: {
      "Content-Type": file.mimeType,
      "Content-Length": String(file.data.length),
      "Content-Disposition": disposition,
      "Cache-Control": cacheControl,
      "X-Content-Type-Options": "nosniff",
    },
  });
}
