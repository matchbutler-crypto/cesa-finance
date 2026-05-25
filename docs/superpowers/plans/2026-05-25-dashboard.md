# Dashboard Screen Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the CESA Financial OS Dashboard screen at `/dashboard` as a pixel-accurate Next.js App Router page using SVG charts and the CESA design system.

**Architecture:** A route group `(app)` holds the shared app shell (sidebar + main area). The dashboard page is a server component that passes mock data to client sub-components. All charts are pure SVG translated from `source/src/charts.jsx` — no Recharts. The CESA design system (CSS Custom Properties, 4 themes, 3 density modes) is added to `globals.css` alongside existing shadcn variables.

**Tech Stack:** Next.js 15 App Router, TypeScript, Tailwind CSS (utility-only for layout helpers), CSS Custom Properties for design tokens, Vitest + React Testing Library, `next/font/google` (Geist + Geist Mono)

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `src/app/globals.css` | Modify | Add all CESA CSS Custom Properties, 4 themes, density system, utility classes |
| `src/app/layout.tsx` | Modify | Load Geist + Geist Mono fonts, set `data-theme` default |
| `src/app/page.tsx` | Modify | Redirect to `/dashboard` |
| `src/lib/types.ts` | Create | TypeScript interfaces (NetWorth, Product, Ads, CashflowEntry, Goal, Document) |
| `src/lib/mock-data.ts` | Create | All demo data as typed TS constants (from `source/src/data.js`) |
| `src/lib/formatters.ts` | Create | `fmtEur`, `fmtNum`, `fmtPct`, `fmtDate` |
| `src/lib/formatters.test.ts` | Create | Unit tests for formatters |
| `src/components/cesa/primitives.tsx` | Create | `Panel`, `Stat`, `Tag`, `StatusDot`, `Sparkline`, `Progress`, `SectionLabel` |
| `src/components/cesa/charts.tsx` | Create | `NetWorthChart`, `MiniBars` SVG components |
| `src/components/cesa/charts.test.tsx` | Create | Render tests for chart components |
| `src/components/cesa/sidebar.tsx` | Create | Sidebar navigation (client component) |
| `src/app/(app)/layout.tsx` | Create | App shell: sidebar + `<main>` wrapper |
| `src/app/(app)/dashboard/page.tsx` | Create | Dashboard screen (server component) |
| `src/app/(app)/dashboard/_components/NetWorthHero.tsx` | Create | Hero card with NetWorthChart |
| `src/app/(app)/dashboard/_components/KpiCard.tsx` | Create | KPI card with sparkline |
| `src/app/(app)/dashboard/_components/DailyCheckin.tsx` | Create | 2×3 check-in grid |
| `src/app/(app)/dashboard/_components/AlertList.tsx` | Create | Alert list with StatusDot |

---

## Task 1: Design System — globals.css + Fonts + Layout

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Add CESA CSS Custom Properties to globals.css**

Append to the end of `src/app/globals.css` (keep all existing shadcn vars intact):

