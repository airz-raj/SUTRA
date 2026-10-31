"use client";

/**
 * SUTRA — Visual Diff Drawer (Before vs. After)
 *
 * Shows atomic state transitions whenever a mutation or stress test is applied:
 * - Budget adjustments per category
 * - Guest count & per-capita plate changes
 * - Timeline milestone compression & critical path shifts
 * - WCAG 2.1 AA aria-live="polite" announcement
 */

import { useEventStore } from "@/store/useEventStore";
import { formatCurrency } from "@/lib/utils";
import {
  X,
  ArrowRight,
  GitCompare,
  Calendar,
  Users,
  Wallet,
} from "lucide-react";

export default function DiffDrawer() {
  const plan = useEventStore((s) => s.plan);
  const previousSnapshot = useEventStore((s) => s.previousSnapshot);
  const showDiff = useEventStore((s) => s.showDiff);
  const closeDiff = useEventStore((s) => s.closeDiff);

  if (!showDiff || !plan || !previousSnapshot) return null;

  const currency = plan.currency;

  // Compute key deltas
  const budgetDelta = plan.totalBudget - previousSnapshot.totalBudget;
  const guestDelta = plan.guestCount - previousSnapshot.guestCount;
  const daysDelta = plan.daysUntilEvent - previousSnapshot.daysUntilEvent;

  // Find category shifts
  const categoryDeltas = plan.budgetAllocations.map((alloc) => {
    const prevAlloc = previousSnapshot.budgetAllocations.find(
      (p) => p.category === alloc.category
    );
    const prevAmount = prevAlloc?.allocated ?? 0;
    const diff = alloc.allocated - prevAmount;
    return {
      category: alloc.category,
      prevAmount,
      newAmount: alloc.allocated,
      diff,
    };
  });

  return (
    <aside
      className="fixed bottom-0 right-0 z-50 w-full sm:max-w-md border-t sm:border-l border-zinc-800 bg-zinc-950/95 p-5 shadow-2xl backdrop-blur-xl animate-slide-in"
      aria-label="Mutation Visual Diff Log"
      aria-live="polite"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500">
            <GitCompare className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-100">
              Atomic State Transition Diff
            </h3>
            <p className="text-[11px] text-zinc-500">
              Live delta applied without wiping user progress
            </p>
          </div>
        </div>
        <button
          onClick={closeDiff}
          className="rounded-md p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
          aria-label="Dismiss diff panel"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Main Metric Deltas */}
      <div className="mt-3.5 grid grid-cols-3 gap-2 text-center">
        {/* Budget */}
        <div className="rounded-lg border border-zinc-800/80 bg-zinc-900/60 p-2.5">
          <div className="flex items-center justify-center gap-1 text-[11px] text-zinc-400">
            <Wallet className="h-3 w-3" /> Budget
          </div>
          <div className="mt-1 font-mono text-xs font-semibold text-zinc-200">
            {formatCurrency(plan.totalBudget, currency)}
          </div>
          {budgetDelta !== 0 && (
            <div
              className={`mt-0.5 font-mono text-[10px] font-bold ${
                budgetDelta > 0 ? "text-rose-400" : "text-emerald-400"
              }`}
            >
              {budgetDelta > 0 ? `+${formatCurrency(budgetDelta, currency)}` : formatCurrency(budgetDelta, currency)}
            </div>
          )}
        </div>

        {/* Guests */}
        <div className="rounded-lg border border-zinc-800/80 bg-zinc-900/60 p-2.5">
          <div className="flex items-center justify-center gap-1 text-[11px] text-zinc-400">
            <Users className="h-3 w-3" /> Guests
          </div>
          <div className="mt-1 font-mono text-xs font-semibold text-zinc-200">
            {plan.guestCount}
          </div>
          {guestDelta !== 0 && (
            <div
              className={`mt-0.5 font-mono text-[10px] font-bold ${
                guestDelta > 0 ? "text-amber-400" : "text-emerald-400"
              }`}
            >
              {guestDelta > 0 ? `+${guestDelta}` : guestDelta}
            </div>
          )}
        </div>

        {/* Days */}
        <div className="rounded-lg border border-zinc-800/80 bg-zinc-900/60 p-2.5">
          <div className="flex items-center justify-center gap-1 text-[11px] text-zinc-400">
            <Calendar className="h-3 w-3" /> Timeline
          </div>
          <div className="mt-1 font-mono text-xs font-semibold text-zinc-200">
            {plan.daysUntilEvent}d
          </div>
          {daysDelta !== 0 && (
            <div
              className={`mt-0.5 font-mono text-[10px] font-bold ${
                daysDelta < 0 ? "text-rose-400" : "text-emerald-400"
              }`}
            >
              {daysDelta > 0 ? `+${daysDelta}d` : `${daysDelta}d`}
            </div>
          )}
        </div>
      </div>

      {/* Category Reallocations */}
      <div className="mt-3.5 space-y-2">
        <h4 className="text-[11px] font-mono font-semibold uppercase text-zinc-400 tracking-wider">
          Category Reallocations:
        </h4>
        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
          {categoryDeltas.map((cat) => (
            <div
              key={cat.category}
              className="flex items-center justify-between rounded border border-zinc-800/60 bg-zinc-900/40 px-2.5 py-1.5 text-xs"
            >
              <span className="capitalize font-medium text-zinc-300">
                {cat.category}
              </span>
              <div className="flex items-center gap-2 font-mono text-[11px]">
                <span className="text-zinc-500">
                  {formatCurrency(cat.prevAmount, currency)}
                </span>
                <ArrowRight className="h-3 w-3 text-zinc-600" />
                <span className="text-zinc-200 font-semibold">
                  {formatCurrency(cat.newAmount, currency)}
                </span>
                {cat.diff !== 0 && (
                  <span
                    className={`text-[10px] ${
                      cat.diff > 0 ? "text-amber-400" : "text-emerald-400"
                    }`}
                  >
                    ({cat.diff > 0 ? "+" : ""}{formatCurrency(cat.diff, currency)})
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer acknowledgment button */}
      <div className="mt-4 pt-3 border-t border-zinc-800/60">
        <button
          onClick={closeDiff}
          className="w-full rounded-lg bg-zinc-800 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-700 transition-colors"
        >
          Acknowledge & Close
        </button>
      </div>
    </aside>
  );
}
