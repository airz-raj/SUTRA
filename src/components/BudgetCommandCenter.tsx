"use client";

import { useMemo } from "react";
import { useEventStore } from "@/store/useEventStore";
import { cn, formatCurrency, formatCompact } from "@/lib/utils";
import type { BudgetAllocation, BudgetLineItem, TradeOffScenario, BudgetCategory } from "@/types/event";
import {
  AlertTriangle,
  BadgeCheck,
  BrainCircuit,
  ChevronRight,
  DollarSign,
  Flame,
  Gauge,
  PieChart,
  Scissors,
  ShieldAlert,
  Sparkles,
  TrendingDown,
  Wallet,
} from "lucide-react";

// ────────────────────────────────────────────────────────────
// Constants
// ────────────────────────────────────────────────────────────

const CATEGORY_META: Record<BudgetCategory, { label: string; color: string; barColor: string }> = {
  venue: { label: "Venue", color: "text-violet-400", barColor: "bg-violet-500" },
  catering: { label: "Catering", color: "text-orange-400", barColor: "bg-orange-500" },
  decor: { label: "Décor", color: "text-pink-400", barColor: "bg-pink-500" },
  photography: { label: "Photography", color: "text-cyan-400", barColor: "bg-cyan-500" },
  logistics: { label: "Logistics", color: "text-lime-400", barColor: "bg-lime-500" },
};

// ────────────────────────────────────────────────────────────
// Sub-components
// ────────────────────────────────────────────────────────────

function EpistemicBadge({
  item,
  onToggle,
}: {
  item: BudgetLineItem;
  onToggle: (id: string) => void;
}) {
  const isConfirmed = item.badge === "CONFIRMED_QUOTE";

  return (
    <button
      type="button"
      onClick={() => onToggle(item.id)}
      aria-label={
        isConfirmed
          ? `${item.label} is confirmed. Click to mark as AI estimate.`
          : `${item.label} is an AI estimate. Click to mark as confirmed.`
      }
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950",
        isConfirmed
          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25"
          : "bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25 animate-pulse"
      )}
    >
      {isConfirmed ? (
        <>
          <BadgeCheck className="h-3 w-3" />
          Confirmed
        </>
      ) : (
        <>
          <BrainCircuit className="h-3 w-3" />
          AI Estimate
        </>
      )}
    </button>
  );
}

function PriorityBar({ weight }: { weight: number }) {
  return (
    <div className="flex items-center gap-1.5" aria-label={`Priority weight ${weight} out of 10`}>
      <Gauge className="h-3.5 w-3.5 text-zinc-500" />
      <div className="flex gap-0.5">
        {Array.from({ length: 10 }, (_, i) => (
          <div
            key={i}
            className={cn(
              "h-2 w-1.5 rounded-sm transition-colors",
              i < weight ? "bg-amber-500" : "bg-zinc-800"
            )}
          />
        ))}
      </div>
      <span className="text-[10px] font-mono text-zinc-500">{weight}/10</span>
    </div>
  );
}

