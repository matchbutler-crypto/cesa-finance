import { MOCK_DATA } from '@/lib/mock-data'
import { Panel, Tag, StatusDot } from '@/components/cesa/primitives'
import { fmtEur, fmtPct, fmtNum } from '@/lib/formatters'
import { CfoChat } from './_components/CfoChat'

const SUGGESTED = [
  'Kann ich €800 entnehmen?',
  'Wann skaliere ich Ads?',
  'Nettovermögen Jahresprognose',
  'Welcher SKU lohnt sich am meisten?',
  'Cashflow-Engpass analysieren',
  'Optimale Rücklage berechnen',
]

export default function CfoPage() {
  const { netWorth: nw, forecast: fc, ads } = MOCK_DATA
  const onTrack = fc.projectedMonthEnd >= fc.target

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 44px)' }}>
      {/* Page header */}
      <div className="cesa-pagehead" style={{ marginBottom: 14, flexShrink: 0 }}>
        <div>
          <div className="cesa-pagehead__eyebrow">KI-Agent · GPT-4o · Echtzeit-Kontext</div>
          <h1 className="cesa-pagehead__title">CFO Agent</h1>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <StatusDot kind="pos" size={7} />
          <span className="cesa-muted" style={{ fontSize: 11.5 }}>Online · Daten vom 25.05.2026</span>
          <button className="cesa-btn cesa-btn--ghost">Verlauf</button>
          <button className="cesa-btn cesa-btn--ghost">Neue Session</button>
        </div>
      </div>

      {/* Main layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 'var(--gap-x)', flex: 1, minHeight: 0 }}>

        {/* Chat */}
        <Panel style={{ display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
          <div className="cesa-panel__hd" style={{ flexShrink: 0 }}>
            <div>
              <h3 className="cesa-panel__title">Gespräch</h3>
              <div className="cesa-panel__sub">Mai 2026 · Session #1</div>
            </div>
            <Tag kind="pos" dot>GPT-4o</Tag>
          </div>
          <div className="cesa-panel__body" style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <CfoChat />
          </div>
        </Panel>

        {/* Right sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-y)', overflowY: 'auto' }}>

          {/* Live context */}
          <Panel title="Live-Kontext" subtitle="Aktuelle Finanzdaten">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { label: 'Nettovermögen',   value: fmtEur(nw.total),              color: 'var(--c-textStrong)' },
                { label: 'MTD Umsatz',      value: fmtEur(fc.mtdRevenue),         color: onTrack ? 'var(--c-positive)' : 'var(--c-warning)' },
                { label: 'Cashflow',        value: fmtEur(4890),                  color: 'var(--c-textStrong)' },
                { label: 'ROAS heute',      value: `${fmtNum(ads.roas, { decimals: 2 })}x`, color: ads.roas >= ads.breakEvenRoas ? 'var(--c-positive)' : 'var(--c-danger)' },
                { label: 'Ads Spend/Tag',   value: fmtEur(ads.todaySpend),        color: 'var(--c-text)' },
              ].map(row => (
                <div key={row.label} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                  padding: '5px 0', borderBottom: '1px solid var(--c-border)',
                }}>
                  <span className="cesa-muted" style={{ fontSize: 11 }}>{row.label}</span>
                  <span className="cesa-mono" style={{ fontSize: 12, fontWeight: 600, color: row.color }}>{row.value}</span>
                </div>
              ))}
            </div>
          </Panel>

          {/* Suggested prompts */}
          <Panel title="Vorschläge" subtitle="Häufige Fragen">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {SUGGESTED.map(q => (
                <button key={q} style={{
                  textAlign: 'left', padding: '7px 10px',
                  background: 'var(--c-surface2)', border: '1px solid var(--c-border)',
                  borderRadius: 'var(--r-sm)', fontSize: 11.5, color: 'var(--c-text)',
                  cursor: 'pointer', fontFamily: 'var(--font-sans)',
                  transition: 'border-color 0.1s',
                }}>
                  {q}
                </button>
              ))}
            </div>
          </Panel>

          {/* Data sources */}
          <Panel title="Datenquellen" subtitle="Was der Agent kennt">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 11 }}>
              {[
                { label: 'Shopify (Umsatz, Produkte)',  ok: true },
                { label: 'Meta Ads (ROAS, Spend)',       ok: true },
                { label: 'Bankkonten (Saldo)',           ok: true },
                { label: 'Cashflow-Timeline',            ok: true },
                { label: 'Lagerbestand',                 ok: true },
                { label: 'Steuer / DATEV',              ok: false },
              ].map(src => (
                <div key={src.label} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 0' }}>
                  <StatusDot kind={src.ok ? 'pos' : 'neutral'} size={6} />
                  <span style={{ color: src.ok ? 'var(--c-text)' : 'var(--c-muted)' }}>{src.label}</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}
