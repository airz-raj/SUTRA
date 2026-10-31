/**
 * SUTRA — API Orchestration Route
 *
 * POST /api/orchestrate
 *
 * Accepts: { action, eventPlan, mutation?, vendorQuoteTexts? }
 * Returns: { success, eventPlan?, tradeOffs?, executionTier, error? }
 *
 * Zod-validated input. Dual-tier: Gemini API (if key present) → Deterministic fallback.
 */

import { NextRequest, NextResponse } from "next/server";
import { orchestrate, deterministicPlan } from "@/lib/ai/orchestrator";
import {
  OrchestrateRequestSchema,
  type EventPlan,
  type DeltaMutation,
} from "@/types/event";

// Rate limiter: simple in-memory counter
const requestCounts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = requestCounts.get(ip);

  if (!entry || now > entry.resetAt) {
    requestCounts.set(ip, { count: 1, resetAt: now + 60000 }); // 1 minute window
    return true;
  }

  if (entry.count >= 30) {
    return false; // Max 30 requests per minute
  }

  entry.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // ── Rate Limiting ──
    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { success: false, error: "Rate limit exceeded. Please wait a moment.", executionTier: "deterministic" as const },
        { status: 429 }
      );
    }

    // ── Parse & Validate Request Body ──
    const rawBody = await request.json();

    const parseResult = OrchestrateRequestSchema.safeParse(rawBody);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid request: ${parseResult.error.issues.map((i) => i.message).join(", ")}`,
          executionTier: "deterministic" as const,
        },
        { status: 400 }
      );
    }

    const { action, eventPlan: planParams, mutation } = parseResult.data;

    // ── Resolve API Key ──
    // Priority: BYOK header > server env
    const byokKey = request.headers.get("x-gemini-key");
    const serverKey = process.env.GEMINI_API_KEY;
    const apiKey = byokKey ?? serverKey ?? null;

    // ── Execute ──
    let result;
    switch (action) {
      case "plan": {
        result = await orchestrate(planParams as Partial<EventPlan>, apiKey, "plan");
        break;
      }
      case "mutate": {
        const deltaMutation: DeltaMutation = mutation ?? {
          guestCountDelta: 0,
          budgetDelta: 0,
          daysUntilEventDelta: 0,
        };
        result = await orchestrate(
          planParams as Partial<EventPlan>,
          apiKey,
          "mutate",
          deltaMutation
        );
        break;
      }
      case "vendor_compare": {
        // Vendor comparison uses deterministic solver directly
        const plan = deterministicPlan(planParams as Partial<EventPlan>);
        result = { plan, tier: "deterministic" as const };
        break;
      }
      default: {
        return NextResponse.json(
          { success: false, error: "Unknown action", executionTier: "deterministic" as const },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      eventPlan: result.plan,
      executionTier: result.tier,
      error: result.error,
    });
  } catch (error) {
    console.error("[SUTRA API Error]", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
        executionTier: "deterministic" as const,
      },
      { status: 500 }
    );
  }
}

