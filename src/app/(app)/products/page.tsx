import { MOCK_DATA } from '@/lib/mock-data'
import { fetchShopifyProductData, type ShopifyProductData } from '@/lib/api/shopify'
import { Panel, Tag, StatusDot } from '@/components/cesa/primitives'
import { fmtEur, fmtPct, fmtNum } from '@/lib/formatters'
import { WaterfallBar, MarginMiniBar } from './_components/MarginBar'

function stockKind(days: number): 'pos' | 'warning' | 'neg' {
  if (days > 21) return 'pos'
  if (days > 10) return 'warning'
  return 'neg'
}

function marginKind(m: number): 'pos' | 'warn' | 'neg' | 'neutral' {
  if (m > 0.35) return 'pos'
  if (m > 0.2) return 'warn'
  return 'neg'
}

// Normalise ShopifyProductData into the shape the page expects
function toPageProduct(p: ShopifyProductData) {
  return {
    sku: p.sku,
    name: p.name,
    price: p.price,
    cogs: p.cogs,
    ads: 0,            // Meta Ads not broken down per SKU
    returns: 0,        // Returns aggregation skipped (complex)
    units: p.units,
    stock: p.stock,
    leadTime: p.leadTime,
    revenue: p.revenue,
    totalCogs: p.totalCogs,
    totalAds: 0,
    totalReturns: 0,
    profit: p.profit,
    margin: p.margin,
    daysToStockout: p.daysToStockout,
    dailyRate: p.dailyRate,
  }
}

