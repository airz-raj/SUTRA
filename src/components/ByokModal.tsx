"use client";

/**
 * SUTRA — Bring Your Own Key (BYOK) Modal
 *
 * Allows users or judges to optionally input a Google AI Studio API key
 * for Gemini 2.5 Flash live inference.
 *
 * ROBUST FALLBACK GUARANTEE:
 * - SUTRA works 100% offline out-of-the-box without ANY API key
 * - Keys are kept in session memory only (never written to disk or localStorage)
 * - If key fails, is throttled, or has an unexpected format, system automatically
 *   falls back to the local deterministic solver without crashing
 */

import { useState } from "react";
import { useEventStore } from "@/store/useEventStore";
import { validateApiKeyFormat } from "@/lib/ai/orchestrator";
import {
  X,
  Key,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  ExternalLink,
} from "lucide-react";

export default function ByokModal() {
  const showByokModal = useEventStore((s) => s.showByokModal);
  const setShowByokModal = useEventStore((s) => s.setShowByokModal);
  const geminiApiKey = useEventStore((s) => s.geminiApiKey);
  const setApiKey = useEventStore((s) => s.setApiKey);

  const [inputKey, setInputKey] = useState(geminiApiKey ?? "");
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "valid" | "invalid">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!showByokModal) return null;

  const handleSave = () => {
    const trimmed = inputKey.trim();
    if (!trimmed) {
      setApiKey(null);
      setShowByokModal(false);
      return;
    }

    if (!validateApiKeyFormat(trimmed)) {
      setErrorMessage("Key format appears invalid. Google AI Studio keys are typically 20+ alphanumeric characters.");
      return;
    }

    setApiKey(trimmed);
    setErrorMessage(null);
    setShowByokModal(false);
  };

  const handleRemove = () => {
    setInputKey("");
    setApiKey(null);
    setTestStatus("idle");
    setErrorMessage(null);
  };

  const handleTestKey = async () => {
    const trimmed = inputKey.trim();
    if (!trimmed) {
      setErrorMessage("Please enter an API key to test.");
      return;
    }

    setTestStatus("testing");
    setErrorMessage(null);

    try {
      const res = await fetch("/api/orchestrate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-gemini-key": trimmed,
        },
        body: JSON.stringify({
          action: "plan",
          eventPlan: {
            eventType: "birthday",
            totalBudget: 100000,
            guestCount: 50,
            daysUntilEvent: 30,
          },
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.executionTier === "gemini") {
        setTestStatus("valid");
      } else {
        // Fallback occurred or API error
        setTestStatus("invalid");
        setErrorMessage(
          data.error || "Key could not connect to Gemini 2.5 Flash. Local Deterministic Engine will remain active."
        );
      }
    } catch {
      setTestStatus("invalid");
      setErrorMessage("Network error connecting to API route. Local Deterministic Engine is ready.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-md p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Google AI Studio API Key Configuration"
    >
      <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500">
              <Key className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-100">
                Google AI Studio API Key (Optional)
              </h2>
              <p className="text-xs text-zinc-500">
                Bring Your Own Key for live Gemini 2.5 Flash inference
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowByokModal(false)}
            className="rounded-md p-1.5 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Zero-Config Guarantee Banner */}
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <span className="font-semibold text-emerald-300">
              100% Zero-Config Fallback Active:
            </span>
            <p className="text-emerald-200/80 leading-relaxed">
              You do <strong>not</strong> need an API key to evaluate SUTRA. All budget math, per-plate scaling, DAG Critical Path schedules, and vendor comparison functions run locally via our deterministic engine.
            </p>
          </div>
        </div>

        {/* Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-zinc-300">
            <span>Google Studio Gemini API Key</span>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-amber-400 hover:underline flex items-center gap-1"
            >
              Get a key <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <input
            id="apiKeyInput"
            type="password"
            value={inputKey}
            onChange={(e) => {
              setInputKey(e.target.value);
              setTestStatus("idle");
              setErrorMessage(null);
            }}
            placeholder="Paste your Google AI Studio API key here"
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900/90 px-3.5 py-2.5 text-sm font-mono text-zinc-100 placeholder-zinc-600 focus:border-amber-500/60 focus:outline-none focus:ring-1 focus:ring-amber-500/40"
          />
          <p className="text-[11px] text-zinc-500">
            Supports both classic and new Studio formats. Stored in session memory only (never written to disk).
          </p>
        </div>

        {/* Error / Status Messages */}
        {errorMessage && (
          <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 flex items-start gap-2 text-xs text-rose-300">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {testStatus === "valid" && (
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 flex items-center gap-2 text-xs text-emerald-300">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Successfully connected to Google Gemini AI! Tier 1 live AI inference is now active.</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
          <div>
            {geminiApiKey && (
              <button
                onClick={handleRemove}
                className="flex items-center gap-1 rounded-md px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" /> Remove Key
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTestKey}
              disabled={!inputKey.trim() || testStatus === "testing"}
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 disabled:opacity-40 transition-colors"
            >
              {testStatus === "testing" ? "Testing..." : "Test Connection"}
            </button>
            <button
              onClick={handleSave}
              className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-zinc-950 hover:bg-amber-400 transition-colors"
            >
              Apply Key
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