```css
/* ═══════════════════════════════
   CESA Design System
   ═══════════════════════════════ */

:root {
  --c-bg: #0B0D10;
  --c-surface: #13161B;
  --c-surface2: #191D24;
  --c-surface3: #1F2530;
  --c-border: #232A35;
  --c-borderStrong: #2E3744;
  --c-text: #E6E8EB;
  --c-textStrong: #F5F6F7;
  --c-muted: #8089A0;
  --c-subtle: #5C6675;
  --c-accent: #7BA7D9;
  --c-positive: #5FB477;
  --c-warning: #D4A24C;
  --c-danger: #C26B6B;
  --c-overlay: rgba(255,255,255,0.04);
  --c-grid: rgba(255,255,255,0.04);

  --r-sm: 4px;
  --r-md: 6px;
  --r-lg: 8px;

  --gap-x: 14px;
  --gap-y: 14px;
  --pad: 14px;
  --pad-sm: 10px;
  --row-h: 32px;
  --fs-base: 13px;
  --fs-sm: 11.5px;
  --fs-xs: 10.5px;
  --fs-h1: 22px;

  --font-sans: var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif;
  --font-mono: var(--font-geist-mono), ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
}

[data-theme="bloomberg"] {
  --c-bg: #000000; --c-surface: #0A0A0A; --c-surface2: #121212; --c-surface3: #1A1A1A;
  --c-border: #222222; --c-borderStrong: #333333; --c-text: #FFB800; --c-textStrong: #FFCB47;
  --c-muted: #8A6A1F; --c-subtle: #5A4615; --c-accent: #4AA8FF;
  --c-positive: #00C853; --c-warning: #FFB800; --c-danger: #FF3838;
  --c-overlay: rgba(255,184,0,0.06); --c-grid: rgba(255,184,0,0.08);
}
[data-theme="mercury"] {
  --c-bg: #FAFAF8; --c-surface: #FFFFFF; --c-surface2: #F4F4F1; --c-surface3: #EBEBE6;
  --c-border: #E3E3DD; --c-borderStrong: #CFCFC7; --c-text: #1F2024; --c-textStrong: #0A0B0E;
  --c-muted: #6E7280; --c-subtle: #9A9DA5; --c-accent: #3B5BDB;
  --c-positive: #1F8A5B; --c-warning: #B07A1E; --c-danger: #B83A3A;
  --c-overlay: rgba(0,0,0,0.025); --c-grid: rgba(0,0,0,0.06);
}
[data-theme="pipe"] {
  --c-bg: #F4F1EA; --c-surface: #FBF9F4; --c-surface2: #EEEAE0; --c-surface3: #E4DFD2;
  --c-border: #DCD5C6; --c-borderStrong: #C6BDA8; --c-text: #1F1B14; --c-textStrong: #0C0A06;
  --c-muted: #7A7060; --c-subtle: #A39782; --c-accent: #3F5C40;
  --c-positive: #3F5C40; --c-warning: #A87A1F; --c-danger: #9B3B2A;
  --c-overlay: rgba(0,0,0,0.025); --c-grid: rgba(0,0,0,0.05);
}

[data-density="compact"] {
  --gap-x: 10px; --gap-y: 10px; --pad: 10px; --pad-sm: 8px;
  --row-h: 28px; --fs-base: 12px; --fs-sm: 10.5px; --fs-xs: 10px; --fs-h1: 20px;
}
[data-density="comfy"] {
  --gap-x: 18px; --gap-y: 18px; --pad: 18px; --pad-sm: 14px;
  --row-h: 38px; --fs-base: 14px; --fs-sm: 12.5px; --fs-xs: 11px; --fs-h1: 26px;
}

/* ── Typography utilities ── */
.cesa-mono { font-family: var(--font-mono); font-variant-numeric: tabular-nums; letter-spacing: -0.01em; }
.cesa-muted { color: var(--c-muted); }
.cesa-subtle { color: var(--c-subtle); }
.cesa-strong { color: var(--c-textStrong); font-weight: 600; }
.cesa-pos { color: var(--c-positive); }
.cesa-neg { color: var(--c-danger); }

/* ── App shell ── */
.cesa-app {
  display: grid;
  grid-template-columns: 248px 1fr;
  min-height: 100vh;
  background: var(--c-bg);
  color: var(--c-text);
  font-family: var(--font-sans);
  font-size: var(--fs-base);
  line-height: 1.45;
  -webkit-font-smoothing: antialiased;
}
.cesa-main { padding: 22px 26px 80px; min-width: 0; max-width: 100%; }
[data-density="compact"] .cesa-main { padding: 14px 18px 60px; }
[data-density="comfy"] .cesa-main { padding: 28px 34px 100px; }

/* ── Sidebar ── */
.cesa-sidebar {
  background: var(--c-surface);
  border-right: 1px solid var(--c-border);
  display: flex; flex-direction: column;
  height: 100vh; position: sticky; top: 0;
}
.cesa-sidebar__brand {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px; border-bottom: 1px solid var(--c-border);
}
.cesa-brand { display: flex; align-items: center; gap: 10px; }
.cesa-brand__mark {
  width: 26px; height: 26px; display: grid; place-items: center;
  background: var(--c-textStrong); color: var(--c-bg);
  font-family: var(--font-mono); font-weight: 700; font-size: 13px;
  border-radius: var(--r-sm);
}
.cesa-brand__name { font-weight: 600; font-size: 12.5px; letter-spacing: -0.005em; color: var(--c-textStrong); }
.cesa-brand__sub { font-size: 10.5px; font-family: var(--font-mono); color: var(--c-muted); }

.cesa-nav { flex: 1; overflow-y: auto; padding: 8px 0; }
.cesa-nav ul { list-style: none; margin: 0; padding: 0; }
.cesa-nav__section + .cesa-nav__section { margin-top: 4px; }
.cesa-nav__hd {
  text-transform: uppercase; font-size: 10px; letter-spacing: 0.08em;
  color: var(--c-subtle); padding: 12px 18px 6px;
}
.cesa-nav__b {
  display: flex; flex-direction: column; align-items: flex-start;
  width: 100%; background: transparent; border: 0; border-left: 2px solid transparent;
  color: var(--c-text); padding: 6px 18px; text-align: left; cursor: pointer;
  font: inherit; font-size: inherit;
}
.cesa-nav__b:hover { background: var(--c-overlay); }
.cesa-nav__b.is-active { background: var(--c-surface2); border-left-color: var(--c-text); color: var(--c-textStrong); }
.cesa-nav__lbl { font-size: 12.5px; font-weight: 500; }
.cesa-nav__hint { font-size: 10.5px; color: var(--c-muted); }

.cesa-sidebar__foot { border-top: 1px solid var(--c-border); padding: 10px 14px; }
.cesa-userchip { display: flex; align-items: center; gap: 10px; }
.cesa-userchip__avatar {
  width: 24px; height: 24px; background: var(--c-surface3); color: var(--c-text);
  display: grid; place-items: center; border-radius: 999px;
  font-family: var(--font-mono); font-size: 11px; border: 1px solid var(--c-border);
}
.cesa-userchip__name { font-size: 12px; font-weight: 500; }
.cesa-userchip__sub { font-size: 10.5px; font-family: var(--font-mono); color: var(--c-muted); }

/* ── Page head ── */
.cesa-pagehead {
  display: flex; align-items: flex-end; justify-content: space-between;
  margin-bottom: 18px; gap: 16px;
}
.cesa-pagehead__eyebrow {
  text-transform: uppercase; letter-spacing: 0.08em;
  font-size: 10.5px; color: var(--c-muted); font-family: var(--font-mono); margin-bottom: 4px;
}
.cesa-pagehead__title {
  font-size: var(--fs-h1); font-weight: 600; margin: 0;
  letter-spacing: -0.015em; color: var(--c-textStrong);
}

/* ── Buttons ── */
.cesa-btn {
  background: var(--c-surface2); border: 1px solid var(--c-border); color: var(--c-text);
  padding: 6px 12px; font: inherit; font-size: 12px; border-radius: var(--r-sm);
  cursor: pointer; display: inline-flex; align-items: center; gap: 6px;
}
.cesa-btn:hover { border-color: var(--c-borderStrong); background: var(--c-surface3); }
.cesa-btn--ghost { background: transparent; }
.cesa-btn--sm { padding: 3px 8px; font-size: 11px; }

/* ── Panel ── */
.cesa-panel {
  background: var(--c-surface); border: 1px solid var(--c-border);
  border-radius: var(--r-md); min-width: 0;
}
.cesa-panel__hd {
  display: flex; align-items: flex-start; justify-content: space-between;
  padding: var(--pad) var(--pad) var(--pad-sm); border-bottom: 1px solid var(--c-border); gap: 10px;
}
.cesa-panel__title { font-size: 12.5px; font-weight: 600; margin: 0; color: var(--c-textStrong); letter-spacing: -0.005em; }
.cesa-panel__sub { font-size: 11px; color: var(--c-muted); margin-top: 2px; font-family: var(--font-mono); }
.cesa-panel__body { padding: var(--pad); }

/* ── Grids ── */
.cesa-grid { display: grid; gap: var(--gap-x); margin-bottom: var(--gap-y); }
.cesa-grid--hero { grid-template-columns: 1fr; }
.cesa-grid--4 { grid-template-columns: repeat(4, 1fr); }
.cesa-grid--3-2 { grid-template-columns: 3fr 2fr; }

/* ── Hero ── */
.cesa-panel--hero { background: var(--c-surface); }
.cesa-panel--hero .cesa-panel__body { padding: var(--pad) calc(var(--pad) + 6px); }
.cesa-hero {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 22px; align-items: center;
  padding: 6px 0 18px; border-bottom: 1px solid var(--c-border);
}
.cesa-hero__label {
  text-transform: uppercase; letter-spacing: 0.08em;
  font-size: 10.5px; color: var(--c-muted); font-family: var(--font-mono); margin-bottom: 4px;
}
.cesa-hero__value {
  font-family: var(--font-mono); font-weight: 600; font-size: 44px;
  letter-spacing: -0.02em; color: var(--c-textStrong); line-height: 1.05;
}
.cesa-hero__sub { display: flex; gap: 8px; align-items: baseline; margin-top: 6px; font-size: 12px; }
.cesa-hero__r { display: flex; align-items: center; justify-content: flex-end; }
.cesa-hero__projection { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; padding-top: 14px; }
.cesa-kv { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; padding: 5px 0; }
.cesa-kv > span { color: var(--c-muted); font-size: 11.5px; }
.cesa-kv > b { font-weight: 500; font-size: 12.5px; }

/* ── KPI Card ── */
.cesa-kpi {
  background: var(--c-surface); border: 1px solid var(--c-border);
  border-radius: var(--r-md); padding: var(--pad); display: flex; flex-direction: column; gap: 6px;
}
.cesa-kpi__top { display: flex; align-items: center; justify-content: space-between; }
.cesa-kpi__label {
  text-transform: uppercase; letter-spacing: 0.08em;
  font-size: 10.5px; color: var(--c-muted); font-family: var(--font-mono);
}
.cesa-kpi__value { font-size: 24px; font-weight: 600; color: var(--c-textStrong); letter-spacing: -0.015em; line-height: 1.1; }
.cesa-kpi__foot { display: flex; align-items: flex-end; justify-content: space-between; gap: 10px; margin-top: auto; }
.cesa-kpi__sub { font-size: 10.5px; color: var(--c-muted); margin-top: 2px; }

/* ── Delta ── */
.cesa-delta { font-family: var(--font-mono); font-size: 11.5px; font-weight: 500; }
.cesa-delta--pos { color: var(--c-positive); }
.cesa-delta--neg { color: var(--c-danger); }

/* ── Tag ── */
.cesa-tag {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 2px 7px; font-size: 10.5px; border-radius: 3px;
  font-family: var(--font-mono); letter-spacing: -0.005em;
  background: var(--c-surface3); color: var(--c-text); border: 1px solid var(--c-border);
}
.cesa-tag--pos { color: var(--c-positive); border-color: color-mix(in oklab, var(--c-positive) 25%, var(--c-border)); }
.cesa-tag--warn { color: var(--c-warning); border-color: color-mix(in oklab, var(--c-warning) 25%, var(--c-border)); }
.cesa-tag--neg { color: var(--c-danger); border-color: color-mix(in oklab, var(--c-danger) 25%, var(--c-border)); }
.cesa-tag__dot { width: 6px; height: 6px; border-radius: 999px; background: currentColor; }

/* ── Dot ── */
.cesa-dot { display: inline-block; border-radius: 999px; flex-shrink: 0; }
.cesa-dot--pos { background: var(--c-positive); }
.cesa-dot--warning { background: var(--c-warning); }
.cesa-dot--neg { background: var(--c-danger); }
.cesa-dot--info { background: var(--c-accent); }
.cesa-dot--neutral { background: var(--c-muted); }

/* ── Pill ── */
.cesa-pill {
  display: inline-block; padding: 1px 5px; font-family: var(--font-mono);
  font-size: 10px; letter-spacing: 0.02em; text-transform: uppercase;
  border-radius: 2px; background: var(--c-surface3); color: var(--c-muted); border: 1px solid var(--c-border);
}
.cesa-pill--liab { color: var(--c-danger); }

/* ── Table ── */
.cesa-tbl { width: 100%; border-collapse: collapse; font-size: 12px; }
.cesa-tbl th {
  text-align: left; text-transform: uppercase; letter-spacing: 0.06em;
  font-size: 10px; font-weight: 500; color: var(--c-muted);
  padding: 8px 8px; border-bottom: 1px solid var(--c-border);
}
.cesa-tbl td { padding: 7px 8px; border-bottom: 1px solid var(--c-border); vertical-align: middle; }
.cesa-tbl tr:last-child td { border-bottom: 0; }
.cesa-tbl td.r { text-align: right; }
.cesa-tbl__sum td {
  border-top: 1px solid var(--c-borderStrong); border-bottom: 0;
  font-weight: 500; background: var(--c-surface2);
}
.cesa-tbl__sum--strong td { background: var(--c-surface3); color: var(--c-textStrong); }
.cesa-tbl__liab td { color: var(--c-muted); }
.cesa-tbl__num { white-space: nowrap; }

/* ── Daily Check-in ── */
.cesa-checkin { display: flex; flex-direction: column; gap: 10px; }
.cesa-checkin__time { font-size: 26px; font-weight: 500; color: var(--c-muted); letter-spacing: -0.01em; }
.cesa-checkin__grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
.cesa-checkin__row {
  padding: 8px 10px; background: var(--c-surface2);
  border: 1px solid var(--c-border); border-radius: var(--r-sm);
}
.cesa-checkin__row.warn { border-color: color-mix(in oklab, var(--c-warning) 30%, var(--c-border)); }
.cesa-checkin__lbl { font-size: 10.5px; color: var(--c-muted); text-transform: uppercase; letter-spacing: 0.06em; }
.cesa-checkin__val { font-size: 16px; color: var(--c-textStrong); margin-top: 1px; }
.cesa-checkin__sub { font-size: 10.5px; color: var(--c-muted); margin-top: 2px; }
.cesa-checkin__verdict {
  display: flex; align-items: center; gap: 8px; padding: 10px 12px;
  background: color-mix(in oklab, var(--c-positive) 8%, var(--c-surface));
  border: 1px solid color-mix(in oklab, var(--c-positive) 25%, var(--c-border));
  border-radius: var(--r-sm); font-size: 12px; color: var(--c-textStrong);
}

/* ── Alerts ── */
.cesa-alerts { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 1px; }
.cesa-alert {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 12px; background: var(--c-surface2); border: 1px solid var(--c-border);
}
.cesa-alert:not(:first-child) { border-top: 0; }
.cesa-alert:first-child { border-top-left-radius: var(--r-sm); border-top-right-radius: var(--r-sm); }
.cesa-alert:last-child { border-bottom-left-radius: var(--r-sm); border-bottom-right-radius: var(--r-sm); }
.cesa-alert__body { flex: 1; min-width: 0; }
.cesa-alert__title { font-size: 12.5px; color: var(--c-textStrong); }
.cesa-alert__sub { font-size: 11px; color: var(--c-muted); margin-top: 1px; font-family: var(--font-mono); }

/* ── Charts ── */
.cesa-chart { width: 100%; height: auto; display: block; }
.cesa-chart__axis { font-family: var(--font-mono); font-size: 10px; fill: var(--c-muted); }
.cesa-sparkline { display: block; }
.cesa-minibars { display: block; }

/* ── Section label ── */
.cesa-seclabel {
  text-transform: uppercase; letter-spacing: 0.08em;
  font-size: 10px; color: var(--c-subtle); font-family: var(--font-mono);
  margin: 14px 0 8px; display: flex; justify-content: space-between;
}

/* ── Responsive ── */
@media (max-width: 1280px) {
  .cesa-grid--4 { grid-template-columns: repeat(2, 1fr); }
  .cesa-hero { grid-template-columns: 1fr; }
}
@media (max-width: 760px) {
  .cesa-app { grid-template-columns: 1fr; }
  .cesa-sidebar { position: static; height: auto; }
  .cesa-grid--3-2 { grid-template-columns: 1fr; }
}
```