export default async function ProductsPage() {
  let products: ReturnType<typeof toPageProduct>[]
  let isLive = false

  try {
    const shopifyProducts = await fetchShopifyProductData()
    // Fall back to mock if Shopify returns empty (no sales yet / token missing)
    if (shopifyProducts.length > 0) {
      products = shopifyProducts.map(toPageProduct)
      isLive = true
    } else {
      products = [...MOCK_DATA.products]
    }
  } catch {
    products = [...MOCK_DATA.products]
  }

  products = [...products].sort((a, b) => b.profit - a.profit)

  const totalRevenue = products.reduce((s, p) => s + p.revenue, 0)
  const totalProfit  = products.reduce((s, p) => s + p.profit, 0)
  const totalCogs    = products.reduce((s, p) => s + p.totalCogs, 0)
  const totalAds     = products.reduce((s, p) => s + p.totalAds, 0)
  const totalReturns = products.reduce((s, p) => s + p.totalReturns, 0)
  const avgMargin    = totalProfit / totalRevenue
  const maxMargin    = Math.max(...products.map(p => p.margin))

  const topProduct  = products[0]
  const lowStock    = products.filter(p => p.daysToStockout < 14).sort((a, b) => a.daysToStockout - b.daysToStockout)

  return (
    <div>
      {/* Page header */}
      <div className="cesa-pagehead">
        <div>
          <div className="cesa-pagehead__eyebrow">
          {new Date().toLocaleString('de-DE', { month: 'long', year: 'numeric' })} · {products.length} SKUs · MTD
          {isLive && <span style={{ marginLeft: 8, color: 'var(--c-positive)', fontSize: 10 }}>● Live · Shopify</span>}
          {!isLive && <span style={{ marginLeft: 8, color: 'var(--c-muted)', fontSize: 10 }}>● Mock-Daten</span>}
        </div>
          <h1 className="cesa-pagehead__title">Produkt-Profitabilität</h1>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="cesa-btn cesa-btn--ghost">Shopify Sync</button>
          <button className="cesa-btn cesa-btn--ghost">CSV Export</button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="cesa-grid cesa-grid--4" style={{ marginBottom: 'var(--gap-y)' }}>
        <ProdKpi label="Gesamtumsatz" value={fmtEur(totalRevenue)} sub={`${products.reduce((s, p) => s + p.units, 0)} Units verkauft`} />
        <ProdKpi label="Gesamtgewinn" value={fmtEur(totalProfit)} sub={`nach COGS, Ads, Returns`} kind="pos" />
        <ProdKpi label="Ø Marge" value={fmtPct(avgMargin * 100, { decimals: 1 })} sub={`Beste: ${fmtPct(maxMargin * 100, { decimals: 1 })}`} kind={avgMargin > 0.3 ? 'pos' : 'warn'} />
        <ProdKpi label="Top SKU" value={topProduct.name.split(' ').slice(0, 2).join(' ')} sub={`${fmtEur(topProduct.profit)} Gewinn`} kind="pos" />
      </div>

      {/* Waterfall overview */}
      <Panel
        title="Umsatz-Aufschlüsselung (Gesamt)"
        subtitle="Umsatz → COGS → Ads → Returns → Gewinn"
        action={<Tag kind="pos">{fmtPct(avgMargin * 100, { decimals: 1 })} Marge</Tag>}
        style={{ marginBottom: 'var(--gap-y)' }}
      >
        <div style={{ padding: '8px 0 12px' }}>
          <WaterfallBar
            revenue={totalRevenue}
            cogs={totalCogs}
            ads={totalAds}
            returns={totalReturns}
            profit={totalProfit}
            width={960}
          />
        </div>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: 11, fontFamily: 'var(--font-mono)' }}>
          {[
            { label: 'Umsatz',   value: totalRevenue,  color: 'var(--c-text)' },
            { label: 'COGS',     value: -totalCogs,    color: 'var(--c-danger)' },
            { label: 'Ads',      value: -totalAds,     color: 'var(--c-warning)' },
            { label: 'Returns',  value: -totalReturns, color: '#8B5CF6' },
            { label: 'Gewinn',   value: totalProfit,   color: 'var(--c-positive)' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span className="cesa-muted">{item.label}</span>
              <span style={{ color: item.color, fontWeight: 600 }}>{fmtEur(Math.abs(item.value))}</span>
              <span className="cesa-muted" style={{ fontSize: 10 }}>
                ({fmtPct(Math.abs(item.value) / totalRevenue * 100, { decimals: 0 })})
              </span>
            </div>
          ))}
        </div>
      </Panel>

      {/* Main table + sidebar */}
      <div className="cesa-grid cesa-grid--3-2">

        {/* Product table */}
        <Panel
          title="SKU-Profitabilität"
          subtitle="Sortiert nach Gewinn · MTD"
          action={<Tag kind="neutral">{products.length} Produkte</Tag>}
        >
          <table className="cesa-tbl" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Produkt</th>
                <th className="r">Units</th>
                <th className="r">Umsatz</th>
                <th className="r">Gewinn</th>
                <th className="r">Marge</th>
                <th>Verteilung</th>
                <th className="r">Stock</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.sku}>
                  <td>
                    <div style={{ fontWeight: 500, fontSize: 12.5, color: 'var(--c-textStrong)' }}>{p.name}</div>
                    <div className="cesa-mono cesa-muted" style={{ fontSize: 10 }}>{p.sku}</div>
                  </td>
                  <td className="r cesa-tbl__num cesa-mono">{p.units}</td>
                  <td className="r cesa-tbl__num cesa-mono">{fmtEur(p.revenue)}</td>
                  <td className="r cesa-tbl__num cesa-mono" style={{
                    color: p.profit > 0 ? 'var(--c-positive)' : 'var(--c-danger)',
                    fontWeight: 600,
                  }}>
                    {fmtEur(p.profit)}
                  </td>
                  <td className="r cesa-tbl__num">
                    <span style={{
                      fontSize: 11.5, fontFamily: 'var(--font-mono)', fontWeight: 600,
                      color: p.margin > 0.35 ? 'var(--c-positive)' : p.margin > 0.2 ? 'var(--c-warning)' : 'var(--c-danger)',
                    }}>
                      {fmtPct(p.margin * 100, { decimals: 1 })}
                    </span>
                  </td>
                  <td style={{ verticalAlign: 'middle' }}>
                    <MarginMiniBar margin={p.margin} maxMargin={maxMargin} />
                  </td>
                  <td className="r cesa-tbl__num">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, justifyContent: 'flex-end' }}>
                      <StatusDot kind={stockKind(p.daysToStockout)} size={6} />
                      <span className="cesa-mono" style={{ fontSize: 11 }}>
                        {fmtNum(p.daysToStockout, { decimals: 0, suffix: 'd' })}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            {/* Summary row */}
            <tfoot>
              <tr className="cesa-tbl__sum cesa-tbl__sum--strong">
                <td>Gesamt</td>
                <td className="r cesa-tbl__num cesa-mono">{products.reduce((s, p) => s + p.units, 0)}</td>
                <td className="r cesa-tbl__num cesa-mono">{fmtEur(totalRevenue)}</td>
                <td className="r cesa-tbl__num cesa-mono" style={{ color: 'var(--c-positive)' }}>{fmtEur(totalProfit)}</td>
                <td className="r cesa-tbl__num">
                  <span style={{ fontSize: 11.5, fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--c-positive)' }}>
                    {fmtPct(avgMargin * 100, { decimals: 1 })}
                  </span>
                </td>
                <td />
                <td />
              </tr>
            </tfoot>
          </table>
        </Panel>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-y)' }}>

          {/* Top product breakdown */}
          <Panel
            title="Top SKU Details"
            subtitle={topProduct.name}
            action={<Tag kind="pos">#{1}</Tag>}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { label: 'Preis (UVP)',    value: fmtEur(topProduct.price, { decimals: 2 }), color: undefined },
                { label: 'COGS / Unit',    value: fmtEur(topProduct.cogs, { decimals: 2 }),  color: 'var(--c-danger)' },
                { label: 'Ads / Unit',     value: fmtEur(topProduct.ads, { decimals: 2 }),   color: 'var(--c-warning)' },
                { label: 'Returns / Unit', value: fmtEur(topProduct.returns, { decimals: 2 }), color: '#8B5CF6' },
                { label: 'Gewinn / Unit',  value: fmtEur(topProduct.price - topProduct.cogs - topProduct.ads - topProduct.returns, { decimals: 2 }), color: 'var(--c-positive)' },
              ].map(row => (
                <div key={row.label} className="cesa-kv" style={{ borderBottom: '1px solid var(--c-border)', paddingBottom: 5 }}>
                  <span className="cesa-muted" style={{ fontSize: 11.5 }}>{row.label}</span>
                  <b className="cesa-mono" style={{ color: row.color ?? 'var(--c-textStrong)', fontSize: 12.5 }}>{row.value}</b>
                </div>
              ))}
              <div style={{ marginTop: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 10.5, fontFamily: 'var(--font-mono)', color: 'var(--c-muted)' }}>
                  <span>Marge {fmtPct(topProduct.margin * 100, { decimals: 1 })}</span>
                  <span>{topProduct.units} Units · {fmtEur(topProduct.revenue)} Umsatz</span>
                </div>
                <WaterfallBar
                  revenue={topProduct.revenue}
                  cogs={topProduct.totalCogs}
                  ads={topProduct.totalAds}
                  returns={topProduct.totalReturns}
                  profit={topProduct.profit}
                  width={220}
                />
              </div>
            </div>
          </Panel>

          {/* Stock Alerts */}
          <Panel
            title="Lagerbestand-Warnung"
            subtitle="Produkte mit Reichweite < 14 Tage"
            action={
              lowStock.length > 0
                ? <Tag kind="warn" dot>{lowStock.length} kritisch</Tag>
                : <Tag kind="pos">Alles OK</Tag>
            }
          >
            {lowStock.length === 0 ? (
              <div style={{
                padding: '12px', textAlign: 'center', color: 'var(--c-muted)', fontSize: 12,
                background: 'color-mix(in oklab, var(--c-positive) 6%, var(--c-surface))',
                borderRadius: 'var(--r-sm)', border: '1px solid color-mix(in oklab, var(--c-positive) 20%, var(--c-border))',
              }}>
                Alle SKUs haben ausreichend Lagerbestand.
              </div>
            ) : (
              <table className="cesa-tbl" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Produkt</th>
                    <th className="r">Stock</th>
                    <th className="r">Reichweite</th>
                    <th className="r">Lead Time</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStock.map(p => (
                    <tr key={p.sku}>
                      <td>
                        <div style={{ fontSize: 12 }}>{p.name}</div>
                        <div className="cesa-mono cesa-muted" style={{ fontSize: 10 }}>{p.sku}</div>
                      </td>
                      <td className="r cesa-tbl__num cesa-mono">{p.stock}</td>
                      <td className="r cesa-tbl__num">
                        <span className="cesa-mono" style={{
                          color: p.daysToStockout < p.leadTime ? 'var(--c-danger)' : 'var(--c-warning)',
                          fontWeight: 600, fontSize: 12,
                        }}>
                          {fmtNum(p.daysToStockout, { decimals: 0, suffix: 'd' })}
                        </span>
                      </td>
                      <td className="r cesa-tbl__num cesa-mono cesa-muted" style={{ fontSize: 11 }}>
                        {p.leadTime}d
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {lowStock.some(p => p.daysToStockout < p.leadTime) && (
              <div style={{
                marginTop: 10, padding: '8px 10px', fontSize: 11,
                background: 'color-mix(in oklab, var(--c-danger) 8%, var(--c-surface))',
                border: '1px solid color-mix(in oklab, var(--c-danger) 20%, var(--c-border))',
                borderRadius: 'var(--r-sm)', color: 'var(--c-textStrong)',
              }}>
                Einige SKUs haben eine Reichweite unter der Lead Time — Bestellung sofort empfohlen.
              </div>
            )}
          </Panel>

          {/* Margin ranking */}
          <Panel title="Marge-Ranking" subtitle="Alle SKUs nach Marge">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[...products].sort((a, b) => b.margin - a.margin).map((p, i) => (
                <div key={p.sku} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="cesa-muted cesa-mono" style={{ fontSize: 10, width: 14, textAlign: 'right' }}>
                    {i + 1}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11.5, color: 'var(--c-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {p.name}
                    </div>
                    <div style={{ marginTop: 2, height: 4, background: 'var(--c-surface3)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', width: `${(p.margin / maxMargin) * 100}%`,
                        background: p.margin > 0.35 ? 'var(--c-positive)' : p.margin > 0.2 ? 'var(--c-warning)' : 'var(--c-danger)',
                        borderRadius: 2,
                      }} />
                    </div>
                  </div>
                  <span className="cesa-mono" style={{
                    fontSize: 11.5, fontWeight: 600, width: 44, textAlign: 'right',
                    color: p.margin > 0.35 ? 'var(--c-positive)' : p.margin > 0.2 ? 'var(--c-warning)' : 'var(--c-danger)',
                  }}>
                    {fmtPct(p.margin * 100, { decimals: 1 })}
                  </span>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}

function ProdKpi({ label, value, sub, kind }: {
  label: string; value: string; sub?: string; kind?: 'pos' | 'neg' | 'warn'
}) {
  const color = kind === 'pos' ? 'var(--c-positive)' : kind === 'neg' ? 'var(--c-danger)' : kind === 'warn' ? 'var(--c-warning)' : 'var(--c-textStrong)'
  return (
    <div className="cesa-panel" style={{ padding: 'var(--pad)' }}>
      <div className="cesa-muted cesa-mono" style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>
        {label}
      </div>
      <div className="cesa-mono" style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.025em', color, lineHeight: 1.1 }}>
        {value}
      </div>
      {sub && <div className="cesa-muted cesa-mono" style={{ fontSize: 10.5, marginTop: 4 }}>{sub}</div>}
    </div>
  )
}
