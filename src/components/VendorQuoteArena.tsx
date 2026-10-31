"use client";

/**
 * VendorQuoteArena — Side-by-side vendor quote comparison
 *
 * Displays vendor quotes with inclusions/exclusions, hidden clause warnings,
 * clarification questions, and a "Generate Clarification Draft" feature.
 * Falls back to preset wedding quotes when no quotes exist in the plan.
 */

import { useState, useCallback, useMemo } from "react";
import { useEventStore } from "@/store/useEventStore";
import { cn, formatCurrency } from "@/lib/utils";
import type { VendorQuote, BudgetCategory, Currency } from "@/types/event";
import { PRESET_WEDDING } from "@/lib/presets";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldAlert,
  ClipboardCopy,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Swords,
  BadgeIndianRupee,
  Users,
  HelpCircle,
  FileWarning,
  ListChecks,
  Send,
} from "lucide-react";

// ────────────────────────────────────────────────────────────
// Interrogation Checklist per Category
// ────────────────────────────────────────────────────────────

const INTERROGATION_CHECKLISTS: Record<BudgetCategory, string[]> = {
  venue: [
    "Is the quoted price all-inclusive or are utilities billed separately?",
    "What is the overtime charge per hour?",
    "Are there noise curfew restrictions?",
    "Is parking included? How many vehicles?",
    "Generator / power backup availability and cost?",
    "Any restrictions on external decor vendors?",
  ],
  catering: [
    "Does the per-plate rate include GST/service tax?",
    "What is the minimum guaranteed guest count for billing?",
    "Cancellation and refund policy?",
    "Is there a corkage / outside-beverage fee?",
    "Tasting session availability and cost?",
    "Overtime charges for extended service hours?",
  ],
  decor: [
    "Does the quote include setup AND teardown?",
    "Are fresh flowers included, or is this for artificial/dried?",
    "Any damage deposit or liability clause?",
    "Timeline for setup — how many hours before event?",
    "What happens if rented items are damaged?",
    "Is lighting (fairy lights, uplighting) included?",
  ],
  photography: [
    "How many hours of coverage are included?",
    "Are edited photos / album included, or charged separately?",
    "Delivery timeline for edited content?",
    "Is a second shooter / assistant included?",
    "Who retains copyright — you or the photographer?",
    "What is the cancellation or reschedule policy?",
  ],
  logistics: [
    "Is transport for guests/equipment included?",
    "Who is the on-site point of contact on event day?",
    "Insurance or liability coverage for equipment?",
    "What is the contingency plan for vendor no-show?",
    "Is there a wet-weather or emergency backup plan?",
    "Volunteer / staff overtime policy?",
  ],
};

// ────────────────────────────────────────────────────────────
// Clarification Draft Generator
// ────────────────────────────────────────────────────────────

function generateClarificationDraft(
  quote: VendorQuote,
  currency: Currency,
  guestCount: number
): string {
  const lines = [
    `Dear ${quote.vendorName} Team,`,
    ``,
    `Thank you for your quote. Before we finalize, we'd appreciate clarity on a few points:`,
    ``,
  ];

  quote.clarificationQuestions.forEach((q, i) => {
    lines.push(`${i + 1}. ${q}`);
  });

  if (quote.hiddenClauses.length > 0) {
    lines.push(``);
    lines.push(`We also noticed the following clauses and would like confirmation:`);
    quote.hiddenClauses.forEach((c) => {
      lines.push(`  • ${c}`);
    });
  }

  lines.push(``);
  lines.push(
    `For reference, our expected guest count is ~${guestCount} and budget for ${quote.category} is being evaluated.`
  );
  lines.push(``);
  lines.push(`Looking forward to your response.`);
  lines.push(`Best regards`);

  return lines.join("\n");
}

// ────────────────────────────────────────────────────────────
// QuoteCard Component
// ────────────────────────────────────────────────────────────

interface QuoteCardProps {
  quote: VendorQuote;
  currency: Currency;
  guestCount: number;
  isBestValue: boolean;
}

