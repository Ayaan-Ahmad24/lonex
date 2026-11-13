/** Small contact helpers shared by the footer, category pages and product pages. */

export function whatsappHref(value: string, message?: string): string | null {
  const digits = value.replace(/[^\d]/g, "");

  if (digits.length < 6) {
    return null;
  }

  const base = `https://wa.me/${digits}`;

  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
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
