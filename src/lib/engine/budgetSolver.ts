/**
 * SUTRA — Budget Solver Engine
 *
 * Pure deterministic functions for:
 * - Elastic budget allocation based on priority weights
 * - Per-capita cost scaling (catering, seating)
 * - 20% budget overrun trade-off scenario generation
 */

import type {
  BudgetAllocation,
  BudgetCategory,
  BudgetLineItem,
  EventPlan,
  PriorityWeights,
  TradeOffScenario,
} from "@/types/event";

// ────────────────────────────────────────────────────────────
// Constants: default per-capita & fixed rates by event type
// ────────────────────────────────────────────────────────────

interface CategoryRates {
  basePercent: number; // base % of total budget
  perCapitaFactor: number; // multiplied by guest count
  isElastic: boolean; // can be compressed during overruns
}

const CATEGORY_RATES: Record<BudgetCategory, CategoryRates> = {
  venue: { basePercent: 0.25, perCapitaFactor: 0, isElastic: false },
  catering: { basePercent: 0.35, perCapitaFactor: 1.0, isElastic: false },
  decor: { basePercent: 0.15, perCapitaFactor: 0, isElastic: true },
  photography: { basePercent: 0.12, perCapitaFactor: 0, isElastic: true },
  logistics: { basePercent: 0.13, perCapitaFactor: 0.1, isElastic: true },
};

const CATEGORIES: BudgetCategory[] = [
  "venue",
  "catering",
  "decor",
  "photography",
  "logistics",
];

// ────────────────────────────────────────────────────────────
// Priority-weighted allocation
// ────────────────────────────────────────────────────────────

/**
 * Allocate budget across categories using priority weights.
 *
 * The allocation formula:
 *   weight_i = priorityWeights[category_i]
 *   share_i = (basePercent_i * weight_i) / sum(basePercent_j * weight_j for all j)
 *   allocated_i = totalBudget * share_i
 */
export function allocateBudget(
  totalBudget: number,
  guestCount: number,
  priorityWeights: PriorityWeights,
  currency: "INR" | "USD" = "INR"
): BudgetAllocation[] {
  const weightMap: Record<BudgetCategory, number> = {
    venue: priorityWeights.venue,
    catering: priorityWeights.food,
    decor: priorityWeights.decor,
    photography: priorityWeights.photography,
    logistics: priorityWeights.logistics,
  };

  // Compute weighted shares
  let totalWeight = 0;
  const rawWeights: Record<string, number> = {};
  for (const cat of CATEGORIES) {
    const w = CATEGORY_RATES[cat].basePercent * weightMap[cat];
    rawWeights[cat] = w;
    totalWeight += w;
  }

  // Prevent division by zero
  if (totalWeight === 0) totalWeight = 1;

  const currencyFactor = currency === "USD" ? 1 : 1;

  return CATEGORIES.map((cat) => {
    const share = rawWeights[cat] / totalWeight;
    const allocated = Math.round(totalBudget * share * currencyFactor);
    const items = generateLineItems(cat, allocated, guestCount, currency);

    return {
      category: cat,
      allocated,
      spent: 0,
      items,
      priorityWeight: weightMap[cat],
    };
  });
}

// ────────────────────────────────────────────────────────────
// Generate line items per category
// ────────────────────────────────────────────────────────────

