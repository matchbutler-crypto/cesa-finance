import { Panel, Tag } from '@/components/cesa/primitives'
import { fmtEur, fmtPct } from '@/lib/formatters'
import { RunningTotalChart } from './_components/RunningTotalChart'

const MONTHS = [
  { m: 'Jan', target: 2400, actual: 2180,  ads: 240, profit: 720  },
  { m: 'Feb', target: 2600, actual: 2410,  ads: 260, profit: 810  },
  { m: 'Mär', target: 2700, actual: 2840,  ads: 280, profit: 980  },
  { m: 'Apr', target: 2950, actual: 3120,  ads: 320, profit: 1080 },
  { m: 'Mai', target: 3500, actual: 2847,  ads: 280, profit: 940,  current: true },
  { m: 'Jun', target: 3600, actual: null,  ads: 340, profit: null },
  { m: 'Jul', target: 3400, actual: null,  ads: 320, profit: null },
  { m: 'Aug', target: 3800, actual: null,  ads: 420, profit: null },
  { m: 'Sep', target: 4200, actual: null,  ads: 480, profit: null },
  { m: 'Okt', target: 4400, actual: null,  ads: 460, profit: null },
  { m: 'Nov', target: 6800, actual: null,  ads: 980, profit: null },
  { m: 'Dez', target: 5800, actual: null,  ads: 720, profit: null },
]

const QUARTERS = [
  { q: 'Q1', months: MONTHS.slice(0, 3),  status: 'done'     as const },
  { q: 'Q2', months: MONTHS.slice(3, 6),  status: 'active'   as const },
  { q: 'Q3', months: MONTHS.slice(6, 9),  status: 'upcoming' as const },
  { q: 'Q4', months: MONTHS.slice(9, 12), status: 'upcoming' as const },
]

