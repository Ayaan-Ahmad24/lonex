import { describe, expect, it } from "vitest";
import {
  detectFileType,
  sanitizeOriginalName,
  validateUpload,
} from "@/admin/core/media/validation";

function png(): Buffer {
  const buffer = Buffer.alloc(24);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(buffer, 0);
  buffer.writeUInt32BE(13, 8);
  buffer.write("IHDR", 12, "ascii");
  buffer.writeUInt32BE(1200, 16);
  buffer.writeUInt32BE(630, 20);

  return buffer;
}

function gif(): Buffer {
  const buffer = Buffer.alloc(16);
  buffer.write("GIF89a", 0, "ascii");
  buffer.writeUInt16LE(320, 6);
  buffer.writeUInt16LE(200, 8);

  return buffer;
}

function jpeg(): Buffer {
  const buffer = Buffer.alloc(40);
  buffer[0] = 0xff;
  buffer[1] = 0xd8;
  buffer[2] = 0xff;
  buffer[3] = 0xe0;
  buffer.writeUInt16BE(16, 4);
  buffer.write("JFIF", 6, "ascii");
  buffer[20] = 0xff;
  buffer[21] = 0xc0;
  buffer.writeUInt16BE(11, 22);
  buffer.writeUInt16BE(8, 24);
  buffer.writeUInt16BE(800, 25);
  buffer.writeUInt16BE(600, 27);

  return buffer;
}

function webp(): Buffer {
  const buffer = Buffer.alloc(32);
  buffer.write("RIFF", 0, "ascii");
  buffer.writeUInt32LE(24, 4);
  buffer.write("WEBP", 8, "ascii");
  buffer.write("VP8X", 12, "ascii");
  buffer.writeUInt32LE(10, 16);
  buffer[24] = 0x2f;
  buffer.writeUIntLE(799, 24, 3);
  buffer.writeUIntLE(599, 27, 3);

  return buffer;
}

function pdf(): Buffer {
  const buffer = Buffer.alloc(20);
  buffer.write("%PDF-1.7", 0, "ascii");

  return buffer;
}

describe("signature-based file detection", () => {
  it("detects supported images and PDFs", () => {
    expect(detectFileType(png())).toMatchObject({
      mimeType: "image/png",
      extension: "png",
      width: 1200,
      height: 630,
    });
    expect(detectFileType(gif())).toMatchObject({
      mimeType: "image/gif",
      width: 320,
      height: 200,
    });
    expect(detectFileType(jpeg())?.mimeType).toBe("image/jpeg");
    expect(detectFileType(webp())?.mimeType).toBe("image/webp");
    expect(detectFileType(pdf())).toMatchObject({
      mimeType: "application/pdf",
      extension: "pdf",
    });
  });

  it("rejects SVG, HTML and empty content no matter the filename", () => {
    expect(
      detectFileType(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg">')),
    ).toBeNull();
    expect(detectFileType(Buffer.from("<!doctype html><script>"))).toBeNull();
    expect(detectFileType(Buffer.alloc(0))).toBeNull();
  });

  it("does not trust a spoofed extension", () => {
    const result = validateUpload({
      buffer: Buffer.from("<svg onload=alert(1)>"),
      originalName: "logo.png",
      declaredMimeType: "image/png",
      maxBytes: 1024,
    });

    expect(result.ok).toBe(false);
  });
});

describe("upload validation", () => {
  it("accepts a signature-matching image", () => {
    const result = validateUpload({
      buffer: png(),
      originalName: "photo.png",
      declaredMimeType: "image/png",
      maxBytes: 1024,
    });

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.detected.mimeType).toBe("image/png");
      expect(result.safeOriginalName).toBe("photo.png");
    }
  });

  it("rejects oversized and empty files", () => {
    expect(
      validateUpload({
        buffer: png(),
        originalName: "photo.png",
        maxBytes: 4,
      }).ok,
    ).toBe(false);

    expect(
      validateUpload({
        buffer: Buffer.alloc(0),
        originalName: "photo.png",
        maxBytes: 1024,
      }).ok,
    ).toBe(false);
  });

  it("rejects disallowed extensions even with a valid signature", () => {
    for (const name of ["photo.svg", "photo.html", "photo.exe", "photo"]) {
      expect(
        validateUpload({
          buffer: png(),
          originalName: name,
          maxBytes: 1024,
        }).ok,
      ).toBe(false);
    }
  });

  it("rejects a declared dangerous MIME type", () => {
    for (const declaredMimeType of [
      "image/svg+xml",
      "text/html",
      "application/javascript",
      "application/xml",
    ]) {
      expect(
        validateUpload({
          buffer: png(),
          originalName: "photo.png",
          declaredMimeType,
          maxBytes: 1024,
        }).ok,
      ).toBe(false);
    }
  });
});

describe("original filename sanitization", () => {
  it("strips directory traversal and keeps only the basename", () => {
    expect(sanitizeOriginalName("../../etc/passwd.png")).toBe("passwd.png");
    expect(sanitizeOriginalName("C:\\Windows\\evil.png")).toBe("evil.png");
    expect(sanitizeOriginalName("/var/www/photo.png")).toBe("photo.png");
  });

  it("removes control characters and reserved characters", () => {
    expect(sanitizeOriginalName("a\u0000b\u001f<>:\"|?*.png")).toBe(
      "ab_______.png",
    );
  });

  it("falls back to a placeholder for unusable names", () => {
    expect(sanitizeOriginalName("   ")).toBe("upload");
  });

  it("caps the stored name length", () => {
    expect(sanitizeOriginalName(`${"a".repeat(400)}.png`).length).toBe(255);
  });
});
