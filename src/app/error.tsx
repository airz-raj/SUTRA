"use client";

/**
 * SUTRA — Global App Router Error Boundary
 *
 * Catches unhandled runtime rendering errors, reports telemetry,
 * and allows the user to safely recover without losing persisted store state.
 */

import { useEffect } from "react";
import Link from "next/link";
import { AlertOctagon, RotateCcw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log non-sensitive error details to telemetry/console
    console.error("[SUTRA Global Error Boundary Caught]", {
      message: error.message,
      digest: error.digest,
    });
  }, [error]);

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="min-h-screen flex items-center justify-center bg-[#09090B] px-4 py-12 text-zinc-100"
    >
      <div className="w-full max-w-md rounded-2xl border border-rose-500/30 bg-zinc-950 p-6 shadow-2xl text-center space-y-5">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
          <AlertOctagon className="h-7 w-7" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold tracking-tight text-zinc-100">
            Runtime Exception Handled
          </h1>
          <p className="text-xs text-zinc-400 leading-relaxed">
            SUTRA&apos;s resilience harness caught an unexpected runtime fault. Your local
            plan state remains safe and uncorrupted.
          </p>
        </div>

        {error.message && (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 text-left">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block">
              Error Details
            </span>
            <code className="text-xs font-mono text-rose-300 break-words mt-1 block">
              {error.message}
            </code>
          </div>
        )}

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-semibold text-zinc-950 shadow-md hover:bg-amber-400 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Attempt Recovery</span>
          </button>

          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 transition-colors"
          >
            <Home className="h-3.5 w-3.5" />
            <span>Return to Workspace</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
