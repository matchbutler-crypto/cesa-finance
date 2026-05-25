import { MOCK_DATA } from '@/lib/mock-data'
import { Panel, Tag, StatusDot } from '@/components/cesa/primitives'
import { fmtEur, fmtPct, fmtNum } from '@/lib/formatters'
import { ForecastChart } from './_components/ForecastChart'

const SCENARIOS = [
  {
    key: 'bear',
    label: 'Bear −25%',
    emoji: '🐻',
    multiplier: 0.75,
    color: 'var(--c-danger)',
    desc: 'Schwache Restwoche, wenig Ads-Performance',
    probability: 15,
  },
  {
    key: 'base',
    label: 'Base',
    emoji: '📈',
    multiplier: 1.0,
    color: 'var(--c-accent)',
    desc: 'Aktueller Trend setzt sich fort',
    probability: 65,
  },
  {
    key: 'bull',
    label: 'Bull +35%',
    emoji: '🚀',
    multiplier: 1.35,
    color: 'var(--c-positive)',
    desc: 'Starke Wochenend-Performance + Viral-Effekt',
    probability: 20,
  },
]

export default function ForecastPage() {
  const { forecast: fc, ads } = MOCK_DATA

  const remainingDays = fc.daysInMonth - fc.daysElapsed
  const pctElapsed = fc.daysElapsed / fc.daysInMonth
  const pctAchieved = fc.mtdRevenue / fc.target
  const targetDailyNeeded = (fc.target - fc.mtdRevenue) / remainingDays
  const onTrack = fc.dailyRunRate >= targetDailyNeeded

  const computedScenarios = SCENARIOS.map(sc => {
    const projectedRevenue = fc.mtdRevenue + fc.dailyRunRate * sc.multiplier * remainingDays
    const delta = projectedRevenue - fc.target
    return { ...sc, projectedRevenue, delta, dailyRate: fc.dailyRunRate * sc.multiplier }
  })

  const chartScenarios = computedScenarios.map(sc => ({
    label: sc.label,
    dailyRate: sc.dailyRate,
    color: sc.color,
  }))

  const bestDay = fc.daily.reduce((best, v, i) => v > best.val ? { val: v, day: i + 1 } : best, { val: 0, day: 0 })
  const worstDay = fc.daily.reduce((worst, v, i) => v < worst.val ? { val: v, day: i + 1 } : worst, { val: Infinity, day: 0 })

  return (
    <div>
      {/* Page header */}
      <div className="cesa-pagehead">
        <div>
          <div className="cesa-pagehead__eyebrow">Mai 2026 · Tag {fc.daysElapsed}/{fc.daysInMonth} · Prognose</div>
          <h1 className="cesa-pagehead__title">Forecast & Scenarios</h1>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <Tag kind={onTrack ? 'pos' : 'warn'} dot>
            {onTrack ? 'On Track' : 'Hinter Plan'}
          </Tag>
          <button className="cesa-btn cesa-btn--ghost">Ziel anpassen</button>
          <button className="cesa-btn cesa-btn--ghost">Export</button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="cesa-grid cesa-grid--4" style={{ marginBottom: 'var(--gap-y)' }}>
        <ForecastKpi
          label="MTD Umsatz"
          value={fmtEur(fc.mtdRevenue)}
          sub={`Ziel: ${fmtEur(fc.target)}`}
          bar={{ pct: pctAchieved, kind: pctAchieved >= pctElapsed ? 'pos' : 'warn' }}
        />
        <ForecastKpi
          label="Proj. Monatsende"
          value={fmtEur(fc.projectedMonthEnd)}
          sub={fc.projectedMonthEnd >= fc.target
            ? `+${fmtEur(fc.projectedMonthEnd - fc.target)} über Ziel`
            : `${fmtEur(fc.projectedMonthEnd - fc.target)} unter Ziel`}
          kind={fc.projectedMonthEnd >= fc.target ? 'pos' : 'neg'}
        />
        <ForecastKpi
          label="Tages-Ø aktuell"
          value={fmtEur(fc.dailyRunRate)}
          sub={`nötig: ${fmtEur(targetDailyNeeded)}/Tag`}
          kind={onTrack ? 'pos' : 'warn'}
        />
        <ForecastKpi
          label="Tage bis Ziel"
          value={onTrack ? fmtNum(fc.daysToTarget, { decimals: 1, suffix: ' d' }) : '—'}
          sub={onTrack ? 'bei aktuellem Ø' : `Defizit ${fmtEur(fc.target - fc.mtdRevenue)}`}
          kind={onTrack ? 'pos' : 'neg'}
        />
      </div>

      {/* Chart */}
      <Panel
        title="Tagesumsätze Mai 2026"
        subtitle={`${fc.daysElapsed} Tage Ist · ${remainingDays} Tage Prognose · 3 Szenarien`}
        style={{ marginBottom: 'var(--gap-y)' }}
      >
        <ForecastChart
          daily={fc.daily}
          daysInMonth={fc.daysInMonth}
          daysElapsed={fc.daysElapsed}
          target={fc.target}
          scenarios={chartScenarios}
        />
      </Panel>

      {/* Scenarios + Insights */}
      <div className="cesa-grid cesa-grid--3-2" style={{ marginBottom: 'var(--gap-y)' }}>

        {/* Scenario Cards */}
        <Panel title="Szenarien" subtitle="Auf Basis des aktuellen Tages-Ø">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {computedScenarios.map((sc) => (
              <div key={sc.key} style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                alignItems: 'center',
                gap: 14,
                padding: '12px 14px',
                background: 'var(--c-surface2)',
                border: '1px solid var(--c-border)',
                borderRadius: 'var(--r-md)',
                borderLeft: `3px solid ${sc.color}`,
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 13 }}>{sc.emoji}</span>
                    <span style={{ fontWeight: 600, fontSize: 12.5, color: 'var(--c-textStrong)' }}>{sc.label}</span>
                    <span className="cesa-tag" style={{
                      fontSize: 10, color: sc.color,
                      borderColor: `color-mix(in oklab, ${sc.color} 30%, var(--c-border))`,
                    }}>
                      {sc.probability}%
                    </span>
                  </div>
                  <div className="cesa-muted" style={{ fontSize: 11 }}>{sc.desc}</div>
                  <div style={{ marginTop: 6, fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--c-muted)' }}>
                    Ø {fmtEur(sc.dailyRate)}/Tag · {remainingDays} Tage
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-mono)',
                    letterSpacing: '-0.02em', color: 'var(--c-textStrong)',
                  }}>
                    {fmtEur(sc.projectedRevenue)}
                  </div>
                  <div style={{
                    fontSize: 11, fontFamily: 'var(--font-mono)',
                    color: sc.delta >= 0 ? 'var(--c-positive)' : 'var(--c-danger)',
                    marginTop: 2,
                  }}>
                    {sc.delta >= 0 ? '+' : ''}{fmtEur(sc.delta)}
                  </div>
                </div>
              </div>
            ))}

            {/* Progress bar toward target */}
            <div style={{ padding: '10px 14px', background: 'var(--c-surface2)', borderRadius: 'var(--r-sm)', border: '1px solid var(--c-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 11, color: 'var(--c-muted)', fontFamily: 'var(--font-mono)' }}>
                <span>Zielerreichung</span>
                <span>{fmtPct(pctAchieved * 100, { decimals: 0 })} von {fmtEur(fc.target)}</span>
              </div>
              <div style={{ height: 6, background: 'var(--c-surface3)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${Math.min(pctAchieved * 100, 100)}%`,
                  background: pctAchieved >= pctElapsed ? 'var(--c-positive)' : 'var(--c-warning)',
                  borderRadius: 3, transition: 'width 0.3s ease',
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5, fontSize: 10, color: 'var(--c-subtle)', fontFamily: 'var(--font-mono)' }}>
                <span>{fmtEur(fc.mtdRevenue)} erreicht</span>
                <span>{fmtEur(fc.target - fc.mtdRevenue)} offen</span>
              </div>
            </div>
          </div>
        </Panel>

        {/* Crystal Ball + Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-y)' }}>

          {/* Crystal Ball */}
          <Panel title="Crystal Ball" subtitle="Automatische Analyse">
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <CrystalItem
                kind={onTrack ? 'pos' : 'warn'}
                text={onTrack
                  ? `Tagesdurchschnitt ${fmtEur(fc.dailyRunRate)} liegt über nötigem Minimum ${fmtEur(targetDailyNeeded)}`
                  : `Tagesdurchschnitt ${fmtEur(fc.dailyRunRate)} reicht nicht — täglich ${fmtEur(targetDailyNeeded)} nötig`}
              />
              <CrystalItem
                kind={ads.roas >= ads.breakEvenRoas ? 'pos' : 'neg'}
                text={`ROAS ${fmtNum(ads.roas, { decimals: 2 })}x ${ads.roas >= ads.breakEvenRoas ? '✓ über' : '✗ unter'} Break-Even ${fmtNum(ads.breakEvenRoas, { decimals: 2 })}x`}
              />
              <CrystalItem
                kind="info"
                text={`Bestes Einzeltag: ${String(bestDay.day).padStart(2, '0')}.05. mit ${fmtEur(bestDay.val)}`}
              />
              <CrystalItem
                kind="neutral"
                text={`Vormonat: ${fmtEur(fc.lastMonth)} · Vorvormonat: ${fmtEur(fc.twoMonthsAgo)}`}
              />
              <CrystalItem
                kind={fc.projectedMonthEnd > fc.lastMonth ? 'pos' : 'warn'}
                text={fc.projectedMonthEnd > fc.lastMonth
                  ? `Proj. ${fmtEur(fc.projectedMonthEnd)} > Vormonat ${fmtEur(fc.lastMonth)} (+${fmtPct((fc.projectedMonthEnd / fc.lastMonth - 1) * 100, { decimals: 0 })})`
                  : `Proj. ${fmtEur(fc.projectedMonthEnd)} < Vormonat ${fmtEur(fc.lastMonth)}`}
              />
            </ul>
          </Panel>

          {/* Month Comparison */}
          <Panel title="Monatsvergleich" subtitle="Umsatz-Historie">
            <table className="cesa-tbl" style={{ width: '100%' }}>
              <tbody>
                <tr>
                  <td className="cesa-muted" style={{ fontSize: 11 }}>Vorvormonat</td>
                  <td className="r cesa-mono cesa-tbl__num">{fmtEur(fc.twoMonthsAgo)}</td>
                  <td className="r" style={{ width: 60 }}>
                    <span className="cesa-muted cesa-mono" style={{ fontSize: 10 }}>Basis</span>
                  </td>
                </tr>
                <tr>
                  <td className="cesa-muted" style={{ fontSize: 11 }}>Vormonat</td>
                  <td className="r cesa-mono cesa-tbl__num">{fmtEur(fc.lastMonth)}</td>
                  <td className="r">
                    <span className={`cesa-delta cesa-delta--${fc.lastMonth > fc.twoMonthsAgo ? 'pos' : 'neg'}`} style={{ fontSize: 10.5 }}>
                      {fmtPct((fc.lastMonth / fc.twoMonthsAgo - 1) * 100, { decimals: 0, sign: true })}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style={{ fontSize: 11 }}>
                    <span className="cesa-strong">Mai (proj.)</span>
                  </td>
                  <td className="r cesa-mono cesa-tbl__num cesa-strong">{fmtEur(fc.projectedMonthEnd)}</td>
                  <td className="r">
                    <span className={`cesa-delta cesa-delta--${fc.projectedMonthEnd > fc.lastMonth ? 'pos' : 'neg'}`} style={{ fontSize: 10.5 }}>
                      {fmtPct((fc.projectedMonthEnd / fc.lastMonth - 1) * 100, { decimals: 0, sign: true })}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="cesa-muted" style={{ fontSize: 11 }}>Jun (trend)</td>
                  <td className="r cesa-mono cesa-tbl__num cesa-muted">{fmtEur(Math.round(fc.projectedMonthEnd * 1.08))}</td>
                  <td className="r">
                    <span className="cesa-delta cesa-delta--pos" style={{ fontSize: 10.5 }}>+8%</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </Panel>

          {/* Daily Stats */}
          <Panel title="Tages-Statistik">
            <table className="cesa-tbl" style={{ width: '100%' }}>
              <tbody>
                <StatRow label="Bester Tag" value={`${String(bestDay.day).padStart(2, '0')}.05.`} num={fmtEur(bestDay.val)} kind="pos" />
                <StatRow label="Schlechtester Tag" value={`${String(worstDay.day).padStart(2, '0')}.05.`} num={fmtEur(worstDay.val)} kind="neg" />
                <StatRow label="Tages-Ø (Ist)" value={`${fc.daysElapsed} Tage`} num={fmtEur(fc.dailyRunRate)} />
                <StatRow label="Nötig (Rest)" value={`${remainingDays} Tage`} num={fmtEur(targetDailyNeeded)} kind={onTrack ? 'pos' : 'warn'} />
              </tbody>
            </table>
          </Panel>
        </div>
      </div>
    </div>
  )
}

