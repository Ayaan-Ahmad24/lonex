import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { authorize } from "@/lib/rbac";
import { isSameOrigin } from "@/lib/origin";
import { getServerEnv } from "@/lib/env";
import { uploadMedia } from "@/admin/core/media/service";

/**
 * Authenticated multipart upload endpoint.
 *
 * Uploads do not go through a Server Action because the Server Action
 * transport enforces a 1 MB body limit before user code runs. This route:
 *
 * - requires a valid session with `media.manage` (server-enforced),
 * - checks the Origin header (CSRF),
 * - enforces the configured byte ceiling while streaming the body, so an
 *   oversized request is rejected without buffering it all in memory,
 * - delegates signature/MIME/path validation and private storage to the
 *   media service, and returns a JSON error instead of tearing down the page.
 */

const noStore = { "Cache-Control": "no-store, max-age=0" };

// Multipart boundaries, part headers and the alt-text field add a few KB.
// Allow 256 KB of room on top of the configured file ceiling.
const MULTIPART_OVERHEAD_BYTES = 256 * 1024;

type UploadResponse =
  | { status: "ok"; id: number; message: string }
  | { status: "error"; message: string };

function json(body: UploadResponse, status = 200) {
  return NextResponse.json(body, { status, headers: noStore });
}

async function readBodyWithLimit(
  request: Request,
  limit: number,
): Promise<Uint8Array | null> {
  const reader = request.body?.getReader();

  if (!reader) {
    return null;
  }

  const chunks: Uint8Array[] = [];
  let total = 0;

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    total += value.byteLength;

    if (total > limit) {
      await reader.cancel().catch(() => undefined);
      return null;
    }

    chunks.push(value);
  }

  const body = new Uint8Array(total);
  let offset = 0;

  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return body;
}

export async function POST(request: Request) {
  const access = await authorize("media.manage");

  if (!access.ok) {
    return json(
      {
        status: "error",
        message:
          access.status === 401
            ? "Your session expired. Sign in again."
            : "You do not have permission to upload media.",
      },
      access.status,
    );
  }

  if (!isSameOrigin(request)) {
    return json({ status: "error", message: "Request origin is not allowed." }, 403);
  }

  const contentType = request.headers.get("content-type") ?? "";

  if (!contentType.toLowerCase().startsWith("multipart/form-data")) {
    return json({ status: "error", message: "Expected a multipart upload." }, 415);
  }

  const maxBytes = getServerEnv().MEDIA_MAX_UPLOAD_BYTES;
  const bodyLimit = maxBytes + MULTIPART_OVERHEAD_BYTES;
  const declaredLength = Number(request.headers.get("content-length") ?? "");

  if (Number.isFinite(declaredLength) && declaredLength > bodyLimit) {
    return json(
      {
        status: "error",
        message: `File is larger than ${Math.round(maxBytes / 1024 / 1024)} MB.`,
      },
      413,
    );
  }

  const body = await readBodyWithLimit(request, bodyLimit);

  if (!body) {
    return json(
      {
        status: "error",
        message: `File is larger than ${Math.round(maxBytes / 1024 / 1024)} MB.`,
      },
      413,
    );
  }

  let formData: FormData;

  try {
    formData = await new Response(Buffer.from(body), {
      headers: { "content-type": contentType },
    }).formData();
  } catch {
    return json({ status: "error", message: "The upload could not be parsed." }, 400);
  }

  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return json(
      {
        status: "error",
        message: "Choose a JPEG, PNG, WebP, GIF or PDF file.",
      },
      400,
    );
  }

  const altText = formData.get("altText");

  const result = await uploadMedia(
    access.user.id,
    file,
    typeof altText === "string" ? altText : "",
  );

  if (!result.ok) {
    return json({ status: "error", message: result.message }, 422);
  }

  revalidatePath("/admin/media");
  revalidatePath("/admin/pages");
  revalidatePath("/admin");

  return json({
    status: "ok",
    id: result.id,
    message: "File uploaded to private storage.",
  });
}
