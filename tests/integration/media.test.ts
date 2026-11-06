import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { closeDbPool } from "@/db/client";
import {
  deleteMedia,
  findMediaReferences,
  getMediaAsset,
  readMediaFile,
  updateMediaAlt,
  uploadMedia,
} from "@/admin/core/media/service";
import { assertSafeStorageKey } from "@/admin/core/media/storage";
import { createCategory, deleteCategory } from "@/admin/modules/categories/service";
import {
  cleanupFixtureUsers,
  closeTestPool,
  createFixtureUser,
  createTestPool,
  type TestDb,
} from "../helpers/db";

let pool: TestDb;
let actorId = "";
const createdUserIds: string[] = [];
const mediaIds: number[] = [];
const pageIds: number[] = [];
const storageKeys: string[] = [];

const STORAGE_ROOT = path.resolve(process.cwd(), ".data", "test-media");

function pngBytes(): Buffer {
  const buffer = Buffer.alloc(24);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(buffer, 0);
  buffer.writeUInt32BE(13, 8);
  buffer.write("IHDR", 12, "ascii");
  buffer.writeUInt32BE(640, 16);
  buffer.writeUInt32BE(480, 20);

  return buffer;
}

function file(name: string, bytes: Buffer, type: string): File {
  return new File([new Uint8Array(bytes)], name, { type });
}

beforeAll(async () => {
  pool = createTestPool();
  const actor = await createFixtureUser(pool, {
    role: "administrator",
    emailPrefix: "vitest-media",
  });
  actorId = actor.id;
  createdUserIds.push(actorId);
});

afterAll(async () => {
  for (const key of storageKeys) {
    const full = path.join(STORAGE_ROOT, key);
    if (existsSync(full)) {
      const { rmSync } = await import("node:fs");
      rmSync(full, { force: true });
    }
  }

  if (pageIds.length > 0) {
    const placeholders = pageIds.map(() => "?").join(",");
    await pool.execute(
      `DELETE FROM public_paths WHERE owner_type = 'category' AND owner_id IN (${placeholders})`,
      pageIds.map(String),
    );
    await pool.execute(
      `DELETE FROM categories WHERE id IN (${placeholders})`,
      pageIds,
    );
    await pool.execute(
      `DELETE FROM audit_log WHERE target_type = 'category' AND target_id IN (${placeholders})`,
      pageIds.map(String),
    );
  }

  if (mediaIds.length > 0) {
    const placeholders = mediaIds.map(() => "?").join(",");
    await pool.execute(`DELETE FROM media_assets WHERE id IN (${placeholders})`, mediaIds);
    await pool.execute(
      `DELETE FROM audit_log WHERE target_type = 'media' AND target_id IN (${placeholders})`,
      mediaIds.map(String),
    );
  }

  await cleanupFixtureUsers(pool, createdUserIds);
  await closeTestPool(pool);
  await closeDbPool();
});

describe("private media storage", () => {
  it("stores a signature-validated upload outside public/", async () => {
    const result = await uploadMedia(
      actorId,
      file("../../evil photo.png", pngBytes(), "image/png"),
      "A test image",
    );

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    mediaIds.push(result.id);

    const asset = await getMediaAsset(result.id);

    expect(asset).toMatchObject({
      originalName: "evil photo.png",
      mimeType: "image/png",
      width: 640,
      height: 480,
      altText: "A test image",
      uploadedBy: actorId,
    });
    expect(asset?.storageKey).toMatch(/^[0-9a-f-]{36}\.png$/);
    expect(asset?.storageKey).not.toContain("..");
    expect(asset?.storageKey).not.toContain("/");

    storageKeys.push(asset!.storageKey);

    const full = path.join(STORAGE_ROOT, asset!.storageKey);

    expect(existsSync(full)).toBe(true);
    expect(full.startsWith(path.resolve(process.cwd(), "public"))).toBe(false);
    expect(readFileSync(full).subarray(0, 8)).toEqual(pngBytes().subarray(0, 8));

    const served = await readMediaFile(result.id);

    expect(served?.mimeType).toBe("image/png");
    expect(served?.data.length).toBe(pngBytes().length);
  });

  it("rejects SVG and signature mismatches", async () => {
    const svg = await uploadMedia(
      actorId,
      file("logo.svg", Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>'), "image/svg+xml"),
      "",
    );

    expect(svg.ok).toBe(false);

    const disguised = await uploadMedia(
      actorId,
      file("photo.png", Buffer.from("<html><script>alert(1)</script>"), "image/png"),
      "",
    );

    expect(disguised.ok).toBe(false);
  });

  it("updates alt text", async () => {
    const id = mediaIds[0];
    const result = await updateMediaAlt(actorId, id, "Updated alt");

    expect(result.ok).toBe(true);
    expect((await getMediaAsset(id))?.altText).toBe("Updated alt");
  });

  it("blocks deletion while a page references the asset", async () => {
    const id = mediaIds[0];
    const created = await createCategory(actorId, {
      name: "Media reference",
      slug: "vitest-media-reference",
      description: "",
      coverMediaId: id,
      status: "draft",
      sortOrder: 0,
    });

    expect(created.ok).toBe(true);

    if (!created.ok) {
      return;
    }

    pageIds.push(created.id);

    const references = await findMediaReferences(id);

    expect(references.length).toBeGreaterThan(0);

    const blocked = await deleteMedia(actorId, id);

    expect(blocked.ok).toBe(false);
    expect(await getMediaAsset(id)).not.toBeNull();
  });

  it("deletes the database row and the stored file once unreferenced", async () => {
    const id = mediaIds[0];
    const asset = await getMediaAsset(id);
    const full = path.join(STORAGE_ROOT, asset!.storageKey);

    await deleteCategory(actorId, pageIds[0]);

    const result = await deleteMedia(actorId, id);

    expect(result.ok).toBe(true);
    expect(await getMediaAsset(id)).toBeNull();
    expect(existsSync(full)).toBe(false);
  });

  it("rejects path traversal in storage keys", () => {
    for (const key of ["../escape.png", "..\\escape.png", "a/b.png", "a\\b.png", ""]) {
      expect(() => assertSafeStorageKey(key)).toThrow();
    }

    expect(() => assertSafeStorageKey("0f0f.png")).not.toThrow();
  });
});
