import { MOCK_DATA } from '@/lib/mock-data'
import { Panel, Tag, StatusDot } from '@/components/cesa/primitives'
import { fmtEur } from '@/lib/formatters'
import { CashflowBars } from './_components/CashflowBars'

const KIND_LABEL: Record<string, string> = {
  payout: 'Payout', ads: 'Ads', supplier: 'Lieferant',
  subscription: 'Abo', rental: 'Miete', income: 'Einnahme',
  tax: 'Steuer', shipping: 'Versand',
}

// May 1, 2026 = Friday → offset 5
function getDayLabel(day: number): string {
  const days = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']
  return days[(4 + day) % 7]
}

export default function CashflowPage() {
  const cf = MOCK_DATA.cashflow

  const totalIn  = cf.entries.filter(e => e.amount > 0 && !e.projected).reduce((s, e) => s + e.amount, 0)
  const totalOut = cf.entries.filter(e => e.amount < 0 && !e.projected).reduce((s, e) => s - e.amount, 0)
  const projIn   = cf.entries.filter(e => e.amount > 0 && e.projected).reduce((s, e) => s + e.amount, 0)
  const projOut  = cf.entries.filter(e => e.amount < 0 && e.projected).reduce((s, e) => s - e.amount, 0)
  const endSaldo = cf.startBalance + totalIn - totalOut + projIn - projOut

  const entriesWithBalance = (() => {
    let bal = cf.startBalance
    return cf.entries.map(e => {
      bal += e.amount
      return { ...e, balance: bal }
    })
  })()

  const futureBalances = entriesWithBalance.filter(e => e.projected).map(e => e.balance)
  const minFutureBalance = futureBalances.length > 0 ? Math.min(...futureBalances) : endSaldo
  const cashSqueeze = minFutureBalance < 500

  const upcomingPayouts  = cf.entries.filter(e => e.projected && e.amount > 0).slice(0, 3)
  const upcomingPayments = cf.entries.filter(e => e.projected && e.amount < 0).slice(0, 3)

  return (
    <div>
      <div className="cesa-pagehead">
        <div>
          <div className="cesa-pagehead__eyebrow">Mai 2026 · tagesbasiert</div>
          <h1 className="cesa-pagehead__title">Cashflow Timeline</h1>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="cesa-btn cesa-btn--ghost">Konto wählen</button>
          <button className="cesa-btn cesa-btn--ghost">CSV Import</button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="cesa-grid cesa-grid--4" style={{ marginBottom: 'var(--gap-y)' }}>
        <KpiStat label="Startsaldo 1.05." value={fmtEur(cf.startBalance)} />
        <KpiStat label="Einnahmen MTD"    value={fmtEur(totalIn)}  sub={`+${fmtEur(projIn)} projiziert`}  kind="pos" />
        <KpiStat label="Ausgaben MTD"     value={fmtEur(totalOut)} sub={`−${fmtEur(projOut)} projiziert`} kind="neg" />
        <KpiStat label="Endsaldo Proj."   value={fmtEur(endSaldo)} sub="31.05.2026"
          kind={endSaldo > cf.startBalance ? 'pos' : 'neg'} />
      </div>

      {/* Chart */}
      <Panel
        title="Tägliche Ein-/Ausgaben"
        subtitle="Grün = Eingang · Rot = Ausgang · transparent = projiziert"
        style={{ marginBottom: 'var(--gap-y)' }}
      >
        <CashflowBars data={cf} />
      </Panel>

      {/* Table + Sidebar */}
      <div className="cesa-grid cesa-grid--3-2">
        <Panel
          title="Transaktionen"
          subtitle="Chronologisch · Mai 2026"
          action={<Tag kind="neutral">{cf.entries.length} Einträge</Tag>}
        >
          <table className="cesa-tbl" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Datum</th>
                <th>Beschreibung</th>
                <th>Kategorie</th>
                <th className="r">Betrag</th>
                <th className="r">Saldo</th>
              </tr>
            </thead>
            <tbody>
              {entriesWithBalance.map((e, i) => (
                <tr key={i} style={{ opacity: e.projected ? 0.65 : 1 }}>
                  <td className="cesa-mono" style={{ whiteSpace: 'nowrap', fontSize: 11.5 }}>
                    {String(e.day).padStart(2, '0')}.05.
                  </td>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 12 }}>{e.label}</span>
                      {e.projected && <Tag kind="neutral">proj.</Tag>}
                    </span>
                  </td>
                  <td>
                    <span className="cesa-pill">{KIND_LABEL[e.kind] ?? e.kind}</span>
                  </td>
                  <td className="r cesa-tbl__num cesa-mono" style={{
                    color: e.amount > 0 ? 'var(--c-positive)' : 'var(--c-danger)',
                  }}>
                    {fmtEur(e.amount, { sign: true })}
                  </td>
                  <td className="r cesa-tbl__num cesa-mono cesa-muted">
                    {fmtEur(e.balance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-y)' }}>
          {/* Engpass-Alarm */}
          <Panel title="Engpass-Alarm">
            <div style={{
              display: 'flex', gap: 10, alignItems: 'flex-start',
              padding: '10px 12px',
              background: cashSqueeze
                ? 'color-mix(in oklab, var(--c-danger) 8%, var(--c-surface))'
                : 'color-mix(in oklab, var(--c-positive) 8%, var(--c-surface))',
              borderRadius: 6,
              border: `1px solid ${cashSqueeze
                ? 'color-mix(in oklab, var(--c-danger) 20%, var(--c-border))'
                : 'color-mix(in oklab, var(--c-positive) 20%, var(--c-border))'}`,
            }}>
              <div style={{ marginTop: 1 }}>
                <StatusDot kind={cashSqueeze ? 'neg' : 'pos'} size={8} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 12.5, color: 'var(--c-textStrong)', marginBottom: 3 }}>
                  {cashSqueeze ? 'Engpass möglich!' : 'Kein Engpass erwartet'}
                </div>
                <div className="cesa-mono" style={{ fontSize: 10.5, color: 'var(--c-muted)' }}>
                  Minimum Saldo 28.05.: {fmtEur(minFutureBalance)}<br />
                  Schwellwert: {fmtEur(500)}
                </div>
              </div>
            </div>
          </Panel>

          {/* Nächste Payouts */}
          <Panel title="Nächste Payouts">
            <table className="cesa-tbl" style={{ width: '100%' }}>
              <tbody>
                {upcomingPayouts.map((e, i) => (
                  <tr key={i}>
                    <td className="cesa-muted" style={{ fontSize: 11 }}>
                      {getDayLabel(e.day)} {String(e.day).padStart(2, '0')}.05.
                    </td>
                    <td className="r cesa-tbl__num cesa-mono" style={{ color: 'var(--c-positive)', whiteSpace: 'nowrap' }}>
                      {fmtEur(e.amount)}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td className="cesa-muted" style={{ fontSize: 11 }}>Mo 01.06.</td>
                  <td className="r cesa-tbl__num cesa-mono" style={{ color: 'var(--c-positive)', whiteSpace: 'nowrap' }}>
                    {fmtEur(310)}
                  </td>
                </tr>
              </tbody>
            </table>
          </Panel>

          {/* Fällige Zahlungen */}
          <Panel title="Fällige Zahlungen">
            <table className="cesa-tbl" style={{ width: '100%' }}>
              <tbody>
                {upcomingPayments.map((e, i) => (
                  <tr key={i}>
                    <td style={{ fontSize: 11 }}>
                      <div className="cesa-muted">{getDayLabel(e.day)} {String(e.day).padStart(2, '0')}.05.</div>
                      <div style={{ color: 'var(--c-text)' }}>{e.label}</div>
                    </td>
                    <td className="r cesa-tbl__num cesa-mono" style={{ color: 'var(--c-danger)', whiteSpace: 'nowrap' }}>
                      {fmtEur(e.amount)}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td style={{ fontSize: 11 }}>
                    <div className="cesa-muted">Mo 01.06.</div>
                    <div style={{ color: 'var(--c-text)' }}>Mieteinnahme</div>
                  </td>
                  <td className="r cesa-tbl__num cesa-mono" style={{ color: 'var(--c-positive)', whiteSpace: 'nowrap' }}>
                    {fmtEur(450)}
                  </td>
                </tr>
              </tbody>
            </table>
          </Panel>
        </div>
      </div>
    </div>
  )
}

function KpiStat({ label, value, sub, kind }: {
  label: string; value: string; sub?: string; kind?: 'pos' | 'neg'
}) {
  return (
    <div className="cesa-panel" style={{ padding: 0 }}>
      <div style={{ padding: 'var(--pad)' }}>
        <div className="cesa-muted cesa-mono" style={{ fontSize: 10.5, marginBottom: 4 }}>
          {label}
        </div>
        <div className="cesa-mono" style={{
          fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em',
          color: kind === 'pos' ? 'var(--c-positive)' : kind === 'neg' ? 'var(--c-danger)' : 'var(--c-textStrong)',
        }}>
          {value}
        </div>
        {sub && (
          <div className="cesa-muted cesa-mono" style={{ fontSize: 10.5, marginTop: 3 }}>
            {sub}
          </div>
        )}
      </div>
    </div>
  )
}
