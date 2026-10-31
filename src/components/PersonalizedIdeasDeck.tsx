"use client";

/**
 * SUTRA — Personalized Ideas Deck
 *
 * Culturally tailored event concepts with:
 * - Multi-generational & accessibility indicators
 * - Age-group filtering (All, Children, Adults, Seniors)
 * - Category filtering (Food, Decor, AV, Logistics, Entertainment)
 * - Estimated cost badges & dark obsidian luxury cards
 */

import { useState, useMemo } from "react";
import { useEventStore } from "@/store/useEventStore";
import { cn, formatCurrency } from "@/lib/utils";
import {
  Sparkles,
  Accessibility,
  Users,
  Baby,
  HeartHandshake,
  Tag,
  Filter,
  BookmarkPlus,
  Compass,
} from "lucide-react";

const AGE_FILTERS = [
  { key: "all", label: "All Ages", icon: Users },
  { key: "children", label: "Kids Zone", icon: Baby },
  { key: "adults", label: "Adults", icon: HeartHandshake },
  { key: "seniors", label: "Seniors Lounge", icon: Accessibility },
] as const;

export default function PersonalizedIdeasDeck() {
  const plan = useEventStore((s) => s.plan);
  const [selectedAge, setSelectedAge] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [savedIdeas, setSavedIdeas] = useState<Set<string>>(new Set());

  const ideas = useMemo(() => plan?.personalizedIdeas ?? [], [plan?.personalizedIdeas]);
  const currency = plan?.currency ?? "INR";

  // Unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    ideas.forEach((i) => {
      if (i.category) cats.add(i.category);
    });
    return ["all", ...Array.from(cats)];
  }, [ideas]);

  // Filtered ideas
  const filteredIdeas = useMemo(() => {
    return ideas.filter((idea) => {
      const matchAge =
        selectedAge === "all" ||
        idea.ageGroup === selectedAge ||
        idea.ageGroup === "all";
      const matchCat =
        selectedCategory === "all" || idea.category === selectedCategory;
      return matchAge && matchCat;
    });
  }, [ideas, selectedAge, selectedCategory]);

  const toggleSave = (id: string) => {
    setSavedIdeas((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  if (!plan) return null;

  return (
    <div className="space-y-6" role="region" aria-label="Personalized Ideas Deck">
      {/* ── Header & Vibe Summary ── */}
      <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-5 backdrop-blur-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                Cultural Vibe & Personalized Concepts
                <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-xs font-mono text-amber-400">
                  {ideas.length} tailored ideas
                </span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Multi-generational activations, cultural aesthetics, and acoustic-accessible zonings
              </p>
            </div>
          </div>
        </div>

        {plan.vibeDescription && (
          <div className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3.5 text-xs leading-relaxed text-amber-200/90 font-sans">
            <span className="font-semibold text-amber-400 uppercase tracking-wider text-[10px] mr-2 block sm:inline">
              Active Cultural Aesthetic:
            </span>
            {plan.vibeDescription}
          </div>
        )}
      </div>

      {/* ── Filter Controls ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-zinc-800/60 bg-zinc-950/80 p-3">
        {/* Age Group Filters */}
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter by demographic">
          <span className="text-xs font-medium text-zinc-400 flex items-center gap-1 mr-1">
            <Filter className="h-3 w-3 text-zinc-500" /> Demographic:
          </span>
          {AGE_FILTERS.map((f) => {
            const Icon = f.icon;
            const isSelected = selectedAge === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setSelectedAge(f.key)}
                className={cn(
                  "flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                  isSelected
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent"
                )}
                aria-pressed={isSelected}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{f.label}</span>
              </button>
            );
          })}
        </div>

        {/* Category Filters */}
        {categories.length > 2 && (
          <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter by category">
            <span className="text-xs font-medium text-zinc-400 flex items-center gap-1 mr-1">
              <Tag className="h-3 w-3 text-zinc-500" /> Category:
            </span>
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors",
                    isSelected
                      ? "bg-zinc-800 text-zinc-100 border border-zinc-700"
                      : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900"
                  )}
                  aria-pressed={isSelected}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Ideas Grid ── */}
      {filteredIdeas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredIdeas.map((idea) => {
            const isSaved = savedIdeas.has(idea.id);
            return (
              <article
                key={idea.id}
                className={cn(
                  "group relative flex flex-col justify-between rounded-xl border bg-zinc-900/70 p-5 transition-all duration-200 hover:border-amber-500/40 hover:bg-zinc-900/90",
                  isSaved
                    ? "border-amber-500/50 shadow-md shadow-amber-500/5"
                    : "border-zinc-800/80"
                )}
              >
                <div>
                  {/* Top tags */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="rounded-full bg-zinc-800/90 px-2.5 py-0.5 text-[11px] font-mono capitalize text-zinc-300 border border-zinc-700/60">
                      {idea.category}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {idea.ageGroup && idea.ageGroup !== "all" && (
                        <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[10px] font-medium text-amber-400 capitalize">
                          {idea.ageGroup}
                        </span>
                      )}
                      <button
                        onClick={() => toggleSave(idea.id)}
                        className={cn(
                          "rounded-md p-1 transition-colors",
                          isSaved
                            ? "text-amber-400 bg-amber-500/15"
                            : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
                        )}
                        aria-label={isSaved ? "Remove idea from favorites" : "Save idea"}
                      >
                        <BookmarkPlus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-semibold text-zinc-100 group-hover:text-amber-400 transition-colors text-sm leading-snug">
                    {idea.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                    {idea.description}
                  </p>
                </div>

                {/* Footer: Cost & Accessibility */}
                <div className="mt-4 pt-3 border-t border-zinc-800/60 flex flex-col gap-2">
                  {idea.accessibilityNote && (
                    <div className="flex items-start gap-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 p-2 text-[11px] text-emerald-300">
                      <Accessibility className="h-3.5 w-3.5 shrink-0 mt-0.5 text-emerald-400" />
                      <span>{idea.accessibilityNote}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500 font-mono text-[11px]">
                      Est. impact:
                    </span>
                    <span className="font-mono font-semibold text-amber-400">
                      {idea.estimatedCost
                        ? `~${formatCurrency(idea.estimatedCost, currency)}`
                        : "Included in Budget"}
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 bg-zinc-950/60 py-12 text-center">
          <Compass className="h-8 w-8 text-zinc-600 mb-2" />
          <p className="text-sm font-medium text-zinc-400">
            No ideas match the selected demographic or category filters.
          </p>
          <button
            onClick={() => {
              setSelectedAge("all");
              setSelectedCategory("all");
            }}
            className="mt-3 text-xs text-amber-500 hover:underline"
          >
            Reset all filters
          </button>
        </div>
      )}
    </div>
  );
}
