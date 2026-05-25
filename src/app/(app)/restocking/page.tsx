import { MOCK_DATA } from '@/lib/mock-data'
import { Panel, Tag, StatusDot } from '@/components/cesa/primitives'
import { fmtEur, fmtNum, fmtPct } from '@/lib/formatters'
import { StockTimeline } from './_components/StockTimeline'

const SUPPLIER_MAP: Record<string, string> = {
  'HOD': 'Müller Textil',
  'CRW': 'Müller Textil',
  'TEE': 'Schmidt & Co.',
  'CAP': 'Kopfbedeckung GmbH',
}

function getSupplier(sku: string) {
  const prefix = sku.split('-')[0]
  return SUPPLIER_MAP[prefix] ?? 'Unbekannt'
}

function getStatus(daysToStockout: number, leadTime: number): 'critical' | 'reorder' | 'ok' {
  if (daysToStockout <= leadTime) return 'critical'
  if (daysToStockout <= leadTime * 1.5) return 'reorder'
  return 'ok'
}

const STATUS_LABEL = { critical: 'Kritisch', reorder: 'Bestellen', ok: 'OK' }
const STATUS_TAG: Record<string, 'neg' | 'warn' | 'pos'> = { critical: 'neg', reorder: 'warn', ok: 'pos' }

// Reorder = 30-day supply rounded up to nearest 5
function reorderQty(dailyRate: number) {
  return Math.ceil((dailyRate * 30) / 5) * 5
}

