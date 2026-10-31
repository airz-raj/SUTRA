"use client";

/**
 * SUTRA (सूत्र) — Main Application HUD
 *
 * Dark Obsidian Luxury HUD for Google PromptWars Challenge 5:
 * - Stunning Hero & 3 One-Click Signature Preset Launchers
 * - Live Delta Mutation Command Bar (Cmd+K + 3 SME Stress Test buttons)
 * - 5 Full Workspaces:
 *     1. Budget Command Center & +20% Overrun Trade-Off Resolver
 *     2. DAG Timeline Board & Critical Path Method (CPM)
 *     3. Vendor Quote Arena & Hidden-Fee Interrogation
 *     4. Personalized Cultural Ideas Deck & Accessibility Profiles
 *     5. Prompt & Architecture Telemetry Inspector
 * - Global Modals: Custom Intake Wizard, BYOK Modal, Visual Diff Drawer
 */

import { useEffect } from "react";
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
  Heart,
  Cake,
  Users,
  ArrowRight,
  ShieldCheck,
  Plus,
  Compass,
  Calendar,
  Wallet,
  CheckCircle2,
  Zap,
} from "lucide-react";

export default function Home() {
  const plan = useEventStore((s) => s.plan);
  const activeTab = useEventStore((s) => s.activeTab);
  const loadPreset = useEventStore((s) => s.loadPreset);
  const setShowIntakeModal = useEventStore((s) => s.setShowIntakeModal);

  // Auto-load preset from URL query parameter (e.g. ?preset=wedding or ?key=...)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const presetParam = params.get("preset");
      if (
        presetParam &&
        (presetParam === "wedding" || presetParam === "birthday" || presetParam === "community")
      ) {
        loadPreset(presetParam);
      }
      const keyParam = params.get("key");
      if (keyParam) {
        useEventStore.getState().setApiKey(keyParam);
      }
    }
  }, [loadPreset]);

  return (
    <div className="min-h-screen bg-[#09090B] text-zinc-100 selection:bg-amber-500/20 selection:text-amber-300 font-sans antialiased">
      {/* ── Sticky Top Header HUD ── */}
      <HeaderHUD />

      {/* ── Persistent Mutation Bar (Visible when plan is active) ── */}
      {plan && <LiveMutationBar />}

      {/* ── Main Canvas ── */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {plan ? (
          /* ════════════ ACTIVE PLAN WORKSPACES ════════════ */
          <div className="space-y-6">
            {/* Top Event Title Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-4 backdrop-blur-md">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <h2 className="text-xl font-bold tracking-tight text-zinc-100 font-sans">
                    {plan.eventName}
                  </h2>
                  <span className="rounded-full bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 text-xs font-mono font-medium text-amber-400 capitalize">
                    {plan.eventType}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono text-zinc-400">
                  <span className="flex items-center gap-1">
                    <Wallet className="h-3.5 w-3.5 text-amber-400" />
                    ₹{plan.totalBudget.toLocaleString("en-IN")}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5 text-blue-400" />
                    {plan.guestCount} guests
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-emerald-400" />
                    {plan.daysUntilEvent} days remaining
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowIntakeModal(true)}
                  className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800/80 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:border-amber-500/50 hover:text-amber-400 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Switch Scenario / Custom</span>
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
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-emerald-400" />
                    <h3 className="text-base font-bold text-zinc-100">
                      Judge Validation & Tool Usage Telemetry
                    </h3>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Review tool usage enforcement, prompt evolution across 3 iterations, and the dual-tier deterministic fallback architecture.
                  </p>
                  <ValidationTelemetryModal />
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ════════════ HERO LANDING & SCENARIO LAUNCHER ════════════ */
          <div className="space-y-10 py-6">
            {/* Hero Header */}
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-mono text-amber-300 backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span>PromptWars Virtual by Google • Challenge 5</span>
              </div>

              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-50 font-sans">
                Deterministic DAG & <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">
                  GenAI Event Orchestration Harness
                </span>
              </h1>

              <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-2xl mx-auto">
                Move beyond static AI prompt wrappers. SUTRA treats event planning as a <strong>coupled constraint-satisfaction and dependency-graph problem</strong>: guest counts ripple into catering tariffs, budget overruns resolve via priority trade-offs, and critical-path DAGs auto-cascade delays.
              </p>

              <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs font-mono text-zinc-400">
                <span className="flex items-center gap-1.5 rounded-md bg-zinc-900/90 border border-zinc-800 px-3 py-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> 100% Zero-Config Vercel Ready
                </span>
                <span className="flex items-center gap-1.5 rounded-md bg-zinc-900/90 border border-zinc-800 px-3 py-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Offline Constraint Solver Fallback
                </span>
                <span className="flex items-center gap-1.5 rounded-md bg-zinc-900/90 border border-zinc-800 px-3 py-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> WCAG 2.1 AA Compliant
                </span>
              </div>
            </div>

            {/* 3 Signature Demo Preset Cards */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-400" />
                    Signature Demo Presets (One-Click Launch)
                  </h2>
                  <p className="text-xs text-zinc-500">
                    Instant full-featured event plans crafted to test coupled ripple effects, CPM schedules, and vendor quotes
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Preset 1: Wedding */}
                <div className="group relative flex flex-col justify-between rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900/90 to-zinc-950 p-6 shadow-xl transition-all duration-300 hover:border-amber-500/50 hover:shadow-2xl hover:shadow-amber-500/5">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                        <Heart className="h-5 w-5" />
                      </div>
                      <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 text-[11px] font-mono text-amber-400">
                        Wedding
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-zinc-100 group-hover:text-amber-400 transition-colors">
                        Purani Dilli & 90s Bollywood Shaadi
                      </h3>
                      <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                        Classic retro cinema aesthetic, vintage Bajaj Chetak scooter photo booth, Chandni Chowk street food live stations, open Jeep baraat entry, and Haryanvi dhol.
                      </p>
                    </div>

                    <div className="rounded-lg bg-zinc-950/80 border border-zinc-800/80 p-3 grid grid-cols-3 gap-2 text-center text-xs font-mono">
                      <div>
                        <span className="text-[10px] text-zinc-500 block">BUDGET</span>
                        <span className="font-semibold text-zinc-200">₹8,00,000</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 block">GUESTS</span>
                        <span className="font-semibold text-zinc-200">200 Pax</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 block">TIMELINE</span>
                        <span className="font-semibold text-zinc-200">120 Days</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-zinc-800/60">
                    <button
                      onClick={() => loadPreset("wedding")}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500 py-2.5 text-xs font-semibold text-zinc-950 shadow-md shadow-amber-500/10 hover:bg-amber-400 transition-all cursor-pointer"
                    >
                      <span>Load Shaadi Workspace</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Preset 2: 50th Birthday */}
                <div className="group relative flex flex-col justify-between rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900/90 to-zinc-950 p-6 shadow-xl transition-all duration-300 hover:border-rose-500/50 hover:shadow-2xl hover:shadow-rose-500/5">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                        <Cake className="h-5 w-5" />
                      </div>
                      <span className="rounded-full bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 text-[11px] font-mono text-rose-400">
                        Birthday
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-zinc-100 group-hover:text-rose-400 transition-colors">
                        Multi-Generational Golden Jubilee
                      </h3>
                      <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                        Kid-friendly activity zone + low-decibel senior lounge, wheelchair-accessible courtyard, nostalgic 50-year timeline photo wall, and diabetic-safe menu split.
                      </p>
                    </div>

                    <div className="rounded-lg bg-zinc-950/80 border border-zinc-800/80 p-3 grid grid-cols-3 gap-2 text-center text-xs font-mono">
                      <div>
                        <span className="text-[10px] text-zinc-500 block">BUDGET</span>
                        <span className="font-semibold text-zinc-200">₹1,50,000</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 block">GUESTS</span>
                        <span className="font-semibold text-zinc-200">80 Pax</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 block">TIMELINE</span>
                        <span className="font-semibold text-zinc-200">21 Days</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-zinc-800/60">
                    <button
                      onClick={() => loadPreset("birthday")}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-800 hover:bg-rose-600 hover:text-white py-2.5 text-xs font-semibold text-zinc-200 shadow-md transition-all cursor-pointer"
                    >
                      <span>Load Jubilee Workspace</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Preset 3: Hackathon */}
                <div className="group relative flex flex-col justify-between rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900/90 to-zinc-950 p-6 shadow-xl transition-all duration-300 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/5">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                        <Users className="h-5 w-5" />
                      </div>
                      <span className="rounded-full bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 text-[11px] font-mono text-blue-400">
                        Community
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-zinc-100 group-hover:text-blue-400 transition-colors">
                        Code for Communities Civic Hackathon
                      </h3>
                      <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                        Volunteer shift matrix, high-speed Wi-Fi & AV redundancy checklist, sponsor booth layout, zero-waste catering, and screen-reader compliance.
                      </p>
                    </div>

                    <div className="rounded-lg bg-zinc-950/80 border border-zinc-800/80 p-3 grid grid-cols-3 gap-2 text-center text-xs font-mono">
                      <div>
                        <span className="text-[10px] text-zinc-500 block">BUDGET</span>
                        <span className="font-semibold text-zinc-200">₹3,00,000</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 block">GUESTS</span>
                        <span className="font-semibold text-zinc-200">300 Pax</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 block">TIMELINE</span>
                        <span className="font-semibold text-zinc-200">45 Days</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-zinc-800/60">
                    <button
                      onClick={() => loadPreset("community")}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-800 hover:bg-blue-600 hover:text-white py-2.5 text-xs font-semibold text-zinc-200 shadow-md transition-all cursor-pointer"
                    >
                      <span>Load Hackathon Workspace</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Custom Builder Banner */}
            <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30 p-6 text-center space-y-3">
              <Compass className="h-7 w-7 text-amber-500 mx-auto" />
              <h3 className="text-sm font-bold text-zinc-200">
                Want to plan a custom wedding, corporate gala, or festival?
              </h3>
              <p className="text-xs text-zinc-500 max-w-lg mx-auto">
                Configure arbitrary budgets, guest counts, target dates, multi-generational demographic constraints, and priority weights.
              </p>
              <button
                onClick={() => setShowIntakeModal(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-5 py-2.5 text-xs font-semibold text-amber-400 hover:bg-amber-500/20 transition-colors cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Open Custom Event Wizard</span>
              </button>
            </div>
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
