"use client";

import { useMemo } from "react";
import { useEventStore } from "@/store/useEventStore";
import { cn } from "@/lib/utils";
import type { DagTask, BudgetCategory, TaskStatus } from "@/types/event";
import {
  AlertTriangle,
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Flame,
  GitBranch,
  Hourglass,
  Layers,
  ListChecks,
  Loader2,
  Lock,
  Milestone,
  Network,
  Pause,
  ShieldAlert,
  Timer,
  Zap,
} from "lucide-react";

// ────────────────────────────────────────────────────────────
// Constants
// ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  TaskStatus,
  { label: string; color: string; bg: string; border: string; icon: React.ReactNode }
> = {
  pending: {
    label: "Pending",
    color: "text-zinc-400",
    bg: "bg-zinc-500/10",
    border: "border-zinc-500/30",
    icon: <Pause className="h-3 w-3" />,
  },
  in_progress: {
    label: "In Progress",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    icon: <Loader2 className="h-3 w-3 animate-spin" />,
  },
  completed: {
    label: "Completed",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  delayed: {
    label: "Delayed",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    icon: <Clock className="h-3 w-3" />,
  },
  blocked: {
    label: "Blocked",
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/30",
    icon: <Lock className="h-3 w-3" />,
  },
};

const CATEGORY_LABELS: Record<BudgetCategory, { label: string; color: string }> = {
  venue: { label: "Venue", color: "text-violet-400" },
  catering: { label: "Catering", color: "text-orange-400" },
  decor: { label: "Décor", color: "text-pink-400" },
  photography: { label: "Photography", color: "text-cyan-400" },
  logistics: { label: "Logistics", color: "text-lime-400" },
};

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────

function groupTasksByCategory(tasks: DagTask[]): Map<BudgetCategory, DagTask[]> {
  const sorted = [...tasks].sort((a, b) => (a.earliestStart ?? 0) - (b.earliestStart ?? 0));
  const groups = new Map<BudgetCategory, DagTask[]>();
  for (const task of sorted) {
    const existing = groups.get(task.category) ?? [];
    existing.push(task);
    groups.set(task.category, existing);
  }
  return groups;
}

function getTaskTitleById(tasks: DagTask[], id: string): string {
  return tasks.find((t) => t.id === id)?.title ?? id;
}

// ────────────────────────────────────────────────────────────
// Sub-components
// ────────────────────────────────────────────────────────────

function SummaryBar({
  totalTasks,
  completedTasks,
  criticalPathCount,
  totalDurationDays,
}: {
  totalTasks: number;
  completedTasks: number;
  criticalPathCount: number;
  totalDurationDays: number;
}) {
  const completionPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4" role="group" aria-label="Project summary statistics">
      {[
        {
          label: "Total Tasks",
          value: totalTasks.toString(),
          icon: <ListChecks className="h-4 w-4 text-amber-500" />,
          accent: "text-amber-400",
        },
        {
          label: "Completed",
          value: `${completedTasks} (${completionPct}%)`,
          icon: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
          accent: "text-emerald-400",
        },
        {
          label: "Critical Path",
          value: criticalPathCount.toString(),
          icon: <Flame className="h-4 w-4 text-rose-400" />,
          accent: "text-rose-400",
        },
        {
          label: "Project Duration",
          value: `${totalDurationDays}d`,
          icon: <CalendarClock className="h-4 w-4 text-blue-400" />,
          accent: "text-blue-400",
        },
      ].map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl border border-zinc-800/80 bg-zinc-900/90 p-4 space-y-1.5"
          aria-label={`${stat.label}: ${stat.value}`}
        >
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            {stat.icon}
            {stat.label}
          </div>
          <div className={cn("text-xl font-mono font-bold", stat.accent)}>{stat.value}</div>
        </div>
      ))}
    </div>
  );
}

