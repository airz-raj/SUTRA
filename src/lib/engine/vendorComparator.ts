/**
 * SUTRA — Vendor Quote Comparator Engine
 *
 * Pure deterministic functions for:
 * - Parsing raw vendor quote text into structured data
 * - Normalizing costs for guest count comparison
 * - Detecting hidden fees and unclear clauses
 * - Generating interrogation checklists
 * - Drafting clarification messages
 */

import type { VendorQuote, BudgetCategory } from "@/types/event";

// ────────────────────────────────────────────────────────────
// Hidden Fee Detection Patterns
// ────────────────────────────────────────────────────────────

const HIDDEN_FEE_PATTERNS = [
  { pattern: /surcharge|extra\s*charge|additional\s*(?:fee|charge|cost)/i, label: "Surcharge / Extra Charge" },
  { pattern: /corkage/i, label: "Corkage Fee" },
  { pattern: /overtime|after\s*(?:midnight|11|12)\s*(?:pm|PM)/i, label: "Overtime Charge" },
  { pattern: /cancel(?:lation)?\s*(?:fee|charge|policy)/i, label: "Cancellation Fee" },
  { pattern: /minimum\s*(?:guaranteed?\s*)?(?:guest|head)\s*count/i, label: "Minimum Guest Guarantee" },
  { pattern: /GST|tax|service\s*(?:charge|tax)/i, label: "Tax / GST (May Be Extra)" },
  { pattern: /no\s*refund/i, label: "No-Refund Clause" },
  { pattern: /deposit|advance|booking\s*amount/i, label: "Non-Refundable Deposit" },
  { pattern: /clean(?:ing)?\s*(?:fee|charge)/i, label: "Cleaning Fee" },
  { pattern: /setup\s*(?:fee|charge)|dismantl/i, label: "Setup / Dismantling Charge" },
  { pattern: /per\s*(?:hour|hr)\s*(?:after|beyond)/i, label: "Per-Hour Extension Fee" },
  { pattern: /insurance|damage\s*deposit/i, label: "Insurance / Damage Deposit" },
];

// ────────────────────────────────────────────────────────────
// Standard interrogation questions by category
// ────────────────────────────────────────────────────────────

const INTERROGATION_QUESTIONS: Record<BudgetCategory, string[]> = {
  venue: [
    "Is the quoted price inclusive of GST/taxes?",
    "What is the maximum guest capacity and is there a surcharge for exceeding it?",
    "What are the available time slots, and are there premium/off-peak pricing differences?",
    "Is backup power (generator) included or an additional charge?",
    "What is the cancellation/rescheduling policy and refund timeline?",
    "Are parking facilities included? Is valet an extra cost?",
    "Are there noise/music restrictions or curfew hours?",
  ],
  catering: [
    "Does the per-plate rate include GST/service tax?",
    "What is the minimum guaranteed guest count for billing?",
    "Is there a corkage fee for outside beverages?",
    "What overtime charges apply after the contracted hours?",
    "Can the menu be customized for dietary restrictions (Jain, diabetic, gluten-free)?",
    "Are live cooking stations included or charged separately?",
    "What is the refund policy if guest count drops significantly?",
    "Is crockery/cutlery rental included or separate?",
  ],
  decor: [
    "Does the quote include setup AND dismantling?",
    "Are fresh flowers priced at current market rates or locked in?",
    "Is there a damage/replacement policy for rented props?",
    "Can the design be modified closer to the event date?",
    "Is transport of materials included in the quote?",
  ],
  photography: [
    "How many hours of coverage are included?",
    "What is the charge for additional hours beyond the package?",
    "How many edited photos/video minutes are deliverable?",
    "What is the delivery timeline for final edits?",
    "Are drone/aerial shots included or charged separately?",
    "Who retains copyright of the photos/videos?",
  ],
  logistics: [
    "Is transport/logistics coordination included?",
    "Are there charges for early setup or late teardown?",
    "Is event insurance available or recommended?",
    "What contingency plans exist for weather (outdoor events)?",
    "Are permits or licenses required and who handles them?",
  ],
};

