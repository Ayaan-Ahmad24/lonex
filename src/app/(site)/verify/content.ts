/**
 * Copy for the public model verification page.
 *
 * Every statement here is limited to what the registry actually does: it
 * matches a registered model code. It does not authenticate a physical unit,
 * a seller or a condition. Keep that distinction in any edit.
 */

export const WHY_POINTS = [
  {
    title: "Confirm the model is registered",
    copy: "A match means the code belongs to a model that LONEX has entered in its registry and still publishes. It is the first check, not the final one.",
  },
  {
    title: "Separate identity from condition",
    copy: "Registration describes the model. The age, history, completeness and physical condition of an individual unit are separate questions.",
  },
  {
    title: "Ask better questions before buying",
    copy: "A confirmed model gives you a name, a category and a registration date to compare against the product in front of you and the paperwork that comes with it.",
  },
] as const;

export const STEPS = [
  {
    index: "01",
    title: "Locate the code",
    copy: "The verification code is printed on the product label or supplied with the documentation. It follows the format LNX-XXXX-XXXX-XXXX.",
  },
  {
    index: "02",
    title: "Enter it once",
    copy: "Type or paste the code into the field above. Capitalisation, dashes and spaces do not affect the check, so an exact transcription is not required.",
  },
  {
    index: "03",
    title: "Read the response",
    copy: "A match returns the registered model, its category and its registration date, with a link to the product page. Anything else returns one generic response.",
  },
] as const;

export const RESULT_FIELDS = [
  {
    label: "Model",
    copy: "The published product name held against the code.",
  },
  {
    label: "Category",
    copy: "The LONEX range the model belongs to.",
  },
  {
    label: "Registered",
    copy: "The date the model code was entered in the registry.",
  },
  {
    label: "Product",
    copy: "A direct link to the published model page, where the available information is listed.",
  },
] as const;

export const NOT_FOUND_CHECKS = [
  "Compare each character with the label. The 12-character body excludes I, L, O and U to avoid misreading.",
  "Dashes and spaces are ignored, so a code copied without them is still accepted.",
  "If the label is damaged or the code is missing, contact LONEX with the model name and any photographs you have.",
] as const;

export const QUESTIONS = [
  {
    q: "Where do I find the verification code?",
    a: "The code is printed on the product label or included with the documentation supplied by LONEX. It follows the format LNX-XXXX-XXXX-XXXX.",
  },
  {
    q: "Why do different invalid codes return the same message?",
    a: "Uniform responses prevent the registry from being used to enumerate valid model codes. A single message keeps the check private and the registry useful.",
  },
  {
    q: "Is a match a guarantee of authenticity?",
    a: "No. A match confirms model registration only. It does not verify an individual physical unit, its condition, its history or the seller offering it.",
  },
  {
    q: "What if the code belongs to a model that is no longer listed?",
    a: "Inactive registrations and unpublished models return the same response as an unknown code. Contact LONEX if you believe the model should still be listed.",
  },
] as const;