- [ ] **Step 2: Update layout.tsx with Geist fonts**

Replace `src/app/layout.tsx`:

```tsx
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'CESA Financial OS',
  description: 'Personal Finance Operating System for CESA Clothing',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" data-theme="linear">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Step 3: Update root page.tsx to redirect to /dashboard**

Replace `src/app/page.tsx`:

```tsx
import { redirect } from 'next/navigation'

export default function Home() {
  redirect('/dashboard')
}
```

- [ ] **Step 4: Run dev server to verify no errors**

```bash
npm run dev
```

Expected: Server starts on localhost:3000, browser redirects to `/dashboard` (shows 404 — that's correct, route not built yet).

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css src/app/layout.tsx src/app/page.tsx
git commit -m "feat: add CESA design system tokens and font setup"
```

---

## Task 2: TypeScript Types + Mock Data

**Files:**
- Create: `src/lib/types.ts`
- Create: `src/lib/mock-data.ts`

- [ ] **Step 1: Create types.ts**

Create `src/lib/types.ts`:

```typescript
export interface Account {
  name: string
  kind: 'bank' | 'store' | 'paypal' | 'savings' | 'real'
  balance: number
  change: number
}

export interface Liability {
  name: string
  amount: number
  due: string
}

export interface NetWorth {
  total: number
  delta30d: number
  delta30dPct: number
  accounts: Account[]
  liabilities: Liability[]
  history: number[]
  forecast12m: number[]
}

export interface Forecast {
  target: number
  mtdRevenue: number
  daysElapsed: number
  daysInMonth: number
  dailyRunRate: number
  projectedMonthEnd: number
  daysToTarget: number
  daily: number[]
  lastMonth: number
  twoMonthsAgo: number
}

export interface Ads {
  todaySpend: number
  yesterdaySpend: number
  todayRevenue: number
  yesterdayRevenue: number
  roas: number
  roasYesterday: number
  roasLastWeek: number
  breakEvenRoas: number
  cpm: number
  ctr: number
  cpp: number
  status: 'green' | 'yellow' | 'red'
  spend7d: number[]
  revenue7d: number[]
}

export interface Product {
  sku: string
  name: string
  price: number
  cogs: number
  ads: number
  returns: number
  units: number
  stock: number
  leadTime: number
  revenue: number
  totalCogs: number
  totalAds: number
  totalReturns: number
  profit: number
  margin: number
  dailyRate: number
  daysToStockout: number
}

export type CashflowKind = 'payout' | 'ads' | 'supplier' | 'subscription' | 'rental' | 'income' | 'tax' | 'shipping'

export interface CashflowEntry {
  day: number
  label: string
  amount: number
  kind: CashflowKind
  projected?: boolean
}

export interface Goal {
  id: number
  label: string
  current: number
  target: number
  due: string
  unit: '€' | 'x' | '€/mo'
  kind: 'revenue' | 'roas' | 'savings' | 'passive'
  pace: 'on-track' | 'achieved' | 'behind'
}

export interface Document {
  id: number
  source: 'gmail' | 'upload'
  vendor: string
  amount: number
  date: string
  category: string
  status: 'auto' | 'pending' | 'confirmed'
  subject: string
}

export interface CesaData {
  netWorth: NetWorth
  forecast: Forecast
  ads: Ads
  products: Product[]
}
```

