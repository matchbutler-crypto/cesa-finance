'use client'
import { fmtEur } from '@/lib/formatters'

interface Segment {
  label: string
  value: number
  color: string
}

interface Props {
  revenue: number
  cogs: number
  ads: number
  returns: number
  profit: number
  width?: number
}

export function WaterfallBar({ revenue, cogs, ads, returns, profit, width = 320 }: Props) {
  const H = 32
  const segments: Segment[] = [
    { label: 'COGS',     value: cogs,    color: 'var(--c-danger)' },
    { label: 'Ads',      value: ads,     color: 'var(--c-warning)' },
    { label: 'Returns',  value: returns, color: '#8B5CF6' },
    { label: 'Gewinn',   value: profit,  color: 'var(--c-positive)' },
  ]
  let x = 0
  return (
    <svg viewBox={`0 0 ${width} ${H}`} width={width} height={H} style={{ display: 'block' }}>
      {segments.map((seg, i) => {
        const w = (seg.value / revenue) * width
        const rect = (
          <rect key={i} x={x} y={4} width={Math.max(w - 1, 0)} height={H - 8}
            fill={seg.color} opacity={0.75} rx={i === 0 ? 3 : i === segments.length - 1 ? 3 : 0}
            style={{ transition: 'width 0.3s' }}
          />
        )
        x += w
        return rect
      })}
    </svg>
  )
}

export function MarginMiniBar({ margin, maxMargin }: { margin: number; maxMargin: number }) {
  const W = 64
  const H = 6
  const filled = (margin / maxMargin) * W
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ display: 'block' }}>
      <rect x={0} y={0} width={W} height={H} rx={2} fill="var(--c-surface3)" />
      <rect x={0} y={0} width={Math.max(filled, 0)} height={H} rx={2}
        fill={margin > 0.35 ? 'var(--c-positive)' : margin > 0.2 ? 'var(--c-warning)' : 'var(--c-danger)'}
        opacity={0.8}
      />
    </svg>
  )
}
