/**
 * SUTRA — Zustand Persistent Store
 *
 * Local-first reactive store with localStorage persistence.
 * Zero external database required.
 */

"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  EventPlan,
  DeltaMutation,
  ExecutionTierType,
} from "@/types/event";
import { PRESETS, type PresetKey } from "@/lib/presets";
import { deterministicPlan, applyMutation } from "@/lib/ai/orchestrator";
import { parseMutation, STRESS_TEST_MUTATIONS } from "@/lib/engine/mutationParser";
import { generateTradeOffScenarios } from "@/lib/engine/budgetSolver";
import {
  propagateDelay,
  completeTask as completeTaskFn,
  computeDeadlines,
} from "@/lib/engine/dagEngine";

// ────────────────────────────────────────────────────────────
// Snapshot for before/after diff
// ────────────────────────────────────────────────────────────

export interface PlanSnapshot {
  totalBudget: number;
  guestCount: number;
  daysUntilEvent: number;
  budgetAllocations: EventPlan["budgetAllocations"];
  tasks: EventPlan["tasks"];
}

function takeSnapshot(plan: EventPlan): PlanSnapshot {
  return {
    totalBudget: plan.totalBudget,
    guestCount: plan.guestCount,
    daysUntilEvent: plan.daysUntilEvent,
    budgetAllocations: plan.budgetAllocations,
    tasks: plan.tasks,
  };
}

// ────────────────────────────────────────────────────────────
// Store Interface
// ────────────────────────────────────────────────────────────

export interface EventStore {
  // ── State ──
  plan: EventPlan | null;
  activePreset: PresetKey | "custom" | null;
  executionTier: ExecutionTierType;
  geminiApiKey: string | null; // In-memory only (NOT persisted)
  isProcessing: boolean;
  error: string | null;

  // Diff tracking
  previousSnapshot: PlanSnapshot | null;
  showDiff: boolean;

  // UI state
  activeTab: "budget" | "timeline" | "vendor" | "ideas" | "validation";
  showIntakeModal: boolean;
  showByokModal: boolean;
  showValidationModal: boolean;

  // ── Actions ──
  loadPreset: (key: PresetKey) => void;
  initCustomPlan: (params: Partial<EventPlan>) => void;
  applyNLMutation: (input: string) => void;
  applyStructuredMutation: (mutation: DeltaMutation) => void;
  applyStressTest: (index: number) => void;
  simulateOverrun: () => void;
  simulateDelay: (taskId: string, delayDays: number) => void;
  completeTask: (taskId: string) => void;
  toggleBadge: (itemId: string) => void;
  setApiKey: (key: string | null) => void;
  setActiveTab: (tab: EventStore["activeTab"]) => void;
  setShowIntakeModal: (show: boolean) => void;
  setShowByokModal: (show: boolean) => void;
  setShowValidationModal: (show: boolean) => void;
  closeDiff: () => void;
  resetPlan: () => void;
  exportPlanJSON: () => string;
}

// ────────────────────────────────────────────────────────────
// Create Store
// ────────────────────────────────────────────────────────────