- [ ] **Step 2: Create mock-data.ts**

Create `src/lib/mock-data.ts`:

```typescript
import type { CesaData, Product } from './types'

const rawProducts = [
  { sku: 'HOD-CLS-BLK', name: 'Hoodie Classic Schwarz',  price: 69.90, cogs: 22.40, ads: 8.20,  returns: 4.10, units: 18, stock: 24, leadTime: 21 },
  { sku: 'HOD-CLS-GRY', name: 'Hoodie Classic Grau',      price: 69.90, cogs: 22.40, ads: 6.80,  returns: 3.50, units: 14, stock: 18, leadTime: 21 },
  { sku: 'HOD-OVS-BLK', name: 'Hoodie Oversize Schwarz',  price: 79.90, cogs: 26.10, ads: 12.40, returns: 6.20, units: 11, stock: 9,  leadTime: 21 },
  { sku: 'CRW-BLK',     name: 'Crewneck Schwarz',         price: 59.90, cogs: 19.80, ads: 5.20,  returns: 2.40, units: 9,  stock: 22, leadTime: 18 },
  { sku: 'TEE-BLK',     name: 'Tee Heavy Schwarz',        price: 34.90, cogs: 9.60,  ads: 3.10,  returns: 1.20, units: 22, stock: 48, leadTime: 14 },
  { sku: 'TEE-WHT',     name: 'Tee Heavy Weiß',           price: 34.90, cogs: 9.60,  ads: 2.40,  returns: 1.80, units: 16, stock: 34, leadTime: 14 },
  { sku: 'CAP-BSC',     name: 'Cap Basic',                price: 29.90, cogs: 7.20,  ads: 4.80,  returns: 2.10, units: 12, stock: 6,  leadTime: 12 },
  { sku: 'CAP-LOG',     name: 'Cap Logo Stick',           price: 32.90, cogs: 8.40,  ads: 3.60,  returns: 0.90, units: 8,  stock: 14, leadTime: 12 },
]

function computeProduct(p: typeof rawProducts[0]): Product {
  const revenue = p.price * p.units
  const totalCogs = p.cogs * p.units
  const totalAds = p.ads * p.units
  const totalReturns = p.returns * p.units
  const profit = revenue - totalCogs - totalAds - totalReturns
  const margin = profit / revenue
  const dailyRate = p.units / 25
  const daysToStockout = p.stock / Math.max(dailyRate, 0.01)
  return { ...p, revenue, totalCogs, totalAds, totalReturns, profit, margin, dailyRate, daysToStockout }
}

export const MOCK_DATA: CesaData = {
  netWorth: {
    total: 18420,
    delta30d: 1240,
    delta30dPct: 7.2,
    accounts: [
      { name: 'Geschäftskonto',      kind: 'bank',    balance: 4890, change:  320 },
      { name: 'Shopify Payout',      kind: 'store',   balance:  620, change: -180 },
      { name: 'PayPal Business',     kind: 'paypal',  balance:  312, change:   44 },
      { name: 'Tagesgeld Rücklage',  kind: 'savings', balance: 3000, change:    0 },
      { name: 'Privatkonto',         kind: 'bank',    balance: 1198, change:   95 },
      { name: 'Immobilie (Anteil)',  kind: 'real',    balance: 8400, change:    0 },
    ],
    liabilities: [
      { name: 'Lieferant Müller (offen)', amount: 280, due: '2026-05-28' },
      { name: 'Meta Ads (akkumuliert)',   amount: 142, due: '2026-06-01' },
    ],
    history:    [14820, 15010, 15240, 15680, 15940, 16210, 16480, 16820, 17100, 17380, 17680, 18420],
    forecast12m:[18420, 18760, 19120, 19490, 19880, 20290, 20720, 21180, 21650, 22150, 22680, 23230],
  },
  forecast: {
    target: 3500,
    mtdRevenue: 2847,
    daysElapsed: 25,
    daysInMonth: 31,
    dailyRunRate: 113.9,
    projectedMonthEnd: 3530,
    daysToTarget: 5.7,
    daily: [94,128,76,142,188,102,88,156,134,98,176,84,110,92,124,142,96,168,130,102,88,154,92,116,137],
    lastMonth: 3120,
    twoMonthsAgo: 2840,
  },
  ads: {
    todaySpend: 48, yesterdaySpend: 42,
    todayRevenue: 137, yesterdayRevenue: 116,
    roas: 2.85, roasYesterday: 2.76, roasLastWeek: 2.42, breakEvenRoas: 2.5,
    cpm: 8.40, ctr: 1.8, cpp: 16.80, status: 'green',
    spend7d:   [38, 42, 45, 48, 44, 42, 48],
    revenue7d: [102,116,128,142,122,116,137],
  },
  products: rawProducts.map(computeProduct),
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/lib/types.ts src/lib/mock-data.ts
git commit -m "feat: add TypeScript types and mock data"
```

---

## Task 3: Formatters (TDD)

**Files:**
- Create: `src/lib/formatters.ts`
- Create: `src/lib/formatters.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/lib/formatters.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { fmtEur, fmtNum, fmtPct, fmtDate } from './formatters'

describe('fmtEur', () => {
  it('formats positive number without sign', () => {
    expect(fmtEur(1234)).toBe('€1.234')
  })
  it('formats negative number with minus sign', () => {
    expect(fmtEur(-280)).toBe('−€280')
  })
  it('formats with sign option for positive', () => {
    expect(fmtEur(1240, { sign: true })).toBe('+€1.240')
  })
  it('formats with sign option for negative', () => {
    expect(fmtEur(-142, { sign: true })).toBe('−€142')
  })
  it('returns em dash for null/undefined', () => {
    expect(fmtEur(null as unknown as number)).toBe('—')
  })
  it('formats with decimals', () => {
    expect(fmtEur(18.5, { decimals: 2 })).toBe('€18,50')
  })
})

describe('fmtNum', () => {
  it('formats integer', () => {
    expect(fmtNum(2847)).toBe('2.847')
  })
  it('formats with suffix', () => {
    expect(fmtNum(2.85, { decimals: 2, suffix: 'x' })).toBe('2,85x')
  })
})

describe('fmtPct', () => {
  it('formats percentage', () => {
    expect(fmtPct(7.2)).toBe('7,2%')
  })
  it('formats with sign for positive', () => {
    expect(fmtPct(7.2, { sign: true })).toBe('+7,2%')
  })
  it('formats with sign for negative', () => {
    expect(fmtPct(-3.1, { sign: true })).toBe('-3,1%')
  })
})

describe('fmtDate', () => {
  it('formats ISO date string', () => {
    expect(fmtDate('2026-05-28')).toMatch(/28\. Mai/)
  })
  it('returns em dash for null', () => {
    expect(fmtDate(null)).toBe('—')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run src/lib/formatters.test.ts
```

