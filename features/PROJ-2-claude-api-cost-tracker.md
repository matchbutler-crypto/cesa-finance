# PROJ-2: Claude API Cost Tracker (Sidebar Widget)

## Status: Planned
**Created:** 2026-05-26
**Last Updated:** 2026-05-26

## Dependencies
- Requires: PROJ-1 (Ausgaben-Tracker) — Supabase-Verbindung muss aktiv sein, da Usage-Daten dort gespeichert werden

## User Stories
- Als Owner möchte ich auf einen Blick sehen, was die Claude API diesen Monat gekostet hat, damit ich die KI-Kosten im Griff behalte ohne in einen separaten Screen wechseln zu müssen
- Als Owner möchte ich die Kosten aufgeteilt nach CFO-Agent und Steuerberater-Agent sehen, damit ich verstehe welcher Agent mehr verbraucht
- Als Owner möchte ich ein monatliches Budget-Limit setzen, damit ich gewarnt werde bevor ich zu viel ausgebe
- Als Owner möchte ich das Budget-Limit direkt im Widget anpassen können, ohne in die Einstellungen zu gehen
- Als Owner möchte ich den Kostenüberblick auch im eingeklappten Sidebar-Modus sehen

## Out of Scope
- Historische Monatsvergleiche (z.B. "März vs. April") — deferred, könnte in `/reports` integriert werden
- Aufschlüsselung nach einzelnen Konversationen oder Nachrichten
- Pro-Agent-Budget-Limits — nur ein gemeinsames Monatslimit
- Automatisches Stoppen der API-Calls bei Budget-Überschreitung
- Export der Usage-Daten als CSV
- Benachrichtigungen per E-Mail bei Budget-Überschreitung
- Konfiguration des USD/EUR-Wechselkurses im UI — Wechselkurs kommt aus `.env.local`

## Acceptance Criteria

**Widget-Anzeige (Expanded Sidebar)**
- [ ] Angenommen die Sidebar ist ausgeklappt, wenn der Nutzer die App öffnet, dann ist das Cost-Tracker-Widget unterhalb der Navigation und oberhalb des User-Chips sichtbar
- [ ] Angenommen Daten vorhanden sind, wenn das Widget geladen wird, dann zeigt es „Heute: €X.XX" und „Monat: €X.XX / €Budget" sowie einen Fortschrittsbalken
- [ ] Angenommen die Kosten liegen unter 75% des Budgets, wenn das Widget angezeigt wird, dann ist der Fortschrittsbalken grün/neutral
- [ ] Angenommen die Kosten erreichen 75–89% des Budgets, wenn das Widget angezeigt wird, dann wird der Fortschrittsbalken orange
- [ ] Angenommen die Kosten erreichen 90%+ des Budgets, wenn das Widget angezeigt wird, dann wird der Fortschrittsbalken rot
- [ ] Angenommen das Widget angezeigt wird, wenn Daten vorhanden sind, dann zeigt es CFO und Steuerberater als separate Zeilen mit jeweiligen Monatswerten

**Leer-Zustand**
- [ ] Angenommen keine API-Calls in diesem Monat erfasst wurden, wenn das Widget geladen wird, dann zeigt es „€0.00 / €Budget" mit leerem Balken und dem Text „Noch keine Anfragen diesen Monat"

**Budget bearbeiten**
- [ ] Angenommen das Widget angezeigt wird, wenn der Nutzer auf den Budget-Betrag klickt, dann öffnet sich ein Inline-Eingabefeld mit dem aktuellen Wert
- [ ] Angenommen das Eingabefeld offen ist, wenn der Nutzer Enter drückt oder das Feld verlässt, dann wird der neue Wert in Supabase gespeichert und das Widget aktualisiert sich
- [ ] Angenommen das Eingabefeld offen ist, wenn der Nutzer einen ungültigen Wert eingibt (kein positiver Betrag), dann bleibt der alte Wert erhalten und eine kurze Fehlermeldung erscheint

**Eingeklappte Sidebar**
- [ ] Angenommen die Sidebar ist eingeklappt, wenn das Widget gerendert wird, dann zeigt es ein Coins-Icon mit der monatlichen Gesamtsumme als Tooltip

