import { MOCK_DATA } from '@/lib/mock-data'
import { Panel, Tag, Sparkline } from '@/components/cesa/primitives'
import { fmtEur, fmtPct, fmtDate } from '@/lib/formatters'
import { NetWorthHero } from './_components/NetWorthHero'
import { KpiCard } from './_components/KpiCard'
import { DailyCheckin } from './_components/DailyCheckin'
import { AlertList } from './_components/AlertList'
import { fetchShopifyDashboard } from '@/lib/api/shopify'
import { fetchMetaDashboard } from '@/lib/api/meta'

const ACCOUNT_ABBREV: Record<string, string> = {
  bank: 'BNK', store: 'SHP', paypal: 'PP', savings: 'TG', real: 'IMO',
}

const MONTHLY_TARGET = 20000 // EUR — anpassen wenn Ziele-System live ist

export default async function DashboardPage() {
  const { netWorth: nw, products } = MOCK_DATA
  const savingsBalance = nw.accounts.find(a => a.kind === 'savings')?.balance ?? 0
  const bankBalance    = nw.accounts[0].balance
  const top3 = [...products].sort((a, b) => b.profit - a.profit).slice(0, 3)

  const now = new Date()
  const day = now.getDate()
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const monthName = now.toLocaleDateString('de-DE', { month: 'long' })

  // Fetch live data, fall back silently on error
  const [shopify, meta] = await Promise.all([
    fetchShopifyDashboard().catch(() => null),
    fetchMetaDashboard().catch(() => null),
  ])

  // Build forecast from real Shopify data (or mock fallback)
  const mtdRevenue        = shopify?.mtdRevenue        ?? MOCK_DATA.forecast.mtdRevenue
  const lastMonthRevenue  = shopify?.lastMonthRevenue  ?? MOCK_DATA.forecast.lastMonth
  const dailyRevenue      = shopify?.dailyRevenue      ?? MOCK_DATA.forecast.daily
  const daysElapsed       = shopify ? day : MOCK_DATA.forecast.daysElapsed
  const dailyRunRate      = daysElapsed > 0 ? mtdRevenue / daysElapsed : 0
  const projectedMonthEnd = dailyRunRate * daysInMonth
  const daysToTarget      = dailyRunRate > 0 ? Math.max(0, (MONTHLY_TARGET - mtdRevenue) / dailyRunRate) : 0
  const vsLastMonth       = lastMonthRevenue > 0 ? (mtdRevenue / lastMonthRevenue - 1) * 100 : 0

  // Build ads from real Meta data (or mock fallback)
  const ads = meta ?? MOCK_DATA.ads

  const liveAds = {
    ...MOCK_DATA.ads,
    ...ads,
  }

  return (
    <div>
      {/* Page header */}
      <div className="cesa-pagehead">
        <div>
          <div className="cesa-pagehead__eyebrow">{monthName} {now.getFullYear()} · Tag {day}/{daysInMonth}</div>
          <h1 className="cesa-pagehead__title">Dashboard</h1>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {shopify && (
            <span className="cesa-pill" style={{ background: 'var(--c-pos-bg)', color: 'var(--c-pos)', fontSize: 10 }}>
              Live · Shopify
            </span>
          )}
          {meta && (
            <span className="cesa-pill" style={{ background: 'var(--c-pos-bg)', color: 'var(--c-pos)', fontSize: 10 }}>
              Live · Meta
            </span>
          )}
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
                  <td className="r cesa-tbl__num cesa-muted">fällig {fmtDate(l.due)}</td>
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
          <DailyCheckin netWorth={nw} ads={liveAds} />
        </Panel>
      </div>

      {/* KPI Cards — live Shopify + Meta data */}
      <div className="cesa-grid cesa-grid--4" style={{ marginBottom: 'var(--gap-y)' }}>
        <KpiCard
          label="Umsatz MTD"
          value={fmtEur(mtdRevenue)}
          delta={fmtPct(vsLastMonth, { sign: true })}
          deltaKind={vsLastMonth >= 0 ? 'pos' : 'neg'}
          sub={`Ziel ${fmtEur(MONTHLY_TARGET)}`}
          chart={<Sparkline data={dailyRevenue} width={92} height={28} stroke="var(--c-text)" />}
        />
        <KpiCard
          label="Projektion EOM"
          value={fmtEur(projectedMonthEnd)}
          delta={`${projectedMonthEnd >= MONTHLY_TARGET ? '+' : ''}${(projectedMonthEnd - MONTHLY_TARGET).toFixed(0)} vs. Ziel`}
          deltaKind={projectedMonthEnd >= MONTHLY_TARGET ? 'pos' : 'neg'}
          sub={`Run rate ${fmtEur(dailyRunRate, { decimals: 0 })}/Tag`}
        />
        <KpiCard
          label="Ad ROAS heute"
          value={liveAds.roas > 0 ? `${liveAds.roas.toFixed(2)}x` : '—'}
          delta={`Break-even ${liveAds.breakEvenRoas}x`}
          deltaKind={liveAds.roas >= liveAds.breakEvenRoas ? 'pos' : 'neg'}
          sub={liveAds.roas >= liveAds.breakEvenRoas ? 'Skalieren empfohlen' : 'Unter Break-even'}
          status={liveAds.status as 'pos' | 'neg' | undefined}
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
