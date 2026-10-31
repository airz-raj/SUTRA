"use client";

/**
 * SUTRA (सूत्र) — Main Application HUD
 *
 * Unified single-screen HUD with Dark Obsidian aesthetic:
 * - Header HUD (Persona, Status, Actions)
 * - Live Delta Mutation Bar (Cmd+K + 3 SME Stress Test buttons)
 * - Tabbed Workspaces:
 *     1. Budget Command Center & Trade-Off Simulator
 *     2. DAG Dependency Timeline & Critical Path Engine
 *     3. Vendor Quote Arena & Interrogation Checklist
 *     4. Personalized Cultural Ideas Deck
 *     5. Prompt & Architecture Telemetry Inspector
 * - Discovery Intake Wizard & BYOK Modal
 * - Atomic Visual Diff Drawer
 */

import { useEventStore } from "@/store/useEventStore";
import HeaderHUD from "@/components/HeaderHUD";
import LiveMutationBar from "@/components/LiveMutationBar";
import BudgetCommandCenter from "@/components/BudgetCommandCenter";
import DagTimelineBoard from "@/components/DagTimelineBoard";
import VendorQuoteArena from "@/components/VendorQuoteArena";
import PersonalizedIdeasDeck from "@/components/PersonalizedIdeasDeck";
import DiscoveryIntakeModal from "@/components/DiscoveryIntakeModal";
import ByokModal from "@/components/ByokModal";
import ValidationTelemetryModal from "@/components/ValidationTelemetryModal";
import DiffDrawer from "@/components/DiffDrawer";
import {
  Sparkles,
  ShieldCheck,
  PlusCircle,
} from "lucide-react";

export default function Home() {
  const plan = useEventStore((s) => s.plan);
  const activeTab = useEventStore((s) => s.activeTab);
  const setShowIntakeModal = useEventStore((s) => s.setShowIntakeModal);

  return (
    <div className="min-h-screen bg-obsidian text-text-primary selection:bg-amber-500/20 selection:text-amber-200">
      {/* ── Fixed / Sticky Navigation ── */}
      <HeaderHUD />
      <LiveMutationBar />

      {/* ── Main Content Area ── */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {plan ? (
          <div className="space-y-6">
            {/* Desktop Tabs Header (for fast navigation) */}
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-zinc-100 font-sans">
                  {plan.eventName}
                </h2>
                <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs font-mono text-zinc-400 capitalize">
                  {plan.eventType}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowIntakeModal(true)}
                  className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:border-amber-500/40 hover:text-amber-400 transition-colors"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span>Switch Scenario / New Event</span>
                </button>
              </div>
            </div>

            {/* Active Workspace View */}
            <div className="animate-fade-in" key={activeTab}>
              {activeTab === "budget" && <BudgetCommandCenter />}
              {activeTab === "timeline" && <DagTimelineBoard />}
              {activeTab === "vendor" && <VendorQuoteArena />}
              {activeTab === "ideas" && <PersonalizedIdeasDeck />}
              {activeTab === "validation" && (
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <ShieldCheck className="h-5 w-5 text-emerald-400" />
                    <h3 className="text-base font-bold text-zinc-100">
                      Judge Validation & Tool Usage Telemetry
                    </h3>
                  </div>
                  <p className="text-xs text-zinc-400 mb-6">
                    Review tool usage enforcement, prompt evolution across 3 iterations, and the dual-tier deterministic fallback architecture.
                  </p>
                  <ValidationTelemetryModal />
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Empty Landing State if Modal is Closed */
          <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 mb-5 animate-pulse-brass">
              <Sparkles className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-100">
              Welcome to <span className="text-amber-500">SUTRA</span> (सूत्र)
            </h2>
            <p className="mt-2 max-w-md text-sm text-zinc-400">
              Deterministic DAG & GenAI Event Orchestration Harness for weddings, birthdays, and community events.
            </p>
            <button
              onClick={() => setShowIntakeModal(true)}
              className="mt-6 rounded-xl bg-amber-500 px-6 py-3 text-sm font-semibold text-zinc-950 shadow-lg shadow-amber-500/10 hover:bg-amber-400 transition-all"
            >
              Get Started / Load Preset
            </button>
          </div>
        )}
      </main>

      {/* ── Global Modals & Overlays ── */}
      <DiscoveryIntakeModal />
      <ByokModal />
      <ValidationTelemetryModal />
      <DiffDrawer />
    </div>
  );
}