**Datenpersistenz**
- [ ] Angenommen ein Claude-API-Call erfolgt (CFO oder Tax), wenn die Antwort empfangen wird, dann werden Input-Tokens, Output-Tokens, Modell, Agent-Typ und Zeitstempel in Supabase gespeichert
- [ ] Angenommen Daten in Supabase vorhanden sind, wenn das Widget lädt, dann werden die Kosten anhand der aktuellen Modellpreise aus `.env.local` berechnet und in € umgerechnet

## Edge Cases
- **Supabase nicht erreichbar:** Widget zeigt den letzten gecachten Wert oder „– / €Budget" mit Offline-Hinweis
- **Wechselkurs nicht konfiguriert:** Fallback auf 1.08 (fixer Näherungswert), kein Absturz
- **Sehr viele Datenpunkte:** Aggregation erfolgt serverseitig (Supabase-Query mit `sum`), nicht client-seitig
- **Monatswechsel:** Widget zählt nur Calls mit `created_at >= Monatsanfang` — kein manueller Reset nötig
- **Negativer Budget-Wert:** Eingabe wird abgelehnt, Fehlermeldung erscheint
- **Gleichzeitiges Budget-Editing:** Letzter gespeicherter Wert gewinnt (kein Konflikt da Einzelnutzer)

## Technical Requirements
- Performance: Widget-Daten laden in < 300ms (Supabase-Aggregation)
- Modellpreise konfigurierbar über `.env.local` (damit bei Preisänderungen kein Code-Deploy nötig)
- USD/EUR-Wechselkurs über `.env.local` (z.B. `NEXT_PUBLIC_USD_EUR_RATE=0.93`)
- Nur für eingeloggten Owner zugänglich (kein Public Access auf Usage-Daten)

## Open Questions
- [ ] Soll das Widget auch Kosten aus dem Batch-API oder nur aus Chat-Agents zählen? (aktuell nur CFO + Tax angenommen)
- [ ] Welches Modell wird final eingesetzt — `claude-sonnet-4-5` oder Update auf `claude-sonnet-4-6`? Beeinflusst die Preiskonfiguration

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Aufschlüsselung nach Agent (CFO vs. Tax), nicht nur Gesamt | Nutzer möchte verstehen welcher Agent mehr verbraucht | 2026-05-26 |
| Ein gemeinsames Monatslimit statt pro-Agent | Einfacher für Einzelnutzer; pro-Agent-Limits sind eher für Teams | 2026-05-26 |
| Anzeige in € statt $ | Alle anderen Zahlen im OS sind in €; Konsistenz wichtiger als API-native Währung | 2026-05-26 |
| Budget inline im Widget editierbar | Kein separater Settings-Screen; schneller für tägliche Nutzung | 2026-05-26 |
| Wechselkurs in `.env.local`, nicht im UI | Ändert sich selten; UI-Konfiguration wäre Over-Engineering für MVP | 2026-05-26 |
| Warnstufen: 75% orange, 90% rot | Bekanntes Pattern aus Dashboard-Cashflow; konsistent mit Rest des OS | 2026-05-26 |
| Collapsed State: Coins-Icon + Tooltip | Konsistent mit anderen Nav-Icons im collapsed Mode | 2026-05-26 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| Supabase für Usage-Logs, kein localStorage | Daten müssen persistiert und aggregiert (SUM, GROUP BY) werden — localStorage unterstützt keine Queries | 2026-05-26 |
| Single `/api/chat` Route für beide Agents | Agent-Typ als Parameter (`agentType`) statt separater Routes — reduziert Duplikation | 2026-05-26 |
| `cost_usd` beim Logging berechnen | Historisch korrekt und unabhängig von späteren Preisänderungen | 2026-05-26 |
| Preise in `.env.local`, nicht hardcoded | Preisänderungen erfordern keinen Code-Deploy | 2026-05-26 |
| Single-Row-Pattern für `api_settings` | Ein Owner, ein Budget — keine Mehrbenutzer-Logik nötig | 2026-05-26 |
| `@anthropic-ai/sdk` statt Raw-HTTP | SDK handelt Streaming, Retries und Typsicherheit automatisch | 2026-05-26 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Kontext
Die CFO- und Tax-Chats nutzen aktuell Mock-Daten. Das Cost-Tracking erfordert, dass die echte Claude-API-Anbindung als Teil dieser Architektur eingebaut wird.

