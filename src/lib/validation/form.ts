import { z } from "zod";

/** Shared FormData parsing helpers for admin mutations. */

export function formText(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value : "";
}

export function formOptionalId(value: FormDataEntryValue | null): number | null {
  const raw = formText(value).trim();

  if (!raw) {
    return null;
  }

  const parsed = Number(raw);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export function formInteger(
  value: FormDataEntryValue | null,
  fallback = 0,
): number {
  const raw = formText(value).trim();

  if (!raw) {
    return fallback;
  }

  const parsed = Number(raw);

  return Number.isInteger(parsed) ? parsed : fallback;
}

export function formCheckbox(value: FormDataEntryValue | null): boolean {
  return value === "on" || value === "true" || value === "1";
}

export type ParsedForm<T> =
  | { ok: true; data: T }
  | { ok: false; errors: Record<string, string> };

export function collectFieldErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";

    if (!errors[key]) {
      errors[key] = issue.message;
    }
  }

  return errors;
}

export function parseForm<T>(
  schema: z.ZodType<T>,
  candidate: unknown,
): ParsedForm<T> {
  const parsed = schema.safeParse(candidate);

  if (!parsed.success) {
    return { ok: false, errors: collectFieldErrors(parsed.error) };
  }

  return { ok: true, data: parsed.data };
}
