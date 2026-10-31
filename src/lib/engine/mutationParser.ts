/**
 * SUTRA — Natural Language Mutation Parser
 *
 * Parses natural language strings like:
 *   "+50 guests, reduce budget by ₹50,000, move event 2 weeks earlier"
 *
 * Returns a structured DeltaMutation object.
 * Pure deterministic — no AI needed.
 */

import type { DeltaMutation } from "@/types/event";

// ────────────────────────────────────────────────────────────
// Regex patterns for intent extraction
// ────────────────────────────────────────────────────────────

const PATTERNS = {
  // Guest count changes
  addGuests: /(?:add|plus|\+)\s*(\d+)\s*(?:more\s*)?(?:guests?|people|attendees?|pax)/i,
  removeGuests: /(?:remove|minus|reduce|cut|subtract|-)\s*(\d+)\s*(?:guests?|people|attendees?|pax)/i,
  setGuests: /(?:set|change)\s*(?:guests?|people|attendees?|pax)\s*(?:to|=)\s*(\d+)/i,

  // Budget changes
  addBudget: /(?:add|plus|increase|\+)\s*(?:₹|\$|INR|USD|budget\s*(?:by)?)?\s*([\d,]+(?:\.\d+)?)\s*(?:to\s*(?:the\s*)?budget)?/i,
  reduceBudget: /(?:reduce|minus|cut|decrease|subtract|-)\s*(?:₹|\$|INR|USD|budget\s*(?:by)?)?\s*([\d,]+(?:\.\d+)?)\s*(?:(?:from|off)\s*(?:the\s*)?budget)?/i,
  reduceBudgetAlt: /(?:budget)\s*(?:reduce|cut|decrease|minus|-)\s*(?:by\s*)?(?:₹|\$|INR|USD)?\s*([\d,]+(?:\.\d+)?)/i,

  // Timeline changes
  moveEarlier: /(?:move|shift|bring)\s*(?:event|date|deadline)?\s*(\d+)\s*(?:days?|weeks?|months?)\s*(?:earlier|sooner|forward|up)/i,
  moveLater: /(?:move|shift|push|delay|postpone)\s*(?:event|date|deadline)?\s*(\d+)\s*(?:days?|weeks?|months?)\s*(?:later|back|out)?/i,
  moveEarlierAlt: /(\d+)\s*(?:days?|weeks?|months?)\s*(?:earlier|sooner)/i,
  moveLaterAlt: /(\d+)\s*(?:days?|weeks?|months?)\s*(?:later|delayed?)/i,

  // Time unit detection
  weeks: /(\d+)\s*weeks?/i,
  months: /(\d+)\s*months?/i,
};

// ────────────────────────────────────────────────────────────
// Parse currency amount
// ────────────────────────────────────────────────────────────