// ── Sub-components ──────────────────────────────────────────

function ForecastKpi({ label, value, sub, kind, bar }: {
  label: string
  value: string
  sub?: string
  kind?: 'pos' | 'neg' | 'warn'
  bar?: { pct: number; kind: 'pos' | 'warn' | 'neg' }
}) {
  const color = kind === 'pos' ? 'var(--c-positive)' : kind === 'neg' ? 'var(--c-danger)' : kind === 'warn' ? 'var(--c-warning)' : 'var(--c-textStrong)'
  return (
    <div className="cesa-panel" style={{ padding: 'var(--pad)' }}>
      <div className="cesa-muted cesa-mono" style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>
        {label}
      </div>
      <div className="cesa-mono" style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.025em', color, lineHeight: 1.1 }}>
        {value}
      </div>
      {sub && (
        <div className="cesa-muted cesa-mono" style={{ fontSize: 10.5, marginTop: 4 }}>{sub}</div>
      )}
      {bar && (
        <div style={{ marginTop: 8, height: 3, background: 'var(--c-surface3)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${Math.min(bar.pct * 100, 100)}%`,
            background: bar.kind === 'pos' ? 'var(--c-positive)' : bar.kind === 'warn' ? 'var(--c-warning)' : 'var(--c-danger)',
            borderRadius: 2,
          }} />
        </div>
      )}
    </div>
  )
}

