/**
 * Public editorial copy for the range.
 *
 * The CMS owns the records — names, categories, images, prices and, where they
 * exist, specifications. This module supplies the customer-facing editorial
 * layer around those records: the introduction, the benefits and the use cases
 * that a product page needs to be useful.
 *
 * Two rules apply throughout:
 *
 * 1. Nothing here states a specification, capacity, efficiency, saving or
 *    environmental outcome. Those must come from the product record.
 * 2. Nothing here announces a programme, partnership or project that LONEX has
 *    not confirmed. Community content is written as direction and ambition.
 */

export type EditorialPoint = {
  title: string;
  copy: string;
};

export type CategoryEditorial = {
  eyebrow: string;
  heroLines: string[];
  heroIntro: string[];
  heroMeta: string[];
  primaryCta: string;
  secondaryCta: string;
  intro: {
    eyebrow: string;
    title: string;
    body: string[];
    link?: { label: string; href: string };
  };
  benefits: {
    eyebrow: string;
    title: string;
    lede: string;
    items: EditorialPoint[];
  };
  products: {
    eyebrow: string;
    title: string;
    lede: string;
    enquiryNote: string;
  };
  charging?: {
    eyebrow: string;
    title: string;
    lede: string;
    items: EditorialPoint[];
    note: string;
  };
  community: {
    lede: string;
    pillars: EditorialPoint[];
    note: string;
  };
  closing: {
    title: string;
    body: string;
  };
  seoDescription: string;
};

export type ProductEditorial = {
  tagline: string;
  summary: string;
  intro: string[];
  benefits: EditorialPoint[];
  useCases: string[];
  note?: string;
  seoDescription: string;
};

export const COMMUNITY_TITLE = "Beyond Energy. Towards Better Communities.";

const SOLAR: CategoryEditorial = {
  eyebrow: "Solar energy",
  heroLines: ["Daylight,", "put to work."],
  heroIntro: [
    "Solar turns a roof, a shed or a commercial building into a place where electricity is generated on site. For many properties it is the most direct way to take part in the energy transition — producing power where it is used rather than waiting for the grid to change.",
    "LONEX builds solar modules for residential and commercial installations. The focus is on the whole arrangement: how the array is sized, how it is mounted, where the power goes and how the system can grow.",
  ],
  heroMeta: ["Residential", "Commercial", "System planning"],
  primaryCta: "Explore solar models",
  secondaryCta: "Talk to LONEX",
  intro: {
    eyebrow: "The whole arrangement",
    title: "A solar installation is a system, not a single panel.",
    body: [
      "Modules generate direct current. An inverter makes it usable. Cabling, protection and monitoring hold the installation together, and storage can change when the power is used. The quality of the result depends on how those parts are matched to the building.",
      "That is why we start with the roof and the load, not the panel. Shading, orientation, available area and the way a building uses electricity through the day all shape a system before a single module is chosen.",
    ],
    link: { label: "See how storage fits", href: "/batteries" },
  },
  benefits: {
    eyebrow: "The case for solar",
    title: "A generating asset, planned around the building.",
    lede: "Solar is simple in principle and specific in practice. Four considerations sit behind every installation we help plan.",
    items: [
      {
        title: "Energy generation on site",
        copy: "A photovoltaic array produces electricity from daylight. It works alongside the grid rather than replacing it overnight, and it gives a property a generating capacity of its own.",
      },
      {
        title: "Less dependence on grid electricity",
        copy: "Every unit generated on site is a unit the building does not need to draw at that moment. The scale of the effect depends on the array, the load and the weather — so it is designed, not assumed.",
      },
      {
        title: "Residential and commercial applications",
        copy: "Homes, offices, shops, schools and light industrial roofs ask different questions of a system. Roof structure, shading, load profile and available area all shape the answer.",
      },
      {
        title: "Planning for the long term",
        copy: "Solar is a long-lived asset. Layout, mounting, cable routes and future storage should be considered at the start, so the system can be extended or integrated later without starting again.",
      },
    ],
  },
  products: {
    eyebrow: "The solar range",
    title: "Two modules. One system approach.",
    lede: "Each model begins with the same question: what is the building trying to power, and how should that be achieved?",
    enquiryNote: "Availability and system details are confirmed directly with LONEX.",
  },
  community: {
    lede: "Solar does more than change a meter reading. It changes how a building understands the energy it uses — and how the people in it make decisions about the future.",
    pillars: [
      {
        title: "Energy awareness and education",
        copy: "A visible solar installation makes generation tangible. It opens a conversation about when power is produced, where it goes and why timing matters.",
      },
      {
        title: "More informed purchasing decisions",
        copy: "Clear information about components, system design and realistic expectations helps buyers compare proposals on substance rather than slogans.",
      },
      {
        title: "Responsible technology adoption",
        copy: "Solar is not the right answer for every roof. Honest assessment — including when a smaller system or a different approach makes more sense — is part of responsible adoption.",
      },
      {
        title: "Energy that stays local",
        copy: "Generation close to the point of use makes the connection between a building and its power supply easier to see — and easier to act on.",
      },
      {
        title: "Local skills and participation",
        copy: "As LONEX grows, our ambition is to support local installation knowledge, service capability and participation in the energy transition.",
      },
    ],
    note: "These are ambitions, not announcements. LONEX has not yet launched specific community programmes; this section describes the direction we intend to take as the company develops.",
  },
  closing: {
    title: "Plan the array around the building.",
    body: "Send us the roof, the load and the ambition. We will help you work out what the system can — and cannot — do.",
  },
  seoDescription:
    "Solar modules for residential and commercial rooftops, built and planned by LONEX as part of a complete generating system.",
};

