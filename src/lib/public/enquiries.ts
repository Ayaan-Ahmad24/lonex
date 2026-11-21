import { mailtoHref } from "./contact";

/**
 * Shared composition for public email enquiries.
 *
 * Every enquiry on the public site opens the visitor's mail client with a
 * prepared message. The recipients, the `mailto:` encoding and the "no email
 * configured" fallback all live here, so a category page, a product page and
 * the seller directory cannot drift apart. Each builder keeps the context that
 * makes the message useful to the recipient (the category, the product, the
 * seller or the page).
 *
 * All builders return null when no contact address is configured; callers use
 * that to hide the email action rather than render a broken `mailto:` link.
 */
function composeEnquiry(
  email: string,
  subject: string,
  body: string,
): string | null {
  if (!email.trim()) {
    return null;
  }

  return mailtoHref(email, subject, body);
}

export function categoryEnquiry(
  email: string,
  input: {
    /** Short range label used in the subject line. */
    label: string;
    /** Category name shown in the message. */
    name: string;
    path: string;
    intro: string;
    closing: string;
  },
): string | null {
  return composeEnquiry(
    email,
    `LONEX Product Enquiry — ${input.label}`,
    `Hello LONEX,

${input.intro}

Category: ${input.name}
Page: ${input.path}

${input.closing}

Thank you.`,
  );
}

export function productEnquiry(
  email: string,
  input: {
    productName: string;
    categoryName: string;
    path: string;
  },
): string | null {
  return composeEnquiry(
    email,
    `LONEX Product Enquiry — ${input.productName}`,
    `Hello LONEX,

I would like to enquire about the following product:

Product: ${input.productName}
Category: ${input.categoryName}
Page: ${input.path}

Please share availability, lead time and pricing details.

Thank you.`,
  );
}

export function generalEnquiry(email: string): string | null {
  return composeEnquiry(
    email,
    "General Enquiry — LONEX",
    `Hello LONEX,

I would like to make a general enquiry.

Please reply at your earliest convenience.

Thank you.`,
  );
}

export function sellerDirectoryEnquiry(email: string): string | null {
  return composeEnquiry(
    email,
    "LONEX Seller Enquiry — Authorized Sellers",
    `Hello LONEX,

I would like help finding an authorized seller.

Page: /authorized-sellers

Please share the current seller position in my city.

Thank you.`,
  );
}

export function sellerEnquiry(
  email: string,
  seller: { name: string; city: string; address: string },
): string | null {
  return composeEnquiry(
    email,
    `LONEX Seller Enquiry — ${seller.name}`,
    `Hello LONEX,

I would like to enquire about ${seller.name} in ${seller.city}.

Seller: ${seller.name}
City: ${seller.city}
Address: ${seller.address}

Please share product availability and pricing details.

Thank you.`,
  );
}

export function verificationEnquiry(email: string): string | null {
  return composeEnquiry(
    email,
    "LONEX Model Verification Enquiry",
    `Hello LONEX,

I need help checking a model verification code.

Please share the model registration status and what it covers.

Thank you.`,
  );
}
