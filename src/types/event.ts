/**
 * SUTRA (सूत्र) — Core Type System & Zod Schema Contracts
 *
 * All domain types for the event orchestration harness.
 * Every type has a corresponding Zod schema for runtime validation.
 */

import { z } from "zod";

// ────────────────────────────────────────────────────────────
// Enums & Literals
// ────────────────────────────────────────────────────────────

export const EventTypeEnum = z.enum(["wedding", "birthday", "community"]);
export type EventType = z.infer<typeof EventTypeEnum>;

export const CurrencyEnum = z.enum(["INR", "USD"]);
export type Currency = z.infer<typeof CurrencyEnum>;

export const CostBadge = z.enum(["AI_ASSUMPTION", "CONFIRMED_QUOTE"]);
export type CostBadgeType = z.infer<typeof CostBadge>;

export const BudgetCategoryEnum = z.enum([
  "venue",
  "catering",
  "decor",
  "photography",
  "logistics",
]);
export type BudgetCategory = z.infer<typeof BudgetCategoryEnum>;

export const TaskStatusEnum = z.enum([
  "pending",
  "in_progress",
  "completed",
  "delayed",
  "blocked",
]);
export type TaskStatus = z.infer<typeof TaskStatusEnum>;

export const ExecutionTier = z.enum(["gemini", "deterministic"]);
export type ExecutionTierType = z.infer<typeof ExecutionTier>;

// ────────────────────────────────────────────────────────────
// Priority Weights
// ────────────────────────────────────────────────────────────

export const PriorityWeightsSchema = z.object({
  food: z.number().min(0).max(10).default(5),
  venue: z.number().min(0).max(10).default(5),
  decor: z.number().min(0).max(10).default(5),
  photography: z.number().min(0).max(10).default(5),
  logistics: z.number().min(0).max(10).default(5),
});
export type PriorityWeights = z.infer<typeof PriorityWeightsSchema>;

// ────────────────────────────────────────────────────────────
// Accessibility Profile
// ────────────────────────────────────────────────────────────

export const AccessibilityProfileSchema = z.object({
  hasChildren: z.boolean().default(false),
  hasSeniors: z.boolean().default(false),
  wheelchairAccess: z.boolean().default(false),
  dietaryRestrictions: z.array(z.string()).default([]),
});
export type AccessibilityProfile = z.infer<typeof AccessibilityProfileSchema>;

// ────────────────────────────────────────────────────────────
// Budget Line Item
// ────────────────────────────────────────────────────────────

export const BudgetLineItemSchema = z.object({
  id: z.string(),
  category: BudgetCategoryEnum,
  label: z.string(),
  amount: z.number().min(0),
  badge: CostBadge.default("AI_ASSUMPTION"),
  perCapita: z.boolean().default(false),
  unitCost: z.number().min(0).optional(),
  notes: z.string().optional(),
});
export type BudgetLineItem = z.infer<typeof BudgetLineItemSchema>;

// ────────────────────────────────────────────────────────────
// Budget Allocation (per category)
// ────────────────────────────────────────────────────────────

export const BudgetAllocationSchema = z.object({
  category: BudgetCategoryEnum,
  allocated: z.number().min(0),
  spent: z.number().min(0).default(0),
  items: z.array(BudgetLineItemSchema),
  priorityWeight: z.number().min(0).max(10),
});
export type BudgetAllocation = z.infer<typeof BudgetAllocationSchema>;

// ────────────────────────────────────────────────────────────
// Trade-Off Scenario (for 20% overrun resolution)
// ────────────────────────────────────────────────────────────

export const TradeOffScenarioSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  savings: z.number().min(0),
  impact: z.record(BudgetCategoryEnum, z.number()),
  preserves: z.array(BudgetCategoryEnum),
  compresses: z.array(BudgetCategoryEnum),
});
export type TradeOffScenario = z.infer<typeof TradeOffScenarioSchema>;

// ────────────────────────────────────────────────────────────
// DAG Task Node
// ────────────────────────────────────────────────────────────