function TaskCard({
  task,
  allTasks,
  onComplete,
  onSimulateDelay,
}: {
  task: DagTask;
  allTasks: DagTask[];
  onComplete: (taskId: string) => void;
  onSimulateDelay: (taskId: string, delayDays: number) => void;
}) {
  const status = STATUS_CONFIG[task.status];
  const category = CATEGORY_LABELS[task.category];
  const isCompleted = task.status === "completed";

  return (
    <article
      className={cn(
        "group relative rounded-xl border bg-zinc-900/90 overflow-hidden transition-all duration-300",
        "hover:shadow-lg hover:shadow-black/20",
        task.isCriticalPath
          ? "border-rose-500/30 hover:border-rose-500/50"
          : "border-zinc-800/80 hover:border-zinc-700/80"
      )}
      aria-label={`Task: ${task.title}. Status: ${status.label}. Duration: ${task.durationDays} days.${
        task.isCriticalPath ? " This task is on the critical path." : ""
      }`}
    >
      {/* Critical path glow */}
      {task.isCriticalPath && (
        <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 via-transparent to-transparent pointer-events-none" />
      )}

      <div className="relative p-4 space-y-3">
        {/* Top row: badges */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Status badge */}
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide border",
                status.bg,
                status.color,
                status.border
              )}
            >
              {status.icon}
              {status.label}
            </span>

            {/* Category badge */}
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-md bg-zinc-800/80 px-2 py-0.5 text-[11px] font-medium",
                category.color
              )}
            >
              <Layers className="h-2.5 w-2.5" />
              {category.label}
            </span>

            {/* Critical Path badge */}
            {task.isCriticalPath && (
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-rose-400 border border-rose-500/30 animate-pulse">
                <Flame className="h-3 w-3" />
                Critical Path
              </span>
            )}
          </div>

          {/* Complete checkbox */}
          <label
            className={cn(
              "flex items-center gap-2 text-xs cursor-pointer select-none transition-colors",
              isCompleted ? "text-emerald-400" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={isCompleted}
                disabled={isCompleted}
                onChange={() => {
                  if (!isCompleted) onComplete(task.id);
                }}
                aria-label={`Mark "${task.title}" as complete`}
              />
              <div
                className={cn(
                  "h-5 w-5 rounded-md border-2 transition-all flex items-center justify-center",
                  isCompleted
                    ? "border-emerald-500 bg-emerald-500/20"
                    : "border-zinc-600 bg-zinc-900 peer-hover:border-zinc-400 peer-focus-visible:ring-2 peer-focus-visible:ring-amber-500/50"
                )}
              >
                {isCompleted && <Check className="h-3 w-3 text-emerald-400" />}
              </div>
            </div>
            <span className="hidden sm:inline">{isCompleted ? "Done" : "Complete"}</span>
          </label>
        </div>

        {/* Title & description */}
        <div className="space-y-1">
          <h4
            className={cn(
              "text-sm font-semibold leading-tight",
              isCompleted ? "text-zinc-500 line-through" : "text-zinc-100"
            )}
          >
            {task.title}
          </h4>
          {task.description && (
            <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2">{task.description}</p>
          )}
        </div>

        {/* Metadata row */}
        <div className="flex items-center gap-4 flex-wrap text-[11px] text-zinc-500">
          <span className="inline-flex items-center gap-1 font-mono">
            <Timer className="h-3 w-3" />
            {task.durationDays}d duration
          </span>
          {task.earliestStart != null && (
            <span className="inline-flex items-center gap-1 font-mono">
              <Milestone className="h-3 w-3" />
              Start: Day {task.earliestStart}
            </span>
          )}
          {task.deadline && (
            <span className="inline-flex items-center gap-1 font-mono">
              <CalendarClock className="h-3 w-3" />
              {task.deadline}
            </span>
          )}
          {task.latestFinish != null && (
            <span className="inline-flex items-center gap-1 font-mono">
              <Hourglass className="h-3 w-3" />
              LF: Day {task.latestFinish}
            </span>
          )}
          {!task.isCriticalPath && task.slack != null && task.slack > 0 && (
            <span className="inline-flex items-center gap-1 font-mono text-blue-400">
              <Zap className="h-3 w-3" />
              {task.slack}d slack
            </span>
          )}
        </div>

        {/* Dependencies */}
        {task.dependsOn.length > 0 && (
          <div className="flex items-start gap-1.5 text-[11px] text-zinc-600">
            <GitBranch className="h-3 w-3 mt-0.5 shrink-0" />
            <span>
              Depends on:{" "}
              {task.dependsOn.map((depId, i) => (
                <span key={depId}>
                  <span className="text-zinc-400">{getTaskTitleById(allTasks, depId)}</span>
                  {i < task.dependsOn.length - 1 && <span className="text-zinc-700">, </span>}
                </span>
              ))}
            </span>
          </div>
        )}

        {/* Actions */}
        {!isCompleted && (
          <div className="pt-1">
            <button
              type="button"
              onClick={() => onSimulateDelay(task.id, 14)}
              aria-label={`Simulate a 14-day delay for "${task.title}"`}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-all duration-200",
                "bg-amber-500/10 text-amber-400 border border-amber-500/20",
                "hover:bg-amber-500/20 hover:border-amber-500/40 active:scale-[0.97]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
              )}
            >
              <AlertTriangle className="h-3 w-3" />
              Simulate +14d Delay
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

// ────────────────────────────────────────────────────────────
// Main Component
// ────────────────────────────────────────────────────────────

export default function DagTimelineBoard() {
  const plan = useEventStore((s) => s.plan);
  const completeTask = useEventStore((s) => s.completeTask);
  const simulateDelay = useEventStore((s) => s.simulateDelay);

  const stats = useMemo(() => {
    if (!plan) return null;
    const tasks = plan.tasks;
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === "completed").length;
    const criticalPathCount = tasks.filter((t) => t.isCriticalPath).length;

    // Calculate total project duration: max(earliestStart + durationDays) across all tasks
    let totalDurationDays = plan.daysUntilEvent;
    if (tasks.length > 0) {
      const maxFinish = Math.max(
        ...tasks.map((t) => (t.earliestStart ?? 0) + t.durationDays)
      );
      if (maxFinish > 0) totalDurationDays = maxFinish;
    }

    return { totalTasks, completedTasks, criticalPathCount, totalDurationDays };
  }, [plan]);

  const grouped = useMemo(() => {
    if (!plan) return new Map<BudgetCategory, DagTask[]>();
    return groupTasksByCategory(plan.tasks);
  }, [plan]);

  if (!plan || !stats) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-zinc-800/80 bg-zinc-900/90">
        <div className="text-center space-y-2">
          <Network className="h-8 w-8 text-zinc-600 mx-auto" />
          <p className="text-sm text-zinc-500">No timeline loaded.</p>
          <p className="text-xs text-zinc-600">Create an event plan to see the DAG timeline.</p>
        </div>
      </div>
    );
  }

  // Completion progress
  const completionPct = stats.totalTasks > 0 ? (stats.completedTasks / stats.totalTasks) * 100 : 0;

  return (
    <div className="space-y-6" role="region" aria-label="DAG Timeline Board">
      {/* ── Header ── */}
      <header className="space-y-1">
        <div className="flex items-center gap-2">
          <Network className="h-5 w-5 text-amber-500" />
          <h2 className="text-lg font-bold text-zinc-100 tracking-tight">
            DAG Timeline Board
          </h2>
        </div>
        <p className="text-xs text-zinc-500">
          Directed Acyclic Graph task orchestration with critical path analysis
        </p>
      </header>

      {/* ── Summary Bar ── */}
      <SummaryBar
        totalTasks={stats.totalTasks}
        completedTasks={stats.completedTasks}
        criticalPathCount={stats.criticalPathCount}
        totalDurationDays={stats.totalDurationDays}
      />

      {/* ── Overall Progress ── */}
      <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/90 p-4 space-y-2">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span className="flex items-center gap-1.5">
            <ShieldAlert className="h-3.5 w-3.5" />
            Overall Progress
          </span>
          <span className="font-mono font-semibold text-zinc-200">{completionPct.toFixed(0)}%</span>
        </div>
        <div className="h-2.5 w-full rounded-full bg-zinc-800 overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-700 ease-out",
              completionPct === 100
                ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                : completionPct > 60
                  ? "bg-gradient-to-r from-amber-500 to-amber-400"
                  : "bg-gradient-to-r from-blue-500 to-blue-400"
            )}
            style={{ width: `${completionPct}%` }}
            role="progressbar"
            aria-valuenow={Math.round(completionPct)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Project ${completionPct.toFixed(0)}% complete`}
          />
        </div>
      </div>

      {/* ── Grouped Tasks ── */}
      <div className="space-y-6">
        {Array.from(grouped.entries()).map(([category, tasks]) => {
          const catMeta = CATEGORY_LABELS[category];
          const catCompleted = tasks.filter((t) => t.status === "completed").length;

          return (
            <section key={category} className="space-y-3" aria-label={`${catMeta.label} tasks`}>
              <div className="flex items-center gap-3">
                <ChevronRight className={cn("h-4 w-4", catMeta.color)} />
                <h3 className={cn("text-sm font-semibold", catMeta.color)}>
                  {catMeta.label}
                </h3>
                <span className="rounded-md bg-zinc-800/80 px-2 py-0.5 text-[11px] font-mono text-zinc-400">
                  {catCompleted}/{tasks.length} done
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    allTasks={plan.tasks}
                    onComplete={completeTask}
                    onSimulateDelay={simulateDelay}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
