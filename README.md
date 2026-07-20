# MotoBudget AI

Philippine-focused motorcycle trip budget planner with an AI Budget Assistant powered by Google Gemini.

Plan fuel, food, lodging, tolls, ferry fees, and emergency funds for your ride — then get route-aware tips tailored to local roads, RFID tolls, and riding conditions.

**Live demo:** [motobudget-app-self.vercel.app](https://motobudget-app-self.vercel.app/)

---

## Features

- **Trip planner** — set bike model, distance, fuel economy, duration, route type, and riding style
- **Expense breakdown** — fuel (auto-calculated), food, lodging, tolls, parking, ferry, misc, and emergency fund
- **Budget chart** — donut visualization and category allocation cards
- **AI Budget Assistant** — Gemini-powered review with PH-specific advice (expressway rules, RFID, carinderias, RoRo, etc.)
- **Saved trips** — store trips in browser `localStorage`, compare two plans, export/import JSON backups
- **Motorcycle presets** — quick-fill common PH bikes (Click, NMAX, ADV, 450MT, Ninja 400, and more)

---

## Tech Stack

| Layer | Tools |
|--------|--------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4, Recharts, react-markdown |
| Backend (local) | Express (`server.ts`), Helmet, rate limiting, Zod validation |
| AI | Google GenAI SDK (`GEMINI_API_KEY`, server-side only) |
| Deploy | Vercel (static SPA + `/api/gemini/analyze` serverless function) |
| Storage | Client-side `localStorage` (`aistudio_moto_trips`) |

---

## Prerequisites

- [Node.js](https://nodejs.org/) 18+ (recommended: 20+)
- A Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey)

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy the example env file and add your key:

```bash
cp .env.example .env
```

Edit `.env`:

```env
GEMINI_API_KEY="your-gemini-api-key-here"
APP_URL="http://localhost:3000"
```

> Keys may start with `AQ.` (auth key) or `AIza` (legacy). Both work with this app.  
> Never commit `.env` — it is gitignored.

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

On Windows PowerShell, if `npm` fails with “Could not determine Node.js install directory”, use:

```powershell
npm.cmd run dev
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Express + Vite (port 3000) |
| `npm run build` | Build client (`dist/`) and bundle server |
| `npm run start` | Run production server (`dist/server.cjs`) |
| `npm run lint` | Typecheck with `tsc --noEmit` |

---

## Deploy on Vercel

1. Import this repo in [Vercel](https://vercel.com/).
2. Add Environment Variable **`GEMINI_API_KEY`** (Production + Preview if needed).
3. Deploy. The AI assistant calls `/api/gemini/analyze`.

After changing env vars, **redeploy** so the serverless function picks them up.

---

## How to Use

1. Fill in ride parameters (bike, distance, fuel, route, style).
2. Switch to **Trip Expenses** and adjust category budgets.
3. Click **Save Trip** to store the plan locally.
4. Use **Analyze My Budget** in the AI panel for a personalized review.
5. Compare saved trips or export/import a JSON backup anytime.

---

## Project Structure

```
├── api/                  # Vercel serverless routes
│   └── gemini/analyze.js
├── src/
│   ├── components/       # TripForm, AIAssistant, BudgetChart, etc.
│   ├── App.tsx
│   ├── types.ts
│   ├── validation.ts     # Shared Zod schemas
│   └── geminiAnalysis.ts # Shared prompt helpers (local server)
├── server.ts             # Express + Vite (local / Node production)
├── vercel.json
└── .env.example
```

---

## Security Notes

- `GEMINI_API_KEY` is used only on the server / Vercel function — never bundled into the client.
- AI markdown output is sanitized with `rehype-sanitize` before rendering.
- Import backups are size-limited and validated with Zod.

---

## Credits

- **Author:** [pjaganon](https://github.com/pjaganon)
- **AI:** [Google Gemini](https://ai.google.dev/) via the [Google GenAI SDK](https://github.com/googleapis/js-genai)
- **Prototype / AI Studio:** Built from a [Google AI Studio](https://aistudio.google.com/) app scaffold
- **UI & tooling:** [React](https://react.dev/), [Vite](https://vitejs.dev/), [Tailwind CSS](https://tailwindcss.com/), [Recharts](https://recharts.org/), [Lucide](https://lucide.dev/), [Zod](https://zod.dev/)
- **Hosting:** [Vercel](https://vercel.com/)

---

## License

Project source includes Apache-2.0 SPDX headers on source files. See individual file headers for details.