function generateLineItems(
  category: BudgetCategory,
  allocated: number,
  guestCount: number,
  currency: "INR" | "USD"
): BudgetLineItem[] {
  const sym = currency === "USD" ? "$" : "₹";
  const items: BudgetLineItem[] = [];

  switch (category) {
    case "venue":
      items.push(
        {
          id: `li_${category}_rental`,
          category,
          label: "Venue Rental / Booking",
          amount: Math.round(allocated * 0.7),
          badge: "AI_ASSUMPTION",
          perCapita: false,
          notes: `Estimated venue cost for ${guestCount} guests`,
        },
        {
          id: `li_${category}_power`,
          category,
          label: "Power, Lighting & Generator",
          amount: Math.round(allocated * 0.15),
          badge: "AI_ASSUMPTION",
          perCapita: false,
        },
        {
          id: `li_${category}_parking`,
          category,
          label: "Parking & Access Setup",
          amount: Math.round(allocated * 0.15),
          badge: "AI_ASSUMPTION",
          perCapita: false,
        }
      );
      break;

    case "catering": {
      const perPlate = Math.round((allocated * 0.6) / Math.max(guestCount, 1));
      items.push(
        {
          id: `li_${category}_perplate`,
          category,
          label: `Per-Plate Main Menu (${sym}${perPlate} × ${guestCount})`,
          amount: perPlate * guestCount,
          badge: "AI_ASSUMPTION",
          perCapita: true,
          unitCost: perPlate,
          notes: `Dynamic: ${sym}${perPlate}/guest`,
        },
        {
          id: `li_${category}_beverage`,
          category,
          label: "Beverages & Live Stations",
          amount: Math.round(allocated * 0.25),
          badge: "AI_ASSUMPTION",
          perCapita: false,
        },
        {
          id: `li_${category}_staff`,
          category,
          label: "Service Staff & Equipment",
          amount: Math.round(allocated * 0.15),
          badge: "AI_ASSUMPTION",
          perCapita: false,
        }
      );
      break;
    }

    case "decor":
      items.push(
        {
          id: `li_${category}_theme`,
          category,
          label: "Theme Decor & Installations",
          amount: Math.round(allocated * 0.5),
          badge: "AI_ASSUMPTION",
          perCapita: false,
        },
        {
          id: `li_${category}_flowers`,
          category,
          label: "Floral Arrangements",
          amount: Math.round(allocated * 0.3),
          badge: "AI_ASSUMPTION",
          perCapita: false,
        },
        {
          id: `li_${category}_lighting`,
          category,
          label: "Ambient & Accent Lighting",
          amount: Math.round(allocated * 0.2),
          badge: "AI_ASSUMPTION",
          perCapita: false,
        }
      );
      break;

    case "photography":
      items.push(
        {
          id: `li_${category}_team`,
          category,
          label: "Photography & Videography Team",
          amount: Math.round(allocated * 0.6),
          badge: "AI_ASSUMPTION",
          perCapita: false,
        },
        {
          id: `li_${category}_booth`,
          category,
          label: "Photo Booth / Props",
          amount: Math.round(allocated * 0.2),
          badge: "AI_ASSUMPTION",
          perCapita: false,
        },
        {
          id: `li_${category}_editing`,
          category,
          label: "Post-Production & Album",
          amount: Math.round(allocated * 0.2),
          badge: "AI_ASSUMPTION",
          perCapita: false,
        }
      );
      break;

    case "logistics":
      items.push(
        {
          id: `li_${category}_transport`,
          category,
          label: "Guest Transport & Coordination",
          amount: Math.round(allocated * 0.3),
          badge: "AI_ASSUMPTION",
          perCapita: false,
        },
        {
          id: `li_${category}_invites`,
          category,
          label: "Invitations & Communication",
          amount: Math.round(allocated * 0.2),
          badge: "AI_ASSUMPTION",
          perCapita: false,
        },
        {
          id: `li_${category}_contingency`,
          category,
          label: "Contingency Reserve",
          amount: Math.round(allocated * 0.3),
          badge: "AI_ASSUMPTION",
          perCapita: false,
          notes: "Buffer for unexpected costs",
        },
        {
          id: `li_${category}_misc`,
          category,
          label: "Miscellaneous",
          amount: Math.round(allocated * 0.2),
          badge: "AI_ASSUMPTION",
          perCapita: false,
        }
      );
      break;
  }

  return items;
}

// ────────────────────────────────────────────────────────────
// Recalculate budget after mutations
// ────────────────────────────────────────────────────────────

export function recalculateBudget(plan: EventPlan): BudgetAllocation[] {
  return allocateBudget(
    plan.totalBudget,
    plan.guestCount,
    plan.priorityWeights,
    plan.currency
  );
}

// ────────────────────────────────────────────────────────────
// 20% Overrun Trade-Off Solver
// ────────────────────────────────────────────────────────────

/**
 * When projected cost exceeds budget by >= 20%, generate 3 trade-off scenarios.
 *
 * The solver:
 * 1. Calculates overrun amount
 * 2. Identifies elastic vs inelastic categories
 * 3. Generates priority-preserving trade-off options
 */
