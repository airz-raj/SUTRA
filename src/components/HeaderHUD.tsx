"use client";

/**
 * SUTRA — Header HUD
 *
 * Top bar showing: Active persona, API mode badge, navigation tabs,
 * Validation HUD trigger, and BYOK modal trigger.
 */

import { useEventStore } from "@/store/useEventStore";
import {
  Sparkles,
  Cpu,
  Key,
  Eye,
  RotateCcw,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "budget" as const, label: "Budget" },
  { key: "timeline" as const, label: "Timeline" },
  { key: "vendor" as const, label: "Vendors" },
  { key: "ideas" as const, label: "Ideas" },
  { key: "validation" as const, label: "Validation" },
] as const;

export default function HeaderHUD() {
  const plan = useEventStore((s) => s.plan);
  const activePreset = useEventStore((s) => s.activePreset);
  const activeTab = useEventStore((s) => s.activeTab);
  const setActiveTab = useEventStore((s) => s.setActiveTab);
  const setShowByokModal = useEventStore((s) => s.setShowByokModal);
  const setShowValidationModal = useEventStore((s) => s.setShowValidationModal);
  const resetPlan = useEventStore((s) => s.resetPlan);
  const exportPlanJSON = useEventStore((s) => s.exportPlanJSON);

  const handleExport = () => {
    const json = exportPlanJSON();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sutra-plan-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <header
      className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/95 backdrop-blur-sm"
      role="banner"
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        {/* ── Logo & Preset ── */}
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold tracking-tight">
            <span className="text-amber-500">SUTRA</span>
            <span className="ml-1.5 text-zinc-500 text-sm font-normal">
              सूत्र
            </span>
          </h1>

          {activePreset && activePreset !== "custom" && (
            <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-500 border border-amber-500/20">
              {activePreset === "wedding"
                ? "90s Bollywood Shaadi"
                : activePreset === "birthday"
                ? "Golden Jubilee"
                : "Civic Hackathon"}
            </span>
          )}

          {/* Execution Tier Badge */}
          <span
            className={cn(
              "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-mono",
              plan?.executionTier === "gemini"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-zinc-800 text-zinc-400 border border-zinc-700"
            )}
            aria-label={`Execution mode: ${plan?.executionTier ?? "none"}`}
          >
            {plan?.executionTier === "gemini" ? (
              <Sparkles className="h-3 w-3" />
            ) : (
              <Cpu className="h-3 w-3" />
            )}
            {plan?.executionTier === "gemini"
              ? "AI POWERED"
              : "LOCAL ENGINE"}
          </span>
        </div>

        {/* ── Tabs (only when plan is active) ── */}
        {plan && (
          <nav
            className="hidden md:flex items-center gap-1"
            role="tablist"
            aria-label="Plan sections"
          >
            {TABS.map((tab) => (
              <button
                key={tab.key}
                role="tab"
                aria-selected={activeTab === tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                  activeTab === tab.key
                    ? "bg-amber-500/15 text-amber-400"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                )}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        )}

        {/* ── Actions ── */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowByokModal(true)}
            className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs text-zinc-400 hover:text-amber-400 hover:bg-zinc-800/50 transition-colors"
            aria-label="Enter API Key"
            title="Bring Your Own API Key"
          >
            <Key className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">API Key</span>
          </button>

          {plan && (
            <>
              <button
                onClick={() => setShowValidationModal(true)}
                className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800/50 transition-colors"
                aria-label="View Validation & Telemetry"
              >
                <Eye className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Telemetry</span>
              </button>

              <button
                onClick={handleExport}
                className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 transition-colors"
                aria-label="Export plan as JSON"
              >
                <Download className="h-3.5 w-3.5" />
              </button>

              <button
                onClick={resetPlan}
                className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs text-zinc-400 hover:text-rose-400 hover:bg-zinc-800/50 transition-colors"
                aria-label="Reset plan"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Mobile Tabs ── */}
      {plan && (
        <div className="md:hidden overflow-x-auto border-t border-zinc-800/50">
          <nav className="flex px-4 py-1 gap-1" role="tablist">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                role="tab"
                aria-selected={activeTab === tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "whitespace-nowrap px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                  activeTab === tab.key
                    ? "bg-amber-500/15 text-amber-400"
                    : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