const BATTERIES: CategoryEditorial = {
  eyebrow: "Energy storage",
  heroLines: ["Store the day.", "Use it when it matters."],
  heroIntro: [
    "A battery changes the timing of energy. Instead of using solar only while the sun is up, a household can hold generated electricity and draw on it later — in the evening, through a cloudy spell, or during an outage where the system is configured for backup.",
    "LONEX supplies home battery systems and hybrid inverters for installations that combine generation with storage. Capacity, backup behaviour and compatibility are decided per system, not assumed.",
  ],
  heroMeta: ["Generate", "Store", "Use"],
  primaryCta: "Explore storage",
  secondaryCta: "Discuss a system",
  intro: {
    eyebrow: "Storage is a decision about time",
    title: "The sun does not wait for the evening.",
    body: [
      "Generation and demand rarely arrive together. A solar array is most productive in the middle of the day; a household is often most demanding after dark. Storage sits between the two, holding what is available until it is useful.",
      "The right battery is not simply the largest one. It is the one that matches the array, the inverter and the way a building actually uses power — with a clear understanding of what backup, if any, the installation can support.",
    ],
    link: { label: "Explore the solar range", href: "/solar" },
  },
  benefits: {
    eyebrow: "The case for storage",
    title: "A better fit between generation and use.",
    lede: "Storage is a system decision. These are the four outcomes it is chosen for.",
    items: [
      {
        title: "Energy storage",
        copy: "A battery holds electricity for later. For a solar household, that means the output of the array can be used after the sun has gone down instead of being exported or lost.",
      },
      {
        title: "Better use of generated electricity",
        copy: "Storage lets a property consume more of what it produces. The right capacity depends on generation, evening demand and how the system is managed.",
      },
      {
        title: "Backup possibilities, where supported",
        copy: "Some systems can keep selected circuits running during an outage. This depends on the inverter, battery, wiring and configuration — it is a system decision, not a battery feature in isolation.",
      },
      {
        title: "Integration with solar",
        copy: "A hybrid inverter coordinates generation, storage and household loads. The aim is a single, understandable system rather than separate devices working around each other.",
      },
    ],
  },
  products: {
    eyebrow: "The storage range",
    title: "Two components of one system.",
    lede: "A battery holds the energy. An inverter decides how it moves. Together they turn a solar array into something a household can use on its own terms.",
    enquiryNote: "Compatibility and backup scope are confirmed for the installation, not assumed from the category.",
  },
  community: {
    lede: "Storage is invisible until it matters. The wider value lies in what people learn about energy — when it is made, when it is needed and how to plan for both.",
    pillars: [
      {
        title: "Energy awareness and education",
        copy: "Storage makes the gap between generation and demand visible. That understanding is the beginning of more deliberate energy use.",
      },
      {
        title: "More informed purchasing decisions",
        copy: "Capacity, backup scope and compatibility are easy to overstate. Clear, system-level information helps buyers ask better questions.",
      },
      {
        title: "Responsible technology adoption",
        copy: "Not every home needs a battery, and not every battery suits every inverter. Responsible adoption starts with an honest assessment.",
      },
      {
        title: "A steadier evening peak",
        copy: "Using stored energy when demand is highest eases the pressure on the grid at the busiest hour, and makes the household's own pattern easier to plan around.",
      },
      {
        title: "Local skills and participation",
        copy: "Storage systems need competent installation and service. Our ambition is to support the local capability that keeps them working safely.",
      },
    ],
    note: "These are ambitions, not announcements. LONEX has not yet launched specific community programmes; this section describes the direction we intend to take as the company develops.",
  },
  closing: {
    title: "Design the storage around the evening.",
    body: "Tell us when the building uses the most power. We will help you plan storage that fits that pattern — and be clear about what it cannot do.",
  },
  seoDescription:
    "Home battery systems and hybrid inverters from LONEX, planned around the way a household generates, stores and uses electricity.",
};

