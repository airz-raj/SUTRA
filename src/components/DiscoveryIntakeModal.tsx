"use client";

/**
 * SUTRA — Discovery Intake Modal
 *
 * Interactive wizard for event setup:
 * - Event type selection
 * - Budget, guest count, days input
 * - Priority weight sliders
 * - Accessibility profile
 * - 3 one-click preset scenarios
 * - Full custom mode
 */

import { useState } from "react";
import { useEventStore } from "@/store/useEventStore";
import type { EventType, PriorityWeights, AccessibilityProfile } from "@/types/event";
import {
  Cake,
  Heart,
  Users,
  Sparkles,
  ChevronRight,
  X,
  Accessibility,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { PresetKey } from "@/lib/presets";

const EVENT_TYPES: { key: EventType; label: string; icon: typeof Heart; description: string }[] = [
  { key: "wedding", label: "Wedding", icon: Heart, description: "Shaadi, engagement, reception" },
  { key: "birthday", label: "Birthday", icon: Cake, description: "Milestone celebration, jubilee" },
  { key: "community", label: "Community Event", icon: Users, description: "Hackathon, meetup, conference" },
];

const PRESETS_INFO: { key: PresetKey; title: string; subtitle: string; budget: string; guests: number; days: number }[] = [
  {
    key: "wedding",
    title: "Purani Dilli & 90s Bollywood Shaadi",
    subtitle: "Retro cinema aesthetic, Chandni Chowk food, dhol & baraat",
    budget: "₹8,00,000",
    guests: 200,
    days: 120,
  },
  {
    key: "birthday",
    title: "Multi-Generational Golden Jubilee",
    subtitle: "Kid-friendly + senior-friendly 50th birthday celebration",
    budget: "₹1,50,000",
    guests: 80,
    days: 21,
  },
  {
    key: "community",
    title: "Code for Communities Civic Hackathon",
    subtitle: "Zero-waste, accessible, volunteer-managed tech event",
    budget: "₹3,00,000",
    guests: 300,
    days: 45,
  },
];

const PRIORITY_LABELS: { key: keyof PriorityWeights; label: string; emoji: string }[] = [
  { key: "food", label: "Culinary Experience", emoji: "🍽️" },
  { key: "venue", label: "Venue & Space", emoji: "🏛️" },
  { key: "decor", label: "Decor & Aesthetics", emoji: "✨" },
  { key: "photography", label: "Photography & AV", emoji: "📸" },
  { key: "logistics", label: "Logistics & Comfort", emoji: "🚗" },
];

export default function DiscoveryIntakeModal() {
  const loadPreset = useEventStore((s) => s.loadPreset);
  const initCustomPlan = useEventStore((s) => s.initCustomPlan);
  const showIntakeModal = useEventStore((s) => s.showIntakeModal);
  const setShowIntakeModal = useEventStore((s) => s.setShowIntakeModal);
  const plan = useEventStore((s) => s.plan);

  const [mode, setMode] = useState<"select" | "custom">("select");
  const [eventType, setEventType] = useState<EventType>("wedding");
  const [budget, setBudget] = useState("500000");
  const [guestCount, setGuestCount] = useState("100");
  const [daysUntilEvent, setDaysUntilEvent] = useState("60");
  const [currency, setCurrency] = useState<"INR" | "USD">("INR");
  const [eventName, setEventName] = useState("");
  const [vibeDescription, setVibeDescription] = useState("");
  const [priorities, setPriorities] = useState<PriorityWeights>({
    food: 5,
    venue: 5,
    decor: 5,
    photography: 5,
    logistics: 5,
  });
  const [accessibility, setAccessibility] = useState<AccessibilityProfile>({
    hasChildren: false,
    hasSeniors: false,
    wheelchairAccess: false,
    dietaryRestrictions: [],
  });

  // Show modal only when explicitly opened
  const isVisible = showIntakeModal;

  if (!isVisible) return null;

  const handlePresetClick = (key: PresetKey) => {
    loadPreset(key);
  };

  const handleCustomSubmit = () => {
    const b = parseFloat(budget);
    const g = parseInt(guestCount, 10);
    const d = parseInt(daysUntilEvent, 10);

    if (isNaN(b) || b < 1000 || isNaN(g) || g < 1 || isNaN(d) || d < 1) {
      return; // Validation handled by HTML5
    }

    initCustomPlan({
      eventType,
      eventName: eventName || `My ${eventType.charAt(0).toUpperCase() + eventType.slice(1)}`,
      currency,
      totalBudget: b,
      guestCount: g,
      daysUntilEvent: d,
      priorityWeights: priorities,
      accessibility,
      vibeDescription: vibeDescription || undefined,
    });
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Event Setup"
    >
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-zinc-800/80 bg-zinc-950 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/50 px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-amber-400">
              {mode === "select" ? "Choose Your Event" : "Custom Event Setup"}
            </h2>
            <p className="text-sm text-zinc-500 mt-0.5">
              {mode === "select"
                ? "Start with a curated preset or build from scratch"
                : "Configure your event parameters"}
            </p>
          </div>
          {plan && (
            <button
              onClick={() => setShowIntakeModal(false)}
              className="rounded-md p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="p-6">
          {mode === "select" ? (
            <div className="space-y-4">
              {/* ── Preset Cards ── */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
                  Signature Presets (One-Click Demo)
                </h3>
                {PRESETS_INFO.map((preset) => (
                  <button
                    key={preset.key}
                    onClick={() => handlePresetClick(preset.key)}
                    className="w-full text-left rounded-lg border border-zinc-800/80 bg-zinc-900/50 p-4 hover:border-amber-500/40 hover:bg-zinc-900 transition-all group"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-zinc-100 group-hover:text-amber-400 transition-colors">
                          {preset.title}
                        </h4>
                        <p className="text-sm text-zinc-500 mt-0.5">
                          {preset.subtitle}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-zinc-600 group-hover:text-amber-500 transition-colors mt-1" />
                    </div>
                    <div className="mt-3 flex gap-4 text-xs font-mono text-zinc-500">
                      <span>{preset.budget}</span>
                      <span>{preset.guests} guests</span>
                      <span>{preset.days} days</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* ── Custom Button ── */}
              <div className="pt-3 border-t border-zinc-800/50">
                <button
                  onClick={() => setMode("custom")}
                  className="w-full rounded-lg border border-dashed border-zinc-700 py-3 text-sm text-zinc-400 hover:text-amber-400 hover:border-amber-500/40 transition-colors flex items-center justify-center gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  Create Custom Event
                </button>
              </div>
            </div>
          ) : (
            /* ── Custom Form ── */
            <div className="space-y-5">
              {/* Event Type */}
              <div>
                <label className="text-sm font-medium text-zinc-300 mb-2 block">
                  Event Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {EVENT_TYPES.map((et) => {
                    const Icon = et.icon;
                    return (
                      <button
                        key={et.key}
                        onClick={() => setEventType(et.key)}
                        className={cn(
                          "rounded-lg border p-3 text-center transition-all",
                          eventType === et.key
                            ? "border-amber-500/50 bg-amber-500/10 text-amber-400"
                            : "border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-700"
                        )}
                      >
                        <Icon className="h-5 w-5 mx-auto mb-1" />
                        <div className="text-sm font-medium">{et.label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Name */}
              <div>
                <label htmlFor="eventName" className="text-sm font-medium text-zinc-300 mb-1 block">
                  Event Name (optional)
                </label>
                <input
                  id="eventName"
                  type="text"
                  maxLength={200}
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  placeholder="My Dream Wedding"
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-amber-500/50 focus:outline-none"
                />
              </div>

              {/* Budget, Guests, Days */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label htmlFor="budget" className="text-sm font-medium text-zinc-300 mb-1 block">
                    Total Budget
                  </label>
                  <div className="flex">
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value as "INR" | "USD")}
                      className="rounded-l-lg border border-r-0 border-zinc-800 bg-zinc-900 px-2 py-2 text-xs text-zinc-400"
                    >
                      <option value="INR">₹</option>
                      <option value="USD">$</option>
                    </select>
                    <input
                      id="budget"
                      type="number"
                      min={1000}
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="w-full rounded-r-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm font-mono text-zinc-100 focus:border-amber-500/50 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="guests" className="text-sm font-medium text-zinc-300 mb-1 block">
                    Guest Count
                  </label>
                  <input
                    id="guests"
                    type="number"
                    min={1}
                    max={10000}
                    value={guestCount}
                    onChange={(e) => setGuestCount(e.target.value)}
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm font-mono text-zinc-100 focus:border-amber-500/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="days" className="text-sm font-medium text-zinc-300 mb-1 block">
                    Days Until Event
                  </label>
                  <input
                    id="days"
                    type="number"
                    min={1}
                    max={730}
                    value={daysUntilEvent}
                    onChange={(e) => setDaysUntilEvent(e.target.value)}
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm font-mono text-zinc-100 focus:border-amber-500/50 focus:outline-none"
                  />
                </div>
              </div>

              {/* Priority Sliders */}
              <div>
                <label className="text-sm font-medium text-zinc-300 mb-2 block">
                  Priority Weights
                </label>
                <div className="space-y-2">
                  {PRIORITY_LABELS.map((p) => (
                    <div key={p.key} className="flex items-center gap-3">
                      <span className="text-sm w-36 text-zinc-400">
                        {p.emoji} {p.label}
                      </span>
                      <input
                        type="range"
                        min={0}
                        max={10}
                        value={priorities[p.key]}
                        onChange={(e) =>
                          setPriorities({
                            ...priorities,
                            [p.key]: parseInt(e.target.value, 10),
                          })
                        }
                        className="flex-1 accent-amber-500"
                        aria-label={`${p.label} priority`}
                      />
                      <span className="text-sm font-mono w-6 text-right text-zinc-500">
                        {priorities[p.key]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Accessibility */}
              <div>
                <label className="text-sm font-medium text-zinc-300 mb-2 flex items-center gap-1">
                  <Accessibility className="h-4 w-4" />
                  Accessibility Profile
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: "hasChildren" as const, label: "Children attending" },
                    { key: "hasSeniors" as const, label: "Senior citizens" },
                    { key: "wheelchairAccess" as const, label: "Wheelchair access" },
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() =>
                        setAccessibility({
                          ...accessibility,
                          [opt.key]: !accessibility[opt.key],
                        })
                      }
                      className={cn(
                        "rounded-full px-3 py-1 text-xs border transition-colors",
                        accessibility[opt.key]
                          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                          : "border-zinc-800 text-zinc-500 hover:border-zinc-700"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Vibe Description */}
              <div>
                <label htmlFor="vibe" className="text-sm font-medium text-zinc-300 mb-1 block">
                  Vibe / Theme Description (optional)
                </label>
                <textarea
                  id="vibe"
                  maxLength={500}
                  rows={2}
                  value={vibeDescription}
                  onChange={(e) => setVibeDescription(e.target.value)}
                  placeholder="Describe the feel, aesthetic, cultural theme..."
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-amber-500/50 focus:outline-none resize-none"
                />
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setMode("select")}
                  className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleCustomSubmit}
                  className="flex-1 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-amber-400 transition-colors"
                >
                  Generate Plan
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

