/**
 * Copy for the About page.
 *
 * The page describes a connected view of energy: generation, storage and
 * mobility. It makes no claims about company age, scale, certifications,
 * partnerships or completed programmes. Keep that boundary in any edit.
 */

export const PILLARS = [
  {
    id: "generate",
    index: "01",
    name: "Solar Panels",
    shortName: "Generate",
    href: "/solar",
    title: "Make the daylight count.",
    copy: "Solar modules turn sunlight into usable electricity. The practical value is not only the generation itself, but the reduction in what a property draws from the grid while the sun is up, and the foundation it creates for storage.",
    detail:
      "We select modules for residential and commercial roofs, and explain the conditions that shape a real installation: available area, orientation, shade, and the way the building uses power.",
    points: ["Rooftop and ground-mount applications", "Residential and commercial systems"],
    image: "/images/v2/craft-panel.webp",
    alt: "A technician lifting a solar module into position on a tiled roof",
  },
  {
    id: "store",
    index: "02",
    name: "Batteries",
    shortName: "Store",
    href: "/batteries",
    title: "Keep the day after dark.",
    copy: "A battery changes when generated electricity can be used. Instead of exporting every surplus unit at once, a property can hold that energy and draw on it in the evening, when demand is higher than generation, or during an outage where the system supports it.",
    detail:
      "Storage is also a compatibility question. Capacity, inverter pairing and the way a property uses power matter more than a headline number, so the system should be sized around the life it will serve.",
    points: ["Home and commercial storage", "Paired with solar generation"],
    image: "/images/lonex-step-1/store-battery.webp",
    alt: "Two white home battery units and a wall-mounted inverter in a warm interior",
  },
  {
    id: "move",
    index: "03",
    name: "Electric Scooters",
    shortName: "Move",
    href: "/electric-scooters",
    title: "Turn power into passage.",
    copy: "Electric scooters make short journeys quieter and simpler. For errands, commutes and the distances that are too far to walk but too short to justify a car, they offer a practical alternative that can be charged from the same supply as the rest of a property.",
    detail:
      "We focus on how the scooter will be used — the length of the journey, the surface, where it will be stored, and how it will be charged — rather than on performance language that rarely survives a daily routine.",
    points: ["Short urban journeys", "Everyday errands and commutes"],
    image: "/images/v2/move-city.png",
    alt: "A black electric scooter parked in a covered city rack",
  },
] as const;

export const APPROACH = [
  {
    title: "Selection with a reason",
    copy: "We keep a focused range rather than a catalogue of everything. A product earns its place by fitting a real use: a roof, a storage need, a daily journey.",
  },
  {
    title: "Plain description",
    copy: "Performance language is easy to borrow. We prefer the specifics that affect an owner: what a system includes, what it depends on, how it is installed, and which questions to ask before committing.",
  },
  {
    title: "Understanding before recommendation",
    copy: "A household, a shop and a fleet do not need the same answer. We start with the property, the pattern of use and the budget, then work back to the equipment.",
  },
  {
    title: "A connected system",
    copy: "Generation, storage and mobility are more useful when planned together. A battery sized for the evening, an array sized for the battery, a bike charged from the same supply: the connections matter.",
  },
] as const;

export const COMMITMENTS = [
  {
    title: "Plain language",
    copy: "Technical terms are useful only when they are explained. We try to write and speak for the person who will live with the system, not only for the engineer who installs it.",
  },
  {
    title: "Informed choice",
    copy: "A customer who understands the difference between generating, storing and moving energy is better able to judge what they are offered, and what they are not.",
  },
  {
    title: "Responsible progress",
    copy: "We prefer a pace that can be sustained: suitable products, honest expectations and systems that can be looked after. Progress that cannot be explained is not progress we want to claim.",
  },
] as const;

export const RANGE_LINKS = [
  { label: "Solar Panels", href: "/solar", meta: "Generate" },
  { label: "Batteries", href: "/batteries", meta: "Store" },
  { label: "Electric Scooters", href: "/electric-scooters", meta: "Move" },
] as const;

export const STORY = {
  intro:
    "Most energy decisions arrive in pieces: a solar quotation, a battery specification, a bike in a showroom. Each is presented on its own, with its own numbers, and the connection between them is left for the customer to work out. LONEX exists to close that gap.",
  vision:
    "Our vision is a home or business that can generate, store and use energy as one considered system, and understand every part of it. That means choosing products for real conditions, explaining what each one can and cannot do, and keeping the relationship between generation, storage and movement visible.",
  mark: "The infinity mark carries the same idea: sunlight captured, energy held, movement returned. It is not a claim about scale. It is a way of thinking about power that does not stop at the socket.",
} as const;