function StackedBar({ allocations, totalBudget }: { allocations: BudgetAllocation[]; totalBudget: number }) {
  return (
    <div className="space-y-2">
      <div
        className="flex h-6 w-full overflow-hidden rounded-full bg-zinc-900 border border-zinc-800/80"
        role="img"
        aria-label="Budget allocation breakdown bar chart"
      >
        {allocations.map((alloc) => {
          const pct = totalBudget > 0 ? (alloc.allocated / totalBudget) * 100 : 0;
          if (pct < 0.5) return null;
          const meta = CATEGORY_META[alloc.category];
          return (
            <div
              key={alloc.category}
              className={cn(meta.barColor, "relative transition-all duration-500 group")}
              style={{ width: `${pct}%` }}
              title={`${meta.label}: ${pct.toFixed(1)}%`}
            >
              {pct > 8 && (
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-bold text-white/90 drop-shadow-sm">
                  {pct.toFixed(0)}%
                </span>
              )}
            </div>
          );
        })}
      </div>
      {/* Legend */}
      <div className="flex flex-wrap gap-3" role="list" aria-label="Budget category legend">
        {allocations.map((alloc) => {
          const meta = CATEGORY_META[alloc.category];
          const pct = totalBudget > 0 ? (alloc.allocated / totalBudget) * 100 : 0;
          return (
            <div key={alloc.category} className="flex items-center gap-1.5 text-xs text-zinc-400" role="listitem">
              <span className={cn("h-2.5 w-2.5 rounded-sm", meta.barColor)} />
              <span>{meta.label}</span>
              <span className="font-mono text-zinc-500">{pct.toFixed(1)}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TradeOffCard({ scenario, currency }: { scenario: TradeOffScenario; currency: "INR" | "USD" }) {
  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-xl border border-rose-500/20 bg-rose-950/10 p-5",
        "hover:border-rose-500/40 hover:bg-rose-950/20 transition-all duration-300"
      )}
      aria-label={`Trade-off scenario: ${scenario.title}`}
    >
      {/* Decorative gradient */}
      <div className="absolute -top-16 -right-16 h-32 w-32 rounded-full bg-rose-500/5 blur-3xl group-hover:bg-rose-500/10 transition-all" />

      <div className="relative space-y-3">
        <div className="flex items-start justify-between gap-3">
          <h4 className="text-sm font-semibold text-rose-300 leading-tight">
            <Scissors className="inline h-3.5 w-3.5 mr-1.5 text-rose-400" />
            {scenario.title}
          </h4>
          <span className="shrink-0 rounded-lg bg-emerald-500/15 px-2.5 py-1 text-xs font-mono font-bold text-emerald-400 border border-emerald-500/20">
            <TrendingDown className="inline h-3 w-3 mr-1" />
            {formatCurrency(scenario.savings, currency)}
          </span>
        </div>
        <p className="text-xs text-zinc-400 leading-relaxed">{scenario.description}</p>

        <div className="flex flex-wrap gap-2 pt-1">
          {scenario.preserves.map((cat) => (
            <span
              key={cat}
              className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400"
            >
              <BadgeCheck className="h-2.5 w-2.5" />
              Keeps {CATEGORY_META[cat]?.label ?? cat}
            </span>
          ))}
          {scenario.compresses.map((cat) => (
            <span
              key={cat}
              className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-400"
            >
              <AlertTriangle className="h-2.5 w-2.5" />
              Reduces {CATEGORY_META[cat]?.label ?? cat}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

function CategorySection({
  alloc,
  currency,
  totalBudget,
  onToggleBadge,
}: {
  alloc: BudgetAllocation;
  currency: "INR" | "USD";
  totalBudget: number;
  onToggleBadge: (id: string) => void;
}) {
  const meta = CATEGORY_META[alloc.category];
  const pct = totalBudget > 0 ? (alloc.allocated / totalBudget) * 100 : 0;
  const utilized = alloc.spent > 0 ? ((alloc.spent / alloc.allocated) * 100).toFixed(0) : "0";

  return (
    <section
      className="rounded-xl border border-zinc-800/80 bg-zinc-900/90 overflow-hidden"
      aria-label={`${meta.label} budget category`}
    >
      {/* Category Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/60 px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className={cn("h-3 w-3 rounded-full", meta.barColor)} />
          <h3 className={cn("text-sm font-semibold", meta.color)}>
            {meta.label}
          </h3>
          <span className="rounded-md bg-zinc-800/80 px-2 py-0.5 text-[11px] font-mono text-zinc-400">
            {pct.toFixed(1)}%
          </span>
        </div>
        <div className="flex items-center gap-4">
          <PriorityBar weight={alloc.priorityWeight} />
          <span className="text-sm font-mono font-semibold text-zinc-200">
            {formatCurrency(alloc.allocated, currency)}
          </span>
        </div>
      </div>

      {/* Utilization bar */}
      {alloc.spent > 0 && (
        <div className="mx-5 mt-3">
          <div className="flex justify-between text-[10px] text-zinc-500 mb-1">
            <span>Spent: {formatCurrency(alloc.spent, currency)}</span>
            <span>{utilized}% utilized</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-zinc-800">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                Number(utilized) > 90 ? "bg-rose-500" : Number(utilized) > 70 ? "bg-amber-500" : "bg-emerald-500"
              )}
              style={{ width: `${Math.min(Number(utilized), 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Line Items */}
      <div className="divide-y divide-zinc-800/40">
        {alloc.items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-4 px-5 py-3 hover:bg-zinc-800/20 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-zinc-200 truncate">{item.label}</span>
                <EpistemicBadge item={item} onToggle={onToggleBadge} />
              </div>
              {item.notes && (
                <p className="mt-0.5 text-[11px] text-zinc-500 truncate">{item.notes}</p>
              )}
              {item.perCapita && item.unitCost != null && (
                <p className="mt-0.5 text-[10px] text-zinc-600 font-mono">
                  Per guest: {formatCurrency(item.unitCost, currency)}
                </p>
              )}
            </div>
            <div className="text-right shrink-0">
              <div className="text-sm font-mono font-semibold text-zinc-100">
                {formatCurrency(item.amount, currency)}
              </div>
              <div className="text-[10px] font-mono text-zinc-500">
                {totalBudget > 0 ? ((item.amount / totalBudget) * 100).toFixed(1) : "0"}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────
// Main Component
// ────────────────────────────────────────────────────────────

export default function BudgetCommandCenter() {
  const plan = useEventStore((s) => s.plan);
  const simulateOverrun = useEventStore((s) => s.simulateOverrun);
  const toggleBadge = useEventStore((s) => s.toggleBadge);

  const stats = useMemo(() => {
    if (!plan) return null;
    const totalAllocated = plan.budgetAllocations.reduce((s, a) => s + a.allocated, 0);
    const totalSpent = plan.budgetAllocations.reduce((s, a) => s + a.spent, 0);
    const totalItems = plan.budgetAllocations.reduce((s, a) => s + a.items.length, 0);
    const confirmedItems = plan.budgetAllocations.reduce(
      (s, a) => s + a.items.filter((i) => i.badge === "CONFIRMED_QUOTE").length,
      0
    );
    const overBudget = totalAllocated > plan.totalBudget;
    const variance = totalAllocated - plan.totalBudget;
    return { totalAllocated, totalSpent, totalItems, confirmedItems, overBudget, variance };
  }, [plan]);

  if (!plan || !stats) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-zinc-800/80 bg-zinc-900/90">
        <div className="text-center space-y-2">
          <Wallet className="h-8 w-8 text-zinc-600 mx-auto" />
          <p className="text-sm text-zinc-500">No budget plan loaded.</p>
          <p className="text-xs text-zinc-600">Select a preset or create a custom event to begin.</p>
        </div>
      </div>
    );
  }

  const currency = plan.currency;

  return (
    <div className="space-y-6" role="region" aria-label="Budget Command Center">
      {/* ── Header ── */}
      <header className="space-y-1">
        <div className="flex items-center gap-2">
          <PieChart className="h-5 w-5 text-amber-500" />
          <h2 className="text-lg font-bold text-zinc-100 tracking-tight">
            Budget Command Center
          </h2>
        </div>
        <p className="text-xs text-zinc-500">
          Real-time budget orchestration with epistemic cost tracking
        </p>
      </header>

      {/* ── Summary Stats ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          {
            label: "Total Budget",
            value: formatCompact(plan.totalBudget),
            icon: <Wallet className="h-4 w-4 text-amber-500" />,
            accent: "text-amber-400",
          },
          {
            label: "Allocated",
            value: formatCompact(stats.totalAllocated),
            icon: <DollarSign className="h-4 w-4 text-violet-400" />,
            accent: stats.overBudget ? "text-rose-400" : "text-violet-400",
          },
          {
            label: "Confirmed",
            value: `${stats.confirmedItems}/${stats.totalItems}`,
            icon: <BadgeCheck className="h-4 w-4 text-emerald-400" />,
            accent: "text-emerald-400",
          },
          {
            label: "Variance",
            value: `${stats.overBudget ? "+" : ""}${formatCompact(Math.abs(stats.variance))}`,
            icon: stats.overBudget ? (
              <ShieldAlert className="h-4 w-4 text-rose-400" />
            ) : (
              <Sparkles className="h-4 w-4 text-emerald-400" />
            ),
            accent: stats.overBudget ? "text-rose-400" : "text-emerald-400",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-zinc-800/80 bg-zinc-900/90 p-4 space-y-1.5"
          >
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              {stat.icon}
              {stat.label}
            </div>
            <div className={cn("text-xl font-mono font-bold", stat.accent)}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* ── Stacked Bar Chart ── */}
      <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/90 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
          <ChevronRight className="h-4 w-4 text-amber-500" />
          Allocation Breakdown
        </h3>
        <StackedBar allocations={plan.budgetAllocations} totalBudget={plan.totalBudget} />
      </div>

      {/* ── Category Sections ── */}
      <div className="space-y-4">
        {plan.budgetAllocations.map((alloc) => (
          <CategorySection
            key={alloc.category}
            alloc={alloc}
            currency={currency}
            totalBudget={plan.totalBudget}
            onToggleBadge={toggleBadge}
          />
        ))}
      </div>

      {/* ── Overrun Stress Simulator ── */}
      <div className="rounded-xl border border-rose-500/20 bg-rose-950/10 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-rose-400" />
            <h3 className="text-sm font-semibold text-rose-300">Stress Simulator</h3>
          </div>
          <button
            type="button"
            onClick={simulateOverrun}
            aria-label="Simulate a 20% budget overrun to generate trade-off scenarios"
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200",
              "bg-rose-600 text-white hover:bg-rose-500 active:scale-[0.97]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950",
              "shadow-lg shadow-rose-500/10 hover:shadow-rose-500/20"
            )}
          >
            <AlertTriangle className="h-4 w-4" />
            +20% Overrun
          </button>
        </div>
        <p className="text-xs text-zinc-500 leading-relaxed">
          Simulate a 20% cost escalation across all categories. This generates actionable trade-off
          scenarios to rebalance your budget without compromising your highest-priority categories.
        </p>
      </div>

      {/* ── Trade-Off Scenarios ── */}
      {plan.tradeOffScenarios && plan.tradeOffScenarios.length > 0 && (
        <section className="space-y-4" aria-label="Trade-off scenarios">
          <div className="flex items-center gap-2">
            <Scissors className="h-5 w-5 text-rose-400" />
            <h3 className="text-base font-bold text-rose-300">
              Trade-Off Scenarios
            </h3>
            <span className="rounded-full bg-rose-500/15 px-2.5 py-0.5 text-[11px] font-mono font-semibold text-rose-400 border border-rose-500/20">
              {plan.tradeOffScenarios.length} options
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {plan.tradeOffScenarios.slice(0, 3).map((scenario) => (
              <TradeOffCard key={scenario.id} scenario={scenario} currency={currency} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