const ELECTRIC_SCOOTERS: CategoryEditorial = {
  eyebrow: "Electric mobility",
  heroLines: ["The city,", "within reach."],
  heroIntro: [
    "Most journeys are short. The commute, the school run, the errand across town — distances a car is often used for simply because it is there. An electric scooter offers another way to cover them: quiet, compact and powered by electricity.",
    "LONEX supplies electric scooters for everyday urban travel. The aim is practical mobility for the journeys where a scooter makes sense — not a claim that it replaces every trip.",
  ],
  heroMeta: ["Everyday journeys", "Urban travel", "Short distances"],
  primaryCta: "Explore electric scooters",
  secondaryCta: "Make an enquiry",
  intro: {
    eyebrow: "A different measure of distance",
    title: "Less friction between here and there.",
    body: [
      "Electric mobility is less about speed than about removing reasons not to go. A scooter takes the effort out of a short trip, carries a bag or a passenger where the model allows, and parks where a car cannot.",
      "For the right journey, that changes the calculation. The choice should be made on distance, route, weather, carrying needs and confidence — not on a promise that one vehicle suits every day.",
    ],
    link: { label: "See the energy behind it", href: "/solar" },
  },
  benefits: {
    eyebrow: "The case for electric mobility",
    title: "Built around the journeys that repeat.",
    lede: "The value of an electric scooter shows up in routine, not in extremes. Four practical reasons sit behind it.",
    items: [
      {
        title: "Everyday urban mobility",
        copy: "A compact electric scooter fits the rhythm of a city: door to door, without the search for a parking space or the wait in traffic.",
      },
      {
        title: "Convenient short-distance travel",
        copy: "Errands, commutes and school runs are often only a few kilometres. An electric scooter is sized for those distances and ready without a special trip to refuel.",
      },
      {
        title: "The benefits of electric drive",
        copy: "Electric power removes the effort from routine journeys, so a wider range of people can consider two wheels for practical travel.",
      },
      {
        title: "A practical alternative for suitable journeys",
        copy: "It is not a replacement for every car journey. It is a credible option where distance, weather, carrying needs and route allow — and the choice should be made honestly.",
      },
    ],
  },
  products: {
    eyebrow: "The electric scooter range",
    title: "Built for the everyday route.",
    lede: "Each model is presented with the information LONEX has confirmed. The figures that matter are published on the product page for that unit.",
    enquiryNote: "Model-specific details are confirmed for the individual unit.",
  },
  charging: {
    eyebrow: "Charging and everyday use",
    title: "A routine, not a ritual.",
    lede: "An electric scooter is only practical if charging and storage fit the pace of an ordinary week. These are the questions worth settling before you buy.",
    items: [
      {
        title: "Charge where you park",
        copy: "Charging usually happens where the scooter stands — at home or at work. Confirm the socket, the cable route and whether the battery can be removed before you plan the routine.",
      },
      {
        title: "Fit it around the week",
        copy: "Charging belongs in the hours when the scooter is standing still. The right pattern depends on the charger supplied with the model and the distance you actually cover.",
      },
      {
        title: "Plan the storage",
        copy: "A scooter needs somewhere secure and weather-aware to stand. Ground-floor access, lifts and shared parking all shape whether the routine is easy or awkward.",
      },
      {
        title: "Ask for the model figures",
        copy: "Charging time and range are details of a specific model. Ask for them for the exact unit you are considering rather than relying on a category-level claim.",
      },
    ],
    note: "Charging time, range and battery details are confirmed per model by LONEX. Nothing on this page assumes a figure.",
  },
  community: {
    lede: "Mobility shapes a neighbourhood. Quieter streets, shorter trips and more people moving through the city change how a place feels as much as how it functions.",
    pillars: [
      {
        title: "Energy awareness and education",
        copy: "Electric mobility makes the connection between electricity and movement visible — and raises useful questions about where that power comes from.",
      },
      {
        title: "More informed purchasing decisions",
        copy: "Range, support, servicing and local conditions matter more than headline claims. Clear information helps riders choose a scooter that fits their actual journeys.",
      },
      {
        title: "Responsible technology adoption",
        copy: "An electric scooter should match the rider, the route and the load. Responsible adoption means saying so when a different solution is the better one.",
      },
      {
        title: "Cleaner, more thoughtful mobility",
        copy: "Every short trip taken on an electric scooter is a trip not taken by a larger vehicle. The effect is cumulative, and it begins with practical choices.",
      },
      {
        title: "Local skills and participation",
        copy: "Sales, servicing and safe riding depend on local capability. Our ambition is to support the people and businesses that make electric mobility work day to day.",
      },
    ],
    note: "These are ambitions, not announcements. LONEX has not yet launched specific community programmes; this section describes the direction we intend to take as the company develops.",
  },
  closing: {
    title: "Start with the journey.",
    body: "Tell us where you need to go, how often and where the scooter will be charged. We will help you work out whether an electric scooter is the right answer.",
  },
  seoDescription:
    "Electric scooters from LONEX for everyday urban journeys, short-distance travel and practical electric mobility in the city.",
};

