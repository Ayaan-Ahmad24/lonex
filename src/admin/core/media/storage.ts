import "server-only";

import { randomUUID } from "node:crypto";
import { mkdir, readFile, stat, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { getServerEnv } from "@/lib/env";

/**
 * Private local storage adapter for Sprint 02.
 *
 * Production persistence on cPanel is NOT verified. A deployment must provide
 * a persistent directory outside the release tree (or another adapter) before
 * uploads can be considered durable across deploys.
 */
export type StoredFile = {
  bytes: number;
};

export type MediaStorage = {
  save(key: string, data: Buffer): Promise<StoredFile>;
  read(key: string): Promise<Buffer>;
  remove(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
};

const SAFE_KEY = /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,254}$/;

function storageRoot(): string {
  const env = getServerEnv();
  // The storage root is configured at runtime and deliberately outside the
  // release tree. Tell the bundler not to trace it, so uploads do not drag the
  // whole project (and the public folder) into the server bundle.
  const root = path.resolve(/* turbopackIgnore: true */ process.cwd(), env.MEDIA_STORAGE_PATH);
  const forbidden = [
    path.resolve(process.cwd(), "public"),
    path.resolve(process.cwd(), ".next"),
    path.resolve(process.cwd(), "node_modules"),
  ];

  for (const blocked of forbidden) {
    // Reject the forbidden directory itself, anything inside it, and any
    // ancestor that contains it. The last rule stops a storage root like the
    // project root from exposing public/ or .next/ through a relative key.
    if (
      root === blocked ||
      root.startsWith(`${blocked}${path.sep}`) ||
      blocked.startsWith(`${root}${path.sep}`)
    ) {
      throw new Error(
        `MEDIA_STORAGE_PATH must be outside ${path.basename(blocked)}.`,
      );
    }
  }

  return root;
}

function resolveKey(key: string): string {
  if (!SAFE_KEY.test(key) || key.includes("..") || key.includes("/") || key.includes("\\")) {
    throw new Error("Invalid storage key.");
  }

  const root = storageRoot();
  const full = path.resolve(root, key);

  if (!full.startsWith(`${root}${path.sep}`)) {
    throw new Error("Invalid storage key.");
  }

  return full;
}

export function createLocalMediaStorage(): MediaStorage {
  return {
    async save(key, data) {
      const full = resolveKey(key);
      await mkdir(path.dirname(full), { recursive: true });
      // "wx" prevents silently overwriting an existing object.
      await writeFile(full, data, { flag: "wx" });
      const info = await stat(full);

      return { bytes: info.size };
    },

    async read(key) {
      return readFile(resolveKey(key));
    },

    async remove(key) {
      try {
        await unlink(resolveKey(key));
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
          throw error;
        }
      }
    },

    async exists(key) {
      try {
        const info = await stat(resolveKey(key));
        return info.isFile();
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") {
          return false;
        }
        throw error;
      }
    },
  };
}

export function newStorageKey(extension: string): string {
  const safeExtension = extension.replace(/[^a-z0-9]/gi, "").toLowerCase();

  if (!safeExtension) {
    throw new Error("A storage extension is required.");
  }

  return `${randomUUID()}.${safeExtension}`;
}

/**
 * Validate a client-supplied key through the same rules used by storage.
 * Exported for tests; the admin UI never chooses a storage key.
 */
export function assertSafeStorageKey(key: string): void {
  resolveKey(key);
}
