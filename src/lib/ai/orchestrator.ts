/**
 * SUTRA — Dual-Tier Execution Orchestrator
 *
 * Tier 1: Google Gemini 2.5 Flash (when API key is available)
 * Tier 2: Deterministic Constraint Solver (always available, fallback)
 *
 * Key design decisions for API key robustness:
 * - Validates key format before attempting calls
 * - try/catch with automatic fallback on ANY API error
 * - Supports server env (GEMINI_API_KEY) and client BYOK (x-gemini-key)
 * - Never hardcodes or logs API keys
 * - Clear UI feedback on which tier is active
 */

import type {
  EventPlan,
  DeltaMutation,
  ExecutionTierType,
} from "@/types/event";
import { allocateBudget, generateTradeOffScenarios } from "@/lib/engine/budgetSolver";
import { computeDeadlines } from "@/lib/engine/dagEngine";
import { generatePersonalizedIdeas } from "./ideaGenerator";

// ────────────────────────────────────────────────────────────
// API Key Validation
// ────────────────────────────────────────────────────────────

/**
 * Validate that an API key has a plausible format.
 * Google AI Studio keys are typically 39 characters starting with "AIza".
 * But newer formats may vary — so we're lenient.
 */
export function validateApiKeyFormat(key: string | undefined | null): boolean {
  if (!key || typeof key !== "string") return false;
  const trimmed = key.trim();
  // Must be at least 15 chars
  if (trimmed.length < 15) return false;
  // Lenient regex to support classic AIzaSy keys, newer Google Cloud / Studio formats, dots, dashes, underscores
  if (!/^[A-Za-z0-9_.\-~+=]+$/.test(trimmed)) return false;
  return true;
}

// ────────────────────────────────────────────────────────────
// Tier 2: Deterministic Solver (always works)
// ────────────────────────────────────────────────────────────

export function deterministicPlan(params: Partial<EventPlan>): EventPlan {
  const totalBudget = params.totalBudget ?? 500000;
  const guestCount = params.guestCount ?? 100;
  const daysUntilEvent = params.daysUntilEvent ?? 60;
  const priorityWeights = params.priorityWeights ?? {
    food: 5,
    venue: 5,
    decor: 5,
    photography: 5,
    logistics: 5,
  };
  const currency = params.currency ?? "INR";
  const eventType = params.eventType ?? "wedding";

  // Compute budget allocations
  const budgetAllocations = allocateBudget(
    totalBudget,
    guestCount,
    priorityWeights,
    currency
  );

  // Compute DAG with CPM
  const tasks = params.tasks ?? [];
  const tasksWithDeadlines = tasks.length > 0
    ? computeDeadlines(tasks, daysUntilEvent)
    : [];

  // Generate trade-off scenarios
  const plan: EventPlan = {
    eventType,
    eventName: params.eventName ?? "My Event",
    currency,
    totalBudget,
    guestCount,
    daysUntilEvent,
    targetDate: params.targetDate,
    priorityWeights,
    accessibility: params.accessibility ?? {
      hasChildren: false,
      hasSeniors: false,
      wheelchairAccess: false,
      dietaryRestrictions: [],
    },
    vibeDescription: params.vibeDescription,
    budgetAllocations,
    tasks: tasksWithDeadlines,
    vendorQuotes: params.vendorQuotes ?? [],
    tradeOffScenarios: [],
    personalizedIdeas: [],
    executionTier: "deterministic",
    lastUpdated: new Date().toISOString(),
  };

  plan.tradeOffScenarios = generateTradeOffScenarios(plan);
  plan.personalizedIdeas = generatePersonalizedIdeas(plan);

  return plan;
}

// ────────────────────────────────────────────────────────────
// Apply mutation to an existing plan
// ────────────────────────────────────────────────────────────

export function applyMutation(
  currentPlan: EventPlan,
  mutation: DeltaMutation
): EventPlan {
  const newGuestCount = Math.max(1, currentPlan.guestCount + (mutation.guestCountDelta ?? 0));
  const newBudget = Math.max(1000, currentPlan.totalBudget + (mutation.budgetDelta ?? 0));
  const newDays = Math.max(1, currentPlan.daysUntilEvent + (mutation.daysUntilEventDelta ?? 0));

  const newPriorities = mutation.priorityChanges
    ? { ...currentPlan.priorityWeights, ...mutation.priorityChanges }
    : currentPlan.priorityWeights;

  return deterministicPlan({
    ...currentPlan,
    totalBudget: newBudget,
    guestCount: newGuestCount,
    daysUntilEvent: newDays,
    priorityWeights: newPriorities,
    lastMutation: mutation,
  });
}

// ────────────────────────────────────────────────────────────
// Tier 1: Gemini API Call (with robust fallback)
// ────────────────────────────────────────────────────────────

interface GeminiResponse {
  plan: EventPlan | null;
  tier: ExecutionTierType;
  error?: string;
}

/**
 * Attempt to call Gemini API. On ANY failure, fall back to deterministic solver.
 *
 * This function is designed to be called from the API route handler.
 * The client-side always has the deterministic solver as backup.
 */