Expected: FAIL — "Cannot find module './formatters'"

- [ ] **Step 3: Implement formatters.ts**

Create `src/lib/formatters.ts`:

```typescript
export function fmtEur(n: number | null | undefined, opts: { sign?: boolean; decimals?: number } = {}): string {
  const { sign = false, decimals = 0 } = opts
  if (n == null || isNaN(n)) return '—'
  const abs = Math.abs(n)
  const s = abs.toLocaleString('de-DE', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
  const prefix = sign ? (n > 0 ? '+' : n < 0 ? '−' : '') : (n < 0 ? '−' : '')
  return `${prefix}€${s}`
}

export function fmtNum(n: number | null | undefined, opts: { decimals?: number; suffix?: string } = {}): string {
  const { decimals = 0, suffix = '' } = opts
  if (n == null || isNaN(n)) return '—'
  return n.toLocaleString('de-DE', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix
}

export function fmtPct(n: number | null | undefined, opts: { decimals?: number; sign?: boolean } = {}): string {
  const { decimals = 1, sign = false } = opts
  if (n == null || isNaN(n)) return '—'
  const v = n.toLocaleString('de-DE', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
  return (sign && n > 0 ? '+' : '') + v + '%'
}

export function fmtDate(d: string | Date | null | undefined): string {
  if (!d) return '—'
  const date = typeof d === 'string' ? new Date(d) : d
  return date.toLocaleDateString('de-DE', { day: '2-digit', month: 'long' })
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
npx vitest run src/lib/formatters.test.ts
```

Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/formatters.ts src/lib/formatters.test.ts
git commit -m "feat: add CESA formatters (fmtEur, fmtNum, fmtPct, fmtDate)"
```

---

## Task 4: Primitive UI Components

**Files:**
- Create: `src/components/cesa/primitives.tsx`

- [ ] **Step 1: Create primitives.tsx**

Create `src/components/cesa/primitives.tsx`:

```tsx
import type { ReactNode, CSSProperties } from 'react'

// ── Panel ──────────────────────────────────────────────────
interface PanelProps {
  title?: string
  subtitle?: string
  action?: ReactNode
  children: ReactNode
  dense?: boolean
  style?: CSSProperties
  className?: string
}
export function Panel({ title, subtitle, action, children, dense, style, className = '' }: PanelProps) {
  return (
    <section className={`cesa-panel ${dense ? 'cesa-panel--dense' : ''} ${className}`} style={style}>
      {(title || action) && (
        <header className="cesa-panel__hd">
          <div>
            {title && <h3 className="cesa-panel__title">{title}</h3>}
            {subtitle && <div className="cesa-panel__sub">{subtitle}</div>}
          </div>
          {action && <div>{action}</div>}
        </header>
      )}
      <div className="cesa-panel__body">{children}</div>
    </section>
  )
}

// ── Tag ────────────────────────────────────────────────────
type TagKind = 'pos' | 'warn' | 'neg' | 'neutral'
interface TagProps { children: ReactNode; kind?: TagKind; dot?: boolean }
export function Tag({ children, kind = 'neutral', dot = false }: TagProps) {
  return (
    <span className={`cesa-tag cesa-tag--${kind}`}>
      {dot && <span className="cesa-tag__dot" />}
      {children}
    </span>
  )
}

// ── StatusDot ──────────────────────────────────────────────
type DotKind = 'pos' | 'warning' | 'neg' | 'info' | 'neutral'
interface StatusDotProps { kind?: DotKind; size?: number }
export function StatusDot({ kind = 'neutral', size = 8 }: StatusDotProps) {
  return <span className={`cesa-dot cesa-dot--${kind}`} style={{ width: size, height: size }} />
}