export default function RestockingPage() {
  const products = MOCK_DATA.products.map(p => ({
    ...p,
    status: getStatus(p.daysToStockout, p.leadTime),
    supplier: getSupplier(p.sku),
    reorderQty: reorderQty(p.dailyRate),
    reorderCost: reorderQty(p.dailyRate) * p.cogs,
    orderArrivalDays: p.leadTime,
  })).sort((a, b) => {
    const priority = { critical: 0, reorder: 1, ok: 2 }
    return priority[a.status] - priority[b.status] || a.daysToStockout - b.daysToStockout
  })

  const critical = products.filter(p => p.status === 'critical')
  const reorder  = products.filter(p => p.status === 'reorder')
  const ok       = products.filter(p => p.status === 'ok')

  const totalReorderCost = products
    .filter(p => p.status !== 'ok')
    .reduce((s, p) => s + p.reorderCost, 0)

  const avgLeadTime = Math.round(products.reduce((s, p) => s + p.leadTime, 0) / products.length)

  // Group by supplier for order summary
  const bySupplier: Record<string, { cost: number; skus: string[]; leadTime: number }> = {}
  products.filter(p => p.status !== 'ok').forEach(p => {
    if (!bySupplier[p.supplier]) bySupplier[p.supplier] = { cost: 0, skus: [], leadTime: p.leadTime }
    bySupplier[p.supplier].cost += p.reorderCost
    bySupplier[p.supplier].skus.push(p.sku)
  })

  const timelineProducts = products.map(p => ({
    name: p.name,
    sku: p.sku,
    daysToStockout: p.daysToStockout,
    leadTime: p.leadTime,
    status: p.status,
  }))

  return (
    <div>
      {/* Page header */}
      <div className="cesa-pagehead">
        <div>
          <div className="cesa-pagehead__eyebrow">Lagerstand · {products.length} SKUs · Heute 25.05.2026</div>
          <h1 className="cesa-pagehead__title">Restocking Intelligence</h1>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {critical.length > 0 && <Tag kind="neg" dot>{critical.length} kritisch</Tag>}
          {reorder.length > 0  && <Tag kind="warn" dot>{reorder.length} bestellen</Tag>}
          <button className="cesa-btn cesa-btn--ghost">Shopify Sync</button>
          <button className="cesa-btn cesa-btn--ghost">Bestellung erstellen</button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="cesa-grid cesa-grid--4" style={{ marginBottom: 'var(--gap-y)' }}>
        <RestockKpi
          label="Kritische SKUs"
          value={String(critical.length)}
          sub="Stockout vor Lieferung"
          kind={critical.length > 0 ? 'neg' : 'pos'}
        />
        <RestockKpi
          label="Bestellen empfohlen"
          value={String(reorder.length)}
          sub="innerhalb Lead Time"
          kind={reorder.length > 0 ? 'warn' : 'pos'}
        />
        <RestockKpi
          label="Geschätzter Bestellwert"
          value={fmtEur(totalReorderCost)}
          sub={`${critical.length + reorder.length} SKUs · COGS`}
        />
        <RestockKpi
          label="Ø Lead Time"
          value={`${avgLeadTime} Tage`}
          sub="über alle Lieferanten"
        />
      </div>

      {/* Main table + right column */}
      <div className="cesa-grid cesa-grid--3-2">

        {/* Restocking table */}
        <Panel
          title="Bestandsübersicht"
          subtitle="Sortiert nach Dringlichkeit"
          action={<Tag kind="neutral">{products.length} SKUs</Tag>}
        >
          <table className="cesa-tbl" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Produkt</th>
                <th className="r">Bestand</th>
                <th className="r">Reichweite</th>
                <th className="r">Lead Time</th>
                <th className="r">Bestell-Menge</th>
                <th className="r">Bestellkosten</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.sku} style={{
                  background: p.status === 'critical'
                    ? 'color-mix(in oklab, var(--c-danger) 4%, transparent)'
                    : undefined,
                }}>
                  <td>
                    <div style={{ fontWeight: 500, fontSize: 12.5, color: 'var(--c-textStrong)' }}>{p.name}</div>
                    <div className="cesa-mono cesa-muted" style={{ fontSize: 10 }}>{p.sku} · {p.supplier}</div>
                  </td>
                  <td className="r cesa-tbl__num cesa-mono">{p.stock}</td>
                  <td className="r cesa-tbl__num">
                    <span className="cesa-mono" style={{
                      fontWeight: 600,
                      color: p.status === 'critical' ? 'var(--c-danger)' : p.status === 'reorder' ? 'var(--c-warning)' : 'var(--c-positive)',
                    }}>
                      {fmtNum(p.daysToStockout, { decimals: 0, suffix: 'd' })}
                    </span>
                  </td>
                  <td className="r cesa-tbl__num cesa-mono cesa-muted">{p.leadTime}d</td>
                  <td className="r cesa-tbl__num">
                    {p.status !== 'ok' ? (
                      <span className="cesa-mono cesa-strong">{p.reorderQty} Stk.</span>
                    ) : (
                      <span className="cesa-muted cesa-mono">—</span>
                    )}
                  </td>
                  <td className="r cesa-tbl__num cesa-mono">
                    {p.status !== 'ok' ? fmtEur(p.reorderCost) : <span className="cesa-muted">—</span>}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <StatusDot
                        kind={p.status === 'critical' ? 'neg' : p.status === 'reorder' ? 'warning' : 'pos'}
                        size={7}
                      />
                      <Tag kind={STATUS_TAG[p.status]}>{STATUS_LABEL[p.status]}</Tag>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Alert banner */}
          {critical.length > 0 && (
            <div style={{
              margin: '12px 0 0',
              padding: '10px 14px',
              background: 'color-mix(in oklab, var(--c-danger) 8%, var(--c-surface))',
              border: '1px solid color-mix(in oklab, var(--c-danger) 25%, var(--c-border))',
              borderRadius: 'var(--r-sm)',
              fontSize: 12, color: 'var(--c-textStrong)',
            }}>
              <b>{critical.length} SKU{critical.length > 1 ? 's werden' : ' wird'} stocken, bevor die Lieferung eintrifft.</b>{' '}
              Sofortige Bestellung empfohlen.
            </div>
          )}
        </Panel>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-y)' }}>

          {/* Timeline */}
          <Panel title="Stockout-Timeline" subtitle="Reichweite der nächsten 45 Tage">
            <StockTimeline products={timelineProducts} horizonDays={45} />
            <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--c-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 2, background: 'var(--c-danger)', display: 'inline-block', borderRadius: 1 }} />
                Stockout
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 2, background: 'var(--c-warning)', display: 'inline-block', borderRadius: 1, borderTop: '1px dashed var(--c-warning)' }} />
                Lead Time
              </span>
            </div>
          </Panel>

          {/* Supplier order summary */}
          <Panel title="Bestellung nach Lieferant" subtitle="Empfohlene Bestellungen">
            {Object.keys(bySupplier).length === 0 ? (
              <div style={{
                padding: '12px', textAlign: 'center', color: 'var(--c-muted)', fontSize: 12,
                background: 'color-mix(in oklab, var(--c-positive) 6%, var(--c-surface))',
                borderRadius: 'var(--r-sm)', border: '1px solid color-mix(in oklab, var(--c-positive) 20%, var(--c-border))',
              }}>
                Kein Restocking nötig.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {Object.entries(bySupplier).map(([supplier, info]) => (
                  <div key={supplier} style={{
                    padding: '10px 12px',
                    background: 'var(--c-surface2)',
                    border: '1px solid var(--c-border)',
                    borderRadius: 'var(--r-sm)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 12.5, color: 'var(--c-textStrong)', marginBottom: 2 }}>{supplier}</div>
                        <div className="cesa-muted cesa-mono" style={{ fontSize: 10 }}>
                          {info.skus.length} SKU{info.skus.length > 1 ? 's' : ''} · {info.leadTime}d Lead Time
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div className="cesa-mono" style={{ fontSize: 15, fontWeight: 700, color: 'var(--c-textStrong)' }}>
                          {fmtEur(info.cost)}
                        </div>
                        <div className="cesa-muted cesa-mono" style={{ fontSize: 10 }}>COGS</div>
                      </div>
                    </div>
                    <div style={{ marginTop: 6, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {info.skus.map(sku => (
                        <span key={sku} className="cesa-pill" style={{ fontSize: 9 }}>{sku}</span>
                      ))}
                    </div>
                  </div>
                ))}

                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '8px 12px',
                  borderTop: '1px solid var(--c-borderStrong)',
                  marginTop: 2,
                  fontSize: 12.5, fontWeight: 600,
                }}>
                  <span className="cesa-strong">Gesamtbestellung</span>
                  <span className="cesa-mono cesa-strong">{fmtEur(totalReorderCost)}</span>
                </div>
              </div>
            )}
          </Panel>

          {/* Daily velocity */}
          <Panel title="Tages-Abverkauf" subtitle="Ø Units/Tag je SKU">
            <table className="cesa-tbl" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>SKU</th>
                  <th className="r">Ø/Tag</th>
                  <th className="r">30d Bedarf</th>
                  <th>Tempo</th>
                </tr>
              </thead>
              <tbody>
                {[...products].sort((a, b) => b.dailyRate - a.dailyRate).map(p => {
                  const maxRate = Math.max(...products.map(x => x.dailyRate))
                  const barPct = (p.dailyRate / maxRate) * 100
                  return (
                    <tr key={p.sku}>
                      <td>
                        <div style={{ fontSize: 11.5 }}>{p.name.split(' ').slice(0, 3).join(' ')}</div>
                        <div className="cesa-mono cesa-muted" style={{ fontSize: 9.5 }}>{p.sku}</div>
                      </td>
                      <td className="r cesa-tbl__num cesa-mono">
                        {fmtNum(p.dailyRate, { decimals: 1 })}
                      </td>
                      <td className="r cesa-tbl__num cesa-mono cesa-muted">
                        {Math.ceil(p.dailyRate * 30)}
                      </td>
                      <td style={{ width: 70 }}>
                        <div style={{ height: 4, background: 'var(--c-surface3)', borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{
                            height: '100%', width: `${barPct}%`,
                            background: 'var(--c-accent)', borderRadius: 2,
                          }} />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </Panel>
        </div>
      </div>
    </div>
  )
}

function RestockKpi({ label, value, sub, kind }: {
  label: string; value: string; sub?: string; kind?: 'pos' | 'neg' | 'warn'
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
      {sub && <div className="cesa-muted cesa-mono" style={{ fontSize: 10.5, marginTop: 4 }}>{sub}</div>}
    </div>
  )
}