export function generateTradeOffScenarios(
  plan: EventPlan,
  projectedCost?: number
): TradeOffScenario[] {
  const budget = plan.totalBudget;
  const cost = projectedCost ?? budget * 1.2; // Default: simulate 20% overrun
  const overrun = cost - budget;

  if (overrun <= 0) return [];

  const weights = plan.priorityWeights;
  const guestCount = plan.guestCount;

  // Sort categories by priority (high priority = protected, low = compressible)
  const catPriority: { cat: BudgetCategory; weight: number }[] = [
    { cat: "catering" as BudgetCategory, weight: weights.food },
    { cat: "venue" as BudgetCategory, weight: weights.venue },
    { cat: "decor" as BudgetCategory, weight: weights.decor },
    { cat: "photography" as BudgetCategory, weight: weights.photography },
    { cat: "logistics" as BudgetCategory, weight: weights.logistics },
  ].sort((a, b) => b.weight - a.weight);

  const topCategories = catPriority.slice(0, 2).map((c) => c.cat);
  const bottomCategories = catPriority.slice(2).map((c) => c.cat);

  // Scenario 1: Protect top priorities, compress elastic categories
  const scenario1Savings: Partial<Record<BudgetCategory, number>> = {};
  let remaining = overrun;
  for (const { cat } of catPriority.reverse()) {
    if (remaining <= 0) break;
    if (CATEGORY_RATES[cat].isElastic) {
      const catAlloc =
        plan.budgetAllocations.find((a) => a.category === cat)?.allocated ??
        budget * CATEGORY_RATES[cat].basePercent;
      const cut = Math.min(Math.round(catAlloc * 0.3), remaining);
      scenario1Savings[cat] = -cut;
      remaining -= cut;
    }
  }

  // Scenario 2: Reduce guest count to maintain quality
  const guestReduction = Math.ceil(guestCount * 0.18);
  const perGuestSavings = Math.round(overrun / Math.max(guestReduction, 1));

  // Scenario 3: Off-peak / hybrid timing shift
  const venueDiscount = Math.round(budget * 0.25 * 0.25); // 25% venue tariff reduction

  return [
    {
      id: "tradeoff_1",
      title: "Protect Top Priorities, Compress Elastic Categories",
      description: `Keep premium ${topCategories.join(" & ")} unchanged. Reduce spending on ${bottomCategories.join(", ")} by selective downsizing — e.g., minimalist lighting instead of elaborate installations, reduced props, tighter logistics.`,
      savings: overrun - remaining,
      impact: scenario1Savings as Record<BudgetCategory, number>,
      preserves: topCategories,
      compresses: bottomCategories,
    },
    {
      id: "tradeoff_2",
      title: `Intimate Guest Trim (-${guestReduction} guests)`,
      description: `Reduce guest list from ${guestCount} to ${guestCount - guestReduction} (−${Math.round((guestReduction / guestCount) * 100)}%). Saves ~₹${perGuestSavings.toLocaleString()}/guest on catering & seating while preserving the grand venue, full decor, and photography package.`,
      savings: perGuestSavings * guestReduction,
      impact: {
        catering: -(perGuestSavings * guestReduction * 0.7),
        logistics: -(perGuestSavings * guestReduction * 0.3),
      } as Record<BudgetCategory, number>,
      preserves: ["venue", "decor", "photography"],
      compresses: ["catering", "logistics"],
    },
    {
      id: "tradeoff_3",
      title: "Off-Peak / Hybrid Slot Shift",
      description: `Shift evening reception to daytime brunch/afternoon slot for ~25% venue tariff reduction (saving ~₹${venueDiscount.toLocaleString()}). Morning ceremonies often have better natural light for photography and lower generator costs.`,
      savings: venueDiscount,
      impact: {
        venue: -venueDiscount,
      } as Record<BudgetCategory, number>,
      preserves: ["catering", "decor", "photography", "logistics"],
      compresses: ["venue"],
    },
  ];
}

// ────────────────────────────────────────────────────────────
// Compute total projected cost
// ────────────────────────────────────────────────────────────

export function computeProjectedCost(allocations: BudgetAllocation[]): number {
  return allocations.reduce((sum, a) => sum + a.allocated, 0);
}

/**
 * Check if budget is in overrun territory (>= threshold %)
 */
export function checkOverrun(
  budget: number,
  projectedCost: number,
  threshold = 0.2
): { isOverrun: boolean; overrunPercent: number; overrunAmount: number } {
  const overrunAmount = projectedCost - budget;
  const overrunPercent = budget > 0 ? overrunAmount / budget : 0;
  return {
    isOverrun: overrunPercent >= threshold,
    overrunPercent,
    overrunAmount,
  };
}

