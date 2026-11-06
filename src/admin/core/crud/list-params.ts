import { z } from "zod";
import type { ListParams } from "./types";

export const LIST_PAGE_SIZE = 10;
export const MAX_LIST_PAGE = 10_000;

const baseListSchema = z.object({
  q: z.string().trim().max(200).catch(""),
  page: z.coerce
    .number()
    .int()
    .min(1)
    .max(MAX_LIST_PAGE)
    .catch(1),
  pageSize: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .catch(LIST_PAGE_SIZE),
  sort: z.string().trim().max(50).catch(""),
  direction: z.enum(["asc", "desc"]).catch("desc"),
});

export type SearchParamsInput = Record<
  string,
  string | string[] | undefined
>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * Parse list query parameters against a trusted allowlist.
 *
 * `allowedSorts` and `filterValues` are supplied by a static module definition,
 * never by the client. Unknown sorts fall back; unknown filter values fall back
 * to the default ("all"). Values are used as bound parameters by Drizzle, not
 * interpolated into SQL identifiers.
 */
export function parseListParams(
  input: SearchParamsInput,
  options: {
    allowedSorts: readonly string[];
    defaultSort: string;
    defaultDirection?: "asc" | "desc";
    filterValues?: Record<string, readonly string[]>;
    pageSize?: number;
  },
): ListParams {
  const raw: Record<string, string | undefined> = {
    q: first(input.q),
    page: first(input.page),
    pageSize: options.pageSize ? String(options.pageSize) : first(input.pageSize),
    sort: first(input.sort),
    direction: first(input.direction),
  };

  const parsed = baseListSchema.parse(raw);
  const sort = options.allowedSorts.includes(parsed.sort)
    ? parsed.sort
    : options.defaultSort;
  const requestedDirection = first(input.direction);
  const direction: "asc" | "desc" =
    requestedDirection === "asc" || requestedDirection === "desc"
      ? requestedDirection
      : (options.defaultDirection ?? "desc");

  const filters: Record<string, string> = {};

  for (const [key, allowed] of Object.entries(options.filterValues ?? {})) {
    const value = first(input[key]);
    filters[key] = value && allowed.includes(value) ? value : "";
  }

  return {
    q: parsed.q,
    page: parsed.page,
    pageSize: parsed.pageSize,
    sort,
    direction,
    filters,
  };
}

export function pageCountFor(total: number, pageSize: number): number {
  return Math.max(1, Math.ceil(total / pageSize));
}

export function clampPage(page: number, total: number, pageSize: number): number {
  return Math.min(page, pageCountFor(total, pageSize));
}

/** Build a query string while preserving unrelated list state. */
export function buildListQuery(
  current: SearchParamsInput,
  changes: Record<string, string | number | undefined | null>,
): string {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(current)) {
    const single = first(value);

    if (single) {
      params.set(key, single);
    }
  }

  for (const [key, value] of Object.entries(changes)) {
    if (value === undefined || value === null || value === "") {
      params.delete(key);
    } else {
      params.set(key, String(value));
    }
  }

  const query = params.toString();

  return query ? `?${query}` : "";
}