export const CATEGORY_EDITORIAL: Record<string, CategoryEditorial> = {
  solar: SOLAR,
  batteries: BATTERIES,
  "electric-scooters": ELECTRIC_SCOOTERS,
};

const PRODUCTS: Record<string, ProductEditorial> = {
  "solar-module": {
    tagline: "The generating layer of a rooftop array.",
    summary:
      "A photovoltaic module for residential and commercial rooftops, planned into a complete generating system.",
    intro: [
      "A solar module converts daylight into direct current. In a rooftop installation it is the visible, generating part of the system — repeated across the roof in a layout shaped by the building, the shading and the available area.",
      "This LONEX module is offered for residential and commercial rooftops. Final system details are agreed during planning, when the array, the inverter and any storage are considered together rather than chosen in isolation.",
    ],
    benefits: [
      {
        title: "Daylight to electricity",
        copy: "Photovoltaic cells generate direct current from daylight, forming the source of a rooftop system.",
      },
      {
        title: "Rooftop format",
        copy: "Intended for mounting in arrays on homes and commercial buildings, with layout and fixing decided during system design.",
      },
      {
        title: "Part of a planned system",
        copy: "Output becomes usable electricity through an inverter, with protection, cabling and monitoring matched to the installation.",
      },
    ],
    useCases: [
      "Residential rooftops",
      "Commercial and institutional roofs",
      "New systems and array expansion",
    ],
    seoDescription:
      "A LONEX solar module for residential and commercial rooftop systems, planned around the building and its energy use.",
  },
  "solar-panel": {
    tagline: "A complete panel for residential and commercial roofs.",
    summary:
      "A finished solar panel, supplied for rooftop installations and planned as part of the wider system.",
    intro: [
      "The panel is the unit most people picture when they imagine solar: a complete assembly installed as part of an array and connected to the rest of the system on the roof and inside the building.",
      "LONEX supplies this panel for homes and commercial buildings. As with every model in the range, the installation is planned around the property rather than chosen from a datasheet alone.",
    ],
    benefits: [
      {
        title: "A complete panel unit",
        copy: "Supplied as a finished panel rather than a loose cell assembly, ready to be planned into a rooftop array.",
      },
      {
        title: "For homes and businesses",
        copy: "Intended for residential and commercial rooftop installations, subject to a site assessment.",
      },
      {
        title: "Supported by system planning",
        copy: "Mounting, orientation and connection are agreed as part of the wider installation.",
      },
    ],
    useCases: [
      "Residential rooftops",
      "Commercial rooftops",
      "Rooftop system planning",
    ],
    seoDescription:
      "A LONEX solar panel for residential and commercial rooftop installations, supplied as part of a planned system.",
  },
  "home-battery": {
    tagline: "Hold generated energy for the hours that matter.",
    summary:
      "A home battery that stores generated electricity for use later in the day, as part of a planned solar system.",
    intro: [
      "A home battery stores electricity so it can be used later. In a solar household, that usually means holding the middle of the day's generation for the evening, when demand is highest and the array is no longer producing.",
      "This LONEX home battery is offered for households that generate their own power. Capacity, backup scope and compatibility are confirmed during system design, because a battery is only as useful as the system it is part of.",
    ],
    benefits: [
      {
        title: "Stores generated energy",
        copy: "Holds surplus electricity from a solar array for use when generation is low or absent.",
      },
      {
        title: "Shifts use into the evening",
        copy: "Makes it possible to draw on stored power after sunset instead of relying entirely on the grid at that moment.",
      },
      {
        title: "Backup where the system supports it",
        copy: "Selected circuits can remain powered during an outage when the inverter, wiring and battery configuration are set up for backup.",
      },
    ],
    useCases: [
      "Solar households",
      "Evening-heavy energy use",
      "Systems planned for backup capability",
    ],
    note: "Backup capability is a property of the whole installation, not the battery alone. It is confirmed during system design.",
    seoDescription:
      "A LONEX home battery that stores solar energy for later use, planned around the household and its evening demand.",
  },
  "hybrid-inverter": {
    tagline: "The meeting point of generation, storage and demand.",
    summary:
      "A hybrid inverter that coordinates a solar array, a battery and the loads of the building.",
    intro: [
      "A hybrid inverter coordinates a solar array, a battery and the building's electrical load. It converts direct current from the array into usable alternating current, manages charging and discharging, and decides where power flows at any moment.",
      "This LONEX inverter is offered for installations that combine generation with storage. Its role is central but not universal: the right model depends on the array, the battery and the loads it will serve.",
    ],
    benefits: [
      {
        title: "Coordinates the system",
        copy: "Brings generation, stored energy and household demand into one managed arrangement.",
      },
      {
        title: "Enables solar and storage together",
        copy: "Provides the working link between a solar array and a battery, so energy can be used, stored or drawn as needed.",
      },
      {
        title: "Supports backup configurations",
        copy: "Where the installation is designed for it, the inverter is the component that makes backup power possible.",
      },
    ],
    useCases: [
      "New solar and storage systems",
      "Storage retrofits where compatible",
      "Installations with backup requirements",
    ],
    note: "Compatibility with a specific array and battery is confirmed during system design.",
    seoDescription:
      "A LONEX hybrid inverter for solar and storage systems, coordinating generation, battery charging and household demand.",
  },
  "electric-scooter": {
    tagline: "An electric scooter for the everyday journey.",
    summary:
      "A powered scooter for short urban trips, everyday errands and the regular commute.",
    intro: [
      "This electric scooter is designed around short urban trips: the commute, the errand, the school run. Electric power removes the effort of getting there, which makes the scooter a realistic option for more people and more days.",
      "It belongs to the LONEX electric mobility range and is offered for everyday travel. Model-specific details — including battery, motor and range — are confirmed for the individual unit rather than assumed from the category.",
    ],
    benefits: [
      {
        title: "Powered for the city",
        copy: "An electric drive supports the rider, making short journeys easier and less dependent on physical effort.",
      },
      {
        title: "Compact urban travel",
        copy: "Sized for city streets and easy parking, where a larger vehicle is often unnecessary.",
      },
      {
        title: "Everyday practicality",
        copy: "Intended for routine trips rather than occasional use, with a layout built around daily travel.",
      },
    ],
    useCases: ["Daily commuting", "Short errands", "Local urban travel"],
    note: "Range and performance depend on the specific model and on how it is ridden.",
    seoDescription:
      "A LONEX electric scooter for everyday urban journeys, short errands and the regular commute.",
  },
  "electric-commuter-scooter": {
    tagline: "A commuter electric scooter for shorter daily journeys.",
    summary:
      "A focused commuter scooter for the regular trip to work and the short journeys around it.",
    intro: [
      "The commute is the journey an electric scooter can change most. It is repeated, predictable and often short enough that a car is more vehicle than the trip requires.",
      "This commuter model is offered for shorter daily journeys in urban conditions. As with every model in the range, the details that matter — battery, motor and range — are confirmed for the individual unit.",
    ],
    benefits: [
      {
        title: "Built around the commute",
        copy: "A layout intended for the repeated journey to work and the short trips that surround it.",
      },
      {
        title: "Quiet electric drive",
        copy: "Electric power makes the ride calmer and less strenuous, particularly on longer or busier routes.",
      },
      {
        title: "Simple to live with",
        copy: "Compact enough for city parking and everyday storage, without the footprint of a larger vehicle.",
      },
    ],
    useCases: ["Daily commuting", "Short-distance travel", "Urban errands"],
    note: "Range and performance depend on the specific model and on how it is ridden.",
    seoDescription:
      "A LONEX commuter electric scooter for shorter daily journeys and practical urban travel.",
  },
};

