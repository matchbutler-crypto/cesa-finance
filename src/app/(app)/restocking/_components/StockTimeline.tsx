'use client'
import { fmtNum } from '@/lib/formatters'

interface ProductBar {
  name: string
  sku: string
  daysToStockout: number
  leadTime: number
  status: 'critical' | 'reorder' | 'ok'
}

interface Props {
  products: ProductBar[]
  horizonDays?: number
}

const STATUS_COLOR = {
  critical: 'var(--c-danger)',
  reorder:  'var(--c-warning)',
  ok:       'var(--c-positive)',
}

export function StockTimeline({ products, horizonDays = 45 }: Props) {
  const W = 560
  const ROW_H = 28
  const LABEL_W = 140
  const BAR_W = W - LABEL_W - 8
  const H = products.length * ROW_H + 30

  function xPos(days: number) {
    return LABEL_W + (Math.min(days, horizonDays) / horizonDays) * BAR_W
  }

  const gridDays = [7, 14, 21, 28, 35, 42]

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
      {/* Grid lines */}
      {gridDays.map(d => (
        <g key={d}>
          <line
            x1={xPos(d)} y1={0}
            x2={xPos(d)} y2={H - 20}
            stroke="var(--c-border)" strokeWidth={0.5} strokeDasharray="3 3"
          />
          <text x={xPos(d)} y={H - 6} textAnchor="middle"
            fontSize={8.5} fill="var(--c-muted)" fontFamily="var(--font-mono)">
            {d}d
          </text>
        </g>
      ))}

      {/* Today line */}
      <line x1={xPos(0)} y1={0} x2={xPos(0)} y2={H - 20}
        stroke="var(--c-accent)" strokeWidth={1} />

      {products.map((p, i) => {
        const y = i * ROW_H + 6
        const color = STATUS_COLOR[p.status]
        const stockoutX = xPos(p.daysToStockout)
        const orderArriveX = xPos(p.leadTime)
        const barEnd = Math.min(stockoutX, xPos(horizonDays))

        return (
          <g key={p.sku}>
            {/* Label */}
            <text x={LABEL_W - 6} y={y + 11} textAnchor="end"
              fontSize={9.5} fill="var(--c-text)" fontFamily="var(--font-sans)">
              {p.name.split(' ').slice(0, 3).join(' ')}
            </text>

            {/* Stock bar (time until stockout) */}
            <rect
              x={LABEL_W} y={y + 2}
              width={Math.max(barEnd - LABEL_W, 0)} height={ROW_H - 10}
              fill={color} opacity={0.25} rx={2}
            />

            {/* Lead time marker (vertical tick) */}
            {p.leadTime <= horizonDays && (
              <line
                x1={orderArriveX} y1={y + 2}
                x2={orderArriveX} y2={y + ROW_H - 8}
                stroke={color} strokeWidth={1.5} strokeDasharray="3 2" opacity={0.7}
              />
            )}

            {/* Stockout marker */}
            {p.daysToStockout <= horizonDays && (
              <g>
                <line
                  x1={stockoutX} y1={y + 2}
                  x2={stockoutX} y2={y + ROW_H - 8}
                  stroke={color} strokeWidth={2}
                />
                <text x={stockoutX + 3} y={y + 12}
                  fontSize={8.5} fill={color} fontFamily="var(--font-mono)">
                  {fmtNum(p.daysToStockout, { decimals: 0, suffix: 'd' })}
                </text>
              </g>
            )}
          </g>
        )
      })}

      {/* Legend */}
      <text x={LABEL_W} y={H - 6} fontSize={8.5} fill="var(--c-subtle)" fontFamily="var(--font-mono)">
        Heute
      </text>
    </svg>
  )
}
