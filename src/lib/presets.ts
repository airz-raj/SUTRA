/**
 * SUTRA — Rich Cultural Persona Presets
 *
 * 3 one-click demo scenarios per the problem statement:
 * 1. Purani Dilli & 90s Bollywood Shaadi (Wedding)
 * 2. Multi-Generational Golden Jubilee (50th Birthday)
 * 3. Code for Communities Civic Hackathon (Community Event)
 */

import type { EventPlan, DagTask, VendorQuote } from "@/types/event";

// ────────────────────────────────────────────────────────────
// Helper: generate unique IDs
// ────────────────────────────────────────────────────────────

let idCounter = 0;
function uid(prefix: string): string {
  return `${prefix}_${++idCounter}_${Date.now().toString(36)}`;
}

// ────────────────────────────────────────────────────────────
// Preset 1: Purani Dilli & 90s Bollywood Shaadi
// ────────────────────────────────────────────────────────────

function weddingTasks(): DagTask[] {
  return [
    {
      id: "t_venue",
      title: "Finalize Heritage Venue",
      description: "Book Purani Dilli haveli/heritage banquet hall",
      category: "venue",
      durationDays: 7,
      dependsOn: [],
      status: "pending",
    },
    {
      id: "t_caterer",
      title: "Book Chandni Chowk Caterer",
      description:
        "Confirm Paranthe Wali Gali & Chaat live station caterer with tasting",
      category: "catering",
      durationDays: 5,
      dependsOn: ["t_venue"],
      status: "pending",
    },
    {
      id: "t_decor",
      title: "Retro Bollywood Decor Blueprint",
      description:
        "Design 90s cinema aesthetic — vintage poster cutouts, Bajaj Chetak photo booth",
      category: "decor",
      durationDays: 10,
      dependsOn: ["t_venue"],
      status: "pending",
    },
    {
      id: "t_photo",
      title: "Book Photographer & AV Setup",
      description:
        "Retro cassette-themed photo booth + cinematic videography crew",
      category: "photography",
      durationDays: 3,
      dependsOn: ["t_venue"],
      status: "pending",
    },
    {
      id: "t_invite",
      title: "Invitation Design & Dispatch",
      description: "Vintage Bollywood film poster style invites (print + WhatsApp digital)",
      category: "logistics",
      durationDays: 14,
      dependsOn: ["t_venue"],
      status: "pending",
    },
    {
      id: "t_music",
      title: "Arrange Dhol & DJ",
      description: "Haryanvi folk dhol for baraat + retro Bollywood DJ set",
      category: "logistics",
      durationDays: 3,
      dependsOn: [],
      status: "pending",
    },
    {
      id: "t_tasting",
      title: "Catering Tasting Session",
      description: "Full menu tasting with family decision makers",
      category: "catering",
      durationDays: 1,
      dependsOn: ["t_caterer"],
      status: "pending",
    },
    {
      id: "t_baraat",
      title: "Baraat Logistics",
      description:
        "Open Mahindra Jeep entry, route planning, guest marshalling",
      category: "logistics",
      durationDays: 2,
      dependsOn: ["t_venue", "t_music"],
      status: "pending",
    },
    {
      id: "t_favors",
      title: "Retro Cassette Favors",
      description: "Custom mixtape cassette packaging as guest favors",
      category: "decor",
      durationDays: 7,
      dependsOn: ["t_decor"],
      status: "pending",
    },
    {
      id: "t_final",
      title: "Final Walk-Through & Rehearsal",
      description: "Complete venue setup verification and ceremony rehearsal",
      category: "logistics",
      durationDays: 1,
      dependsOn: ["t_decor", "t_tasting", "t_photo", "t_baraat", "t_favors"],
      status: "pending",
    },
  ];
}

function weddingVendorQuotes(): VendorQuote[] {
  return [
    {
      id: uid("vq"),
      vendorName: "Shahi Dawat Caterers",
      category: "catering",
      baseCost: 180000,
      perGuestCost: 900,
      inclusions: [
        "Live Chaat counter",
        "Paranthe station",
        "Main course (6 dishes)",
        "Dessert counter",
        "Service staff",
      ],
      exclusions: [
        "Crockery rental",
        "Extra ice cream counter",
        "After-midnight service",
      ],
      hiddenClauses: [
        "15% surcharge on guest count exceeding 220",
        "Corkage fee of ₹15,000 for outside beverages",
      ],
      clarificationQuestions: [
        "Does the per-plate rate include taxes (GST)?",
        "What is the cancellation/refund policy if guest count reduces by >20%?",
        "Is there backup power for live cooking stations?",
      ],
    },
    {
      id: uid("vq"),
      vendorName: "Delhi Heritage Kitchens",
      category: "catering",
      baseCost: 150000,
      perGuestCost: 750,
      inclusions: [
        "Main course (5 dishes)",
        "Dessert (2 items)",
        "Basic service staff",
        "Paper plates & cutlery",
      ],
      exclusions: [
        "Live cooking stations",
        "Premium crockery",
        "Ice cream / kulfi counter",
        "Dedicated service manager",
      ],
      hiddenClauses: [
        "Overtime charge of ₹5,000/hour after 11 PM",
        "No refund on advance if cancelled within 7 days",
      ],
      clarificationQuestions: [
        "Can live stations be added? At what cost?",
        "Are taxes included in the quoted per-plate rate?",
        "What is the minimum guaranteed guest count for billing?",
      ],
    },
  ];
}