/**
 * Sentences that belong to the content-management process rather than to the
 * customer. Records written before this layer existed still carry a few of
 * them, so they are removed from any fallback copy that reaches a page.
 */
const INTERNAL_SENTENCE =
  /(?:[^.]*?(?:published|publishing|draft material|once confirmed|once supplied|approved by LONEX|prices follow)[^.]*\.)/gi;

export function customerFacingCopy(text: string | null | undefined): string {
  if (!text) {
    return "";
  }

  return text
    .replace(INTERNAL_SENTENCE, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function getCategoryEditorial(
  slug: string,
  categoryName: string,
  categoryDescription: string | null,
): CategoryEditorial {
  const editorial = CATEGORY_EDITORIAL[slug];

  if (editorial) {
    return editorial;
  }

  const description = customerFacingCopy(categoryDescription);

  return {
    eyebrow: categoryName,
    heroLines: [categoryName],
    heroIntro: [
      description ||
        `Explore the ${categoryName.toLowerCase()} range from LONEX, selected for homes and businesses.`,
      "Every model is presented with the information LONEX has confirmed. Speak to us about the right starting point.",
    ],
    heroMeta: ["Residential", "Commercial", "Enquiries welcome"],
    primaryCta: "Explore the range",
    secondaryCta: "Talk to LONEX",
    intro: {
      eyebrow: "The range",
      title: `${categoryName}, brought together in one place.`,
      body: [
        description ||
          `The ${categoryName.toLowerCase()} range is selected by LONEX for practical, everyday use.`,
        "Each model is planned around the property, the site and the way power is used rather than chosen from a catalogue in isolation.",
      ],
    },
    benefits: {
      eyebrow: "Why this range",
      title: "Considered selection, clear information.",
      lede: "The right starting point is a conversation about what you need the system to do.",
      items: [
        {
          title: "Selected with purpose",
          copy: "Models are chosen for a clear role within the wider range, not to fill a catalogue.",
        },
        {
          title: "Information that helps",
          copy: "Product pages explain what a model does and where it fits, without inventing details.",
        },
        {
          title: "Planned around the site",
          copy: "The details that matter are confirmed for the property rather than assumed from a category page.",
        },
      ],
    },
    products: {
      eyebrow: "The range",
      title: "Models from this category.",
      lede: "Explore the models currently available from LONEX.",
      enquiryNote: "Availability is confirmed directly with LONEX.",
    },
    community: {
      lede: "Responsible adoption begins with understanding. As the range grows, so does the opportunity to make energy and mobility easier to reason about.",
      pillars: [
        {
          title: "Energy awareness and education",
          copy: "Clear information about how a system works helps people make sense of the energy they use.",
        },
        {
          title: "More informed purchasing decisions",
          copy: "Comparing substance rather than slogans leads to better choices.",
        },
        {
          title: "Responsible technology adoption",
          copy: "The right solution depends on the site, the load and the journey — not on a single headline.",
        },
        {
          title: "Cleaner, more thoughtful mobility",
          copy: "Practical electric options make different everyday choices possible.",
        },
        {
          title: "Local skills and participation",
          copy: "Our ambition is to support local capability as the company develops.",
        },
      ],
      note: "These are ambitions, not announcements. LONEX has not yet launched specific community programmes.",
    },
    closing: {
      title: "Talk to us about the range.",
      body: "Tell us what you are trying to power or where you need to go. We will help you find the right starting point.",
    },
    seoDescription:
      description ||
      `${categoryName} from LONEX, selected for homes and businesses.`,
  };
}

export function getProductEditorial(
  slug: string,
  fallbackName: string,
  fallbackShortDescription: string | null,
  fallbackDescription: string | null,
): ProductEditorial {
  const editorial = PRODUCTS[slug];

  if (editorial) {
    return editorial;
  }

  const summary =
    customerFacingCopy(fallbackShortDescription) ||
    customerFacingCopy(fallbackDescription) ||
    `${fallbackName} from the LONEX range.`;

  return {
    tagline: `${fallbackName} — part of the LONEX range.`,
    summary,
    intro: [
      "Details for this model are published by LONEX as they are confirmed, rather than copied from a generic catalogue.",
      "Speak to LONEX about the site, the system and the details that apply to this model.",
    ],
    benefits: [
      {
        title: "Selected by LONEX",
        copy: "Part of a considered range rather than a catalogue of unrelated products.",
      },
      {
        title: "Planned around the application",
        copy: "The right configuration is confirmed for the property or journey it will serve.",
      },
      {
        title: "Supported by information",
        copy: "Ask us for the details that matter to your installation.",
      },
    ],
    useCases: ["Residential", "Commercial", "System planning"],
    seoDescription: summary,
  };
}

export function productWhatsAppMessage(productName: string): string {
  return `Hello LONEX, I would like to enquire about the ${productName}.`;
}
