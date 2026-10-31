/**
 * SUTRA — Deterministic Personalized Idea Generator
 *
 * Generates culturally tailored event ideas based on event type,
 * vibe description, accessibility profile, and budget.
 */

import type { EventPlan, PersonalizedIdea } from "@/types/event";

// ────────────────────────────────────────────────────────────
// Idea Banks by Event Type
// ────────────────────────────────────────────────────────────

const WEDDING_IDEAS: Omit<PersonalizedIdea, "id" | "estimatedCost">[] = [
  {
    title: "Vintage Photo Booth with Retro Props",
    description: "Set up a photo booth with vintage suitcases, retro sunglasses, Bollywood movie posters, and classic scooter cutouts for nostalgic photo ops.",
    category: "photography",
    ageGroup: "all",
    accessibilityNote: "Ensure booth entrance is wheelchair accessible",
  },
  {
    title: "Live Chaat & Street Food Counter",
    description: "Authentic Delhi street food experience with live pani puri, aloo tikki, and golgappa stations served by uniformed chaatwallas.",
    category: "catering",
    ageGroup: "all",
    accessibilityNote: "Provide seated counter option for seniors",
  },
  {
    title: "Retro Bollywood DJ & Folk Dhol Set",
    description: "Curated 90s Bollywood hits playlist with a live dhol player for baraat. Transition from folk to retro disco for reception.",
    category: "entertainment",
    ageGroup: "all",
  },
  {
    title: "Mehendi & Haldi Garden Ceremony",
    description: "Open-air mehendi ceremony with traditional folk singers, haldi ritual with marigold decor and turmeric clay pots.",
    category: "decor",
    ageGroup: "all",
    accessibilityNote: "Shaded seating area for elderly guests",
  },
  {
    title: "Cassette Tape Guest Favors",
    description: "Custom-designed retro audio cassette boxes with curated song list card and traditional sweets inside.",
    category: "decor",
    ageGroup: "adults",
  },
  {
    title: "Kids' Mini Carnival Zone",
    description: "Dedicated area with cotton candy machine, balloon artist, face painting, and age-appropriate games away from the main music zone.",
    category: "entertainment",
    ageGroup: "children",
    accessibilityNote: "All activities at accessible heights",
  },
  {
    title: "Heritage Lighting & Candle Path",
    description: "Line the venue entrance with traditional brass diyas and marigold garlands. Use warm Edison bulb strings instead of harsh LED floods.",
    category: "decor",
    ageGroup: "all",
  },
  {
    title: "Senior Comfort Lounge",
    description: "A quieter, well-lit area with comfortable seating, lower music volume, easy-access restrooms, and dedicated tea/refreshment service.",
    category: "logistics",
    ageGroup: "seniors",
    accessibilityNote: "Wheelchair accessible, hearing-aid-compatible sound levels",
  },
];

const BIRTHDAY_IDEAS: Omit<PersonalizedIdea, "id" | "estimatedCost">[] = [
  {
    title: "50-Year Memory Timeline Wall",
    description: "A chronological photo and milestone display spanning 5 decades — birth, school, career, family — with handwritten captions by family members.",
    category: "decor",
    ageGroup: "all",
  },
  {
    title: "Dual Menu Stations",
    description: "Separate food stations: a kid-friendly pizza/pasta/nugget bar and a sophisticated adult menu with diabetic-friendly options clearly labeled.",
    category: "catering",
    ageGroup: "all",
    accessibilityNote: "All allergens clearly labeled, nut-free zone available",
  },
  {
    title: "Art & Craft Corner for Kids",
    description: "Supervised art station with painting, clay modeling, and 'Birthday Card for Grandpa/Grandma' activity to keep children engaged.",
    category: "entertainment",
    ageGroup: "children",
  },
  {
    title: "Golden Jubilee Memory Book",
    description: "A guest book where attendees write memories, wishes, and anecdotes. Presented as a bound keepsake at the end.",
    category: "decor",
    ageGroup: "all",
    accessibilityNote: "Large-print writing cards available for seniors",
  },
  {
    title: "Low-Decibel Jazz/Acoustic Set",
    description: "Live acoustic performance of golden-era favorites — pleasant for seniors, not overwhelming for children.",
    category: "entertainment",
    ageGroup: "all",
    accessibilityNote: "Volume kept below 75dB for hearing-aid compatibility",
  },
  {
    title: "Family Photo Relay",
    description: "Structured family group photos in the first hour, then candid coverage. Multi-generational group shot with custom backdrop.",
    category: "photography",
    ageGroup: "all",
  },
];

const COMMUNITY_IDEAS: Omit<PersonalizedIdea, "id" | "estimatedCost">[] = [
  {
    title: "Hackathon War Room Setup",
    description: "Team tables with power strips, monitors, whiteboards, and snack baskets. Central leaderboard screen with real-time progress.",
    category: "venue",
    ageGroup: "all",
    accessibilityNote: "Height-adjustable desks for wheelchair users",
  },
  {
    title: "Zero-Waste Catering Kit",
    description: "All food served in compostable containers. Water refill stations replace single-use bottles. Digital menu boards replace printed ones.",
    category: "catering",
    ageGroup: "all",
  },
  {
    title: "Sponsor Showcase Boulevard",
    description: "Designated sponsor booth area with standardized table/backdrop setup, power access, and attendee traffic flow planning.",
    category: "logistics",
    ageGroup: "all",
    accessibilityNote: "Accessible pathways between booths",
  },
  {
    title: "Live Streaming & Recording Rig",
    description: "Multi-camera setup for keynotes and demo presentations. YouTube/Twitch streaming with real-time captioning.",
    category: "photography",
    ageGroup: "all",
    accessibilityNote: "Real-time captioning and sign-language interpreter slot",
  },
  {
    title: "Quiet / Focus Room",
    description: "Soundproofed room for neurodivergent attendees or those needing a sensory break. Dim lighting, comfortable seating, no screens.",
    category: "logistics",
    ageGroup: "all",
    accessibilityNote: "Sensory-friendly environment with soft lighting",
  },
  {
    title: "Volunteer Shift Dashboard",
    description: "Digital volunteer management board showing shifts, roles, locations, and break times. Accessible from mobile devices.",
    category: "logistics",
    ageGroup: "all",
  },
];

// ────────────────────────────────────────────────────────────
// Generator
// ────────────────────────────────────────────────────────────

export function generatePersonalizedIdeas(plan: EventPlan): PersonalizedIdea[] {
  let ideaBank: Omit<PersonalizedIdea, "id" | "estimatedCost">[];

  switch (plan.eventType) {
    case "wedding":
      ideaBank = WEDDING_IDEAS;
      break;
    case "birthday":
      ideaBank = BIRTHDAY_IDEAS;
      break;
    case "community":
      ideaBank = COMMUNITY_IDEAS;
      break;
    default:
      ideaBank = WEDDING_IDEAS;
  }

  // Filter based on accessibility needs
  let filtered = [...ideaBank];
  if (!plan.accessibility.hasChildren) {
    filtered = filtered.filter((i) => i.ageGroup !== "children");
  }
  if (!plan.accessibility.hasSeniors) {
    filtered = filtered.filter((i) => i.ageGroup !== "seniors");
  }

  // Estimate costs based on budget
  const perIdeaBudget = plan.totalBudget * 0.05; // ~5% of total per idea

  return filtered.map((idea, index) => ({
    ...idea,
    id: `idea_${plan.eventType}_${index}`,
    estimatedCost: Math.round(perIdeaBudget * (0.3 + Math.random() * 0.7)),
  }));
}

