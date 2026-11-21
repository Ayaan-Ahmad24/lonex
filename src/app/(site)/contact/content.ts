/**
 * Copy for the contact page.
 *
 * Every statement here is either a description of how the page works or a
 * question we can answer. No response times, opening hours, certifications or
 * completed-project claims are made. Keep that boundary in any edit.
 */

export const HERO = {
  eyebrow: "Contact",
  lineOne: "Let's move",
  lineTwo: "things",
  lineTwoAccent: "forward.",
  intro: [
    "A rooftop system, a battery that covers the evening, an electric scooter for the daily route — they are separate decisions that tend to meet in the same conversation. Tell us what you are planning and we will help you work out the next step.",
    "LONEX is based in Lahore. Share the property, the journeys or the system you have in mind, and we will answer with the details that apply to it.",
  ],
  facts: [
    { label: "Based", value: "Lahore, Pakistan" },
    { label: "Range", value: "Solar · Storage · Mobility" },
    { label: "Channels", value: "Call · Email · Form" },
  ],
  captionIndex: "01",
  caption: "A home, a family, a route — the same conversation.",
  imageAlt:
    "A family looking up together in warm evening light, outdoors among trees",
  insetAlt: "An electric vehicle charging connector lit at sunset",
} as const;

export const DIRECT = {
  eyebrow: "Direct contact",
  title: "A direct line, if you prefer one.",
  intro:
    "Phone and email reach the same office. Use whichever suits the conversation — a quick question, a site detail, or a longer discussion about a system.",
  note:
    "No opening hours are listed here. If you are planning a visit, message first and we will confirm the details with you.",
} as const;

export const ENQUIRY = {
  eyebrow: "Enquiry",
  title: "Tell us what you are planning.",
  intro:
    "A few details are enough to start. The form prepares a structured message and opens your email client, where you can read it, change it, and send it yourself.",
  steps: [
    {
      index: "01",
      title: "Write",
      copy: "Your name, a way to reply, and the shape of the enquiry.",
    },
    {
      index: "02",
      title: "Review",
      copy: "The message opens in your email client, complete and editable.",
    },
    {
      index: "03",
      title: "Send",
      copy: "Nothing leaves this page until you press send there.",
    },
  ],
  note:
    "This form does not send or store anything on the website. It prepares a message for you to review in your email client.",
} as const;

export const CATEGORIES = [
  {
    id: "solar",
    label: "Solar",
    hint: "Generation for a roof or site",
  },
  {
    id: "batteries",
    label: "Batteries",
    hint: "Storage and evening supply",
  },
  {
    id: "electric-scooters",
    label: "Electric Scooters",
    hint: "Daily journeys and charging",
  },
  {
    id: "general",
    label: "General",
    hint: "Something else entirely",
  },
] as const;

export type EnquiryCategory = (typeof CATEGORIES)[number]["id"];

export const FORM = {
  sheetLabel: "Enquiry form",
  sheetMeta: "All fields required",
  submit: "Prepare message in email",
  working: "Preparing message",
  fields: {
    name: {
      label: "Full name",
      placeholder: "Your full name",
      index: "01",
    },
    email: {
      label: "Email",
      placeholder: "you@example.com",
      index: "02",
    },
    phone: {
      label: "Phone",
      placeholder: "03xx xxxxxxx",
      index: "03",
    },
    category: {
      label: "Enquiry category",
      index: "04",
    },
    subject: {
      label: "Subject",
      placeholder: "What is this about?",
      index: "05",
    },
    message: {
      label: "Message",
      placeholder:
        "The property, the journey, or the question you are starting with.",
      index: "06",
    },
  },
} as const;

export const LOCATION = {
  eyebrow: "Office",
  title: "Find us on Brandth Road.",
  intro:
    "Enquiries are handled from our office in Lahore. For a visit, message or call first and we will confirm the details with you.",
  mapLabel: "Open in Google Maps",
  mapNote: "The map opens in a new tab.",
} as const;

export const CLOSING = {
  eyebrow: "Next step",
  title: "Prefer a conversation?",
  copy:
    "Call or message the office directly. If the enquiry is easier to write down, the form above prepares it for you.",
} as const;

/** Generic opener used by the direct WhatsApp link, before the form is used. */
export const WHATSAPP_OPENER =
  "Hello LONEX, I would like to discuss a solar, storage or electric mobility enquiry.";