function QuoteCard({ quote, currency, guestCount, isBestValue }: QuoteCardProps) {
  const [showDraft, setShowDraft] = useState(false);
  const [copied, setCopied] = useState(false);
  const [checklistOpen, setChecklistOpen] = useState(false);

  const effectiveCost =
    quote.effectiveCost ??
    quote.baseCost + (quote.perGuestCost ?? 0) * guestCount;

  const draft = useMemo(
    () => generateClarificationDraft(quote, currency, guestCount),
    [quote, currency, guestCount]
  );

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(draft);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = draft;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [draft]);

  const checklistItems = INTERROGATION_CHECKLISTS[quote.category] ?? [];

  return (
    <article
      role="article"
      aria-label={`Quote from ${quote.vendorName}`}
      className={cn(
        "relative flex flex-col rounded-2xl border transition-all duration-300",
        "bg-zinc-900/90 border-zinc-800/80",
        "hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-500/5",
        isBestValue && "ring-1 ring-amber-500/50"
      )}
    >
      {/* Best Value Badge */}
      {isBestValue && (
        <div className="absolute -top-3 left-4 z-10">
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-3 py-0.5 text-xs font-bold text-zinc-950">
            <BadgeIndianRupee className="h-3 w-3" aria-hidden="true" />
            Best Value
          </span>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-zinc-800/60 px-5 pt-5 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-semibold text-zinc-100">
              {quote.vendorName}
            </h3>
            <span className="mt-1 inline-block rounded-md bg-zinc-800 px-2 py-0.5 text-xs font-medium capitalize text-zinc-400">
              {quote.category}
            </span>
          </div>
          <Swords className="h-5 w-5 shrink-0 text-amber-500/70" aria-hidden="true" />
        </div>
      </header>

      {/* Cost Breakdown */}
      <section aria-label="Cost breakdown" className="border-b border-zinc-800/40 px-5 py-4">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
              Base Cost
            </p>
            <p className="mt-1 font-mono text-sm font-semibold text-zinc-200">
              {formatCurrency(quote.baseCost, currency)}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
              Per Guest
            </p>
            <p className="mt-1 font-mono text-sm font-semibold text-zinc-200">
              {quote.perGuestCost != null
                ? formatCurrency(quote.perGuestCost, currency)
                : "—"}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
              Effective
            </p>
            <p className="mt-1 font-mono text-sm font-bold text-amber-500">
              {formatCurrency(effectiveCost, currency)}
            </p>
          </div>
        </div>
        {quote.perGuestCost != null && (
          <p className="mt-2 flex items-center justify-center gap-1 text-[11px] text-zinc-500">
            <Users className="h-3 w-3" aria-hidden="true" />
            Based on {guestCount} guests
          </p>
        )}
      </section>

      {/* Inclusions */}
      {quote.inclusions.length > 0 && (
        <section aria-label="Inclusions" className="border-b border-zinc-800/40 px-5 py-4">
          <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-500">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
            Inclusions
          </h4>
          <ul className="space-y-1.5" role="list">
            {quote.inclusions.map((item, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 text-sm text-zinc-300"
              >
                <CheckCircle2
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500"
                  aria-hidden="true"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Exclusions */}
      {quote.exclusions.length > 0 && (
        <section aria-label="Exclusions" className="border-b border-zinc-800/40 px-5 py-4">
          <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-rose-400">
            <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
            Exclusions
          </h4>
          <ul className="space-y-1.5" role="list">
            {quote.exclusions.map((item, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 text-sm text-zinc-400"
              >
                <XCircle
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-500"
                  aria-hidden="true"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Hidden Clauses — Warning */}
      {quote.hiddenClauses.length > 0 && (
        <section
          aria-label="Hidden clauses"
          className="border-b border-zinc-800/40 px-5 py-4"
        >
          <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-rose-600">
            <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
            Hidden Clauses
          </h4>
          <div className="space-y-2" role="list" aria-label="Hidden clause warnings">
            {quote.hiddenClauses.map((clause, idx) => (
              <div
                key={idx}
                role="listitem"
                className="flex items-start gap-2 rounded-lg border border-rose-800/40 bg-rose-950/30 px-3 py-2"
              >
                <AlertTriangle
                  className="mt-0.5 h-4 w-4 shrink-0 text-rose-500"
                  aria-hidden="true"
                />
                <span className="text-sm font-medium text-rose-300">
                  {clause}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Clarification Questions */}
      {quote.clarificationQuestions.length > 0 && (
        <section
          aria-label="Clarification questions"
          className="border-b border-zinc-800/40 px-5 py-4"
        >
          <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-400">
            <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" />
            Clarifications Needed
          </h4>
          <ol className="space-y-1.5 list-decimal list-inside" role="list">
            {quote.clarificationQuestions.map((q, idx) => (
              <li key={idx} className="text-sm text-zinc-300">
                {q}
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-2 px-5 py-4">
        {/* Generate Draft Button */}
        {quote.clarificationQuestions.length > 0 && (
          <button
            onClick={() => setShowDraft((prev) => !prev)}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200",
              "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
            )}
            aria-expanded={showDraft}
            aria-controls={`draft-${quote.id}`}
          >
            <Send className="h-4 w-4" aria-hidden="true" />
            {showDraft ? "Hide" : "Generate"} Clarification Draft
            {showDraft ? (
              <ChevronUp className="h-4 w-4" aria-hidden="true" />
            ) : (
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        )}

        {/* Draft Content */}
        {showDraft && (
          <div
            id={`draft-${quote.id}`}
            className="rounded-xl border border-zinc-700/50 bg-zinc-950/80 p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="flex items-center gap-1.5 text-xs font-medium text-zinc-400">
                <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
                Ready-to-copy message (Email / WhatsApp)
              </p>
              <button
                onClick={handleCopy}
                className={cn(
                  "flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                  copied
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                )}
                aria-label={copied ? "Copied to clipboard" : "Copy to clipboard"}
              >
                <ClipboardCopy className="h-3.5 w-3.5" aria-hidden="true" />
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <pre className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-300 font-sans">
              {draft}
            </pre>
          </div>
        )}

        {/* Interrogation Checklist */}
        {checklistItems.length > 0 && (
          <button
            onClick={() => setChecklistOpen((prev) => !prev)}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200",
              "bg-zinc-800/60 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
            )}
            aria-expanded={checklistOpen}
            aria-controls={`checklist-${quote.id}`}
          >
            <ListChecks className="h-4 w-4" aria-hidden="true" />
            {quote.category.charAt(0).toUpperCase() + quote.category.slice(1)} Interrogation Checklist
            {checklistOpen ? (
              <ChevronUp className="h-4 w-4" aria-hidden="true" />
            ) : (
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        )}

        {checklistOpen && (
          <div
            id={`checklist-${quote.id}`}
            className="rounded-xl border border-zinc-700/50 bg-zinc-950/80 p-4"
          >
            <ul className="space-y-2" role="list">
              {checklistItems.map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-sm text-zinc-300"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-zinc-800 font-mono text-[10px] font-bold text-amber-500">
                    {idx + 1}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </article>
  );
}

// ────────────────────────────────────────────────────────────
// Main Component
// ────────────────────────────────────────────────────────────

export default function VendorQuoteArena() {
  const plan = useEventStore((s) => s.plan);

  const quotes: VendorQuote[] = useMemo(() => {
    if (plan?.vendorQuotes && plan.vendorQuotes.length > 0) {
      return plan.vendorQuotes;
    }
    // Fallback to preset wedding quotes for demo
    return PRESET_WEDDING.vendorQuotes;
  }, [plan]);

  const currency: Currency = plan?.currency ?? "INR";
  const guestCount = plan?.guestCount ?? 200;

  const usingSample = !plan?.vendorQuotes || plan.vendorQuotes.length === 0;

  // Group quotes by category for organized display
  const groupedQuotes = useMemo(() => {
    const groups: Record<string, VendorQuote[]> = {};
    quotes.forEach((q) => {
      if (!groups[q.category]) groups[q.category] = [];
      groups[q.category].push(q);
    });
    return groups;
  }, [quotes]);

  // Determine best value per category (lowest effective cost)
  const bestValueIds = useMemo(() => {
    const ids = new Set<string>();
    Object.values(groupedQuotes).forEach((categoryQuotes) => {
      if (categoryQuotes.length < 2) return;
      let bestId = categoryQuotes[0].id;
      let bestCost =
        categoryQuotes[0].effectiveCost ??
        categoryQuotes[0].baseCost +
          (categoryQuotes[0].perGuestCost ?? 0) * guestCount;

      categoryQuotes.forEach((q) => {
        const cost =
          q.effectiveCost ?? q.baseCost + (q.perGuestCost ?? 0) * guestCount;
        if (cost < bestCost) {
          bestCost = cost;
          bestId = q.id;
        }
      });
      ids.add(bestId);
    });
    return ids;
  }, [groupedQuotes, guestCount]);

  return (
    <section
      aria-label="Vendor Quote Comparison Arena"
      className="w-full space-y-6"
    >
      {/* Section Header */}
      <header className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-zinc-100">
            <Swords className="h-5 w-5 text-amber-500" aria-hidden="true" />
            Vendor Quote Arena
          </h2>
          <p className="mt-0.5 text-sm text-zinc-500">
            Compare quotes side-by-side, spot hidden clauses, and generate clarification messages.
          </p>
        </div>
        {usingSample && (
          <div className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5">
            <FileWarning className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" />
            <span className="text-xs font-medium text-amber-400">
              Showing sample quotes — add vendor quotes to compare yours
            </span>
          </div>
        )}
      </header>

      {/* Grouped Quote Comparisons */}
      {Object.entries(groupedQuotes).map(([category, categoryQuotes]) => (
        <div key={category} className="space-y-4">
          <h3 className="flex items-center gap-2 border-b border-zinc-800/50 pb-2 text-sm font-semibold uppercase tracking-wider text-zinc-400">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden="true" />
            {category}
            <span className="text-zinc-600">
              ({categoryQuotes.length} quote{categoryQuotes.length !== 1 ? "s" : ""})
            </span>
          </h3>
          <div
            className="grid gap-5 md:grid-cols-2"
            role="list"
            aria-label={`${category} vendor quotes`}
          >
            {categoryQuotes.map((quote) => (
              <div key={quote.id} role="listitem">
                <QuoteCard
                  quote={quote}
                  currency={currency}
                  guestCount={guestCount}
                  isBestValue={bestValueIds.has(quote.id)}
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Empty State */}
      {quotes.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/50 px-8 py-16 text-center">
          <Swords className="mb-4 h-10 w-10 text-zinc-700" aria-hidden="true" />
          <p className="text-lg font-medium text-zinc-400">
            No vendor quotes yet
          </p>
          <p className="mt-1 text-sm text-zinc-600">
            Add vendor quotes to your event plan to start comparing.
          </p>
        </div>
      )}
    </section>
  );
}