function parseCurrencyAmount(raw: string): number {
  // Remove commas, currency symbols, whitespace
  const cleaned = raw.replace(/[,\s₹$]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;

  // Handle shorthand: 50k = 50000, 8L = 800000
}

function parseAmountWithShorthand(raw: string): number {
  const cleaned = raw.replace(/[,\s₹$]/g, "").toLowerCase();

  const kMatch = cleaned.match(/^([\d.]+)k$/);
  if (kMatch) return parseFloat(kMatch[1]) * 1000;

  const lMatch = cleaned.match(/^([\d.]+)l$/);
  if (lMatch) return parseFloat(lMatch[1]) * 100000;

  const crMatch = cleaned.match(/^([\d.]+)(?:cr|crore)$/);
  if (crMatch) return parseFloat(crMatch[1]) * 10000000;

  const mMatch = cleaned.match(/^([\d.]+)m$/);
  if (mMatch) return parseFloat(mMatch[1]) * 1000000;

  return parseCurrencyAmount(raw);
}

// ────────────────────────────────────────────────────────────
// Convert time units to days
// ────────────────────────────────────────────────────────────

function timeUnitToDays(value: number, unit: string): number {
  const lower = unit.toLowerCase();
  if (lower.startsWith("week")) return value * 7;
  if (lower.startsWith("month")) return value * 30;
  return value; // days
}

function extractTimeUnit(text: string): string {
  if (/weeks?/i.test(text)) return "weeks";
  if (/months?/i.test(text)) return "months";
  return "days";
}

// ────────────────────────────────────────────────────────────
// Main Parser
// ────────────────────────────────────────────────────────────

/**
 * Parse a natural language mutation string into a structured DeltaMutation.
 *
 * Examples:
 *   "Add 50 guests" → { guestCountDelta: 50 }
 *   "Reduce budget by ₹50,000" → { budgetDelta: -50000 }
 *   "Move event 2 weeks earlier" → { daysUntilEventDelta: -14 }
 *   "+50 guests, -₹50k budget, 2 weeks earlier" → combined deltas
 */
export function parseMutation(input: string): DeltaMutation {
  const result: DeltaMutation = {
    guestCountDelta: 0,
    budgetDelta: 0,
    daysUntilEventDelta: 0,
    rawInput: input,
  };

  if (!input || input.trim().length === 0) return result;

  // ── Guest count parsing ──
  let match = input.match(PATTERNS.addGuests);
  if (match) {
    result.guestCountDelta += parseInt(match[1], 10);
  }

  match = input.match(PATTERNS.removeGuests);
  if (match) {
    result.guestCountDelta -= parseInt(match[1], 10);
  }

  // ── Budget parsing with shorthand support ──
  const budgetReduceRegex = /(?:reduce|minus|cut|decrease|subtract|-)\s*(?:budget\s*(?:by)?\s*)?(?:₹|\$|INR|USD)?\s*([\d,]+(?:\.\d+)?[kKlLmM]?)/gi;
  const budgetAddRegex = /(?:add|plus|increase|\+)\s*(?:budget\s*(?:by)?\s*)?(?:₹|\$|INR|USD)?\s*([\d,]+(?:\.\d+)?[kKlLmM]?)/gi;

  let budgetMatch;
  while ((budgetMatch = budgetReduceRegex.exec(input)) !== null) {
    // Ensure this isn't a guest count match
    const contextAfter = input.slice(budgetMatch.index + budgetMatch[0].length).slice(0, 20);
    if (!/guest|people|attend|pax/i.test(contextAfter)) {
      result.budgetDelta -= parseAmountWithShorthand(budgetMatch[1]);
    }
  }

  while ((budgetMatch = budgetAddRegex.exec(input)) !== null) {
    const contextAfter = input.slice(budgetMatch.index + budgetMatch[0].length).slice(0, 20);
    if (!/guest|people|attend|pax/i.test(contextAfter)) {
      // Don't double-count if already captured as guest
      if (result.guestCountDelta > 0) {
        const guestStr = result.guestCountDelta.toString();
        if (budgetMatch[1].replace(/[,\s]/g, "") === guestStr) continue;
      }
      result.budgetDelta += parseAmountWithShorthand(budgetMatch[1]);
    }
  }

  // ── Timeline parsing ──
  match = input.match(PATTERNS.moveEarlier) || input.match(PATTERNS.moveEarlierAlt);
  if (match) {
    const value = parseInt(match[1], 10);
    const unit = extractTimeUnit(input);
    result.daysUntilEventDelta -= timeUnitToDays(value, unit);
  } else {
    match = input.match(PATTERNS.moveLater) || input.match(PATTERNS.moveLaterAlt);
    if (match) {
      const value = parseInt(match[1], 10);
      const unit = extractTimeUnit(input);
      result.daysUntilEventDelta += timeUnitToDays(value, unit);
    }
  }

  return result;
}

// ────────────────────────────────────────────────────────────
// Pre-built stress-test mutations (one-click SME tests)
// ────────────────────────────────────────────────────────────

export const STRESS_TEST_MUTATIONS: { label: string; mutation: DeltaMutation }[] = [
  {
    label: "+50 Guests, -₹50k Budget, 2 Weeks Earlier",
    mutation: {
      guestCountDelta: 50,
      budgetDelta: -50000,
      daysUntilEventDelta: -14,
      rawInput: "Add 50 more guests, reduce budget by ₹50,000, and move event 2 weeks earlier",
    },
  },
  {
    label: "Simulate +20% Cost Overrun",
    mutation: {
      guestCountDelta: 0,
      budgetDelta: 0,
      daysUntilEventDelta: 0,
      rawInput: "Simulate 20% budget overrun scenario",
    },
  },
  {
    label: "Delay Venue Booking by 14 Days",
    mutation: {
      guestCountDelta: 0,
      budgetDelta: 0,
      daysUntilEventDelta: 0,
      rawInput: "Delay venue booking task by 14 days",
    },
  },
];

