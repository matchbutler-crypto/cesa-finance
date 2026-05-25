'use client'
import { useState } from 'react'
import { Panel, Tag, StatusDot } from '@/components/cesa/primitives'
import { fmtEur } from '@/lib/formatters'

const SEASON_EVENTS = [
  { id: 'sommer', label: 'Sommer-Start',      date: '2026-06-01', uplift: 1.15, adBudget: 380,  days: 14, desc: 'Saisonaler Wechsel — Caps & Tees in den Fokus.' },
  { id: 'b2s',    label: 'Back-to-School',    date: '2026-08-15', uplift: 1.22, adBudget: 520,  days: 21, desc: 'Hoodies & Crewnecks für jüngere Zielgruppe.' },
  { id: 'bfcm',   label: 'Black Friday / CM', date: '2026-11-27', uplift: 1.85, adBudget: 980,  days: 5,  desc: 'Stärkster Tag des Jahres. Lager 3 Wochen vorher.' },
  { id: 'xmas',   label: 'Weihnachten',       date: '2026-12-18', uplift: 1.45, adBudget: 640,  days: 14, desc: 'Geschenk-Set Hoodie+Cap als Bundle.' },
  { id: 'vday',   label: 'Valentinstag',      date: '2027-02-10', uplift: 1.08, adBudget: 220,  days: 7,  desc: 'Couple-Hoodies — letztes Jahr +8%.' },
  { id: 'spring', label: 'Frühlings-Drop',    date: '2027-04-01', uplift: 1.18, adBudget: 320,  days: 10, desc: 'Neue Kollektion — Pastellfarben.' },
]

const BFCM_CHECKLIST = [
  { label: 'Lieferanten-Bestellung Hoodies', due: '06.11.', done: false },
  { label: 'Lieferanten-Bestellung Caps',    due: '06.11.', done: false },
  { label: 'Ad Creatives finalisieren',      due: '20.11.', done: false },
  { label: 'Landing Page BFCM',             due: '24.11.', done: false },
  { label: 'Email-Kampagne vorbereiten',     due: '25.11.', done: false },
  { label: 'Cashflow-Reserve €1.800',        due: '20.11.', done: false },
]
const DEFAULT_CHECKLIST = [
  { label: 'Lieferanten-Bestellung',        due: '−21d',  done: false },
  { label: 'Ad Creatives finalisieren',     due: '−7d',   done: false },
  { label: 'Landing Page anpassen',         due: '−3d',   done: false },
  { label: 'Email-Kampagne vorbereiten',    due: '−2d',   done: false },
]

const MONTHS = ['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez']
const START_MONTH = 4 // Mai 2026 (0-indexed)
const START_YEAR = 2026
const TOTAL_COLS = 12

function colOf(dateStr: string) {
  const d = new Date(dateStr)
  const idx = (d.getFullYear() - START_YEAR) * 12 + d.getMonth() - START_MONTH
  return Math.max(0, Math.min(TOTAL_COLS - 1, idx))
}

