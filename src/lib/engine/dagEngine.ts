/**
 * SUTRA — DAG Critical Path Engine
 *
 * Pure deterministic functions for:
 * - Topological sort of task dependencies
 * - Critical Path Method (CPM) — ES, LF, Slack
 * - Delay propagation across dependent tasks
 * - Task completion unlocking downstream nodes
 */

import type { DagTask } from "@/types/event";

// ────────────────────────────────────────────────────────────
// Topological Sort (Kahn's Algorithm)
// ────────────────────────────────────────────────────────────

/**
 * Returns task IDs in topologically sorted order.
 * Throws if a cycle is detected (should never happen in a DAG).
 */
export function topologicalSort(tasks: DagTask[]): string[] {
  const taskMap = new Map<string, DagTask>();
  const inDegree = new Map<string, number>();
  const adjacency = new Map<string, string[]>();

  // Build graph
  for (const task of tasks) {
    taskMap.set(task.id, task);
    inDegree.set(task.id, 0);
    adjacency.set(task.id, []);
  }

  for (const task of tasks) {
    for (const dep of task.dependsOn) {
      if (taskMap.has(dep)) {
        adjacency.get(dep)!.push(task.id);
        inDegree.set(task.id, (inDegree.get(task.id) ?? 0) + 1);
      }
    }
  }

  // Kahn's BFS
  const queue: string[] = [];
  for (const [id, degree] of inDegree) {
    if (degree === 0) queue.push(id);
  }

  const sorted: string[] = [];
  while (queue.length > 0) {
    const current = queue.shift()!;
    sorted.push(current);

    for (const neighbor of adjacency.get(current) ?? []) {
      const newDegree = (inDegree.get(neighbor) ?? 1) - 1;
      inDegree.set(neighbor, newDegree);
      if (newDegree === 0) queue.push(neighbor);
    }
  }

  if (sorted.length !== tasks.length) {
    throw new Error(
      "DAG cycle detected — task dependency graph is not acyclic"
    );
  }

  return sorted;
}

// ────────────────────────────────────────────────────────────
// Critical Path Method (CPM)
// ────────────────────────────────────────────────────────────

export interface CpmResult {
  tasks: DagTask[];
  criticalPath: string[];
  totalDuration: number;
}

/**
 * Compute Critical Path using forward + backward passes.
 *
 * Forward pass: compute Earliest Start (ES) for each task.
 * Backward pass: compute Latest Finish (LF) and Slack for each task.
 * Critical path = all tasks where Slack === 0.
 */
export function computeCriticalPath(tasks: DagTask[]): CpmResult {
  if (tasks.length === 0) {
    return { tasks: [], criticalPath: [], totalDuration: 0 };
  }

  const taskMap = new Map<string, DagTask>();
  for (const t of tasks) {
    taskMap.set(t.id, { ...t });
  }

  const sortedIds = topologicalSort(tasks);

  // ── Forward Pass (compute ES) ──
  const es = new Map<string, number>();
  const ef = new Map<string, number>(); // earliest finish

  for (const id of sortedIds) {
    const task = taskMap.get(id)!;
    let earliestStart = 0;

    for (const depId of task.dependsOn) {
      const depEf = ef.get(depId) ?? 0;
      earliestStart = Math.max(earliestStart, depEf);
    }

    es.set(id, earliestStart);
    ef.set(id, earliestStart + task.durationDays);
  }

  // Total project duration = max EF
  const totalDuration = Math.max(...Array.from(ef.values()), 0);

  // ── Backward Pass (compute LF, Slack) ──
  const lf = new Map<string, number>();
  const ls = new Map<string, number>(); // latest start
  const slack = new Map<string, number>();

  // Initialize all LF to total duration
  for (const id of sortedIds) {
    lf.set(id, totalDuration);
  }

  // Traverse in reverse topological order
  for (let i = sortedIds.length - 1; i >= 0; i--) {
    const id = sortedIds[i];
    const task = taskMap.get(id)!;

    // Find successors
    let latestFinish = totalDuration;
    for (const otherId of sortedIds) {
      const other = taskMap.get(otherId)!;
      if (other.dependsOn.includes(id)) {
        latestFinish = Math.min(latestFinish, ls.get(otherId) ?? totalDuration);
      }
    }

    lf.set(id, latestFinish);
    ls.set(id, latestFinish - task.durationDays);
    slack.set(id, (ls.get(id) ?? 0) - (es.get(id) ?? 0));
  }

  // ── Build results ──
  const criticalPath: string[] = [];
  const updatedTasks: DagTask[] = sortedIds.map((id) => {
    const task = taskMap.get(id)!;
    const taskSlack = slack.get(id) ?? 0;
    const isCritical = taskSlack === 0;

    if (isCritical) {
      criticalPath.push(id);
    }

    return {
      ...task,
      earliestStart: es.get(id),
      latestFinish: lf.get(id),
      slack: taskSlack,
      isCriticalPath: isCritical,
    };
  });

  return {
    tasks: updatedTasks,
    criticalPath,
    totalDuration,
  };
}