export const PRESET_WEDDING: Omit<EventPlan, "lastUpdated"> = {
  eventType: "wedding",
  eventName: "Purani Dilli & 90s Bollywood Shaadi",
  currency: "INR",
  totalBudget: 800000,
  guestCount: 200,
  daysUntilEvent: 120,
  priorityWeights: {
    food: 9,
    venue: 7,
    decor: 6,
    photography: 5,
    logistics: 4,
  },
  accessibility: {
    hasChildren: true,
    hasSeniors: true,
    wheelchairAccess: false,
    dietaryRestrictions: ["vegetarian-majority", "jain-option"],
  },
  vibeDescription:
    "Classic 1990s retro cinema aesthetic — Sholay / Old Delhi street nostalgia, vintage Bajaj Chetak photo booth, Chandni Chowk Paranthe Wali Gali & Chaat live stations, open Mahindra Jeep baraat entry, Haryanvi folk dhol + retro cassette favors. Prioritize food and warmth over expensive imported florals.",
  budgetAllocations: [],
  tasks: weddingTasks(),
  vendorQuotes: weddingVendorQuotes(),
  tradeOffScenarios: [],
  personalizedIdeas: [],
  executionTier: "deterministic",
};

// ────────────────────────────────────────────────────────────
// Preset 2: Multi-Generational Golden Jubilee (50th Birthday)
// ────────────────────────────────────────────────────────────

function birthdayTasks(): DagTask[] {
  return [
    {
      id: "t_b_venue",
      title: "Book Accessible Courtyard Venue",
      description:
        "Wheelchair-accessible courtyard with covered area and parking",
      category: "venue",
      durationDays: 3,
      dependsOn: [],
      status: "pending",
    },
    {
      id: "t_b_menu",
      title: "Finalize Dual Menu",
      description:
        "Diabetic-friendly senior menu + kid-approved menu with separate stations",
      category: "catering",
      durationDays: 4,
      dependsOn: ["t_b_venue"],
      status: "pending",
    },
    {
      id: "t_b_timeline",
      title: "Design Nostalgic Timeline Wall",
      description:
        "Photo timeline spanning 50 years — collect family photos and milestones",
      category: "decor",
      durationDays: 10,
      dependsOn: [],
      status: "pending",
    },
    {
      id: "t_b_kidzone",
      title: "Setup Kid Activity Zone",
      description: "Art corner, balloon artist, face painting, game area",
      category: "logistics",
      durationDays: 2,
      dependsOn: ["t_b_venue"],
      status: "pending",
    },
    {
      id: "t_b_senior",
      title: "Setup Low-Decibel Senior Lounge",
      description:
        "Comfortable seating with acoustic separation, tea service, memory book",
      category: "logistics",
      durationDays: 2,
      dependsOn: ["t_b_venue"],
      status: "pending",
    },
    {
      id: "t_b_cake",
      title: "Order Custom Cake",
      description: "Multi-tier cake with 50-year milestone design",
      category: "catering",
      durationDays: 5,
      dependsOn: [],
      status: "pending",
    },
    {
      id: "t_b_photo",
      title: "Book Family Photographer",
      description: "Candid + group shots, multi-generational group coordination",
      category: "photography",
      durationDays: 2,
      dependsOn: ["t_b_venue"],
      status: "pending",
    },
    {
      id: "t_b_final",
      title: "Final Dry Run",
      description: "Complete walkthrough of venue with all setups verified",
      category: "logistics",
      durationDays: 1,
      dependsOn: [
        "t_b_menu",
        "t_b_timeline",
        "t_b_kidzone",
        "t_b_senior",
        "t_b_photo",
      ],
      status: "pending",
    },
  ];
}

export const PRESET_BIRTHDAY: Omit<EventPlan, "lastUpdated"> = {
  eventType: "birthday",
  eventName: "Multi-Generational Golden Jubilee — 50th Birthday",
  currency: "INR",
  totalBudget: 150000,
  guestCount: 80,
  daysUntilEvent: 21,
  priorityWeights: {
    food: 8,
    venue: 6,
    decor: 7,
    photography: 5,
    logistics: 6,
  },
  accessibility: {
    hasChildren: true,
    hasSeniors: true,
    wheelchairAccess: true,
    dietaryRestrictions: ["diabetic-friendly", "kid-approved", "no-nuts"],
  },
  vibeDescription:
    "Kid-friendly activity zone + low-decibel senior lounge, wheelchair-accessible courtyard, nostalgic timeline wall, diabetic-friendly + kid-approved menu split. Warm, inclusive celebration across 3 generations.",
  budgetAllocations: [],
  tasks: birthdayTasks(),
  vendorQuotes: [],
  tradeOffScenarios: [],
  personalizedIdeas: [],
  executionTier: "deterministic",
};

