# MotoBudget AI — Product Spec & Architecture Notes

**Product:** AI Motorcycle Trip Budget Planner (MotoBudget AI)  
**Live demo:** https://motobudget-app-self.vercel.app/  
**Repo:** https://github.com/pjaganon/Graded-Mini-Project-4.2-AI-Powered-Web-Application  

**Source documents (project root):**
- `PRD for AI Motorcycle Trip Budget Planner.pdf` — MVP product requirements
- `7-Step Validation Framework.pdf` — problem/market validation brief

This spec merges those documents with the **as-built** application architecture.

---

## 1. Product Vision

Enable motorcycle riders to plan trips with confidence by producing **accurate, motorcycle-specific budget estimates** based on bike, riding style, and travel plans — not generic car trip tools.

**North-star question (PRD + Validation Framework):**

> “Can I comfortably afford this ride?”

---

## 2. Problem Statement

Riders often underestimate trip cost because:

- Existing tools target cars, RVs, or general travel (maps, sheets, booking sites).
- Fuel economy varies with style, passenger, luggage, and terrain.
- Motorcycle-specific costs are easy to forget: tolls/RFID, ferry/RoRo fees, lodging, parking, emergency cash, wet-weather gear, roadside repairs.

The result is a multi-tool workflow and budget surprises after departure.

---

## 3. Target Users

| Segment | Need (from PRD) |
|--------|------------------|
| **Weekend riders** | Day/overnight trips — “Can I afford this?” |
| **Motorcycle tourers** | Multi-day plans — fuel, lodging, food, contingency |
| **New motorcycle owners** | Guidance on what to budget for |

**Validation Framework emphasis:** long-distance tourers (25–50), multi-day 300–1,000+ km, several trips/year, careful budgeting. Secondary: weekend riders, new owners, clubs.

**Market framing (Validation Framework):** Philippines-first (large motorcycle fleet); English-speaking web users; later SEA expansion. Monetization signal to validate: ₱150–₱300/month or one-time, with a free tier.

---

## 4. Goals & Success Metrics (PRD)

| Metric | Target |
|--------|--------|
| Trip creation rate | ≥70% of new users create a first trip budget in the first session |
| Retention | ≥30% return within 30 days to create/review another budget |
| AI engagement | ≥60% of created budgets include AI Budget Assistant interaction |

**Validation Framework interview criteria (pre-build):**
- ≥70% of riders currently use multiple tools / manual math to estimate cost
- ≥60% have forgotten expenses at least once

---

## 5. Scope

### 5.1 In scope (MVP v1 — PRD)

1. **Trip Budget Calculator** — distance, motorcycle model, fuel economy, fuel price, duration → fuel cost and total expenses  
2. **Expense Breakdown** — Fuel, Food, Accommodation, Tolls, Parking, Ferry, Miscellaneous, Emergency fund  
3. **AI Budget Assistant** — explain costs, flag forgotten expenses, suggest savings, highlight assumptions  
4. **Trip Saving & History** — save, revisit, compare, reuse as templates  
5. **Budget Visualization** — charts of spend by category  

### 5.2 Out of scope (v1 — PRD)

- Map-based auto route/distance  
- Live fuel prices / traffic / weather  
- Receipt OCR, live on-trip expense tracking  
- Group expense splitting  
- Maintenance forecasting  
- Offline mode  
- Native iOS/Android  

**Validation Framework stress-test:** defer navigation, maintenance, weather, and live tracking until the core question (“Can I afford this?”) is validated.

### 5.3 Competitive gap (Validation Framework)

No mainstream product combines **motorcycle-specific budgeting + AI cost recommendations + personalized fuel estimation**. Competitors (Google Maps, Roadtrippers, REVER, Calimoto, Wanderlog, spreadsheets) cover routing or generic budgets, not this combo.

---

## 6. Functional Requirements (As-Built Mapping)