// ────────────────────────────────────────────────────────────
// Parse Raw Quote Text
// ────────────────────────────────────────────────────────────

/**
 * Parse a raw vendor quote text into a structured VendorQuote.
 * Uses regex-based NLP to extract costs, inclusions, exclusions, and hidden clauses.
 */
export function parseVendorQuote(
  rawText: string,
  vendorName: string,
  category: BudgetCategory,
  guestCount: number
): VendorQuote {
  const lines = rawText.split(/\n|[.;]/).map((l) => l.trim()).filter(Boolean);

  // Extract base cost
  const costMatch = rawText.match(/(?:total|base|package|quote|price|cost|amount|rate)\s*[:=]?\s*(?:₹|\$|INR|USD)?\s*([\d,]+(?:\.\d+)?)/i);
  const baseCost = costMatch ? parseFloat(costMatch[1].replace(/,/g, "")) : 0;

  // Extract per-guest cost
  const perGuestMatch = rawText.match(/(?:per\s*(?:plate|guest|head|person|pax))\s*[:=]?\s*(?:₹|\$|INR|USD)?\s*([\d,]+(?:\.\d+)?)/i);
  const perGuestCost = perGuestMatch
    ? parseFloat(perGuestMatch[1].replace(/,/g, ""))
    : 0;

  // Calculate effective cost
  const effectiveCost = perGuestCost > 0
    ? baseCost + perGuestCost * guestCount
    : baseCost;

  // Extract inclusions
  const inclusions: string[] = [];
  const inclusionSection = rawText.match(/(?:includ(?:es?|ing|ed)|what's included)[\s:]*([^]*?)(?:(?:exclud|not\s*includ|hidden|extra|addition|terms)|$)/i);
  if (inclusionSection) {
    const incLines = inclusionSection[1].split(/\n|[•\-✓✔]/).map((l) => l.trim()).filter(Boolean);
    inclusions.push(...incLines.slice(0, 10));
  }

  // Extract exclusions
  const exclusions: string[] = [];
  const exclusionSection = rawText.match(/(?:exclud(?:es?|ing|ed)|not\s*includ(?:es?|ed|ing))[\s:]*([^]*?)(?:(?:hidden|terms|condition|note)|$)/i);
  if (exclusionSection) {
    const excLines = exclusionSection[1].split(/\n|[•\-✗✘]/).map((l) => l.trim()).filter(Boolean);
    exclusions.push(...excLines.slice(0, 10));
  }

  // Detect hidden clauses
  const hiddenClauses: string[] = [];
  for (const { pattern, label } of HIDDEN_FEE_PATTERNS) {
    if (pattern.test(rawText)) {
      // Extract the full sentence containing the hidden fee
      const sentence = lines.find((line) => pattern.test(line));
      hiddenClauses.push(sentence ? `${label}: ${sentence}` : label);
    }
  }

  // Generate clarification questions
  const clarificationQuestions = INTERROGATION_QUESTIONS[category].filter(
    (q) => {
      // Only include questions relevant to what's NOT explicitly addressed
      const keywords = q.toLowerCase().split(/\s+/).slice(0, 3).join(" ");
      return !rawText.toLowerCase().includes(keywords);
    }
  ).slice(0, 5);

  return {
    id: `vq_${vendorName.replace(/\s+/g, "_").toLowerCase()}_${Date.now().toString(36)}`,
    vendorName,
    category,
    baseCost,
    perGuestCost: perGuestCost || undefined,
    effectiveCost,
    inclusions,
    exclusions,
    hiddenClauses,
    clarificationQuestions,
    rawText,
  };
}

// ────────────────────────────────────────────────────────────
// Compare Two Vendor Quotes
// ────────────────────────────────────────────────────────────

export interface VendorComparison {
  quoteA: VendorQuote;
  quoteB: VendorQuote;
  costDifference: number;
  cheaperVendor: string;
  inclusionAdvantages: { vendor: string; items: string[] }[];
  hiddenFeeWarnings: string[];
  recommendation: string;
}

export function compareVendorQuotes(
  quoteA: VendorQuote,
  quoteB: VendorQuote,
  guestCount: number
): VendorComparison {
  const effectiveA = quoteA.perGuestCost
    ? quoteA.baseCost + quoteA.perGuestCost * guestCount
    : quoteA.baseCost;
  const effectiveB = quoteB.perGuestCost
    ? quoteB.baseCost + quoteB.perGuestCost * guestCount
    : quoteB.baseCost;

  const costDiff = Math.abs(effectiveA - effectiveB);
  const cheaperVendor =
    effectiveA <= effectiveB ? quoteA.vendorName : quoteB.vendorName;

  // Find inclusion advantages
  const aOnly = quoteA.inclusions.filter(
    (inc) => !quoteB.inclusions.some((b) => b.toLowerCase().includes(inc.toLowerCase().slice(0, 10)))
  );
  const bOnly = quoteB.inclusions.filter(
    (inc) => !quoteA.inclusions.some((a) => a.toLowerCase().includes(inc.toLowerCase().slice(0, 10)))
  );

  const inclusionAdvantages = [];
  if (aOnly.length > 0) {
    inclusionAdvantages.push({ vendor: quoteA.vendorName, items: aOnly });
  }
  if (bOnly.length > 0) {
    inclusionAdvantages.push({ vendor: quoteB.vendorName, items: bOnly });
  }

  // Combine hidden fee warnings
  const hiddenFeeWarnings = [
    ...quoteA.hiddenClauses.map((c) => `${quoteA.vendorName}: ${c}`),
    ...quoteB.hiddenClauses.map((c) => `${quoteB.vendorName}: ${c}`),
  ];

  // Generate recommendation
  const perGuestA = guestCount > 0 ? effectiveA / guestCount : effectiveA;
  const perGuestB = guestCount > 0 ? effectiveB / guestCount : effectiveB;

  let recommendation = "";
  if (costDiff < effectiveA * 0.05) {
    recommendation = `Both quotes are within 5% of each other. Focus on inclusions and hidden fees. ${
      hiddenFeeWarnings.length > 0
        ? `⚠️ ${hiddenFeeWarnings.length} hidden fee clause(s) detected — clarify before signing.`
        : ""
    }`;
  } else {
    recommendation = `${cheaperVendor} is more cost-effective (₹${Math.round(
      Math.min(perGuestA, perGuestB)
    )}/guest vs ₹${Math.round(Math.max(perGuestA, perGuestB))}/guest). However, check inclusion differences carefully.`;
  }

  return {
    quoteA: { ...quoteA, effectiveCost: effectiveA },
    quoteB: { ...quoteB, effectiveCost: effectiveB },
    costDifference: costDiff,
    cheaperVendor,
    inclusionAdvantages,
    hiddenFeeWarnings,
    recommendation,
  };
}

// ────────────────────────────────────────────────────────────
// Generate Clarification Email/WhatsApp Draft
// ────────────────────────────────────────────────────────────

export function generateClarificationDraft(
  quote: VendorQuote,
  eventName: string
): string {
  const questions = quote.clarificationQuestions;
  const hiddenClauses = quote.hiddenClauses;

  let draft = `Dear ${quote.vendorName} Team,\n\n`;
  draft += `Thank you for your quotation for our event "${eventName}". Before we proceed, we'd like to clarify the following:\n\n`;

  if (hiddenClauses.length > 0) {
    draft += `Regarding specific clauses in your quote:\n`;
    hiddenClauses.forEach((clause, i) => {
      draft += `${i + 1}. Could you please clarify: "${clause}"?\n`;
    });
    draft += `\n`;
  }

  if (questions.length > 0) {
    draft += `Additional questions:\n`;
    questions.forEach((q, i) => {
      draft += `${i + 1}. ${q}\n`;
    });
  }

  draft += `\nWe look forward to your response.\n\nBest regards`;
  return draft;
}

/**
 * Get standard interrogation checklist for a category.
 */
export function getInterrogationChecklist(category: BudgetCategory): string[] {
  return INTERROGATION_QUESTIONS[category] ?? [];
}

