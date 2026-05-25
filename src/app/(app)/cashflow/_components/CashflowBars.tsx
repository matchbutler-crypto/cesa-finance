'use client'
import type { Cashflow } from '@/lib/types'
import { fmtEur } from '@/lib/formatters'
import { useState } from 'react'

interface Props {
  data: Cashflow
}

export function CashflowBars({ data }: Props) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; entry: typeof data.entries[0]; balance: number } | null>(null)

  const W = 1080
  const H = 220
  const PAD_L = 56
  const PAD_R = 12
  const PAD_T = 16
  const PAD_B = 32
  const chartW = W - PAD_L - PAD_R
  const chartH = H - PAD_T - PAD_B

  // Group entries by day — sum positives and negatives per day
  const byDay: Record<number, { ins: number; outs: number; projected: boolean }> = {}
  for (let d = 1; d <= 31; d++) byDay[d] = { ins: 0, outs: 0, projected: false }
  data.entries.forEach(e => {
    if (e.amount > 0) byDay[e.day].ins += e.amount
    else byDay[e.day].outs += Math.abs(e.amount)
    if (e.projected) byDay[e.day].projected = true
  })

  const days = Array.from({ length: 31 }, (_, i) => i + 1)
  const maxVal = Math.max(...days.map(d => Math.max(byDay[d].ins, byDay[d].outs)), 100)
  const barW = chartW / 31
  const barInner = Math.max(barW - 3, 2)

  function xPos(day: number) {
    return PAD_L + (day - 1) * barW + barW / 2
  }
  function barHeight(val: number) {
    return (val / maxVal) * (chartH / 2 - 4)
  }

  const midY = PAD_T + chartH / 2

  // Gridlines
  const gridVals = [maxVal * 0.5, maxVal]
  const yLabels = [
    { y: midY - barHeight(maxVal * 0.5), val: maxVal * 0.5 },
    { y: midY - barHeight(maxVal), val: maxVal },
    { y: midY + barHeight(maxVal * 0.5), val: -maxVal * 0.5 },
  ]

  return (
    <div style={{ position: 'relative' }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{ display: 'block', overflow: 'visible' }}
        onMouseLeave={() => setTooltip(null)}
      >
        {/* Grid */}
        {gridVals.map((v, i) => (
          <g key={i}>
            <line
              x1={PAD_L} y1={midY - barHeight(v)}
              x2={W - PAD_R} y2={midY - barHeight(v)}
              stroke="var(--c-border)" strokeWidth={0.5} strokeDasharray="3 3"
            />
            <line
              x1={PAD_L} y1={midY + barHeight(v)}
              x2={W - PAD_R} y2={midY + barHeight(v)}
              stroke="var(--c-border)" strokeWidth={0.5} strokeDasharray="3 3"
            />
          </g>
        ))}

        {/* Y axis labels */}
        {yLabels.map((yl, i) => (
          <text key={i} x={PAD_L - 4} y={yl.y + 3.5} textAnchor="end"
            fontSize={9} fill="var(--c-muted)" fontFamily="var(--font-mono)">
            {fmtEur(yl.val)}
          </text>
        ))}

        {/* Zero line */}
        <line x1={PAD_L} y1={midY} x2={W - PAD_R} y2={midY}
          stroke="var(--c-borderStrong)" strokeWidth={1} />

        {/* Today marker */}
        <line
          x1={xPos(data.today)} y1={PAD_T}
          x2={xPos(data.today)} y2={PAD_T + chartH}
          stroke="var(--c-accent)" strokeWidth={1} strokeDasharray="4 3" opacity={0.6}
        />
        <text x={xPos(data.today) + 3} y={PAD_T + 8}
          fontSize={9} fill="var(--c-accent)" fontFamily="var(--font-mono)">
          heute
        </text>

        {/* Bars */}
        {days.map(d => {
          const { ins, outs, projected } = byDay[d]
          const cx = xPos(d)
          const bw = barInner / 2
          const hasActivity = ins > 0 || outs > 0
          return (
            <g key={d}
              onMouseEnter={(ev) => {
                if (!hasActivity) return
                const rect = (ev.currentTarget as SVGGElement).closest('svg')!.getBoundingClientRect()
                // compute running balance at this day
                let bal = data.startBalance
                data.entries.filter(e => e.day <= d).forEach(e => { bal += e.amount })
                const relevantEntry = data.entries.find(e => e.day === d)
                if (relevantEntry) setTooltip({ x: cx, y: midY - 80, entry: relevantEntry, balance: bal })
              }}
              style={{ cursor: hasActivity ? 'pointer' : 'default' }}
            >
              {ins > 0 && (
                <rect
                  x={cx - bw} y={midY - barHeight(ins)}
                  width={barInner} height={barHeight(ins)}
                  fill={projected ? 'var(--c-positive)' : 'var(--c-positive)'}
                  opacity={projected ? 0.35 : 0.75}
                  rx={1.5}
                />
              )}
              {outs > 0 && (
                <rect
                  x={cx - bw} y={midY}
                  width={barInner} height={barHeight(outs)}
                  fill="var(--c-danger)"
                  opacity={projected ? 0.35 : 0.75}
                  rx={1.5}
                />
              )}
              {/* Day label */}
              {(d === 1 || d % 5 === 0) && (
                <text x={cx} y={PAD_T + chartH + 14}
                  textAnchor="middle" fontSize={9}
                  fill="var(--c-muted)" fontFamily="var(--font-mono)">
                  {String(d).padStart(2, '0')}
                </text>
              )}
            </g>
          )
        })}
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div style={{
          position: 'absolute',
          left: `calc(${(tooltip.x / W) * 100}% - 72px)`,
          top: 0,
          background: 'var(--c-surface3)',
          border: '1px solid var(--c-borderStrong)',
          borderRadius: 6,
          padding: '6px 10px',
          fontSize: 11,
          fontFamily: 'var(--font-mono)',
          pointerEvents: 'none',
          zIndex: 10,
          whiteSpace: 'nowrap',
        }}>
          <div style={{ color: 'var(--c-textStrong)', marginBottom: 2 }}>{tooltip.entry.label}</div>
          <div style={{ color: tooltip.entry.amount > 0 ? 'var(--c-positive)' : 'var(--c-danger)' }}>
            {fmtEur(tooltip.entry.amount, { sign: true })}
          </div>
          <div style={{ color: 'var(--c-muted)', marginTop: 2 }}>
            Saldo: {fmtEur(tooltip.balance)}
          </div>
        </div>
      )}
    </div>
  )
}
