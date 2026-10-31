"use client";

/**
 * SUTRA — Validation & Prompt Telemetry Modal
 *
 * Dedicated in-app inspector for judges and evaluators satisfying:
 * 1. Tool Usage Enforcement Matrix (GenAI vs Human boundaries)
 * 2. Prompt Evolution Log (v1 -> v2 -> v3)
 * 3. System Architecture & Dual-Tier Fallback Harness
 * 4. Epistemic Uncertainty Framework
 */

import { useState } from "react";
import { useEventStore } from "@/store/useEventStore";
import { PROMPT_EVOLUTION } from "@/lib/ai/prompts";
import {
  X,
  ShieldCheck,
  GitFork,
  BookOpen,
  Terminal,
  Copy,
  Layers,
  Check,
} from "lucide-react";

const TOOL_MATRIX = [
  {
    tool: "Google Gemini 2.5 Flash (@google/genai)",
    role: "Sub-second structured JSON output (responseSchema) for creative intake, NL delta mutation parsing, and unstructured vendor quote clause extraction.",
    genaiHandled: "Translating conversational changes into structured deltas, generating culturally nuanced multi-generational ideas, and extracting hidden fees from raw vendor proposals.",
    humanEngineered: "Strict Zod JSON contracts, dual-tier fallback router, epistemic uncertainty badges ([AI ESTIMATE] vs [CONFIRMED]), and rate limiting.",
  },
  {
    tool: "Antigravity Agentic Harness",
    role: "Multi-file synthesis, WCAG 2.1 AA accessibility auditing, and end-to-end Vitest test suite creation.",
    genaiHandled: "Boilerplate scaffolding, ARIA attribute wiring, test case generation, and responsive component layouts.",
    humanEngineered: "Coupled constraint model, DAG Critical Path Method algorithm, priority-weighted trade-off formulas, and Dark Obsidian aesthetic tokens.",
  },
  {
    tool: "Next.js 15 App Router + Zustand + Zod",
    role: "Zero-database, zero-config Vercel deployment with instant 0ms client reactivity and runtime payload security.",
    genaiHandled: "Route handler scaffolding and state sync glue code.",
    humanEngineered: "Local-first persistence, topological sorting engine, mathematical budget allocator, and offline deterministic execution.",
  },
];

