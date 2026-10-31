"use client";

/**
 * SUTRA — Live Delta Mutation Bar (The SME Golden Test)
 *
 * Persistent command bar (`Cmd+K` or input) allowing mid-flight mutations:
 * - Natural language input ("+50 guests, reduce budget by ₹50,000, 2 weeks earlier")
 * - 3 one-click SME Stress-Test buttons
 * - Quick-delta chips (+25 guests, -₹25k, +10 days)
 * - Atomic state transitions with Visual Diff Log trigger
 */

import { useState, useEffect, useRef } from "react";
import { useEventStore } from "@/store/useEventStore";
import {
  Command,
  ArrowRight,
  Zap,
  Flame,
  Clock,
} from "lucide-react";

export default function LiveMutationBar() {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const plan = useEventStore((s) => s.plan);
  const applyNLMutation = useEventStore((s) => s.applyNLMutation);
  const applyStressTest = useEventStore((s) => s.applyStressTest);
  const simulateOverrun = useEventStore((s) => s.simulateOverrun);
  const simulateDelay = useEventStore((s) => s.simulateDelay);
  const isProcessing = useEventStore((s) => s.isProcessing);

  // Focus input with Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;
    applyNLMutation(input.trim());
    setInput("");
  };

  const handleChipClick = (mutationText: string) => {
    applyNLMutation(mutationText);
  };

  if (!plan) return null;

  return (
    <div
      className="sticky top-14 z-40 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md px-4 py-3 shadow-lg"
      role="search"
      aria-label="Live Delta Mutation Bar"
    >
      <div className="mx-auto max-w-7xl space-y-2.5">
        {/* ── Main Input Bar ── */}
        <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-amber-500/80">
              <Zap className="h-4 w-4" />
            </div>

            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='Enter mutation in natural language... e.g. "Add 50 guests, -₹50,000 budget, 2 weeks earlier"'
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900/90 py-2.5 pl-10 pr-20 text-sm text-zinc-100 placeholder-zinc-500 shadow-inner transition-all focus:border-amber-500/60 focus:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-amber-500/40"
              aria-label="Natural language plan mutation input"
            />

            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-zinc-700 bg-zinc-800/80 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">
                <Command className="h-2.5 w-2.5" /> K
              </kbd>
            </div>
          </div>

          <button
            type="submit"
            disabled={!input.trim() || isProcessing}
            className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2.5 text-xs font-semibold text-zinc-950 shadow-md transition-all hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Execute mutation"
          >
            <span>Mutate</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </form>

        {/* ── 3 One-Click SME Stress-Test Buttons & Quick Chips ── */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          {/* 3 SME Golden Test Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-mono text-[11px] font-semibold text-amber-500/90 uppercase tracking-wider mr-1">
              SME Stress Tests:
            </span>

            {/* Test 1: +50 guests, -50k budget, -2 weeks */}
            <button
              onClick={() => applyStressTest(0)}
              className="flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 font-mono text-[11px] text-amber-300 hover:bg-amber-500/20 hover:border-amber-500/50 transition-colors"
              title="Apply: +50 Guests, -₹50k Budget, 2 Weeks Earlier"
            >
              <Zap className="h-3 w-3 text-amber-400" />
              <span>+50 Guests, -₹50k, -2 Wks</span>
            </button>

            {/* Test 2: +20% Cost Overrun */}
            <button
              onClick={() => simulateOverrun()}
              className="flex items-center gap-1 rounded-md border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 font-mono text-[11px] text-rose-300 hover:bg-rose-500/20 hover:border-rose-500/50 transition-colors"
              title="Simulate +20% Cost Overrun Scenario"
            >
              <Flame className="h-3 w-3 text-rose-400" />
              <span>+20% Overrun</span>
            </button>

            {/* Test 3: Delay Venue Booking */}
            <button
              onClick={() => {
                const venueTask = plan.tasks.find((t) => t.category === "venue");
                if (venueTask) {
                  simulateDelay(venueTask.id, 14);
                } else if (plan.tasks.length > 0) {
                  simulateDelay(plan.tasks[0].id, 14);
                }
              }}
              className="flex items-center gap-1 rounded-md border border-orange-500/30 bg-orange-500/10 px-2.5 py-1 font-mono text-[11px] text-orange-300 hover:bg-orange-500/20 hover:border-orange-500/50 transition-colors"
              title="Delay Critical Venue Booking by 14 Days"
            >
              <Clock className="h-3 w-3 text-orange-400" />
              <span>Delay Venue +14d</span>
            </button>
          </div>

          {/* Quick delta chips */}
          <div className="hidden lg:flex items-center gap-1.5 text-zinc-500 text-[11px]">
            <span>Quick deltas:</span>
            <button
              onClick={() => handleChipClick("+25 guests")}
              className="rounded px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
            >
              +25 guests
            </button>
            <button
              onClick={() => handleChipClick("-20 guests")}
              className="rounded px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
            >
              -20 guests
            </button>
            <button
              onClick={() => handleChipClick("+₹1,00,000 budget")}
              className="rounded px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
            >
              +₹1L budget
            </button>
            <button
              onClick={() => handleChipClick("10 days earlier")}
              className="rounded px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
            >
              -10 days
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