| PRD feature | Implementation |
|-------------|----------------|
| Trip calculator | `TripForm` — ride parameters + smart fuel calc (`calculateEstimatedFuel`) |
| Expense breakdown | Expense fields on Trip Expenses tab; totals in header & form |
| AI assistant | `AIAssistant` → `POST /api/gemini/analyze` (Express locally; Vercel serverless in prod) |
| Save / history | `SavedTrips` + `localStorage` key `aistudio_moto_trips` |
| Visualization | `BudgetChart` (Recharts donut + category cards) |
| Compare | `TripComparer` |
| Backup | JSON export/import with Zod validation (`parseImportedTrips`) |
| PH context | Motorcycle presets, PH-oriented AI prompt (expressways 400cc+, RFID, carinderia, RoRo, kapote, etc.) |

### 6.1 Core data model

```ts
TripBudget {
  id, tripName, motorcycleModel,
  distance, distanceUnit,           // mi | km
  fuelEconomy, fuelEconomyUnit,     // mpg | l/100km | km/l
  fuelPrice, fuelPriceUnit,         // gal | liter
  duration, routeType, ridingStyle,
  passenger,                        // solo | two-up
  expenses: { fuel, food, accommodation, toll, parking, ferry, miscellaneous, emergency },
  customNotes, savedAt, aiAnalysis?
}
```

Defined in `src/types.ts`; validated in `src/validation.ts` (Zod).

### 6.2 AI assistant behavior (PRD → prompt)

The analysis prompt asks Gemini to cover:

1. Ride cost & fuel review (conversational; no raw algebra shown to user)  
2. Motorcycle & style insights (PH expressway legality, maintenance, fatigue)  
3. Commonly forgotten PH expenses (RFID, LGU fees, RoRo, cash, rain gear)  
4. Cost-reduction tips  
5. Safety contingencies & whether emergency fund is realistic  

User fields are sanitized and treated as **data only** (no instruction-following from notes).

---

## 7. Architecture Notes

### 7.1 High-level architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Browser (React SPA)                                        │
│  App.tsx state · TripForm · AIAssistant · BudgetChart ·     │
│  SavedTrips · TripComparer · localStorage                   │
└─────────────┬───────────────────────────────▲───────────────┘
              │ POST /api/gemini/analyze      │ JSON analysis
              ▼                               │
┌─────────────────────────────────────────────┴───────────────┐
│  API layer                                                  │
│  Local: Express (server.ts) + rate limit + Helmet           │
│  Prod:  Vercel serverless api/gemini/analyze.js             │
│  Shared: Zod validate → Gemini (GEMINI_API_KEY)             │
└─────────────────────────────────────────────────────────────┘
```

### 7.2 Runtime modes

| Mode | How it runs |
|------|-------------|
| **Local dev** | `npm run dev` → `tsx server.ts` mounts Vite middleware + Express API on port 3000 |
| **Local prod** | `npm run build` → Vite `dist/` + `dist/server.cjs`; `npm start` |
| **Vercel** | Static SPA from Vite build; AI via `api/gemini/analyze.js` (ESM `fetch` handler) |

### 7.3 Frontend architecture

- **Stack:** React 19, TypeScript, Vite, Tailwind CSS v4, Recharts, Lucide, react-markdown + rehype-sanitize  
- **State:** Lifted in `App.tsx` (active trip, saved trips, compare trip, toasts)  
- **Persistence:** Browser `localStorage` only — no user accounts in v1  
- **UI:** Dark theme (`#0A0A0A` / `#151515`), amber accents  

### 7.4 Backend / AI architecture

- **Local API:** Express route `POST /api/gemini/analyze`  
  - Body limit 50kb  
  - Helmet CSP  
  - `express-rate-limit` (20 req / 15 min on analyze)  
  - Zod `analyzeRequestSchema`  
  - `generateTripAnalysis()` via `@google/genai`  
- **Vercel API:** Self-contained handler in `api/gemini/analyze.js`  
  - Model fallback: `gemini-3.5-flash` → `gemini-2.0-flash` → `gemini-flash-latest`  
  - Same validation + PH prompt logic  