function CrystalItem({ kind, text }: { kind: 'pos' | 'neg' | 'warn' | 'info' | 'neutral'; text: string }) {
  const colors = {
    pos: 'var(--c-positive)', neg: 'var(--c-danger)',
    warn: 'var(--c-warning)', info: 'var(--c-accent)', neutral: 'var(--c-muted)',
  }
  return (
    <li style={{
      display: 'flex', gap: 8, alignItems: 'flex-start',
      padding: '7px 10px', background: 'var(--c-surface2)',
      border: '1px solid var(--c-border)', borderRadius: 'var(--r-sm)',
      borderLeft: `3px solid ${colors[kind]}`,
    }}>
      <span style={{ fontSize: 11, color: 'var(--c-text)', lineHeight: 1.5 }}>{text}</span>
    </li>
  )
}

function StatRow({ label, value, num, kind }: {
  label: string; value: string; num: string; kind?: 'pos' | 'neg' | 'warn'
}) {
  const color = kind === 'pos' ? 'var(--c-positive)' : kind === 'neg' ? 'var(--c-danger)' : kind === 'warn' ? 'var(--c-warning)' : 'var(--c-textStrong)'
  return (
    <tr>
      <td style={{ fontSize: 11.5 }}>{label}</td>
      <td className="cesa-muted" style={{ fontSize: 11, fontFamily: 'var(--font-mono)' }}>{value}</td>
      <td className="r cesa-tbl__num cesa-mono" style={{ color }}>{num}</td>
    </tr>
  )
}