function YearTimeline({ selected, onSelect }: { selected: string; onSelect: (id: string) => void }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      {/* Month labels */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${TOTAL_COLS}, 1fr)`, minWidth: 700, marginBottom: 8 }}>
        {Array.from({ length: TOTAL_COLS }).map((_, i) => {
          const m = (START_MONTH + i) % 12
          const y = START_YEAR + Math.floor((START_MONTH + i) / 12)
          return (
            <div key={i} style={{ textAlign: 'center', fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--c-muted)' }}>
              {MONTHS[m]}{m === 0 ? <span style={{ display: 'block', color: 'var(--c-subtle)', fontSize: 9 }}>{y}</span> : null}
            </div>
          )
        })}
      </div>
      {/* Track */}
      <div style={{ position: 'relative', minWidth: 700, height: 120, background: 'var(--c-surface2)', borderRadius: 'var(--r-sm)', border: '1px solid var(--c-border)' }}>
        {/* Grid lines */}
        {Array.from({ length: TOTAL_COLS }).map((_, i) => (
          <div key={i} style={{
            position: 'absolute', top: 0, bottom: 0, left: `${(i / TOTAL_COLS) * 100}%`,
            borderLeft: '1px solid var(--c-border)', opacity: 0.5,
          }} />
        ))}
        {/* Today marker */}
        <div style={{
          position: 'absolute', top: 0, bottom: 0, left: '0.5%',
          borderLeft: '2px solid var(--c-accent)', zIndex: 2,
        }}>
          <span style={{ position: 'absolute', top: 4, left: 4, fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--c-accent)', background: 'var(--c-surface2)', padding: '0 3px', borderRadius: 2 }}>heute</span>
        </div>
        {/* Events */}
        {SEASON_EVENTS.map((e, row) => {
          const col = colOf(e.date)
          const left = (col / TOTAL_COLS) * 100
          const width = Math.max(8, (e.days / 30 / TOTAL_COLS) * 100)
          const isSelected = e.id === selected
          return (
            <button key={e.id} onClick={() => onSelect(e.id)} style={{
              position: 'absolute',
              left: `${left}%`,
              top: `${8 + row * 16}px`,
              width: `max(120px, ${width}%)`,
              padding: '3px 8px',
              background: isSelected ? 'var(--c-accent)' : 'var(--c-surface3)',
              border: `1px solid ${isSelected ? 'var(--c-accent)' : 'var(--c-border)'}`,
              borderRadius: 4,
              cursor: 'pointer',
              textAlign: 'left',
              zIndex: 1,
            }}>
              <div style={{ fontSize: 10.5, fontWeight: 600, color: isSelected ? 'var(--c-bg)' : 'var(--c-textStrong)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {e.label}
              </div>
              <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: isSelected ? 'rgba(255,255,255,0.7)' : 'var(--c-muted)', whiteSpace: 'nowrap' }}>
                {e.date.slice(5).split('-').reverse().join('.')} · {e.uplift.toFixed(2)}x
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function SeasonsClient() {
  const [selected, setSelected] = useState('bfcm')
  const today = new Date('2026-05-25')
  const ev = SEASON_EVENTS.find(e => e.id === selected)!
  const daysTo = Math.ceil((new Date(ev.date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  const checklist = ev.id === 'bfcm' ? BFCM_CHECKLIST : DEFAULT_CHECKLIST
  const lagerDate = new Date(new Date(ev.date).getTime() - 21 * 86400000)
  const lagerStr = lagerDate.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-y)' }}>
      <Panel title="Jahresübersicht 2026 / 2027" subtitle="Geplante Saison-Events">
        <YearTimeline selected={selected} onSelect={setSelected} />
      </Panel>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 'var(--gap-x)' }}>
        <Panel
          title={ev.label}
          subtitle={ev.desc}
          action={<Tag kind={daysTo < 30 ? 'warn' : 'neutral'}>{daysTo > 0 ? `in ${daysTo} Tagen` : `vor ${-daysTo} Tagen`}</Tag>}
        >
          {/* Stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
            {[
              { label: 'Historischer Uplift',    value: `${ev.uplift.toFixed(2)}x`,              sub: 'vs. Wochendurchschnitt' },
              { label: 'Empf. Ad Budget',         value: fmtEur(ev.adBudget),                     sub: `über ${ev.days} Tage` },
              { label: 'Lager-Aufbau bis',        value: lagerStr,                                sub: '3 Wochen Vorlauf' },
              { label: 'Erwarteter Mehrumsatz',   value: fmtEur(Math.round(ev.adBudget * 2.85)),  sub: 'bei ROAS 2.85' },
            ].map(stat => (
              <div key={stat.label} style={{ padding: '10px 12px', background: 'var(--c-surface2)', border: '1px solid var(--c-border)', borderRadius: 'var(--r-sm)' }}>
                <div className="cesa-muted" style={{ fontSize: 10 }}>{stat.label}</div>
                <div className="cesa-mono" style={{ fontSize: 14, fontWeight: 700, color: 'var(--c-textStrong)', marginTop: 2 }}>{stat.value}</div>
                <div className="cesa-muted" style={{ fontSize: 9.5, marginTop: 2 }}>{stat.sub}</div>
              </div>
            ))}
          </div>

          {/* Checklist */}
          <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--c-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Checkliste</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 16 }}>
            {checklist.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid var(--c-border)' }}>
                <div style={{ width: 14, height: 14, border: '1px solid var(--c-border)', borderRadius: 3, flexShrink: 0, background: item.done ? 'var(--c-positive)' : 'transparent' }} />
                <span style={{ flex: 1, fontSize: 12, color: item.done ? 'var(--c-muted)' : 'var(--c-text)', textDecoration: item.done ? 'line-through' : 'none' }}>{item.label}</span>
                {item.due && <span className="cesa-mono cesa-muted" style={{ fontSize: 10.5 }}>{item.due}</span>}
              </div>
            ))}
          </div>

          {/* Historical table */}
          <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--c-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Historisch · Vorjahre</div>
          <table className="cesa-tbl" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Jahr</th>
                <th style={{ textAlign: 'right' }}>Umsatz Event</th>
                <th style={{ textAlign: 'right' }}>vs. Normal-Wo.</th>
                <th style={{ textAlign: 'right' }}>Ad ROAS</th>
                <th>Notiz</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="cesa-mono">2025</td>
                <td className="cesa-mono" style={{ textAlign: 'right' }}>€2.840</td>
                <td style={{ textAlign: 'right' }}><Tag kind="pos">+1.92x</Tag></td>
                <td className="cesa-mono" style={{ textAlign: 'right' }}>3.10</td>
                <td className="cesa-muted" style={{ fontSize: 10.5 }}>Bester BF bisher</td>
              </tr>
              <tr>
                <td className="cesa-mono">2024</td>
                <td className="cesa-mono" style={{ textAlign: 'right' }}>€1.620</td>
                <td style={{ textAlign: 'right' }}><Tag kind="pos">+1.74x</Tag></td>
                <td className="cesa-mono" style={{ textAlign: 'right' }}>2.80</td>
                <td className="cesa-muted" style={{ fontSize: 10.5 }}>Caps ausverkauft Tag 2</td>
              </tr>
            </tbody>
          </table>
        </Panel>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-y)' }}>
          <Panel title="Cashflow-Vorausschau">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {[
                { label: 'Lager-Investment (3 Wo. vorher)', value: fmtEur(-1800),                              color: 'var(--c-danger)' },
                { label: 'Ad Budget',                       value: fmtEur(-ev.adBudget),                       color: 'var(--c-danger)' },
                { label: 'Erwartete Payouts',               value: fmtEur(Math.round(ev.adBudget * 2.85)),     color: 'var(--c-positive)' },
                { label: 'Netto-Impact',                    value: fmtEur(Math.round(ev.adBudget * 2.85) - 1800 - ev.adBudget), color: 'var(--c-textStrong)' },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '4px 0', borderBottom: '1px solid var(--c-border)' }}>
                  <span className="cesa-muted" style={{ fontSize: 11 }}>{row.label}</span>
                  <span className="cesa-mono" style={{ fontSize: 12, fontWeight: 600, color: row.color }}>{row.value}</span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Risiken">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { ok: false, text: 'Lieferzeit Müller Print 7 Tage — Mitte Nov. bestellen' },
                { ok: false, text: 'Cap Basic Stock-Risiko (12 Tage Lieferzeit)' },
                { ok: true,  text: 'Cashflow reicht für Vorab-Investment' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <StatusDot kind={item.ok ? 'pos' : 'neutral'} size={6} />
                  <span style={{ fontSize: 11.5, color: 'var(--c-text)', lineHeight: 1.4 }}>{item.text}</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}