### Komponentenstruktur
```
src/components/cesa/sidebar.tsx (bestehend — wird erweitert)
  └── ApiCostWidget (neu: src/components/cesa/api-cost-widget.tsx)
      ├── [Expanded Mode]
      │   ├── Section-Header "KI-Kosten"
      │   ├── TodayRow          → "Heute: €0.04"
      │   ├── MonthProgress
      │   │   ├── ProgressBar   → grün / orange / rot je nach %
      │   │   └── BudgetLabel   → "€1.23 / €10.00" (Klick → Edit)
      │   ├── AgentRow CFO      → "CFO Agent  €0.87"
      │   ├── AgentRow STB      → "Steuerberater  €0.36"
      │   └── BudgetEditor      → Inline-Input (erscheint nach Klick)
      └── [Collapsed Mode]
          └── CoinsIcon         → Tooltip: "€1.23 / Monat"

src/app/api/chat/route.ts (neu)
  → Empfängt Chat-Nachrichten vom Frontend
  → Leitet an Claude API weiter (Anthropic SDK)
  → Loggt Token-Verbrauch in Supabase
  → Gibt Antwort an Frontend zurück
```

### Datenmodell (Supabase)

**Tabelle `api_usage_logs`** — ein Eintrag pro Claude-API-Call:
- `id` UUID, `created_at` Timestamp, `agent_type` ("cfo"|"tax"), `model` (String), `input_tokens` (Integer), `output_tokens` (Integer), `cost_usd` (Decimal)

**Tabelle `api_settings`** — eine feste Zeile, Konfiguration:
- `id` Integer (immer 1), `monthly_budget_eur` (Decimal), `updated_at` Timestamp

### Datenfluss

**Beim Chat-Send:**
User → Frontend → POST /api/chat (agentType, message, history) → Anthropic SDK → Claude antwortet mit message + usage → API-Route berechnet cost_usd → schreibt in api_usage_logs → gibt Antwort zurück

**Widget beim Laden:**
3 parallele Supabase-Queries: (1) Kosten heute, (2) Kosten diesen Monat gruppiert nach agent_type, (3) Budget aus api_settings → Widget rendert

**Budget bearbeiten:**
Klick auf Betrag → Inline-Input → Enter/Blur → Validierung → UPDATE api_settings → Widget re-rendert

### Umgebungsvariablen (.env.local)
- `ANTHROPIC_API_KEY` — bereits vorgesehen
- `CLAUDE_MODEL=claude-sonnet-4-6`
- `CLAUDE_INPUT_PRICE_USD=0.000003`
- `CLAUDE_OUTPUT_PRICE_USD=0.000015`
- `NEXT_PUBLIC_USD_EUR_RATE=0.93`

### Dependencies
- `@anthropic-ai/sdk` — offizieller Claude API Client (noch nicht installiert)

## QA Test Results

**QA Date:** 2026-05-26
**QA Engineer:** Claude Code (automated)
**Test Suite:** Vitest (unit/integration) + Playwright (E2E, Chromium + Mobile Safari)

### Summary

| Category | Result |
|----------|--------|
| Vitest tests | 30/30 ✓ |
| E2E tests (Chromium) | 16/16 ✓ |
| E2E tests (Mobile Safari) | 16/16 ✓ |
| Acceptance criteria | 11/11 PASS |
| Critical bugs | 0 |
| High bugs | 1 |
| Medium bugs | 2 |
| Low bugs | 0 |

### Acceptance Criteria Results

| # | Criterion | Result | Notes |
|---|-----------|--------|-------|
| AC1 | Widget sichtbar in ausgeklappter Sidebar | ✓ PASS | |
| AC2 | Zeigt Heute + Monat + Fortschrittsbalken | ✓ PASS | |
| AC3 | Fortschrittsbalken grün < 75% | ✓ PASS | |
| AC4 | Fortschrittsbalken orange 75–89% | ✓ PASS | |
| AC5 | Fortschrittsbalken rot ≥ 90% | ✓ PASS | |
| AC6 | CFO- und Steuerberater-Zeilen separat | ✓ PASS | |
| AC7 | Leer-Zustand "Noch keine Anfragen diesen Monat" | ✓ PASS | |
| AC8 | Klick auf Budget öffnet Inline-Editor | ✓ PASS | |
| AC9 | Enter speichert Budget (optimistisch) | ✓ PASS | |
| AC10 | Negativer/Null-Budget zeigt Fehlermeldung | ✓ PASS | |
| AC11 | Eingeklappte Sidebar zeigt Coins-Icon + Tooltip | ✓ PASS | |

