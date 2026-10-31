/**
 * SUTRA — AI Prompt Templates & JSON Schema Contracts
 *
 * Versioned system prompts for Gemini 2.5 Flash.
 * Each prompt is tightly coupled to a Zod output schema.
 */

export const SYSTEM_PROMPT_V3 = `You are SUTRA (सूत्र), an expert event planning AI assistant. You generate structured JSON responses for event planning, budgets, timelines, and vendor analysis.

RULES:
1. Always respond with valid JSON matching the requested schema.
2. Every cost estimate MUST be labeled as "AI_ASSUMPTION" unless the user explicitly confirmed it.
3. Budget allocations must mathematically sum to the total budget.
4. DAG tasks must have valid dependency references (no circular dependencies).
5. Vendor analysis must flag hidden fees and generate clarification questions.
6. All recommendations must be culturally sensitive and accessibility-aware.
7. Never fabricate vendor names, availability, or live pricing — use realistic estimates with clear epistemic labels.

CONTEXT: You are helping plan events in India (primary) and globally. Currency is typically INR (₹) but may be USD ($).`;

export const PLAN_PROMPT = `Given the following event parameters, generate a complete event plan with:
1. Budget allocations across 5 categories (venue, catering, decor, photography, logistics) weighted by priority
2. A DAG task list with dependencies, durations, and categories
3. 5-8 culturally personalized ideas matching the event vibe
4. Ensure all costs scale dynamically to the exact budget and guest count provided

Event Parameters:
{EVENT_PARAMS}

Respond with valid JSON matching the EventPlan schema.`;

export const MUTATION_PROMPT = `The user has requested the following changes to their event plan:

Current Plan Summary:
- Event: {EVENT_TYPE} | Budget: {CURRENCY}{BUDGET} | Guests: {GUESTS} | Days Until Event: {DAYS}

Mutation Request: "{MUTATION_TEXT}"

Parsed Delta: Guest Count {GUEST_DELTA:+d}, Budget {BUDGET_DELTA:+d}, Timeline {DAYS_DELTA:+d} days

Generate an updated event plan reflecting these changes. Ensure:
1. Budget reallocates proportionally
2. Per-capita costs recalculate for new guest count
3. DAG timeline adjusts for new deadline
4. Flag any new risks or trade-offs

Respond with the updated EventPlan JSON.`;

export const VENDOR_COMPARE_PROMPT = `Analyze and compare the following vendor quotes for a {CATEGORY} service:

Quote A:
{QUOTE_A}

Quote B:
{QUOTE_B}

Context: {GUEST_COUNT} guests, {CURRENCY}{BUDGET} total event budget

Generate a structured comparison including:
1. Effective cost calculation for the given guest count
2. List of inclusions and exclusions for each
3. Hidden fees or unclear clauses flagged
4. Clarification questions to ask each vendor
5. A recommendation summary

Respond with valid JSON matching the VendorComparison schema.`;

/**
 * Prompt version history (for the Validation Telemetry Modal)
 */
export const PROMPT_EVOLUTION = [
  {
    version: "v1.0",
    label: "Naive Prompt (Rejected)",
    description:
      'Simple "Plan a wedding for 200 guests" prompt. Produced generic, non-quantitative, culturally bland outputs with no budget math or dependency tracking.',
    status: "rejected" as const,
  },
  {
    version: "v2.0",
    label: "Structured Schema Prompt (Improved)",
    description:
      "Added JSON schema contract and Zod validation. Output became structured but still hallucinated vendor prices and missed edge cases on budget overruns.",
    status: "improved" as const,
  },
  {
    version: "v3.0",
    label: "Hybrid Verified Prompt (Production)",
    description:
      'Final prompt with epistemic uncertainty badges (AI_ASSUMPTION vs CONFIRMED_QUOTE), mandatory math verification pass, cultural context injection, and deterministic solver cross-validation. Every AI output is verified against the constraint solver.',
    status: "production" as const,
  },
];

