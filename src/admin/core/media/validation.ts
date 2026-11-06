import path from "node:path";

/**
 * Upload validation.
 *
 * The browser-supplied MIME type and filename are metadata only. The actual
 * bytes are inspected; the stored extension and served Content-Type come from
 * the detected signature, never from the client.
 */

export type DetectedFile = {
  mimeType:
    | "image/jpeg"
    | "image/png"
    | "image/webp"
    | "image/gif"
    | "application/pdf";
  extension: "jpg" | "png" | "webp" | "gif" | "pdf";
  kind: "image" | "pdf";
  width: number | null;
  height: number | null;
};

export type UploadValidation =
  | {
      ok: true;
      detected: DetectedFile;
      safeOriginalName: string;
    }
  | { ok: false; reason: string };

const ALLOWED_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "webp",
  "gif",
  "pdf",
]);

function readUInt24LE(buffer: Buffer, offset: number): number {
  return (
    buffer[offset] | (buffer[offset + 1] << 8) | (buffer[offset + 2] << 16)
  );
}

function jpegDimensions(
  buffer: Buffer,
): { width: number; height: number } | null {
  let offset = 2;

  while (offset + 9 < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    const marker = buffer[offset + 1];

    // SOF0..SOF15 except DHT (C4), JPG (C8) and DAC (CC).
    if (
      marker >= 0xc0 &&
      marker <= 0xcf &&
      marker !== 0xc4 &&
      marker !== 0xc8 &&
      marker !== 0xcc
    ) {
      return {
        height: buffer.readUInt16BE(offset + 5),
        width: buffer.readUInt16BE(offset + 7),
      };
    }

    if (marker === 0xd8 || marker === 0xd9) {
      offset += 2;
      continue;
    }

    const length = buffer.readUInt16BE(offset + 2);

    if (length < 2) {
      return null;
    }

    offset += 2 + length;
  }

  return null;
}

function webpDimensions(
  buffer: Buffer,
): { width: number; height: number } | null {
  if (buffer.length < 30) {
    return null;
  }

  const chunk = buffer.toString("ascii", 12, 16);

  if (chunk === "VP8X") {
    return {
      width: 1 + readUInt24LE(buffer, 24),
      height: 1 + readUInt24LE(buffer, 27),
    };
  }

  if (chunk === "VP8L") {
    const bits = buffer.readUInt32LE(21);
    return {
      width: (bits & 0x3fff) + 1,
      height: ((bits >> 14) & 0x3fff) + 1,
    };
  }

  if (chunk === "VP8 ") {
    return {
      width: buffer.readUInt16LE(26) & 0x3fff,
      height: buffer.readUInt16LE(28) & 0x3fff,
    };
  }

  return null;
}

export function detectFileType(buffer: Buffer): DetectedFile | null {
  if (buffer.length < 12) {
    return null;
  }

  // JPEG: FF D8 FF
  if (
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    const dimensions = jpegDimensions(buffer);

    return {
      mimeType: "image/jpeg",
      extension: "jpg",
      kind: "image",
      width: dimensions?.width ?? null,
      height: dimensions?.height ?? null,
    };
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A, IHDR width/height at 16..23
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a &&
    buffer.length >= 24
  ) {
    return {
      mimeType: "image/png",
      extension: "png",
      kind: "image",
      width: buffer.readUInt32BE(16),
      height: buffer.readUInt32BE(20),
    };
  }

  // GIF87a / GIF89a
  const gifHeader = buffer.toString("ascii", 0, 6);

  if ((gifHeader === "GIF87a" || gifHeader === "GIF89a") && buffer.length >= 10) {
    return {
      mimeType: "image/gif",
      extension: "gif",
      kind: "image",
      width: buffer.readUInt16LE(6),
      height: buffer.readUInt16LE(8),
    };
  }

  // WEBP: RIFF....WEBP
  if (
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    const dimensions = webpDimensions(buffer);

    return {
      mimeType: "image/webp",
      extension: "webp",
      kind: "image",
      width: dimensions?.width ?? null,
      height: dimensions?.height ?? null,
    };
  }

  // PDF: %PDF-
  if (buffer.toString("ascii", 0, 5) === "%PDF-") {
    return {
      mimeType: "application/pdf",
      extension: "pdf",
      kind: "pdf",
      width: null,
      height: null,
    };
  }

  return null;
}

export function sanitizeOriginalName(name: string): string {
  const base = path.basename(name.replace(/\\/g, "/"));
  const cleaned = base
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .replace(/[<>:"|?*]/g, "_")
    .trim();

  return (cleaned || "upload").slice(0, 255);
}

export function validateUpload(input: {
  buffer: Buffer;
  originalName: string;
  declaredMimeType?: string;
  maxBytes: number;
}): UploadValidation {
  if (input.buffer.length === 0) {
    return { ok: false, reason: "The file is empty." };
  }

  if (input.buffer.length > input.maxBytes) {
    return {
      ok: false,
      reason: `File is larger than ${Math.round(input.maxBytes / 1024 / 1024)} MB.`,
    };
  }

  const safeOriginalName = sanitizeOriginalName(input.originalName);
  const extension = path.extname(safeOriginalName).slice(1).toLowerCase();

  if (!ALLOWED_EXTENSIONS.has(extension)) {
    return {
      ok: false,
      reason:
        "Only JPEG, PNG, WebP, GIF and PDF files are allowed (SVG and HTML are rejected).",
    };
  }

  // Reject a declared type that is explicitly dangerous. A generic or missing
  // type is irrelevant because the signature decides what is stored.
  const declared = (input.declaredMimeType ?? "").toLowerCase();

  if (
    declared.includes("svg") ||
    declared.includes("html") ||
    declared.includes("javascript") ||
    declared.includes("xml")
  ) {
    return {
      ok: false,
      reason: "This file type is not allowed.",
    };
  }

  const detected = detectFileType(input.buffer);

  if (!detected) {
    return {
      ok: false,
      reason:
        "The file signature does not match a supported image or PDF format.",
    };
  }

  return { ok: true, detected, safeOriginalName };
}
