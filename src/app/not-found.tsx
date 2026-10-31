/**
 * SUTRA — Custom 404 Not Found Page
 *
 * Polished Dark Obsidian fallback for unknown routes.
 */

import Link from "next/link";
import { Compass, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#09090B] px-4 text-zinc-100">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-8 text-center space-y-6 shadow-2xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
          <Compass className="h-7 w-7" />
        </div>

        <div className="space-y-2">
          <span className="rounded-full bg-zinc-800 border border-zinc-700 px-2.5 py-0.5 text-xs font-mono text-zinc-400">
            HTTP 404
          </span>
          <h1 className="text-xl font-bold tracking-tight text-zinc-100">
            Route Not Found in SUTRA Harness
          </h1>
          <p className="text-xs text-zinc-400 leading-relaxed">
            The requested resource or workspace does not exist in the active event graph.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-semibold text-zinc-950 hover:bg-amber-400 transition-colors shadow-md shadow-amber-500/10"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Workspace</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