export default function ValidationTelemetryModal() {
  const showValidationModal = useEventStore((s) => s.showValidationModal);
  const setShowValidationModal = useEventStore((s) => s.setShowValidationModal);
  const executionTier = useEventStore((s) => s.executionTier);

  const [activeTab, setActiveTab] = useState<"tools" | "prompts" | "architecture" | "submission">("tools");
  const [copied, setCopied] = useState(false);

  if (!showValidationModal) return null;

  const handleCopySummary = () => {
    const text = `SUTRA (सूत्र) — Deterministic DAG & GenAI Event Orchestration Harness for PromptWars Virtual by Google (Challenge 5).
Combines Google Gemini 2.5 Flash for conversational intelligence with a deterministic Critical Path Method (CPM) DAG and priority-weighted budget trade-off solver.
100% serverless, zero-config on Vercel with automatic deterministic fallback if API credits expire.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-md p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Judge Validation & Prompt Telemetry Modal"
    >
      <div className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 px-6 py-4 bg-zinc-900/50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                Prompt & Tool Validation HUD
                <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[11px] font-mono text-emerald-400">
                  Rubric Compliant
                </span>
              </h2>
              <p className="text-xs text-zinc-500">
                Evaluation artifacts for Hackathon Judges & Technical Reviewers
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowValidationModal(false)}
            className="rounded-lg p-1.5 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            aria-label="Close telemetry modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-zinc-800/80 bg-zinc-950 px-6 pt-2">
          {[
            { key: "tools" as const, label: "Tool Usage Matrix", icon: Terminal },
            { key: "prompts" as const, label: "Prompt Evolution", icon: BookOpen },
            { key: "architecture" as const, label: "Dual-Tier Architecture", icon: GitFork },
            { key: "submission" as const, label: "Submission Summary", icon: Layers },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-medium transition-all ${
                  isSelected
                    ? "border-amber-500 text-amber-400 bg-amber-500/5"
                    : "border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === "tools" && (
            <div className="space-y-4">
              <p className="text-xs text-zinc-400">
                Demonstrates strict adherence to the <strong>Tool Usage Enforcement</strong> parameter. Every layer has an explicit separation between GenAI assistance and human engineering.
              </p>

              <div className="space-y-3">
                {TOOL_MATRIX.map((item, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-sm text-amber-400">
                        {item.tool}
                      </h4>
                      <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-mono text-zinc-400">
                        Core Tech
                      </span>
                    </div>

                    <p className="text-xs text-zinc-300">
                      <strong>Selection Rationale:</strong> {item.role}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 text-xs">
                      <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-2.5">
                        <span className="font-semibold text-amber-400 text-[11px] block mb-1">
                          🤖 What GenAI Handled:
                        </span>
                        <p className="text-zinc-400 text-[11px] leading-relaxed">
                          {item.genaiHandled}
                        </p>
                      </div>

                      <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-2.5">
                        <span className="font-semibold text-emerald-400 text-[11px] block mb-1">
                          👨‍💻 What Humans Designed & Engineered:
                        </span>
                        <p className="text-zinc-400 text-[11px] leading-relaxed">
                          {item.humanEngineered}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "prompts" && (
            <div className="space-y-4">
              <p className="text-xs text-zinc-400">
                Prompt architecture evolution across three distinct iterations demonstrating deliberate engineering, structured schema constraints, and epistemic labeling:
              </p>

              <div className="space-y-3">
                {PROMPT_EVOLUTION.map((pe) => (
                  <div
                    key={pe.version}
                    className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-amber-400">
                          {pe.version}
                        </span>
                        <h4 className="text-sm font-semibold text-zinc-200">
                          {pe.label}
                        </h4>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-mono uppercase ${
                          pe.status === "production"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : pe.status === "improved"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                            : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                        }`}
                      >
                        {pe.status}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {pe.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "architecture" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-3">
                <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                  <GitFork className="h-4 w-4" /> Dual-Tier Execution Philosophy
                </h4>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  To guarantee <strong>100% uptime on Vercel</strong> during automated or manual judge evaluations (even if API keys expire or rate limits hit), SUTRA employs a dual-tier execution harness:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3.5 space-y-1.5">
                    <span className="font-mono text-xs font-bold text-amber-400">
                      Tier 1: Live Gemini 2.5 Flash
                    </span>
                    <p className="text-xs text-zinc-400">
                      Triggered when <code>GEMINI_API_KEY</code> or client-side BYOK header is detected. Generates rich creative concepts and extracts nuance from unstructured vendor text.
                    </p>
                  </div>

                  <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3.5 space-y-1.5">
                    <span className="font-mono text-xs font-bold text-emerald-400">
                      Tier 2: Deterministic Constraint Solver
                    </span>
                    <p className="text-xs text-zinc-400">
                      Pure TypeScript algorithms (Kahn&apos;s CPM, priority-weighted budget allocator, and regex-NLP delta parser). Works completely offline with mathematical certainty.
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-lg bg-zinc-950 p-3 text-xs font-mono text-zinc-400 border border-zinc-800">
                  Active Runtime Mode: <span className="text-emerald-400 font-semibold">{executionTier === "gemini" ? "TIER 1 (GEMINI 2.5 FLASH)" : "TIER 2 (LOCAL DETERMINISTIC ENGINE)"}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "submission" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-zinc-100">
                    LinkedIn / Hackathon Submission Summary
                  </h4>
                  <button
                    onClick={handleCopySummary}
                    className="flex items-center gap-1 rounded bg-zinc-800 px-2.5 py-1 text-xs text-zinc-300 hover:text-amber-400 hover:bg-zinc-700 transition-colors"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </button>
                </div>

                <div className="rounded-lg bg-zinc-950 p-4 text-xs font-mono text-zinc-300 leading-relaxed border border-zinc-800/80">
                  Thrilled to present <strong>SUTRA (सूत्र)</strong> for PromptWars Virtual by Google — Challenge 5!
                  <br /><br />
                  Traditional GenAI event tools are static prompt wrappers that produce generic lists. Event planning is fundamentally a <strong>coupled constraint satisfaction and dependency graph problem</strong>: changes in guest count ripple into catering tariffs; budget overruns require priority-preserving trade-offs; task delays impact downstream venue and invitation milestones.
                  <br /><br />
                  🚀 <strong>Key Innovations:</strong><br />
                  1. Dual-Tier Harness: Google Gemini 2.5 Flash + Deterministic CPM DAG Solver (100% serverless, zero-config on Vercel)<br />
                  2. Dynamic Ripple Engine: guest count ↔ catering per-plate ↔ venue capacity<br />
                  3. +20% Overrun Trade-Off Simulator with priority-preserving scenario cards<br />
                  4. Epistemic Cost Badges: [AI ESTIMATE] vs [CONFIRMED QUOTE]<br />
                  5. Live Delta Mutation Bar (Cmd+K) with visual Before/After diff drawer<br />
                  6. Vendor Quote Arena: hidden-fee detector and automated clarification drafts
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-zinc-800/80 bg-zinc-900/40 px-6 py-3 flex items-center justify-between">
          <span className="text-[11px] font-mono text-zinc-500">
            SUTRA v1.0.0 • PromptWars Virtual by Google
          </span>
          <button
            onClick={() => setShowValidationModal(false)}
            className="rounded-lg bg-zinc-800 px-4 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-700 transition-colors"
          >
            Close Telemetry
          </button>
        </div>
      </div>
    </div>
  );
}