export default function PlanningPage() {
  const ytdMonths = MONTHS.slice(0, 5)
  const ytdTarget = ytdMonths.reduce((s, m) => s + m.target, 0)
  const ytdActual = ytdMonths.reduce((s, m) => s + (m.actual ?? 0), 0)
  const yearTarget = MONTHS.reduce((s, m) => s + m.target, 0)
  const projection = ytdActual + MONTHS.slice(5).reduce((s, m) => s + m.target * 1.04, 0)
  const max = Math.max(...MONTHS.map(m => m.target))

  const kpis = [
    { label: 'Ziel 2026',       value: fmtEur(yearTarget),          sub: '12 Monate',                color: 'var(--c-textStrong)', delta: null },
    { label: 'YTD Actual',      value: fmtEur(ytdActual),            sub: null,                       color: ytdActual >= ytdTarget ? 'var(--c-positive)' : 'var(--c-warning)', delta: fmtPct((ytdActual / ytdTarget - 1) * 100, { sign: true }), deltaKind: ytdActual >= ytdTarget ? 'pos' : 'neg' },
    { label: 'YTD vs. Ziel',    value: fmtEur(ytdActual - ytdTarget, { sign: true }), sub: `${fmtPct(ytdActual / ytdTarget * 100, { decimals: 0 })} erreicht`, color: ytdActual >= ytdTarget ? 'var(--c-positive)' : 'var(--c-danger)', delta: null },
    { label: 'Jahresprognose',  value: fmtEur(Math.round(projection)), sub: null,                     color: projection >= yearTarget ? 'var(--c-positive)' : 'var(--c-warning)', delta: fmtPct((projection / yearTarget - 1) * 100, { sign: true }), deltaKind: projection >= yearTarget ? 'pos' : 'neg' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-y)' }}>
      <div className="cesa-pagehead">
        <div>
          <div className="cesa-pagehead__eyebrow">Soll vs. Ist · monatlich</div>
          <h1 className="cesa-pagehead__title">Jahresplanung 2026</h1>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="cesa-btn cesa-btn--ghost">Ziele bearbeiten</button>
          <button className="cesa-btn cesa-btn--ghost">Export</button>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--gap-x)' }}>
        {kpis.map(kpi => (
          <div key={kpi.label} style={{ padding: '14px 16px', background: 'var(--c-surface2)', border: '1px solid var(--c-border)', borderRadius: 'var(--r-md)' }}>
            <div className="cesa-muted" style={{ fontSize: 10.5, marginBottom: 6 }}>{kpi.label}</div>
            <div className="cesa-mono" style={{ fontSize: 20, fontWeight: 700, color: kpi.color }}>{kpi.value}</div>
            {kpi.delta && (
              <div className="cesa-mono" style={{ fontSize: 11, marginTop: 3, color: (kpi as {deltaKind?: string}).deltaKind === 'pos' ? 'var(--c-positive)' : 'var(--c-danger)' }}>{kpi.delta}</div>
            )}
            {kpi.sub && <div className="cesa-muted" style={{ fontSize: 10.5, marginTop: 3 }}>{kpi.sub}</div>}
          </div>
        ))}
      </div>

      {/* Gantt */}
      <Panel title="Monatliche Ziele vs. Actual" subtitle="Graue Balken = Ziel, farbiger = Actual">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {MONTHS.map(m => {
            const tPct = (m.target / max) * 100
            const aPct = m.actual ? (m.actual / max) * 100 : 0
            const isOver = m.actual && m.actual > m.target
            return (
              <div key={m.m} style={{
                display: 'grid', gridTemplateColumns: '36px 1fr 64px',
                alignItems: 'center', gap: 8,
                padding: '4px 8px',
                background: (m as {current?: boolean}).current ? 'color-mix(in oklab, var(--c-accent) 8%, transparent)' : 'transparent',
                borderRadius: 'var(--r-sm)',
                border: `1px solid ${(m as {current?: boolean}).current ? 'color-mix(in oklab, var(--c-accent) 25%, var(--c-border))' : 'transparent'}`,
              }}>
                <span className="cesa-mono" style={{ fontSize: 10.5, color: 'var(--c-muted)' }}>{m.m}</span>
                <div style={{ position: 'relative', height: 20 }}>
                  {/* target bar */}
                  <div style={{
                    position: 'absolute', top: 6, height: 8,
                    width: `${tPct}%`, background: 'var(--c-surface3)',
                    border: '1px solid var(--c-border)', borderRadius: 2,
                  }}>
                    <span className="cesa-mono" style={{ position: 'absolute', right: 4, top: -1, fontSize: 9, color: 'var(--c-muted)', lineHeight: '10px' }}>
                      {fmtEur(m.target)}
                    </span>
                  </div>
                  {/* actual bar */}
                  {m.actual && (
                    <div style={{
                      position: 'absolute', top: 6, height: 8,
                      width: `${aPct}%`,
                      background: isOver ? 'var(--c-positive)' : 'var(--c-accent)',
                      borderRadius: 2, opacity: 0.85,
                    }}>
                      <span className="cesa-mono" style={{ position: 'absolute', right: 4, top: -1, fontSize: 9, color: 'var(--c-bg)', lineHeight: '10px' }}>
                        {fmtEur(m.actual)}
                      </span>
                    </div>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  {m.actual ? (
                    <span className="cesa-mono" style={{ fontSize: 10.5, color: m.actual >= m.target ? 'var(--c-positive)' : 'var(--c-danger)' }}>
                      {fmtPct((m.actual / m.target - 1) * 100, { sign: true, decimals: 0 })}
                    </span>
                  ) : (
                    <span className="cesa-mono cesa-muted" style={{ fontSize: 10 }}>geplant</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </Panel>

      {/* Quarters */}
      <Panel title="Quartals-Review" subtitle="Performance pro Quartal">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {QUARTERS.map(q => {
            const t = q.months.reduce((s, m) => s + m.target, 0)
            const a = q.months.reduce((s, m) => s + (m.actual ?? 0), 0)
            const p = q.months.reduce((s, m) => s + (m.profit ?? 0), 0)
            const tagKind = q.status === 'done' ? 'pos' : q.status === 'active' ? 'neutral' : 'warn'
            const tagLabel = q.status === 'done' ? 'abgeschlossen' : q.status === 'active' ? 'laufend' : 'geplant'
            return (
              <div key={q.q} style={{
                padding: '14px 16px',
                background: 'var(--c-surface2)', border: '1px solid var(--c-border)', borderRadius: 'var(--r-md)',
                opacity: q.status === 'upcoming' ? 0.7 : 1,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-textStrong)' }}>{q.q} 2026</span>
                  <Tag kind={tagKind}>{tagLabel}</Tag>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {[
                    { label: 'Ziel',   value: fmtEur(t), show: true },
                    { label: 'Actual', value: q.status !== 'upcoming' ? fmtEur(a) : '—', show: true },
                    { label: 'Profit', value: q.status === 'done' ? fmtEur(p) : '—', show: true },
                  ].map(row => (
                    <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--c-border)', padding: '3px 0' }}>
                      <span className="cesa-muted" style={{ fontSize: 10.5 }}>{row.label}</span>
                      <span className="cesa-mono" style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--c-textStrong)' }}>{row.value}</span>
                    </div>
                  ))}
                </div>
                <div className="cesa-mono cesa-muted" style={{ fontSize: 9.5, marginTop: 8 }}>
                  {q.months.map(m => m.m).join(' · ')}
                </div>
              </div>
            )
          })}
        </div>
      </Panel>

      {/* Running total chart + gaps */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 'var(--gap-x)' }}>
        <Panel title="Running Total · 2026" subtitle="Kumulativer Umsatz vs. Ziel">
          <RunningTotalChart months={MONTHS} />
        </Panel>
        <Panel title="Was bis Ziel?" subtitle="Was muss passieren">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {[
              { label: 'Differenz zu Jahresziel',    value: fmtEur(yearTarget - projection),                                              color: 'var(--c-danger)' },
              { label: 'Benötigte Run rate Δ',        value: `+${fmtPct(((yearTarget - ytdActual) / (yearTarget - ytdTarget) - 1) * 100, { decimals: 0 })}`, color: 'var(--c-textStrong)' },
              { label: 'BFCM-Uplift kritisch',        value: '+€2.400 Annahme',                                                           color: 'var(--c-textStrong)' },
              { label: 'Notwendiger Ø-Monat ab Jun',  value: fmtEur(Math.round((yearTarget - ytdActual) / 7)),                            color: 'var(--c-textStrong)' },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '5px 0', borderBottom: '1px solid var(--c-border)' }}>
                <span className="cesa-muted" style={{ fontSize: 11 }}>{row.label}</span>
                <span className="cesa-mono" style={{ fontSize: 12, fontWeight: 600, color: row.color }}>{row.value}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  )
}