// ────────────────────────────────────────────────────────────
// Preset 3: Code for Communities Civic Hackathon
// ────────────────────────────────────────────────────────────

function hackathonTasks(): DagTask[] {
  return [
    {
      id: "t_h_venue",
      title: "Book Convention Hall / Co-working Space",
      description:
        "Large open floor plan with high-speed Wi-Fi, AV systems, and power outlets",
      category: "venue",
      durationDays: 7,
      dependsOn: [],
      status: "pending",
    },
    {
      id: "t_h_sponsors",
      title: "Confirm Sponsors & Booth Layout",
      description: "Finalize sponsor commitments and design floor plan with booth allocations",
      category: "logistics",
      durationDays: 14,
      dependsOn: [],
      status: "pending",
    },
    {
      id: "t_h_wifi",
      title: "Network & AV Redundancy Setup",
      description:
        "Primary + backup Wi-Fi, projector, screens, microphones, live-streaming rig",
      category: "logistics",
      durationDays: 3,
      dependsOn: ["t_h_venue"],
      status: "pending",
    },
    {
      id: "t_h_catering",
      title: "Arrange Zero-Waste Catering",
      description:
        "Sustainable catering with compostable packaging, water refill stations",
      category: "catering",
      durationDays: 5,
      dependsOn: ["t_h_venue"],
      status: "pending",
    },
    {
      id: "t_h_volunteers",
      title: "Recruit & Schedule Volunteer Shifts",
      description:
        "Shift matrix for registration, tech support, food service, and accessibility",
      category: "logistics",
      durationDays: 10,
      dependsOn: ["t_h_sponsors"],
      status: "pending",
    },
    {
      id: "t_h_access",
      title: "Accessibility Compliance Audit",
      description:
        "Sign-language interpreter, screen-reader station, wheelchair paths, quiet room",
      category: "logistics",
      durationDays: 3,
      dependsOn: ["t_h_venue"],
      status: "pending",
    },
    {
      id: "t_h_swag",
      title: "Design & Order Swag / Certificates",
      description: "Eco-friendly swag bags, participant certificates, judge badges",
      category: "decor",
      durationDays: 10,
      dependsOn: ["t_h_sponsors"],
      status: "pending",
    },
    {
      id: "t_h_photo",
      title: "Book Event Photographer & Videographer",
      description: "Coverage of keynotes, team photos, award ceremony",
      category: "photography",
      durationDays: 2,
      dependsOn: ["t_h_venue"],
      status: "pending",
    },
    {
      id: "t_h_final",
      title: "Full Dress Rehearsal & Tech Check",
      description:
        "Complete run-through: AV, Wi-Fi stress test, registration flow, accessibility check",
      category: "logistics",
      durationDays: 1,
      dependsOn: [
        "t_h_wifi",
        "t_h_catering",
        "t_h_volunteers",
        "t_h_access",
        "t_h_swag",
        "t_h_photo",
      ],
      status: "pending",
    },
  ];
}

export const PRESET_HACKATHON: Omit<EventPlan, "lastUpdated"> = {
  eventType: "community",
  eventName: "Code for Communities — Civic Hackathon",
  currency: "INR",
  totalBudget: 300000,
  guestCount: 300,
  daysUntilEvent: 45,
  priorityWeights: {
    food: 5,
    venue: 8,
    decor: 3,
    photography: 4,
    logistics: 9,
  },
  accessibility: {
    hasChildren: false,
    hasSeniors: false,
    wheelchairAccess: true,
    dietaryRestrictions: ["vegan-option", "gluten-free-option"],
  },
  vibeDescription:
    "Volunteer shift matrix, high-speed Wi-Fi/AV redundancy checklist, sponsor booth layout, zero-waste catering, sign-language & screen-reader accessibility compliance. Professional, inclusive, tech-forward.",
  budgetAllocations: [],
  tasks: hackathonTasks(),
  vendorQuotes: [],
  tradeOffScenarios: [],
  personalizedIdeas: [],
  executionTier: "deterministic",
};

// ────────────────────────────────────────────────────────────
// Preset Registry
// ────────────────────────────────────────────────────────────

export const PRESETS = {
  wedding: PRESET_WEDDING,
  birthday: PRESET_BIRTHDAY,
  community: PRESET_HACKATHON,
} as const;

export type PresetKey = keyof typeof PRESETS;

