# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**CESA Financial OS** — a personal finance operating system for an e-commerce owner (CESA Clothing, `cesaclothing.myshopify.com`). Combines store intelligence, cashflow forecasting, document management, and two AI agents (CFO + tax advisor). The core UX promise: 30 seconds daily to know if you're on track.

## Commands

```bash
npm run dev          # Dev server at localhost:3000
npm run build        # Production build
npm run lint         # ESLint
npm test             # Vitest unit/integration (jsdom)
npm run test:watch   # Vitest in watch mode
npx vitest run src/path/to/file.test.ts  # Single test file
npm run test:e2e     # Playwright E2E
npm run test:all     # Both suites
```

## Architecture

### Stack
- **Next.js 15** App Router, TypeScript, React 19
- **Styling:** Tailwind CSS + CSS Custom Properties for the CESA design system (4 themes, 3 density modes)
- **Charts:** Recharts (LineChart, BarChart, AreaChart) — not yet installed; add when building chart screens
- **UI components:** shadcn/ui (pre-installed in `src/components/ui/`) — always use these before creating custom components
- **Backend:** Supabase (PostgreSQL + Auth) — client in `src/lib/supabase.ts`, currently returns `null` placeholder until activated
- **AI agents:** Claude API (`claude-sonnet-4-5`), `max_tokens: 1024`
- **Fonts:** Geist Sans + Geist Mono via `next/font/google`

### Design System
The CESA design system lives entirely in CSS Custom Properties — **not** Tailwind utilities. The 4 themes (Linear dark, Bloomberg, Mercury light, Pipe light/warm) are applied by swapping `--c-*` token values on `:root`. Density (compact/regular/comfy) is controlled via `data-density` on `<html>`.

The canonical token and component reference is `source/src/styles.css` and `source/src/ui.jsx`. When building screens, transfer tokens from `source/src/styles.css` into `src/app/globals.css` — do not invent new CSS variables.

### Prototype Reference (`source/`)
The `source/` directory contains high-fidelity HTML prototypes — the single source of truth for layouts, component specs, data structures, and business logic formulas. Before building any screen:
1. Read the corresponding section of `README.md` for layout and component specs
2. Read `source/src/data.js` for the exact data shapes
3. Read the relevant `source/src/screens-*.jsx` for interaction logic

Prototypes use React via Babel in-browser (no build chain). All data is hardcoded in `source/src/data.js`. In the live app, data comes from external APIs.

### 12 Screens → Routes
| Route | Screen | Source file |
|---|---|---|
| `/dashboard` | Net Worth + Daily Check-in | `screens-core.jsx` |
| `/cashflow` | Cashflow Timeline | `screens-core.jsx` |
| `/forecast` | Forecast & Scenarios | `screens-core.jsx` |
| `/products` | Product Profitability | `screens-ops.jsx` |
| `/restocking` | Restocking Intelligence | `screens-ops.jsx` |
| `/documents` | Document Inbox (Gmail + upload) | `screens-ops.jsx` |
| `/cfo` | CFO Chat Agent | `screens-meta.jsx` |
| `/tax` | Tax Advisor Chat Agent | `screens-meta.jsx` |
| `/goals` | Goals & Waypoints | `screens-meta.jsx` |
| `/seasons` | Season Calendar | `screens-plan.jsx` |
| `/planning` | Annual Planning (Gantt) | `screens-plan.jsx` |
| `/reports` | Investor Reports (P&L, Bilanz) | `screens-plan.jsx` |

Navigation has two layouts: `sidebar` (248px fixed) and `topnav` — switchable at runtime via theme toggle.

### Data Flow
**Phase 1 (current):** Hardcoded mock data from `source/src/data.js` shapes — import as TypeScript constants.

**Phase 2 (API integration):**
- Shopify orders/products/inventory → `GET https://n8n.srv1240318.hstgr.cloud/shopify-proxy`
- Meta Ads ROAS/spend → `GET https://n8n.srv1240318.hstgr.cloud/meta-proxy`
- Documents/receipts → Gmail MCP Bridge + manual upload
- Financial records → lexoffice API
- Persistence → Supabase (PostgreSQL)

All external credentials go in `.env.local`. Required vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SHOPIFY_TOKEN`, `META_TOKEN`, `LEXOFFICE_TOKEN`, `ANTHROPIC_API_KEY`. See `.env.local.example`.

### AI Agent Pattern (CFO + Tax screens)
Both chat screens inject a system prompt with live store context, then stream Claude API responses. The prototype in `source/src/screens-meta.jsx` shows the exact system prompt template and message history structure to replicate.

### Feature Workflow
Features are tracked in `features/INDEX.md`. Use the project skills in order:
`/write-spec` → `/architecture` → `/frontend` → `/backend` → `/qa` → `/deploy`

Each skill reads `features/INDEX.md` at start and updates status when done. Never write code for a feature without a spec in `features/`.
