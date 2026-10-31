/**
 * SUTRA (सूत्र) — Centralized Domain Constants
 *
 * Single source of truth for multipliers, constraints, timeout thresholds,
 * and category parameters across budget, CPM, and GenAI subsystems.
 */

import type { BudgetCategory } from "@/types/event";

/** Default event parameters when initializing from scratch */
export const EVENT_DEFAULTS = {
  MIN_BUDGET: 1_000,
  DEFAULT_BUDGET: 500_000,
  MAX_BUDGET: 100_000_000,
  MIN_GUESTS: 1,
  DEFAULT_GUESTS: 100,
  MAX_GUESTS: 10_000,
  MIN_DAYS: 1,
  DEFAULT_DAYS: 60,
  MAX_DAYS: 730,
  DEFAULT_CURRENCY: "INR" as const,
  DEFAULT_PRIORITY_WEIGHT: 5,
} as const;

/** Category rate metadata for deterministic budget distribution */
export interface CategoryRateConfig {
  readonly basePercent: number;
  readonly perCapitaFactor: number;
  readonly isElastic: boolean;
  readonly label: string;
}

export const CATEGORY_RATE_CONFIG: Record<BudgetCategory, CategoryRateConfig> = {
  venue: { basePercent: 0.25, perCapitaFactor: 0, isElastic: false, label: "Venue" },
  catering: { basePercent: 0.35, perCapitaFactor: 1.0, isElastic: false, label: "Catering" },
  decor: { basePercent: 0.15, perCapitaFactor: 0, isElastic: true, label: "Décor" },
  photography: { basePercent: 0.12, perCapitaFactor: 0, isElastic: true, label: "Photography" },
  logistics: { basePercent: 0.13, perCapitaFactor: 0.1, isElastic: true, label: "Logistics" },
} as const;

export const ALL_BUDGET_CATEGORIES: readonly BudgetCategory[] = [
  "venue",
  "catering",
  "decor",
  "photography",
  "logistics",
] as const;

/** Overrun solver thresholds */
export const OVERRUN_SOLVER_CONFIG = {
  SIMULATION_MULTIPLIER: 1.2, // +20% overrun trigger
  OVERRUN_THRESHOLD: 0.2,     // 20% threshold flag
  ELASTIC_CUT_RATIO: 0.3,     // Up to 30% reduction on elastic categories
  GUEST_TRIM_PERCENT: 0.18,   // 18% trim on intimate scenario
  OFFPEAK_VENUE_DISCOUNT: 0.25, // 25% discount for daytime/offpeak slot
} as const;

/** GenAI Candidate Model Cascade */
export const CANDIDATE_GEMINI_MODELS = [
  "gemini-3.5-flash-lite", // Primary: fastest structured JSON
  "gemini-3.5-flash",      // Secondary: deep creative synthesis
  "gemini-3.8-flash",      // High-demand tier
  "gemini-2.5-flash",      // Legacy fallback
  "gemini-flash-latest",   // General latest alias
] as const;

/** Network and timeout limits */
export const NETWORK_LIMITS = {
  MODEL_TIMEOUT_MS: 6_000,
  RATE_LIMIT_WINDOW_MS: 60_000,
  RATE_LIMIT_MAX_REQUESTS: 30,
} as const;