// ────────────────────────────────────────────────────────────
// Delay Propagation
// ────────────────────────────────────────────────────────────

/**
 * Propagate a delay through the DAG.
 * When a task is marked as delayed, all downstream dependent tasks
 * are shifted and potentially flagged as blocked.
 */
export function propagateDelay(
  tasks: DagTask[],
  delayedTaskId: string,
  delayDays: number
): DagTask[] {
  const taskMap = new Map<string, DagTask>();
  for (const t of tasks) {
    taskMap.set(t.id, { ...t });
  }

  // Mark the delayed task
  const delayedTask = taskMap.get(delayedTaskId);
  if (!delayedTask) return tasks;

  delayedTask.status = "delayed";

  // Find all downstream tasks (BFS)
  const affected = new Set<string>();
  const queue = [delayedTaskId];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    for (const [id, task] of taskMap) {
      if (task.dependsOn.includes(currentId) && !affected.has(id)) {
        affected.add(id);
        queue.push(id);
      }
    }
  }

  // Update affected tasks
  for (const id of affected) {
    const task = taskMap.get(id)!;
    if (task.status === "pending" || task.status === "in_progress") {
      task.status = "blocked";
    }
    if (task.earliestStart !== undefined) {
      task.earliestStart += delayDays;
    }
    if (task.latestFinish !== undefined) {
      task.latestFinish += delayDays;
    }
  }

  return Array.from(taskMap.values());
}

// ────────────────────────────────────────────────────────────
// Task Completion
// ────────────────────────────────────────────────────────────

/**
 * Mark a task as completed and check if downstream tasks are unblocked.
 */
export function completeTask(
  tasks: DagTask[],
  completedTaskId: string
): DagTask[] {
  const taskMap = new Map<string, DagTask>();
  for (const t of tasks) {
    taskMap.set(t.id, { ...t });
  }

  const task = taskMap.get(completedTaskId);
  if (!task) return tasks;

  task.status = "completed";

  // Check each task to see if all its dependencies are now completed
  for (const [, t] of taskMap) {
    if (t.status === "blocked" || t.status === "pending") {
      const allDepsCompleted = t.dependsOn.every(
        (depId) => taskMap.get(depId)?.status === "completed"
      );
      if (allDepsCompleted && t.dependsOn.length > 0) {
        t.status = "pending"; // Unblocked — ready to start
      }
    }
  }

  return Array.from(taskMap.values());
}

// ────────────────────────────────────────────────────────────
// Compute deadlines from a target date
// ────────────────────────────────────────────────────────────

export function computeDeadlines(
  tasks: DagTask[],
  daysUntilEvent: number
): DagTask[] {
  const { tasks: cpmTasks } = computeCriticalPath(tasks);

  const today = new Date();
  const eventDate = new Date(today);
  eventDate.setDate(eventDate.getDate() + daysUntilEvent);

  return cpmTasks.map((task) => {
    const es = task.earliestStart ?? 0;
    const deadlineDate = new Date(today);
    deadlineDate.setDate(deadlineDate.getDate() + es + task.durationDays);

    return {
      ...task,
      deadline: deadlineDate.toISOString().split("T")[0],
    };
  });
}

/**
 * Get downstream dependents (direct children) of a task.
 */
export function getDownstreamTasks(
  tasks: DagTask[],
  taskId: string
): DagTask[] {
  return tasks.filter((t) => t.dependsOn.includes(taskId));
}

/**
 * Check if the timeline is feasible (total CPM duration <= days until event).
 */
export function isTimelineFeasible(
  tasks: DagTask[],
  daysUntilEvent: number
): { feasible: boolean; totalDuration: number; deficit: number } {
  const { totalDuration } = computeCriticalPath(tasks);
  const deficit = totalDuration - daysUntilEvent;
  return {
    feasible: deficit <= 0,
    totalDuration,
    deficit: Math.max(deficit, 0),
  };
}

