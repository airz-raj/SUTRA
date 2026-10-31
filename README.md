# SUTRA (सूत्र) — Deterministic DAG & GenAI Event Orchestration Harness

> **PromptWars Virtual by Google — Challenge 5: Celebration & Event Planner**  
> *A deterministic constraint-satisfaction and GenAI-powered event planning assistant for weddings, birthdays, and community gatherings.*

🌐 **Live Production Deployment**: [https://sutra-event-planner.vercel.app](https://sutra-event-planner.vercel.app)  
📦 **GitHub Repository**: [https://github.com/airz-raj/SUTRA.git](https://github.com/airz-raj/SUTRA.git)  

---

## 1. Executive Summary & Problem Philosophy

Most GenAI event planning tools are superficial prompt wrappers that generate static lists ("Here are 10 party themes"). In reality, event planning is a **coupled constraint-satisfaction and dependency-graph problem**:

1. **Coupled Variables**: Guest count ($N$), total budget ($B$), timeline ($T$), and priority weights ($W_{\text{food}}, W_{\text{venue}}, W_{\text{decor}}, W_{\text{photo}}, W_{\text{logistics}}$).
2. **Causal Ripple Effects**:
   - $\Delta N > 0 \implies$ Catering & seating scale linearly; venue capacity constraints trigger; decor remains fixed.
   - $\Delta B < 0$ or Overrun $\ge 20\% \implies$ Priority-weighted solver protects core categories (e.g., Culinary Experience) while compressing elastic categories (e.g., Floral Decor).
   - $\Delta T < 0$ or Task Delay $\implies$ Directed Acyclic Graph (DAG) Critical Path Method (CPM) recalculates slack times and flags bottlenecked downstream tasks.

**SUTRA** solves this by pairing **Google Gemini 2.5 Flash** for cultural intake, natural language delta interpretation, and vendor clause analysis with a **Deterministic Mathematical & DAG Constraint Engine** that guarantees mathematical accuracy and 100% zero-config reliability.

---

## 2. Dual-Tier Execution Harness & API Key Strategy

To ensure **100% uptime on Vercel** during hackathon evaluations (even if API credits expire, environment variables are unset, or network throttles occur):

```
                        ┌───────────────────────────────────────────────┐
                        │ User Input / NL Mutation / Preset / Quote     │
                        └───────────────────────┬───────────────────────┘
                                                │
                                                ▼
                                    ┌───────────────────────┐
                                    │ Tiered Router         │
                                    └───────────┬───────────┘
                                                │
                       ┌────────────────────────┴────────────────────────┐
                       ▼                                                 ▼
        [API Key Present & Valid]                         [No Key / Rate Limit / Fallback]
                       │                                                 │
                       ▼                                                 ▼
        ┌─────────────────────────────┐                   ┌─────────────────────────────┐
        │ Tier 1: Gemini 2.5 Flash    │                   │ Tier 2: Deterministic       │
        │ (@google/genai)             │                   │ Constraint Solver (Client)  │
        │ Structured JSON Schema      │                   │ Mathematical Budget & DAG   │
        └──────────────┬──────────────┘                   └──────────────┬──────────────┘
                       │                                                 │
                       └────────────────────────┬────────────────────────┘
                                                ▼
                                ┌───────────────────────────────┐
                                │ Local-First Zustand Store     │
                                │ (0ms Latency, Zero DB Needed) │
                                └───────────────┬───────────────┘
                                                │
                                                ▼
                                ┌───────────────────────────────┐
                                │ Dark Obsidian HUD UI          │
                                └───────────────────────────────┘
```

### Robust Google AI Studio Key Handling:
- **Lenient Format Validation**: Safely handles classic `AIzaSy...` keys, newer Studio formats, dots, hyphens, and underscores without crashing.
- **Fail-Safe Fallback**: Any API error, rate limit (HTTP 429), or format mismatch instantly triggers the deterministic engine.
- **Zero Hardcoded Secrets**: Secrets are never hardcoded. Optional client-side BYOK (Bring Your Own Key) is stored only in session memory.
- **Out-of-the-Box Functionality**: Evaluators and users can test every feature without configuring any API key.

---

## 3. Core Functional Modules

### Module A: Conversational Discovery & Cultural Vibe Intake
- Multi-step conversational intake + natural language prompt bar.
- Interactive priority matrix (Culinary Quality, Aesthetics, Guest Comfort, Entertainment, Photography).
- Multi-generational and accessibility profiling (wheelchair access, children zone, low-decibel senior lounge, dietary restrictions).
- **3 Signature Presets**:
  1. **Purani Dilli & 90s Bollywood Shaadi** (Wedding — ₹8,00,000 | 200 Guests | 120 Days)
  2. **Multi-Generational Golden Jubilee** (50th Birthday — ₹1,50,000 | 80 Guests | 21 Days)
  3. **Code for Communities Civic Hackathon** (Community Event — ₹3,00,000 | 300 Attendees | 45 Days)

### Module B: Dynamic Budget Engine & 20% Overrun Trade-Off Resolver
- Priority-weighted categorized breakdown: Venue, Catering, Decor, Photography, Logistics.
- **Epistemic Badging**: Line items feature toggleable badges:
  - `[AI ESTIMATE]` (Calculated from regional heuristics)
  - `[CONFIRMED QUOTE]` (Locked by user or verified quotation)
- **+20% Overrun Simulator**: Triggers 3 AI-reasoned trade-off cards protecting top priorities, trimming guest lists, or shifting to off-peak time slots.

### Module C: DAG Dependency Timeline & Critical Path Engine
- Tasks modeled as nodes in a Directed Acyclic Graph (DAG) with explicit prerequisite edges (`dependsOn`).
- Computes **Earliest Start (ES)**, **Latest Finish (LF)**, and **Critical Path** using Kahn's topological sort and forward/backward passes.
- Interactive task completion unlocking downstream nodes and delay simulation cascading across dependent tasks.

### Module D: Live Delta Mutation Bar (The SME Golden Test)
- Persistent command bar (`Cmd+K` / `Ctrl+K`) supporting natural language changes:
  - `"Add 50 more guests, reduce budget by ₹50,000, and move event 2 weeks earlier"`
- 3 One-Click SME Stress-Test buttons:
  - `+50 Guests, -₹50k, -2 Wks`
  - `+20% Overrun Simulator`
  - `Delay Venue +14d`
- **Atomic State Transitions**: Visual Diff Drawer (Before vs. After) logging exact per-plate adjustments and milestone shifts without wiping user state.

### Module E: Vendor Coordinator & Quotation Matrix Comparator
- Side-by-side vendor quotation comparator calculating base cost vs. effective cost for $N$ guests.
- Automated hidden-fee detection (surcharges, corkage fees, overtime rates, cancellation traps).
- Automated clarification message generation ready to copy for WhatsApp/email.
- Custom interrogation checklists per vendor category.

---

## 4. Tool Usage Enforcement Matrix

| Tool / Technology | Why It Was Selected | What GenAI Handled | What Humans Designed & Engineered |
| :--- | :--- | :--- | :--- |
| **Google Gemini 2.5 Flash (`@google/genai`)** | Sub-second structured JSON output (`responseSchema`) ideal for parsing unstructured vendor quotes and natural language delta mutations. | Translating open-ended natural language changes, generating culturally nuanced concepts, and extracting hidden clauses from vendor quotes. | Strict Zod contracts, epistemic uncertainty labeling (`AI_ASSUMPTION` vs `CONFIRMED_QUOTE`), and tiered fallback router. |
| **Antigravity Agentic Harness** | Rapid multi-file synthesis, WCAG 2.1 AA accessibility auditing, and unit test generation. | Boilerplate component scaffolding, ARIA wiring, and test case expansion. | Coupled state model, DAG Critical Path algorithm, priority-weighted trade-off math, and Dark Obsidian aesthetic tokens. |
| **Next.js 15 App Router + Zustand + Zod** | Zero-database, zero-config Vercel deployment with instant client reactivity and runtime payload security. | Route handler scaffolding and state sync glue code. | Local-first persistence layer, Kahn's topological sort, budget elasticity formulas, and offline deterministic execution. |

---

## 5. Prompt Evolution Log

### Iteration v1.0 (Naive Prompt — Rejected)
```text
Plan an Indian wedding for 200 guests with an ₹8,00,000 budget.
```
*Outcome*: Produced generic, unstructured text with unverified budgets, static ideas, and zero dependency tracking.

### Iteration v2.0 (Structured Schema Prompt — Improved)
```text
Return a JSON object with categorized budgets and tasks for a wedding with budget {BUDGET} and guests {GUEST_COUNT}.
```
*Outcome*: Output was structured, but model hallucinated live vendor quotes and lacked mathematical constraint checking.

### Iteration v3.0 (Hybrid Verified Prompt — Production)
```text
You are SUTRA (सूत्र), an expert event planning AI. Respond with valid JSON only matching EventPlanSchema.
Every cost estimate must be labeled as "AI_ASSUMPTION" unless confirmed. Budget allocations must sum to total budget.
DAG tasks must have valid dependency references. Vendor analysis must flag hidden fees.
Cross-validated against the deterministic constraint solver.
```
*Outcome*: Strict separation between creative generation and deterministic constraint verification. Every output mathematically balances.

---

## 6. Verification & Quality Gates

Run the verification test suite:

```bash
# Unit Tests (16/16 tests passing)
npm run test

# Linter Cleanliness (0 errors, 0 warnings)
npm run lint

# Production Build (Static + Serverless Edge routes)
npm run build
```

---

## 7. Quick Start (Local Development)

```bash
# Clone the repository
git clone <repo-url>
cd SUTRA

# Install dependencies
npm install

# (Optional) Set your Gemini API key in .env.local
echo "GEMINI_API_KEY=your_key_here" > .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the SUTRA HUD.

---

## 8. License

MIT License — built for PromptWars Virtual by Google (Challenge 5).