export async function orchestrate(
  params: Partial<EventPlan>,
  apiKey?: string | null,
  action: "plan" | "mutate" | "vendor_compare" = "plan",
  mutation?: DeltaMutation
): Promise<GeminiResponse> {
  // ── Step 1: Check if API key is available and valid ──
  const key = apiKey?.trim();
  const hasValidKey = validateApiKeyFormat(key);

  if (!hasValidKey) {
    // No key or invalid key — go straight to deterministic solver
    const plan = action === "mutate" && mutation
      ? applyMutation(params as EventPlan, mutation)
      : deterministicPlan(params);

    return { plan, tier: "deterministic" };
  }

  // ── Step 2: Attempt Gemini API call with robust error handling ──
  try {
    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey: key! });

    const prompt = buildPrompt(params, action, mutation);
    const candidateModels = [
      "gemini-3.5-flash-lite",
      "gemini-3.5-flash",
      "gemini-3.8-flash",
      "gemini-2.5-flash",
      "gemini-flash-latest",
    ];

    let text = "";
    let lastError = "";

    for (const model of candidateModels) {
      try {
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Model ${model} timed out after 6s`)), 6000)
        );

        const callPromise = ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            temperature: 0.3,
          },
        });

        const response = await Promise.race([callPromise, timeoutPromise]);
        text = response.text ?? "";
        if (text.trim().length > 0) {
          break; // Successfully got response
        }
      } catch (err) {
        lastError = err instanceof Error ? err.message : String(err);
        // Continue to next candidate model
      }
    }

    if (!text.trim()) {
      throw new Error(`Google Studio API error or high-demand quota spike: ${lastError.slice(0, 100)}`);
    }

    // Try to parse the JSON response
    let parsed: Record<string, unknown>;
    try {
      // Handle cases where Gemini wraps JSON in markdown code fences
      const jsonStr = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(jsonStr);
    } catch {
      // JSON parse failed — fall back
      console.warn("[SUTRA] Gemini returned non-JSON response, falling back to deterministic solver");
      const plan = action === "mutate" && mutation
        ? applyMutation(params as EventPlan, mutation)
        : deterministicPlan(params);
      return { plan, tier: "deterministic", error: "Gemini returned invalid JSON" };
    }

    // Merge Gemini's creative output with deterministic verification
    const deterministicResult = action === "mutate" && mutation
      ? applyMutation(params as EventPlan, mutation)
      : deterministicPlan(params);

    // Use deterministic budget math (guaranteed correct) but take creative ideas from Gemini
    const plan: EventPlan = {
      ...deterministicResult,
      personalizedIdeas: Array.isArray(parsed.personalizedIdeas)
        ? parsed.personalizedIdeas as EventPlan["personalizedIdeas"]
        : deterministicResult.personalizedIdeas,
      vibeDescription: typeof parsed.vibeDescription === "string"
        ? parsed.vibeDescription
        : deterministicResult.vibeDescription,
      executionTier: "gemini",
    };

    return { plan, tier: "gemini" };
  } catch (error) {
    // ANY error: network, auth, rate limit, format, etc. → deterministic fallback
    const errorMessage = error instanceof Error ? error.message : "Unknown Gemini API error";
    console.warn(`[SUTRA] Gemini API error: ${errorMessage}. Falling back to deterministic solver.`);

    const plan = action === "mutate" && mutation
      ? applyMutation(params as EventPlan, mutation)
      : deterministicPlan(params);

    return {
      plan,
      tier: "deterministic",
      error: `Gemini fallback: ${errorMessage}`,
    };
  }
}

// ────────────────────────────────────────────────────────────
// Build prompt for Gemini
// ────────────────────────────────────────────────────────────

function buildPrompt(
  params: Partial<EventPlan>,
  action: string,
  mutation?: DeltaMutation
): string {
  const base = `You are SUTRA (सूत्र), an expert event planning AI. Respond with valid JSON only.

Event: ${params.eventType ?? "wedding"}
Budget: ${params.currency ?? "INR"} ${params.totalBudget ?? 500000}
Guests: ${params.guestCount ?? 100}
Days Until Event: ${params.daysUntilEvent ?? 60}
Vibe: ${params.vibeDescription ?? "Not specified"}
Priority Weights: Food=${params.priorityWeights?.food ?? 5}, Venue=${params.priorityWeights?.venue ?? 5}, Decor=${params.priorityWeights?.decor ?? 5}, Photo=${params.priorityWeights?.photography ?? 5}, Logistics=${params.priorityWeights?.logistics ?? 5}
`;

  if (action === "mutate" && mutation) {
    return `${base}
Apply this mutation: ${mutation.rawInput ?? JSON.stringify(mutation)}
Guest delta: ${mutation.guestCountDelta}, Budget delta: ${mutation.budgetDelta}, Days delta: ${mutation.daysUntilEventDelta}

Generate updated personalizedIdeas (array of objects with id, title, description, category, ageGroup, estimatedCost, accessibilityNote) and an updated vibeDescription.`;
  }

  return `${base}
Generate personalizedIdeas (array of 5-8 objects with id, title, description, category, ageGroup, estimatedCost, accessibilityNote) and a detailed vibeDescription matching the event parameters.`;
}

