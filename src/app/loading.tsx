/**
 * SUTRA — Global Loading Skeleton
 *
 * Rendered during route transitions or initial server hydration.
 */

import { Cpu } from "lucide-react";

export default function Loading() {
  return (
    <div
      role="status"
      aria-label="Loading SUTRA workspace"
      className="min-h-screen flex flex-col items-center justify-center bg-[#09090B] text-zinc-100"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
          <Cpu className="h-7 w-7 animate-pulse" />
          <div className="absolute inset-0 rounded-2xl border-2 border-amber-500/40 animate-ping opacity-25" />
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-sm font-semibold tracking-wide text-zinc-200">
            Initializing SUTRA (सूत्र) Harness
          </h2>
          <p className="text-xs font-mono text-zinc-500">
            Mounting deterministic constraint engines &amp; local store...
          </p>
        </div>
      </div>
    </div>
  );
}
