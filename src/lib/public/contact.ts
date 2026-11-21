/** Small contact helpers shared by the footer, category pages and product pages. */

export function whatsappHref(value: string, message?: string): string | null {
  const digits = value.replace(/[^\d]/g, "");

  if (digits.length < 6) {
    return null;
  }

  const base = `https://wa.me/${digits}`;

  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** Build a mailto: link with an optional subject and body. Returns null when
 *  no email address is configured, so callers can fall back gracefully. */
export function mailtoHref(
  email: string,
  subject?: string,
  body?: string,
): string | null {
  const trimmed = email.trim();

  if (!trimmed) {
    return null;
  }

  const parts = [`mailto:${trimmed}`];
  const query: string[] = [];

  if (subject) {
    query.push(`subject=${encodeURIComponent(subject)}`);
  }

  if (body) {
    query.push(`body=${encodeURIComponent(body)}`);
  }

  if (query.length > 0) {
    parts.push(query.join("&"));
  }

  return parts.join("?");
}

/** Build a `tel:` link. Keeps digits and a leading `+`, so formatted numbers
 *  such as `(042) 111-222` still dial. Returns null when there is no usable
 *  number, so callers never render a dead link. */
export function telHref(value: string): string | null {
  const cleaned = value.replace(/[^\d+]/g, "");

  if (cleaned.replace(/[^\d]/g, "").length < 6) {
    return null;
  }

  return `tel:${cleaned}`;
}

/** 03228888278 becomes 0322 888 8278. */
export function formatPhone(value: string): string {
  const digits = value.replace(/[^\d]/g, "");

  if (digits.length === 11 && digits.startsWith("0")) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  }

  return value;
}

/** 923228888278 becomes +92 322 888 8278. */
export function formatInternational(value: string): string {
  const digits = value.replace(/[^\d]/g, "");

  if (digits.length === 12 && digits.startsWith("92")) {
    return `+${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
  }

  return value;
}