export const DagTaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  category: BudgetCategoryEnum,
  durationDays: z.number().min(1),
  dependsOn: z.array(z.string()).default([]),
  status: TaskStatusEnum.default("pending"),
  // Computed by the DAG engine
  earliestStart: z.number().optional(),
  latestFinish: z.number().optional(),
  slack: z.number().optional(),
  isCriticalPath: z.boolean().optional(),
  deadline: z.string().optional(),
});
export type DagTask = z.infer<typeof DagTaskSchema>;

// ────────────────────────────────────────────────────────────
// Vendor Quote
// ────────────────────────────────────────────────────────────

export const VendorQuoteSchema = z.object({
  id: z.string(),
  vendorName: z.string(),
  category: BudgetCategoryEnum,
  baseCost: z.number().min(0),
  perGuestCost: z.number().min(0).optional(),
  effectiveCost: z.number().min(0).optional(),
  inclusions: z.array(z.string()).default([]),
  exclusions: z.array(z.string()).default([]),
  hiddenClauses: z.array(z.string()).default([]),
  clarificationQuestions: z.array(z.string()).default([]),
  rawText: z.string().optional(),
});
export type VendorQuote = z.infer<typeof VendorQuoteSchema>;

// ────────────────────────────────────────────────────────────
// Delta Mutation
// ────────────────────────────────────────────────────────────

export const DeltaMutationSchema = z.object({
  guestCountDelta: z.number().default(0),
  budgetDelta: z.number().default(0),
  daysUntilEventDelta: z.number().default(0),
  priorityChanges: PriorityWeightsSchema.partial().optional(),
  rawInput: z.string().optional(),
});
export type DeltaMutation = z.infer<typeof DeltaMutationSchema>;

// ────────────────────────────────────────────────────────────
// Personalized Idea
// ────────────────────────────────────────────────────────────

export const PersonalizedIdeaSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  ageGroup: z.enum(["all", "children", "adults", "seniors"]).default("all"),
  estimatedCost: z.number().min(0).optional(),
  accessibilityNote: z.string().optional(),
});
export type PersonalizedIdea = z.infer<typeof PersonalizedIdeaSchema>;

// ────────────────────────────────────────────────────────────
// Main Event Plan State
// ────────────────────────────────────────────────────────────

export const EventPlanSchema = z.object({
  // Core inputs
  eventType: EventTypeEnum,
  eventName: z.string().max(200).default("My Event"),
  currency: CurrencyEnum.default("INR"),
  totalBudget: z.number().min(1000),
  guestCount: z.number().min(1).max(10000),
  daysUntilEvent: z.number().min(1).max(730),
  targetDate: z.string().optional(),
  priorityWeights: PriorityWeightsSchema,
  accessibility: AccessibilityProfileSchema.default({}),
  vibeDescription: z.string().max(500).optional(),

  // Computed outputs
  budgetAllocations: z.array(BudgetAllocationSchema).default([]),
  tasks: z.array(DagTaskSchema).default([]),
  vendorQuotes: z.array(VendorQuoteSchema).default([]),
  tradeOffScenarios: z.array(TradeOffScenarioSchema).default([]),
  personalizedIdeas: z.array(PersonalizedIdeaSchema).default([]),

  // Execution metadata
  executionTier: ExecutionTier.default("deterministic"),
  lastMutation: DeltaMutationSchema.optional(),
  lastUpdated: z.string().optional(),
});
export type EventPlan = z.infer<typeof EventPlanSchema>;

// ────────────────────────────────────────────────────────────
// API Request/Response Schemas
// ────────────────────────────────────────────────────────────

export const OrchestrateRequestSchema = z.object({
  action: z.enum(["plan", "mutate", "vendor_compare"]),
  eventPlan: EventPlanSchema.partial(),
  mutation: DeltaMutationSchema.optional(),
  vendorQuoteTexts: z.array(z.string()).optional(),
});
export type OrchestrateRequest = z.infer<typeof OrchestrateRequestSchema>;

export const OrchestrateResponseSchema = z.object({
  success: z.boolean(),
  eventPlan: EventPlanSchema.optional(),
  tradeOffs: z.array(TradeOffScenarioSchema).optional(),
  vendorComparison: z.array(VendorQuoteSchema).optional(),
  executionTier: ExecutionTier,
  error: z.string().optional(),
});
export type OrchestrateResponse = z.infer<typeof OrchestrateResponseSchema>;

