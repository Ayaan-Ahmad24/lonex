"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

/**
 * Raw verification codes shown to the signed-in administrator.
 *
 * A raw code can never be recovered from the HMAC digest, so the only place it
 * can be displayed after submission is this browser tab. Codes live in
 * `sessionStorage` (not cookies, not the database, not audit logs) and are
 * cleared when the tab closes. The server never stores or logs the raw value.
 *
 * `useSyncExternalStore` is used instead of a `useState` initializer so the
 * server renders an empty set and the browser hydrates with the stored set
 * without a mismatch. Same-tab writes emit a custom event because the native
 * `storage` event only fires in other tabs.
 */
const STORAGE_KEY = "lonex.admin.verificationCodes";
const STORAGE_EVENT = "lonex.verificationCodes.changed";

type ShownCodes = Record<number, string>;

type VerificationCodeContextType = {
  shownCodes: ShownCodes;
  showCode: (productId: number, code: string) => void;
  getCode: (productId: number) => string | undefined;
  clearCodes: () => void;
};

const VerificationCodeContext = createContext<
  VerificationCodeContextType | undefined
>(undefined);

const EMPTY_CODES: ShownCodes = {};

let cachedRaw: string | null = null;
let cachedCodes: ShownCodes = EMPTY_CODES;

function parseCodes(raw: string | null): ShownCodes {
  if (!raw) {
    return EMPTY_CODES;
  }

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const codes: ShownCodes = {};

    for (const [key, value] of Object.entries(parsed)) {
      const id = Number(key);

      if (Number.isInteger(id) && id > 0 && typeof value === "string") {
        codes[id] = value;
      }
    }

    return codes;
  } catch {
    return EMPTY_CODES;
  }
}

function readSnapshot(): ShownCodes {
  if (typeof window === "undefined") {
    return EMPTY_CODES;
  }

  let raw: string | null = null;

  try {
    raw = window.sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return EMPTY_CODES;
  }

  if (raw === cachedRaw) {
    return cachedCodes;
  }

  cachedRaw = raw;
  cachedCodes = parseCodes(raw);

  return cachedCodes;
}

function serverSnapshot(): ShownCodes {
  return EMPTY_CODES;
}

function subscribe(callback: () => void): () => void {
  window.addEventListener("storage", callback);
  window.addEventListener(STORAGE_EVENT, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(STORAGE_EVENT, callback);
  };
}

function writeStoredCodes(codes: ShownCodes): void {
  const raw = JSON.stringify(codes);

  try {
    window.sessionStorage.setItem(STORAGE_KEY, raw);
    cachedRaw = raw;
    cachedCodes = codes;
  } catch {
    // Storage may be unavailable (private mode/quota). Display still works for
    // the current render; only reload persistence is lost.
  }

  window.dispatchEvent(new Event(STORAGE_EVENT));
}

export function VerificationCodeProvider({ children }: { children: ReactNode }) {
  const shownCodes = useSyncExternalStore(
    subscribe,
    readSnapshot,
    serverSnapshot,
  );

  const showCode = useCallback((productId: number, code: string) => {
    writeStoredCodes({ ...readSnapshot(), [productId]: code });
  }, []);

  const getCode = useCallback(
    (productId: number) => shownCodes[productId],
    [shownCodes],
  );

  const clearCodes = useCallback(() => {
    try {
      window.sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore unavailable storage.
    }

    cachedRaw = null;
    cachedCodes = EMPTY_CODES;
    window.dispatchEvent(new Event(STORAGE_EVENT));
  }, []);

  const value = useMemo(
    () => ({ shownCodes, showCode, getCode, clearCodes }),
    [shownCodes, showCode, getCode, clearCodes],
  );

  return (
    <VerificationCodeContext.Provider value={value}>
      {children}
    </VerificationCodeContext.Provider>
  );
}

export function useVerificationCode() {
  const context = useContext(VerificationCodeContext);

  if (!context) {
    throw new Error(
      "useVerificationCode must be used within a VerificationCodeProvider",
    );
  }

  return context;
}
