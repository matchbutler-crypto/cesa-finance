import { Panel, Tag } from '@/components/cesa/primitives'
import { fmtEur, fmtPct } from '@/lib/formatters'

const GOALS = [
  { id: 1, label: 'Erster €5k Monat',            current: 2847,  target: 5000,  due: '31.12.2026', unit: '€',    kind: 'revenue', pace: 'on-track' as const },
  { id: 2, label: 'Ad ROAS ≥ 2.5 (Break-even)',  current: 2.85,  target: 2.5,   due: 'laufend',    unit: 'x',    kind: 'roas',    pace: 'achieved' as const },
  { id: 3, label: '3-Monats Cashpuffer',          current: 3000,  target: 9000,  due: '31.03.2027', unit: '€',    kind: 'savings', pace: 'behind' as const },
  { id: 4, label: 'Finanzielle Freiheit',         current: 450,   target: 3200,  due: '31.08.2041', unit: '€/mo', kind: 'passive', pace: 'on-track' as const },
]

const WAYPOINTS = [
  { month: 'Apr 2026', actualRevenue: 3120, forecast: 2950, actualCash: 5210, note: 'Lieferung verspätet, Stock-out bei Cap Basic 4 Tage.' },
  { month: 'Mär 2026', actualRevenue: 2840, forecast: 2700, actualCash: 4890, note: 'Erstes Mal über €2.500.' },
  { month: 'Feb 2026', actualRevenue: 2410, forecast: 2600, actualCash: 4420, note: 'Valentinstag-Push hat nicht funktioniert.' },
  { month: 'Jan 2026', actualRevenue: 2180, forecast: 2400, actualCash: 4100, note: 'Saisonales Tief wie erwartet.' },
]

function fmtGoalVal(val: number, unit: string) {
  if (unit === '€') return fmtEur(val)
  if (unit === 'x') return val.toFixed(2) + 'x'
  return fmtEur(val) + '/mo'
}

function ProgressBar({ value, kind }: { value: number; kind: 'pos' | 'warn' }) {
  const color = kind === 'pos' ? 'var(--c-positive)' : 'var(--c-warning)'
  return (
    <div style={{ height: 6, background: 'var(--c-surface3)', borderRadius: 3, overflow: 'hidden', margin: '8px 0' }}>
      <div style={{ height: '100%', width: `${Math.min(100, value)}%`, background: color, borderRadius: 3, transition: 'width 0.3s' }} />
    </div>
  )
}

