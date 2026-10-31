import { describe, it, expect } from "vitest";
import {
  allocateBudget,
  recalculateBudget,
  generateTradeOffScenarios,
  checkOverrun,
} from "@/lib/engine/budgetSolver";
import {
  topologicalSort,
  computeCriticalPath,
  propagateDelay,
  completeTask,
  isTimelineFeasible,
} from "@/lib/engine/dagEngine";
import { parseMutation } from "@/lib/engine/mutationParser";
import {
  parseVendorQuote,
  compareVendorQuotes,
  getInterrogationChecklist,
} from "@/lib/engine/vendorComparator";
import { PRESET_WEDDING } from "@/lib/presets";
import { validateApiKeyFormat } from "@/lib/ai/orchestrator";
import type { DagTask, EventPlan } from "@/types/event";

describe("SUTRA Engine Test Suite", () => {
  // ────────────────────────────────────────────────────────────
  // Test 1: Budget Recalculation & Scaling
  // ────────────────────────────────────────────────────────────
  describe("Module B: Dynamic Budget Engine", () => {
    it("allocates total budget across all 5 categories proportionally to priority weights", () => {
      const budget = 800000;
      const guests = 200;
      const priorities = { food: 9, venue: 7, decor: 6, photography: 5, logistics: 4 };

      const allocations = allocateBudget(budget, guests, priorities, "INR");

      expect(allocations).toHaveLength(5);

      // Total sum of allocations should equal or approximate totalBudget
      const sum = allocations.reduce((acc, a) => acc + a.allocated, 0);
      expect(Math.abs(sum - budget)).toBeLessThan(100); // within rounding margin

      // High-priority food should have higher allocation than lower-priority logistics
      const foodAlloc = allocations.find((a) => a.category === "catering")!;
      const logAlloc = allocations.find((a) => a.category === "logistics")!;
      expect(foodAlloc.allocated).toBeGreaterThan(logAlloc.allocated);
    });

    it("scales per-plate line items when guest count mutates by +50 and budget drops", () => {
      const initialPlan: EventPlan = {
        ...PRESET_WEDDING,
        totalBudget: 800000,
        guestCount: 200,
        lastUpdated: new Date().toISOString(),
      };

      const mutatedPlan: EventPlan = {
        ...initialPlan,
        totalBudget: 750000, // -50k budget
        guestCount: 250,    // +50 guests
      };

      const initialAllocations = recalculateBudget(initialPlan);
      const mutatedAllocations = recalculateBudget(mutatedPlan);

      const initCatering = initialAllocations.find((a) => a.category === "catering")!;
      const mutatedCatering = mutatedAllocations.find((a) => a.category === "catering")!;

      const initPerPlateItem = initCatering.items.find((i) => i.perCapita)!;
      const mutatedPerPlateItem = mutatedCatering.items.find((i) => i.perCapita)!;

      expect(initPerPlateItem.perCapita).toBe(true);
      expect(mutatedPerPlateItem.perCapita).toBe(true);
      // Recalculates dynamically for 250 guests
      expect(mutatedPerPlateItem.label).toContain("250");
    });

    it("generates 3 trade-off scenarios when simulating a 20% budget overrun", () => {
      const plan: EventPlan = {
        ...PRESET_WEDDING,
        totalBudget: 800000,
        guestCount: 200,
        budgetAllocations: allocateBudget(800000, 200, PRESET_WEDDING.priorityWeights),
        lastUpdated: new Date().toISOString(),
      };

      // Check overrun flag at 20%
      const overrunCheck = checkOverrun(800000, 960000, 0.2);
      expect(overrunCheck.isOverrun).toBe(true);
      expect(overrunCheck.overrunAmount).toBe(160000);

      const scenarios = generateTradeOffScenarios(plan, 960000);
      expect(scenarios).toHaveLength(3);

      // Scenario 1 preserves top priority (culinary/catering)
      expect(scenarios[0].preserves).toContain("catering");
      expect(scenarios[0].savings).toBeGreaterThan(0);

      // Scenario 2 reduces guest count
      expect(scenarios[1].title).toContain("Guest Trim");
      expect(scenarios[1].savings).toBeGreaterThan(0);

      // Scenario 3 off-peak / slot shift
      expect(scenarios[2].title).toContain("Off-Peak");
      expect(scenarios[2].savings).toBeGreaterThan(0);
    });
  });

  // ────────────────────────────────────────────────────────────
  // Test 2: DAG Critical Path & Topological Sort
  // ────────────────────────────────────────────────────────────
  describe("Module C: DAG Dependency Timeline & CPM", () => {
    const sampleTasks: DagTask[] = [
      {
        id: "venue",
        title: "Book Venue",
        category: "venue",
        durationDays: 10,
        dependsOn: [],
        status: "pending",
      },
      {
        id: "caterer",
        title: "Book Caterer",
        category: "catering",
        durationDays: 5,
        dependsOn: ["venue"],
        status: "pending",
      },
      {
        id: "invites",
        title: "Print & Dispatch Invites",
        category: "logistics",
        durationDays: 7,
        dependsOn: ["venue"],
        status: "pending",
      },
      {
        id: "tasting",
        title: "Menu Tasting",
        category: "catering",
        durationDays: 2,
        dependsOn: ["caterer"],
        status: "pending",
      },
    ];

    it("topologically sorts tasks respecting prerequisite order", () => {
      const sorted = topologicalSort(sampleTasks);
      expect(sorted[0]).toBe("venue"); // Venue must be first
      expect(sorted.indexOf("venue")).toBeLessThan(sorted.indexOf("caterer"));
      expect(sorted.indexOf("caterer")).toBeLessThan(sorted.indexOf("tasting"));
    });

    it("computes Critical Path with zero slack", () => {
      const { tasks, criticalPath, totalDuration } = computeCriticalPath(sampleTasks);

      // Longest path: venue (10) -> caterer (5) -> tasting (2) = 17 days
      // Alternative: venue (10) -> invites (7) = 17 days
      expect(totalDuration).toBe(17);
      expect(criticalPath).toContain("venue");

      const venueTask = tasks.find((t) => t.id === "venue")!;
      expect(venueTask.isCriticalPath).toBe(true);
      expect(venueTask.slack).toBe(0);
    });

    it("propagates delays to downstream dependent tasks", () => {
      // Delay venue by 14 days
      const delayedTasks = propagateDelay(sampleTasks, "venue", 14);

      const venue = delayedTasks.find((t) => t.id === "venue")!;
      const caterer = delayedTasks.find((t) => t.id === "caterer")!;
      const tasting = delayedTasks.find((t) => t.id === "tasting")!;

      expect(venue.status).toBe("delayed");
      expect(caterer.status).toBe("blocked"); // Downstream task flagged as blocked
      expect(tasting.status).toBe("blocked");
    });

    it("unblocks downstream tasks when prerequisite is completed", () => {
      // Initially, complete the venue task
      const updated = completeTask(sampleTasks, "venue");
      const venue = updated.find((t) => t.id === "venue")!;
      const caterer = updated.find((t) => t.id === "caterer")!;

      expect(venue.status).toBe("completed");
      expect(caterer.status).toBe("pending"); // Ready to start
    });

    it("evaluates timeline feasibility against target days", () => {
      const feasible = isTimelineFeasible(sampleTasks, 30);
      expect(feasible.feasible).toBe(true);
      expect(feasible.deficit).toBe(0);

      const infeasible = isTimelineFeasible(sampleTasks, 10);
      expect(infeasible.feasible).toBe(false);
      expect(infeasible.deficit).toBe(7); // 17 - 10
    });
  });

  // ────────────────────────────────────────────────────────────
  // Test 3: Natural Language Mutation Parsing (The SME Golden Test)
  // ────────────────────────────────────────────────────────────
  describe("Module D: Live Delta Mutation Parser", () => {
    it("parses '+50 guests, reduce budget by ₹50,000, and move event 2 weeks earlier'", () => {
      const input = "Add 50 more guests, reduce budget by ₹50,000, and move event 2 weeks earlier";
      const delta = parseMutation(input);

      expect(delta.guestCountDelta).toBe(50);
      expect(delta.budgetDelta).toBe(-50000);
      expect(delta.daysUntilEventDelta).toBe(-14); // 2 weeks earlier = -14 days
    });

    it("handles shorthand notation (50k, 1L, etc.)", () => {
      const input = "+25 guests, -50k budget, 10 days earlier";
      const delta = parseMutation(input);

      expect(delta.guestCountDelta).toBe(25);
      expect(delta.budgetDelta).toBe(-50000);
      expect(delta.daysUntilEventDelta).toBe(-10);
    });

    it("handles single-intent mutations safely", () => {
      const delta = parseMutation("add 30 attendees");
      expect(delta.guestCountDelta).toBe(30);
      expect(delta.budgetDelta).toBe(0);
      expect(delta.daysUntilEventDelta).toBe(0);
    });
  });

  // ────────────────────────────────────────────────────────────
  // Test 4: Vendor Quote Comparator & Hidden Clause Detector
  // ────────────────────────────────────────────────────────────
  describe("Module E: Vendor Coordinator & Comparator", () => {
    const rawQuoteA = `
      Vendor: Shahi Dawat Caterers
      Base cost: ₹1,80,000
      Rate per guest: ₹900
      Included:
      - Live Chaat counter
      - Paranthe station
      - Main course (6 dishes)
      Excluded:
      - Crockery rental
      - After-midnight service
      Terms:
      - 15% surcharge on guest count exceeding 220
      - Corkage fee of ₹15,000 for outside beverages
    `;

    const rawQuoteB = `
      Vendor: Delhi Heritage Kitchens
      Base cost: ₹1,50,000
      Rate per guest: ₹750
      Included:
      - Main course (5 dishes)
      - Basic service staff
      Excluded:
      - Live cooking stations
      Terms:
      - Overtime charge of ₹5,000 per hour after 11 PM
      - No refund on advance if cancelled
    `;

    it("parses raw vendor quote text and extracts costs and hidden clauses", () => {
      const quote = parseVendorQuote(rawQuoteA, "Shahi Dawat Caterers", "catering", 200);

      expect(quote.baseCost).toBe(180000);
      expect(quote.perGuestCost).toBe(900);
      expect(quote.effectiveCost).toBe(180000 + 900 * 200);

      // Inclusions extracted
      expect(quote.inclusions.length).toBeGreaterThan(0);

      // Hidden clauses flagged
      expect(quote.hiddenClauses.some((c) => c.toLowerCase().includes("corkage"))).toBe(true);
      expect(quote.hiddenClauses.some((c) => c.toLowerCase().includes("surcharge"))).toBe(true);
    });

    it("compares two quotes and highlights cheaper vendor and fee warnings", () => {
      const quoteA = parseVendorQuote(rawQuoteA, "Shahi Dawat Caterers", "catering", 200);
      const quoteB = parseVendorQuote(rawQuoteB, "Delhi Heritage Kitchens", "catering", 200);

      const comparison = compareVendorQuotes(quoteA, quoteB, 200);

      expect(comparison.cheaperVendor).toBe("Delhi Heritage Kitchens");
      expect(comparison.costDifference).toBeGreaterThan(0);
      expect(comparison.hiddenFeeWarnings.length).toBeGreaterThan(0);
    });

    it("provides standard interrogation questions per category", () => {
      const questions = getInterrogationChecklist("catering");
      expect(questions.length).toBeGreaterThan(4);
      expect(questions.some((q) => q.toLowerCase().includes("corkage"))).toBe(true);
    });
  });

  // ────────────────────────────────────────────────────────────
  // Test 5: API Key Format Validation & Dual-Tier Safety
  // ────────────────────────────────────────────────────────────
  describe("API Key Handling & Dual-Tier Fallback", () => {
    it("validates plausible Google AI Studio API key formats", () => {
      expect(validateApiKeyFormat("AIzaSyD-1234567890abcdefghijklmnopqrstuv")).toBe(true);
      expect(validateApiKeyFormat("AIzaSyValidFormatKey1234567890abcdefgh")).toBe(true);
      expect(validateApiKeyFormat("AQ.valid_key_format_with_hyphens-123456")).toBe(true);
    });

    it("rejects invalid, empty, or too short keys safely without throwing", () => {
      expect(validateApiKeyFormat("")).toBe(false);
      expect(validateApiKeyFormat(undefined)).toBe(false);
      expect(validateApiKeyFormat(null)).toBe(false);
      expect(validateApiKeyFormat("short")).toBe(false);
      expect(validateApiKeyFormat("invalid space key 1234567890")).toBe(false);
    });
  });
});