// ── Sparkline ──────────────────────────────────────────────
interface SparklineProps {
  data: number[]
  width?: number
  height?: number
  stroke?: string
  fill?: string
  strokeWidth?: number
}
export function Sparkline({ data, width = 80, height = 22, stroke, fill, strokeWidth = 1.25 }: SparklineProps) {
  if (!data || data.length < 2) return null
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const stepX = width / (data.length - 1)
  const points = data.map((v, i) => {
    const x = i * stepX
    const y = height - ((v - min) / range) * (height - 2) - 1
    return [x, y]
  })
  const path = points.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(' ')
  const area = `${path} L${width},${height} L0,${height} Z`
  return (
    <svg width={width} height={height} className="cesa-sparkline">
      {fill && <path d={area} fill={fill} />}
      <path d={path} fill="none" stroke={stroke || 'currentColor'} strokeWidth={strokeWidth} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

// ── Progress ───────────────────────────────────────────────
interface ProgressProps { value: number; max?: number; kind?: 'pos' | 'warn' | 'neg' | 'neutral'; height?: number }
export function Progress({ value, max = 100, kind = 'neutral', height = 4 }: ProgressProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  return (
    <div className="progress" style={{ height }}>
      <div className={`progress__fill progress__fill--${kind}`} style={{ width: `${pct}%` }} />
    </div>
  )
}

// ── SectionLabel ───────────────────────────────────────────
interface SectionLabelProps { children: ReactNode; right?: ReactNode }
export function SectionLabel({ children, right }: SectionLabelProps) {
  return (
    <div className="cesa-seclabel">
      <span>{children}</span>
      {right && <span>{right}</span>}
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/cesa/primitives.tsx
git commit -m "feat: add CESA primitive UI components"
```

---

## Task 5: SVG Charts

**Files:**
- Create: `src/components/cesa/charts.tsx`
- Create: `src/components/cesa/charts.test.tsx`

- [ ] **Step 1: Write failing tests**

Create `src/components/cesa/charts.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { NetWorthChart, MiniBars } from './charts'

const history    = [14820, 15010, 15240, 15680, 15940, 16210, 16480, 16820, 17100, 17380, 17680, 18420]
const forecast12m = [18420, 18760, 19120, 19490, 19880, 20290, 20720, 21180, 21650, 22150, 22680, 23230]

describe('NetWorthChart', () => {
  it('renders an SVG element', () => {
    const { container } = render(<NetWorthChart history={history} forecast={forecast12m} />)
    expect(container.querySelector('svg')).not.toBeNull()
  })

  it('renders history and forecast paths', () => {
    const { container } = render(<NetWorthChart history={history} forecast={forecast12m} />)
    const paths = container.querySelectorAll('path')
    expect(paths.length).toBeGreaterThanOrEqual(2)
  })

  it('renders axis labels', () => {
    const { getByText } = render(<NetWorthChart history={history} forecast={forecast12m} />)
    expect(getByText('heute')).toBeDefined()
    expect(getByText('−12M')).toBeDefined()
    expect(getByText('+12M')).toBeDefined()
  })
})

describe('MiniBars', () => {
  it('renders correct number of bars', () => {
    const data = [38, 42, 45, 48, 44, 42, 48]
    const { container } = render(<MiniBars data={data} />)
    const rects = container.querySelectorAll('rect')
    expect(rects.length).toBe(7)
  })

  it('renders nothing for empty data', () => {
    const { container } = render(<MiniBars data={[]} />)
    expect(container.querySelector('svg')).toBeNull()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run src/components/cesa/charts.test.tsx
```

Expected: FAIL — "Cannot find module './charts'"

- [ ] **Step 3: Implement charts.tsx**

Create `src/components/cesa/charts.tsx`:

```tsx
interface NetWorthChartProps {
  history: number[]
  forecast: number[]
  width?: number
  height?: number
}

export function NetWorthChart({ history, forecast, width = 520, height = 140 }: NetWorthChartProps) {
  const padL = 8, padR = 8, padT = 8, padB = 18
  const W = width - padL - padR
  const H = height - padT - padB
  const all = [...history, ...forecast.slice(1)]
  const min = Math.min(...all) * 0.95
  const max = Math.max(...all) * 1.02
  const range = max - min || 1
  const sx = (i: number) => padL + (i / (all.length - 1)) * W
  const sy = (v: number) => padT + H - ((v - min) / range) * H

  const histPath = history.map((v, i) => `${i === 0 ? 'M' : 'L'}${sx(i)},${sy(v)}`).join(' ')
  const fcPath = forecast.map((v, i) => `${i === 0 ? 'M' : 'L'}${sx(history.length - 1 + i)},${sy(v)}`).join(' ')
  const histArea = `${histPath} L${sx(history.length - 1)},${padT + H} L${sx(0)},${padT + H} Z`

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="cesa-chart" preserveAspectRatio="none">
      <path d={histArea} fill="var(--c-text)" opacity="0.06" />
      <path d={histPath} fill="none" stroke="var(--c-text)" strokeWidth="1.5" />
      <path d={fcPath} fill="none" stroke="var(--c-accent)" strokeWidth="1.5" strokeDasharray="3 3" />
      <circle cx={sx(history.length - 1)} cy={sy(history[history.length - 1])} r="3" fill="var(--c-text)" />
      <text x={padL} y={height - 4} className="cesa-chart__axis">−12M</text>
      <text x={sx(history.length - 1)} y={height - 4} textAnchor="middle" className="cesa-chart__axis">heute</text>
      <text x={width - padR} y={height - 4} textAnchor="end" className="cesa-chart__axis">+12M</text>
    </svg>
  )
}

interface MiniBarsProps {
  data: number[]
  width?: number
  height?: number
  kind?: 'pos' | 'neg' | 'neutral'
}

export function MiniBars({ data, width = 80, height = 28, kind = 'neutral' }: MiniBarsProps) {
  if (!data || !data.length) return null
  const max = Math.max(...data)
  const w = width / data.length
  const gap = Math.max(1, w * 0.2)
  const colorMap = { pos: 'var(--c-positive)', neg: 'var(--c-danger)', neutral: 'var(--c-muted)' }
  return (
    <svg width={width} height={height} className="cesa-minibars">
      {data.map((v, i) => {
        const h = (v / max) * (height - 2)
        return (
          <rect key={i} x={i * w + gap / 2} y={height - h} width={w - gap} height={h} fill={colorMap[kind]} />
        )
      })}
    </svg>
  )
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
npx vitest run src/components/cesa/charts.test.tsx
```

Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/cesa/charts.tsx src/components/cesa/charts.test.tsx
git commit -m "feat: add CESA SVG chart components (NetWorthChart, MiniBars)"
```

---

## Task 6: Sidebar + App Shell Layout

**Files:**
- Create: `src/components/cesa/sidebar.tsx`
- Create: `src/app/(app)/layout.tsx`

- [ ] **Step 1: Create sidebar.tsx**

Create `src/components/cesa/sidebar.tsx`:

```tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { section: 'Übersicht', items: [
    { id: 'dashboard',  label: 'Dashboard',     hint: 'Net Worth · Check-in', href: '/dashboard' },
    { id: 'cashflow',   label: 'Cashflow',       hint: 'Timeline · Engpässe', href: '/cashflow' },
    { id: 'forecast',   label: 'Forecast',       hint: 'Szenarien · Crystal Ball', href: '/forecast' },
  ]},
  { section: 'Operations', items: [
    { id: 'products',   label: 'Produkte',       hint: 'Profitabilität · Marge', href: '/products' },
    { id: 'restocking', label: 'Restocking',     hint: 'Bestand · Reorder', href: '/restocking' },
    { id: 'documents',  label: 'Documents',      hint: 'Gmail · Belege', href: '/documents' },
  ]},
  { section: 'Agenten', items: [
    { id: 'cfo',        label: 'CFO',            hint: 'Finanz-Agent', href: '/cfo' },
    { id: 'tax',        label: 'Steuerberater',  hint: 'Steuer-Agent', href: '/tax' },
  ]},
  { section: 'Planung', items: [
    { id: 'goals',      label: 'Ziele',          hint: 'Goals · Waypoints', href: '/goals' },
    { id: 'seasons',    label: 'Saisonkalender', hint: 'BFCM · Weihnachten', href: '/seasons' },
    { id: 'planning',   label: 'Jahresplanung',  hint: 'Soll-Ist · Quartale', href: '/planning' },
    { id: 'reports',    label: 'Reports',        hint: 'Investor · P&L', href: '/reports' },
  ]},
]

export function Sidebar() {
  const pathname = usePathname()
  return (
    <aside className="cesa-sidebar">
      <div className="cesa-sidebar__brand">
        <div className="cesa-brand">
          <div className="cesa-brand__mark">C</div>
          <div>
            <div className="cesa-brand__name">CESA Financial OS</div>
            <div className="cesa-brand__sub cesa-muted">cesaclothing.myshopify.com</div>
          </div>
        </div>
      </div>

      <nav className="cesa-nav">
        {NAV.map((section) => (
          <div key={section.section} className="cesa-nav__section">
            <div className="cesa-nav__hd">{section.section}</div>
            <ul>
              {section.items.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className={`cesa-nav__b ${pathname === item.href ? 'is-active' : ''}`}
                  >
                    <span className="cesa-nav__lbl">{item.label}</span>
                    <span className="cesa-nav__hint">{item.hint}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="cesa-sidebar__foot">
        <div className="cesa-userchip">
          <div className="cesa-userchip__avatar">E</div>
          <div>
            <div className="cesa-userchip__name">Easy</div>
            <div className="cesa-userchip__sub">Owner · Mai 2026</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
```

- [ ] **Step 2: Create app shell layout**

Create `src/app/(app)/layout.tsx`:

```tsx
import { Sidebar } from '@/components/cesa/sidebar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="cesa-app">
      <Sidebar />
      <main className="cesa-main">{children}</main>
    </div>
  )
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/cesa/sidebar.tsx src/app/'(app)'/layout.tsx
git commit -m "feat: add sidebar navigation and app shell layout"
```

---

## Task 7: Dashboard Screen

**Files:**
- Create: `src/app/(app)/dashboard/_components/NetWorthHero.tsx`
- Create: `src/app/(app)/dashboard/_components/KpiCard.tsx`
- Create: `src/app/(app)/dashboard/_components/DailyCheckin.tsx`
- Create: `src/app/(app)/dashboard/_components/AlertList.tsx`
- Create: `src/app/(app)/dashboard/page.tsx`

- [ ] **Step 1: Create NetWorthHero.tsx**

Create `src/app/(app)/dashboard/_components/NetWorthHero.tsx`:

```tsx
import { NetWorthChart } from '@/components/cesa/charts'
import { fmtEur, fmtPct } from '@/lib/formatters'
import type { NetWorth } from '@/lib/types'

const ACCOUNT_ABBREV: Record<string, string> = {
  bank: 'BNK', store: 'SHP', paypal: 'PP', savings: 'TG', real: 'IMO',
}

interface Props { netWorth: NetWorth }

export function NetWorthHero({ netWorth: nw }: Props) {
  const sumAssets = nw.accounts.reduce((s, a) => s + a.balance, 0)
  const sumChange = nw.accounts.reduce((s, a) => s + a.change, 0)

  return (
    <div className="cesa-grid cesa-grid--hero">
      <section className="cesa-panel cesa-panel--hero">
        <div className="cesa-panel__body">
          <div className="cesa-hero">
            <div>
              <div className="cesa-hero__label">Gesamtvermögen</div>
              <div className="cesa-hero__value cesa-mono">{fmtEur(nw.total)}</div>
              <div className="cesa-hero__sub">
                <span className="cesa-delta cesa-delta--pos">{fmtEur(nw.delta30d, { sign: true })}</span>
                <span className="cesa-muted">letzte 30 Tage · {fmtPct(nw.delta30dPct, { sign: true })}</span>
              </div>
            </div>
            <div className="cesa-hero__r">
              <NetWorthChart history={nw.history} forecast={nw.forecast12m} width={520} height={130} />
            </div>
          </div>

          <div className="cesa-hero__projection">
            <div className="cesa-kv">
              <span>Projektion 12M</span>
              <b className="cesa-mono">{fmtEur(nw.forecast12m[nw.forecast12m.length - 1])}</b>
            </div>
            <div className="cesa-kv">
              <span>Monatliches Wachstum</span>
              <b className="cesa-mono">{fmtEur(Math.round((nw.forecast12m[11] - nw.total) / 12))}</b>
            </div>
            <div className="cesa-kv">
              <span>Ziel Ø Wachstum</span>
              <b className="cesa-mono cesa-muted">{fmtEur(500)}</b>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
```

- [ ] **Step 2: Create KpiCard.tsx**

Create `src/app/(app)/dashboard/_components/KpiCard.tsx`:

```tsx
import type { ReactNode } from 'react'
import { StatusDot } from '@/components/cesa/primitives'

interface KpiCardProps {
  label: string
  value: string
  delta?: string
  deltaKind?: 'pos' | 'neg'
  sub?: string
  chart?: ReactNode
  status?: 'pos' | 'warning' | 'neg'
}

export function KpiCard({ label, value, delta, deltaKind = 'pos', sub, chart, status }: KpiCardProps) {
  return (
    <div className="cesa-kpi">
      <div className="cesa-kpi__top">
        <span className="cesa-kpi__label">{label}</span>
        {status && <StatusDot kind={status} />}
      </div>
      <div className="cesa-kpi__value cesa-mono">{value}</div>
      <div className="cesa-kpi__foot">
        <div>
          {delta && <span className={`cesa-delta cesa-delta--${deltaKind}`}>{delta}</span>}
          {sub && <div className="cesa-kpi__sub">{sub}</div>}
        </div>
        {chart && <div style={{ opacity: 0.85 }}>{chart}</div>}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create DailyCheckin.tsx**

Create `src/app/(app)/dashboard/_components/DailyCheckin.tsx`:

```tsx
import { StatusDot } from '@/components/cesa/primitives'
import { fmtEur } from '@/lib/formatters'
import type { NetWorth, Ads } from '@/lib/types'

interface Props { netWorth: NetWorth; ads: Ads }

export function DailyCheckin({ netWorth, ads }: Props) {
  const cashBalance = netWorth.accounts[0].balance + netWorth.accounts[1].balance
  const items = [
    { lbl: 'Orders gestern',  val: '4',                                        sub: '€204 GMV',           ok: true  },
    { lbl: 'Ad ROAS gestern', val: `${ads.roasYesterday.toFixed(2)}x`,          sub: `Break-even ${ads.breakEvenRoas}x`, ok: true  },
    { lbl: 'Cash heute',      val: fmtEur(cashBalance),                         sub: 'Konto + Shopify',    ok: true  },
    { lbl: 'Engpass-Risiko',  val: 'Keiner',                                   sub: 'Nächste 14 Tage',    ok: true  },
    { lbl: 'Belege offen',    val: '2',                                         sub: 'In Inbox',           ok: false },
    { lbl: 'Steuer-Fristen',  val: 'Keine',                                    sub: 'Diese Woche',        ok: true  },
  ]

  return (
    <div className="cesa-checkin">
      <div className="cesa-checkin__time cesa-mono">07:42</div>
      <div className="cesa-checkin__grid">
        {items.map((item) => (
          <div key={item.lbl} className={`cesa-checkin__row ${item.ok ? '' : 'warn'}`}>
            <div className="cesa-checkin__lbl">{item.lbl}</div>
            <div className="cesa-checkin__val cesa-mono">{item.val}</div>
            <div className="cesa-checkin__sub">{item.sub}</div>
          </div>
        ))}
      </div>
      <div className="cesa-checkin__verdict">
        <StatusDot kind="pos" size={10} />
        <span>Auf Kurs. Cap Basic heute nachbestellen.</span>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create AlertList.tsx**

Create `src/app/(app)/dashboard/_components/AlertList.tsx`:

```tsx
import { StatusDot } from '@/components/cesa/primitives'

type AlertKind = 'warn' | 'info' | 'ok'

interface Alert {
  kind: AlertKind
  title: string
  sub: string
  cta?: string
}

const dotKind = (kind: AlertKind) => {
  if (kind === 'warn') return 'warning' as const
  if (kind === 'ok')   return 'pos' as const
  return 'info' as const
}

const ALERTS: Alert[] = [
  { kind: 'warn', title: 'Cap Basic läuft in 5 Tagen aus', sub: 'Nachbestellen — Lieferzeit 12 Tage', cta: 'Bestellen' },
  { kind: 'info', title: 'Shopify Payout am 26.05.',       sub: 'Erwartet ~€290' },
  { kind: 'warn', title: 'Lieferant Müller fällig 28.05.', sub: '€280 — Cash reicht' },
  { kind: 'ok',   title: 'UStVA April eingereicht',        sub: 'Nächste Frist 10.06.' },
]

export function AlertList() {
  return (
    <ul className="cesa-alerts">
      {ALERTS.map((alert, i) => (
        <li key={i} className="cesa-alert">
          <StatusDot kind={dotKind(alert.kind)} />
          <div className="cesa-alert__body">
            <div className="cesa-alert__title">{alert.title}</div>
            <div className="cesa-alert__sub">{alert.sub}</div>
          </div>
          {alert.cta && (
            <button className="cesa-btn cesa-btn--ghost cesa-btn--sm">{alert.cta}</button>
          )}
        </li>
      ))}
    </ul>
  )
}
```

- [ ] **Step 5: Create dashboard page.tsx**

Create `src/app/(app)/dashboard/page.tsx`:

```tsx
import { MOCK_DATA } from '@/lib/mock-data'
import { Panel, Tag, Sparkline } from '@/components/cesa/primitives'
import { fmtEur, fmtPct } from '@/lib/formatters'
import { NetWorthHero } from './_components/NetWorthHero'
import { KpiCard } from './_components/KpiCard'
import { DailyCheckin } from './_components/DailyCheckin'
import { AlertList } from './_components/AlertList'

const ACCOUNT_ABBREV: Record<string, string> = {
  bank: 'BNK', store: 'SHP', paypal: 'PP', savings: 'TG', real: 'IMO',
}

export default function DashboardPage() {
  const { netWorth: nw, forecast, ads, products } = MOCK_DATA
  const savingsBalance = nw.accounts.find(a => a.kind === 'savings')?.balance ?? 0
  const bankBalance    = nw.accounts[0].balance
  const top3 = [...products].sort((a, b) => b.profit - a.profit).slice(0, 3)

  return (
    <div>
      {/* Page header */}
      <div className="cesa-pagehead">
        <div>
          <div className="cesa-pagehead__eyebrow">Mai 2026 · Tag 25/31</div>
          <h1 className="cesa-pagehead__title">Dashboard</h1>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="cesa-btn cesa-btn--ghost">Waypoint setzen</button>
          <button className="cesa-btn cesa-btn--ghost">Export</button>
        </div>
      </div>

      {/* Hero: Net Worth + 24M Chart */}
      <NetWorthHero netWorth={nw} />

      {/* Accounts + Daily Check-in */}
      <div className="cesa-grid cesa-grid--3-2" style={{ marginBottom: 'var(--gap-y)' }}>
        <Panel title="Kontensaldo" subtitle="Aufschlüsselung Vermögen" action={<Tag kind="neutral">{nw.accounts.length} Konten</Tag>}>
          <table className="cesa-tbl">
            <tbody>
              {nw.accounts.map((a) => (
                <tr key={a.name}>
                  <td style={{ width: 40 }}>
                    <span className="cesa-pill">{ACCOUNT_ABBREV[a.kind] ?? '—'}</span>
                  </td>
                  <td>{a.name}</td>
                  <td className="r cesa-tbl__num cesa-mono">{fmtEur(a.balance)}</td>
                  <td className="r cesa-tbl__num">
                    {a.change !== 0
                      ? <span className={`cesa-delta cesa-delta--${a.change > 0 ? 'pos' : 'neg'}`}>{fmtEur(a.change, { sign: true })}</span>
                      : <span className="cesa-muted">—</span>}
                  </td>
                </tr>
              ))}
              <tr className="cesa-tbl__sum">
                <td colSpan={2}>Summe Aktiva</td>
                <td className="r cesa-tbl__num cesa-mono">{fmtEur(nw.accounts.reduce((s, a) => s + a.balance, 0))}</td>
                <td className="r cesa-tbl__num">
                  <span className="cesa-delta cesa-delta--pos">
                    {fmtEur(nw.accounts.reduce((s, a) => s + a.change, 0), { sign: true })}
                  </span>
                </td>
              </tr>
              {nw.liabilities.map((l) => (
                <tr key={l.name} className="cesa-tbl__liab">
                  <td><span className="cesa-pill cesa-pill--liab">VBL</span></td>
                  <td>{l.name}</td>
                  <td className="r cesa-tbl__num cesa-mono">{fmtEur(-l.amount)}</td>
                  <td className="r cesa-tbl__num cesa-muted">fällig {l.due}</td>
                </tr>
              ))}
              <tr className="cesa-tbl__sum cesa-tbl__sum--strong">
                <td colSpan={2}>Nettovermögen</td>
                <td className="r cesa-tbl__num cesa-mono">{fmtEur(nw.total)}</td>
                <td />
              </tr>
            </tbody>
          </table>
        </Panel>

        <Panel title="Heute" subtitle="Daily Check-in · 30 Sekunden">
          <DailyCheckin netWorth={nw} ads={ads} />
        </Panel>
      </div>

      {/* KPI Cards */}
      <div className="cesa-grid cesa-grid--4" style={{ marginBottom: 'var(--gap-y)' }}>
        <KpiCard
          label="Umsatz MTD"
          value={fmtEur(forecast.mtdRevenue)}
          delta={fmtPct((forecast.mtdRevenue / forecast.lastMonth - 1) * 100, { sign: true })}
          deltaKind="pos"
          sub={`Ziel ${fmtEur(forecast.target)}`}
          chart={<Sparkline data={forecast.daily} width={92} height={28} stroke="var(--c-text)" />}
        />
        <KpiCard
          label="Projektion EOM"
          value={fmtEur(forecast.projectedMonthEnd)}
          delta={`+${(forecast.projectedMonthEnd - forecast.target).toFixed(0)} vs. Ziel`}
          deltaKind="pos"
          sub={`Run rate ${fmtEur(forecast.dailyRunRate, { decimals: 0 })}/Tag`}
        />
        <KpiCard
          label="Ad ROAS heute"
          value={`${ads.roas.toFixed(2)}x`}
          delta={`Break-even ${ads.breakEvenRoas}x`}
          deltaKind="pos"
          sub="Skalieren empfohlen"
          status="pos"
        />
        <KpiCard
          label="Cash Reserve"
          value={fmtEur(savingsBalance + bankBalance)}
          delta="≈ 38 Tage Fixkosten"
          deltaKind="pos"
          sub="Liquidität gesund"
        />
      </div>

      {/* Alerts + Top 3 Products */}
      <div className="cesa-grid cesa-grid--3-2" style={{ marginBottom: 'var(--gap-y)' }}>
        <Panel title="Aufmerksamkeit" subtitle="Was diese Woche zählt">
          <AlertList />
        </Panel>

        <Panel title="Top 3 Produkte" subtitle="Echter Profit (MTD)">
          <table className="cesa-tbl">
            <tbody>
              {top3.map((p) => (
                <tr key={p.sku}>
                  <td>
                    <div>{p.name}</div>
                    <div className="cesa-muted" style={{ fontSize: 10.5 }}>{p.sku} · {p.units} Stk</div>
                  </td>
                  <td className="r cesa-tbl__num cesa-mono">{fmtEur(p.profit, { decimals: 0 })}</td>
                  <td className="r">
                    <Tag kind={p.margin > 0.45 ? 'pos' : p.margin > 0.35 ? 'neutral' : 'warn'}>
                      {fmtPct(p.margin * 100, { decimals: 0 })}
                    </Tag>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Run dev server and verify dashboard renders**

```bash
npm run dev
```

Open `http://localhost:3000` — should redirect to `/dashboard` and show the dashboard with sidebar, hero card, KPI cards, accounts table, daily check-in, alerts, and top products.

- [ ] **Step 7: Run full test suite**

```bash
npm test
```

Expected: All tests pass.

- [ ] **Step 8: Commit**

```bash
git add src/app/'(app)'/dashboard/
git commit -m "feat(PROJ-1): dashboard screen with NetWorth hero, KPI cards, check-in, alerts"
```

---

## Self-Review

**Spec coverage check:**

| Spec requirement | Task |
|---|---|
| Layout: Sidebar (248px) + Main Content | Task 6 |
| Hero-Row: Net Worth Card with 24M SVG chart | Task 7, NetWorthHero |
| 4-Spalten-Grid: KPI Cards | Task 7, KpiCard ×4 |
| 3:2-Grid: Kontensaldo + Daily Check-in | Task 7, Panel + DailyCheckin |
| 3:2-Grid: Alert-Liste + Top-3-Produkte | Task 7, AlertList + table |
| CSS Custom Properties, 4 Themes | Task 1 |
| Geist Sans + Geist Mono fonts | Task 1 |
| TypeScript types matching prototype data shapes | Task 2 |
| German number/date formatting (de-DE locale) | Task 3 |
| SVG charts (no Recharts) | Task 5 |

**No placeholders found.**

**Type consistency:** All types defined in `src/lib/types.ts` (Task 2) are referenced correctly in Task 7 components. `fmtEur`/`fmtPct` used identically in test file and implementations.