export default function GoalsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-y)' }}>
      <div className="cesa-pagehead">
        <div>
          <div className="cesa-pagehead__eyebrow">Nicht irgendwann — ein Datum</div>
          <h1 className="cesa-pagehead__title">Ziele & Waypoints</h1>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="cesa-btn cesa-btn--ghost">Neues Ziel</button>
          <button className="cesa-btn cesa-btn--primary">Waypoint setzen</button>
        </div>
      </div>

      {/* Active goals */}
      <Panel title="Aktive Ziele" subtitle={`${GOALS.length} verfolgt`}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {GOALS.map(g => {
            const pct = Math.min(100, (g.current / g.target) * 100)
            const tagKind = g.pace === 'achieved' ? 'pos' : g.pace === 'on-track' ? 'neutral' : 'warn'
            const tagLabel = g.pace === 'achieved' ? 'erreicht' : g.pace === 'on-track' ? 'on track' : 'hinter Plan'
            const barKind = g.pace === 'behind' ? 'warn' : 'pos'
            return (
              <div key={g.id} style={{
                padding: '14px 16px',
                background: 'var(--c-surface2)',
                border: '1px solid var(--c-border)',
                borderRadius: 'var(--r-md)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--c-textStrong)' }}>{g.label}</div>
                    <div className="cesa-muted" style={{ fontSize: 10.5, marginTop: 2 }}>Fällig {g.due}</div>
                  </div>
                  <Tag kind={tagKind}>{tagLabel}</Tag>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 2 }}>
                  <span className="cesa-mono" style={{ fontSize: 18, fontWeight: 700, color: 'var(--c-textStrong)' }}>
                    {fmtGoalVal(g.current, g.unit)}
                  </span>
                  <span className="cesa-mono cesa-muted" style={{ fontSize: 12 }}>
                    / {fmtGoalVal(g.target, g.unit)}
                  </span>
                </div>
                <ProgressBar value={pct} kind={barKind} />
                <div className="cesa-muted" style={{ fontSize: 10.5 }}>
                  {g.pace === 'achieved'
                    ? 'Ziel übertroffen.'
                    : g.pace === 'on-track'
                    ? 'Bei aktuellem Tempo erreichbar.'
                    : `Mehrbedarf: ${fmtEur(g.target - g.current)} bis ${g.due}`}
                </div>
              </div>
            )
          })}
        </div>
      </Panel>

      {/* Waypoints + accuracy */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 'var(--gap-x)' }}>
        <Panel title="Waypoints" subtitle="Monatliche Check-ins · Ist vs. Forecast">
          <table className="cesa-tbl" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Monat</th>
                <th style={{ textAlign: 'right' }}>Forecast</th>
                <th style={{ textAlign: 'right' }}>Actual</th>
                <th style={{ textAlign: 'right' }}>Δ</th>
                <th style={{ textAlign: 'right' }}>Cash Ende</th>
                <th>Notiz</th>
              </tr>
            </thead>
            <tbody>
              {WAYPOINTS.map(w => {
                const delta = (w.actualRevenue / w.forecast - 1) * 100
                const isPos = delta >= 0
                return (
                  <tr key={w.month}>
                    <td className="cesa-mono" style={{ fontSize: 11.5 }}>{w.month}</td>
                    <td className="cesa-mono cesa-muted" style={{ textAlign: 'right', fontSize: 11.5 }}>{fmtEur(w.forecast)}</td>
                    <td className="cesa-mono" style={{ textAlign: 'right', fontSize: 11.5, fontWeight: 600 }}>{fmtEur(w.actualRevenue)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <span style={{ color: isPos ? 'var(--c-positive)' : 'var(--c-danger)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                        {isPos ? '+' : ''}{fmtPct(delta, { decimals: 1 })}
                      </span>
                    </td>
                    <td className="cesa-mono" style={{ textAlign: 'right', fontSize: 11.5 }}>{fmtEur(w.actualCash)}</td>
                    <td className="cesa-muted" style={{ fontSize: 10.5, maxWidth: 180 }}>{w.note}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Panel>

        {/* Forecast accuracy */}
        <Panel title="Forecast-Genauigkeit" subtitle="Letzte 4 Monate">
          <div style={{ textAlign: 'center', padding: '20px 0 16px' }}>
            <div className="cesa-mono" style={{ fontSize: 36, fontWeight: 700, color: 'var(--c-positive)' }}>+8.4%</div>
            <div className="cesa-muted" style={{ fontSize: 11, lineHeight: 1.5, marginTop: 6 }}>
              Deine Forecasts sind im Schnitt 8% zu konservativ. Tendenz: konsistent.
            </div>
          </div>
          <div style={{ borderTop: '1px solid var(--c-border)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              { label: 'Beste Abweichung',  value: '+5.7% (Apr)', color: 'var(--c-positive)' },
              { label: 'Schlechteste',      value: '−7.3% (Feb)', color: 'var(--c-danger)' },
              { label: 'Trend',             value: 'verbessert sich', color: 'var(--c-textStrong)' },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '3px 0', borderBottom: '1px solid var(--c-border)' }}>
                <span className="cesa-muted" style={{ fontSize: 11 }}>{row.label}</span>
                <span className="cesa-mono" style={{ fontSize: 11.5, fontWeight: 600, color: row.color }}>{row.value}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  )
}