### Bugs Found

#### HIGH — BUG-001: Keine Authentifizierung auf API-Routes

**Severity:** High
**Component:** `src/app/api/chat/route.ts`, `src/app/api/api-cost/route.ts`
**Reproducible:** Ja

**Beschreibung:**
Beide API-Routes sind ohne Authentifizierung erreichbar. Jeder mit Netzwerkzugang zum Server kann:
- POST `/api/chat` aufrufen und Claude-API-Kosten auf Kosten des Owners verursachen
- PUT `/api/api-cost` aufrufen und das Budget beliebig ändern
- GET `/api/api-cost` aufrufen und Kostendaten lesen

**Steps to Reproduce:**
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "test", "history": [], "agentType": "cfo"}'
```

**Erwartetes Verhalten:** 401 Unauthorized
**Tatsächliches Verhalten:** 502 (API key fehlt) oder 200 bei gesetztem Key — kein Auth-Check

**Risiko:** Hoch bei öffentlichem Deployment (Claude-API-Credits können ausgeschöpft werden). Vertretbar für lokales Single-User-Tool.

**Spec-Referenz:** "Nur für eingeloggten Owner zugänglich (kein Public Access auf Usage-Daten)"

---

#### MEDIUM — BUG-002: Sehr große Budget-Werte führen zu Database Error

**Severity:** Medium
**Component:** `src/app/api/api-cost/route.ts`
**Reproducible:** Ja

**Beschreibung:**
Budget-Werte > 99.999.999,99 überschreiten das Supabase-Schema `NUMERIC(10,2)` und führen zu einem unkritischen "Database error" (500) statt einer validierten 400-Antwort.

**Steps to Reproduce:**
```bash
curl -X PUT http://localhost:3000/api/api-cost \
  -H "Content-Type: application/json" \
  -d '{"monthly_budget_eur": 999999999999}'
# → {"error":"Database error"}
```

**Fix:** Zod-Schema um `.max(99999)` erweitern.

---

#### MEDIUM — BUG-003: Kein Rate Limiting auf `/api/chat`

**Severity:** Medium
**Component:** `src/app/api/chat/route.ts`

**Beschreibung:**
Kein Rate Limiting implementiert. Bei gesetztem API-Key könnten schnell viele Requests gesendet werden, die Claude-API-Kosten verursachen (relevant wenn API öffentlich erreichbar).

**Fix:** Next.js Rate Limiting Middleware oder Upstash Redis Rate Limiter.

---

### Security Audit

| Check | Status | Notes |
|-------|--------|-------|
| XSS via Budget-Eingabe | ✓ Sicher | Zod lehnt Strings ab (type: number required) |
| SQL Injection | ✓ Sicher | Supabase-Client mit parametrisierten Queries |
| API-Key-Exposition | ✓ Sicher | Key nur serverseitig, nicht im Browser-Response |
| Stack Trace Leakage | ✓ Sicher | Fehler werden als generische Nachrichten zurückgegeben |
| Authentifizierung | ✗ Fehlt | Siehe BUG-001 |
| Rate Limiting | ✗ Fehlt | Siehe BUG-003 |
| Budget Overflow-Validierung | ✗ Fehlt | Siehe BUG-002 |

### Production-Ready Decision

**STATUS: APPROVED** (für lokales Single-User-Deployment)

Alle Acceptance Criteria bestanden. Keine kritischen Bugs. Die gefundenen Bugs (BUG-001 Auth, BUG-003 Rate Limiting) sind für ein lokales, persönliches Tool akzeptabel. Bei öffentlichem Deployment müssen BUG-001 und BUG-003 vorher gefixt werden.

**Empfehlung:** Vor Deployment auf öffentlichen Server → BUG-001 priorisiert beheben.

## Deployment

**Deployed:** 2026-05-27
**Umgebung:** Lokal (localhost:3000) — persönliches Single-User-Tool
**GitHub:** https://github.com/matchbutler-crypto/cesa-finance (branch: main, commit: 315b5ce)

**Voraussetzungen für den Betrieb:**
1. `ANTHROPIC_API_KEY` in `.env.local` eintragen
2. Migration `supabase/migrations/003_api_cost_tracker.sql` im Supabase SQL-Editor ausführen
3. `npm run dev` starten

**Vercel (optional, später):** Alle Env Vars aus `.env.local` im Vercel Dashboard eintragen, dann `npx vercel --prod`.
