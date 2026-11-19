/**
 * Copy for the authorized seller directory.
 *
 * A listing confirms the business and the contact details LONEX has published.
 * It is not a warranty, an authenticity certificate or a promise of after-sales
 * service. Keep that boundary in any edit.
 */

export const SELLER_WHY = [
  {
    title: "Confirmed by LONEX",
    copy: "A listing means LONEX has appointed the business and confirmed the contact details shown here. It is a directory entry, not an advertisement.",
  },
  {
    title: "A clear route to the range",
    copy: "An authorized seller can point you to the published models, the product information behind them and the next step for a specific enquiry.",
  },
  {
    title: "A documented starting point",
    copy: "The directory tells you who to speak to and where they are. Quantities, pricing, delivery and terms are agreed in writing with the seller.",
  },
] as const;

export const BEFORE_PURCHASE = [
  {
    title: "Confirm the seller is listed",
    copy: "Check the business and city in this directory before relying on a seller's claim. If it is not listed, confirm with LONEX first.",
  },
  {
    title: "Check the model code",
    copy: "Use the verification page to confirm that the model code belongs to a model registered with LONEX.",
  },
  {
    title: "Ask for the details in writing",
    copy: "Request the model name, quantity, price and delivery terms in a written quotation, not only in conversation.",
  },
  {
    title: "Inspect what you are buying",
    copy: "Ask what is included with the unit, confirm its condition and keep the documentation that comes with it.",
  },
] as const;

export const LISTING_FIELDS = [
  "Business name",
  "City",
  "Complete address",
  "Contact number",
  "WhatsApp, where supplied",
  "Map link, where supplied",
] as const;

export const RANGE_LINKS = [
  {
    name: "Solar Panels",
    href: "/solar",
    line: "Modules and panels for residential and commercial generation.",
    image: "/images/lonex-step-1/generate-solar.webp",
    alt: "Solar modules on a roof at sunset",
  },
  {
    name: "Batteries",
    href: "/batteries",
    line: "Storage for generated electricity, with backup where the system supports it.",
    image: "/images/lonex-step-1/store-battery.webp",
    alt: "Home battery units and an inverter mounted against an interior wall",
  },
  {
    name: "Electric Scooters",
    href: "/electric-scooters",
    line: "Electric two-wheelers for short urban journeys and everyday errands.",
    image: "/images/lonex-step-1/move-mobility.webp",
    alt: "An electric scooter parked in a covered rack",
  },
] as const;