export const useEventStore = create<EventStore>()(
  persist(
    (set, get) => ({
      // ── Initial State ──
      plan: null,
      activePreset: null,
      executionTier: "deterministic",
      geminiApiKey: null,
      isProcessing: false,
      error: null,
      previousSnapshot: null,
      showDiff: false,
      activeTab: "budget",
      showIntakeModal: false,
      showByokModal: false,
      showValidationModal: false,

      // ── Actions ──

      loadPreset: (key: PresetKey) => {
        const preset = PRESETS[key];
        const plan = deterministicPlan({
          ...preset,
          lastUpdated: new Date().toISOString(),
        });
        const { geminiApiKey } = get();
        set({
          plan,
          activePreset: key,
          executionTier: geminiApiKey ? "gemini" : "deterministic",
          error: null,
          previousSnapshot: null,
          showDiff: false,
          showIntakeModal: false,
        });

        // If API key is present, enrich in background with live Gemini ideas
        if (geminiApiKey) {
          fetch("/api/orchestrate", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-gemini-key": geminiApiKey,
            },
            body: JSON.stringify({
              action: "plan",
              eventPlan: plan,
            }),
          })
            .then((res) => res.json())
            .then((data) => {
              if (data.success && data.eventPlan) {
                const current = get().plan;
                if (current && get().activePreset === key) {
                  set({
                    plan: {
                      ...current,
                      personalizedIdeas: data.eventPlan.personalizedIdeas?.length
                        ? data.eventPlan.personalizedIdeas
                        : current.personalizedIdeas,
                      vibeDescription: data.eventPlan.vibeDescription ?? current.vibeDescription,
                      executionTier: "gemini",
                    },
                    executionTier: "gemini",
                  });
                }
              }
            })
            .catch(() => {
              // Silently stay on deterministic engine
            });
        }
      },

      initCustomPlan: (params: Partial<EventPlan>) => {
        const plan = deterministicPlan(params);
        set({
          plan,
          activePreset: "custom",
          executionTier: "deterministic",
          error: null,
          previousSnapshot: null,
          showDiff: false,
          showIntakeModal: false,
        });
      },

      applyNLMutation: (input: string) => {
        const { plan, geminiApiKey } = get();
        if (!plan) return;

        const snapshot = takeSnapshot(plan);
        const mutation = parseMutation(input);
        const newPlan = applyMutation(plan, mutation);

        set({
          plan: { ...newPlan, lastMutation: mutation },
          previousSnapshot: snapshot,
          showDiff: true,
          error: null,
        });

        // If an API key is present, attempt live AI enrichment in background
        if (geminiApiKey) {
          fetch("/api/orchestrate", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-gemini-key": geminiApiKey,
            },
            body: JSON.stringify({
              action: "mutate",
              eventPlan: newPlan,
              mutation,
            }),
          })
            .then((res) => res.json())
            .then((data) => {
              if (data.success && data.eventPlan && data.executionTier === "gemini") {
                const current = get().plan;
                if (current) {
                  set({
                    plan: {
                      ...current,
                      personalizedIdeas: data.eventPlan.personalizedIdeas ?? current.personalizedIdeas,
                      vibeDescription: data.eventPlan.vibeDescription ?? current.vibeDescription,
                      executionTier: "gemini",
                    },
                  });
                }
              }
            })
            .catch(() => {
              // Silently remain on deterministic engine
            });
        }
      },

      applyStructuredMutation: (mutation: DeltaMutation) => {
        const { plan, geminiApiKey } = get();
        if (!plan) return;

        const snapshot = takeSnapshot(plan);
        const newPlan = applyMutation(plan, mutation);

        set({
          plan: { ...newPlan, lastMutation: mutation },
          previousSnapshot: snapshot,
          showDiff: true,
          error: null,
        });

        // If an API key is present, attempt live AI enrichment in background
        if (geminiApiKey) {
          fetch("/api/orchestrate", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-gemini-key": geminiApiKey,
            },
            body: JSON.stringify({
              action: "mutate",
              eventPlan: newPlan,
              mutation,
            }),
          })
            .then((res) => res.json())
            .then((data) => {
              if (data.success && data.eventPlan && data.executionTier === "gemini") {
                const current = get().plan;
                if (current) {
                  set({
                    plan: {
                      ...current,
                      personalizedIdeas: data.eventPlan.personalizedIdeas ?? current.personalizedIdeas,
                      vibeDescription: data.eventPlan.vibeDescription ?? current.vibeDescription,
                      executionTier: "gemini",
                    },
                  });
                }
              }
            })
            .catch(() => {
              // Silently remain on deterministic engine
            });
        }
      },

      applyStressTest: (index: number) => {
        const stressTest = STRESS_TEST_MUTATIONS[index];
        if (!stressTest) return;
        get().applyStructuredMutation(stressTest.mutation);
      },

      simulateOverrun: () => {
        const { plan } = get();
        if (!plan) return;

        const snapshot = takeSnapshot(plan);

        // Simulate by keeping budget but inflating costs by 20%
        // This triggers the trade-off scenario generator
        const overrunPlan = deterministicPlan({
          ...plan,
          totalBudget: plan.totalBudget, // Keep same budget
        });

        // Force-generate trade-offs as if costs exceeded by 20%
        const tradeOffs = generateTradeOffScenarios(overrunPlan, plan.totalBudget * 1.2);

        set({
          plan: { ...overrunPlan, tradeOffScenarios: tradeOffs },
          previousSnapshot: snapshot,
          showDiff: true,
          error: null,
        });
      },

      simulateDelay: (taskId: string, delayDays: number) => {
        const { plan } = get();
        if (!plan) return;

        const snapshot = takeSnapshot(plan);
        const delayedTasks = propagateDelay(plan.tasks, taskId, delayDays);
        const updatedTasks = computeDeadlines(delayedTasks, plan.daysUntilEvent);

        set({
          plan: { ...plan, tasks: updatedTasks, lastUpdated: new Date().toISOString() },
          previousSnapshot: snapshot,
          showDiff: true,
          error: null,
        });
      },

      completeTask: (taskId: string) => {
        const { plan } = get();
        if (!plan) return;

        const updatedTasks = completeTaskFn(plan.tasks, taskId);
        const withDeadlines = computeDeadlines(updatedTasks, plan.daysUntilEvent);

        set({
          plan: { ...plan, tasks: withDeadlines, lastUpdated: new Date().toISOString() },
        });
      },

      toggleBadge: (itemId: string) => {
        const { plan } = get();
        if (!plan) return;

        const newAllocations = plan.budgetAllocations.map((alloc) => ({
          ...alloc,
          items: alloc.items.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  badge:
                    item.badge === "AI_ASSUMPTION"
                      ? ("CONFIRMED_QUOTE" as const)
                      : ("AI_ASSUMPTION" as const),
                }
              : item
          ),
        }));

        set({
          plan: { ...plan, budgetAllocations: newAllocations },
        });
      },

      setApiKey: (key: string | null) => {
        set({ geminiApiKey: key });
        const { plan } = get();
        if (key && plan) {
          // Re-enrich with live Gemini ideas
          fetch("/api/orchestrate", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-gemini-key": key,
            },
            body: JSON.stringify({
              action: "plan",
              eventPlan: plan,
            }),
          })
            .then((res) => res.json())
            .then((data) => {
              if (data.success && data.eventPlan) {
                const current = get().plan;
                if (current) {
                  set({
                    plan: {
                      ...current,
                      personalizedIdeas: data.eventPlan.personalizedIdeas?.length
                        ? data.eventPlan.personalizedIdeas
                        : current.personalizedIdeas,
                      vibeDescription: data.eventPlan.vibeDescription ?? current.vibeDescription,
                      executionTier: "gemini",
                    },
                    executionTier: "gemini",
                  });
                }
              }
            })
            .catch(() => {});
        } else if (!key && plan) {
          set({ executionTier: "deterministic" });
        }
      },

      setActiveTab: (tab) => set({ activeTab: tab }),
      setShowIntakeModal: (show) => set({ showIntakeModal: show }),
      setShowByokModal: (show) => set({ showByokModal: show }),
      setShowValidationModal: (show) => set({ showValidationModal: show }),

      closeDiff: () => set({ showDiff: false, previousSnapshot: null }),

      resetPlan: () =>
        set({
          plan: null,
          activePreset: null,
          previousSnapshot: null,
          showDiff: false,
          error: null,
        }),

      exportPlanJSON: () => {
        const { plan } = get();
        return plan ? JSON.stringify(plan, null, 2) : "{}";
      },
    }),
    {
      name: "sutra-event-store",
      partialize: (state) => ({
        plan: state.plan,
        activePreset: state.activePreset,
        activeTab: state.activeTab,
        // NOTE: geminiApiKey is NOT persisted for security
      }),
    }
  )
);