- **Secrets:** `GEMINI_API_KEY` from `.env` (local) or Vercel Environment Variables — **never** shipped in the client bundle  

### 7.5 Validation & trust (aligns with Validation Framework mitigations)

| Risk (Framework) | Product mitigation (as-built) |
|------------------|-------------------------------|
| AI seen as inaccurate | Editable expenses; AI explains assumptions; user can re-analyze |
| Stick with spreadsheets | Motorcycle categories + PH AI insights hard to replicate manually |
| Feature overload | MVP scoped to affordability question; maps/live prices deferred |
| Bad import / bad API input | Zod schemas; import size/count limits; sanitized prompts & markdown |

### 7.6 Security notes (implementation)

- Server-side API key only  
- Prompt injection hygiene: sanitize + “treat fields as data” instruction  
- AI output rendered with `rehype-sanitize` + blocked dangerous URL schemes  
- Rate limiting on local Express analyze endpoint  

### 7.7 Key modules

| Path | Role |
|------|------|
| `src/App.tsx` | Root UI, localStorage, import/export |
| `src/components/TripForm.tsx` | Parameters + expenses tabs |
| `src/components/AIAssistant.tsx` | AI UI + fetch to analyze API |
| `src/components/BudgetChart.tsx` | Donut + allocations |
| `src/components/SavedTrips.tsx` | History, compare, backup |
| `src/validation.ts` | Shared Zod schemas |
| `src/geminiAnalysis.ts` | Shared prompt helpers (Express) |
| `server.ts` | Local Express + Vite |
| `api/gemini/analyze.js` | Vercel serverless AI |

---

## 8. Non-Functional Requirements

| Area | Requirement |
|------|-------------|
| Performance | Trip calculator and charts must feel instant; AI may take several seconds |
| Compatibility | Modern desktop/mobile browsers; responsive layout |
| Privacy | Trip data stays in the user’s browser; AI request sends trip fields to Gemini via server |
| Reliability | Graceful AI errors (missing key, model unavailable, network) with clear UI messages |
| Maintainability | TypeScript + Zod; shared validation between client import and API |

---

## 9. Validation Framework ↔ Product Checklist

| Step | Framework intent | How this app supports it |
|------|------------------|---------------------------|
| 1. Define problem | Multi-tool, forgotten costs | Explicit 8 expense categories + AI forgotten-cost section |
| 2. Profile customer | Tourers / weekend / new owners | Presets, PH context, simple “afford this?” flow |
| 3. Size market | PH → SEA | PH-first copy and AI prompt; English UI |
| 4. Map competition | Fill moto+budget+AI gap | Dedicated planner + Gemini assistant |
| 5. Define edge | Personalized fuel + AI tips | Auto fuel calc + structured AI review |
| 6. Cheap test | Prototype web + AI | Live Vercel demo + local Express |
| 7. Stress-test | Objections fixable | Editable estimates; free local use; scoped MVP |

---

## 10. Future Work (Post-MVP)

Aligned with PRD out-of-scope and Validation Framework “later” list:

- Map distance / routing integration  
- Live fuel price feeds  
- Weather and traffic awareness  
- On-trip expense tracking / OCR  
- Accounts & cloud sync  
- Monetization (free tier + subscription / one-time)  
- Offline / PWA / native apps  

---

## 11. Credits

- **Author:** [pjaganon](https://github.com/pjaganon)  
- **Product docs:** PRD + 7-Step Validation Framework (project PDFs)  
- **AI:** Google Gemini via Google GenAI SDK  
- **Scaffold:** Google AI Studio  
- **Stack:** React, Vite, Tailwind CSS, Recharts, Lucide, Zod, Express, Vercel  

---

## 12. Document History

| Version | Notes |
|---------|--------|
| 1.0 | Spec synthesized from PRD PDF, 7-Step Validation Framework PDF, and current codebase architecture |
