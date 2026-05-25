import type { ReactNode } from 'react'
import { StatusDot } from '@/components/cesa/primitives'

interface KpiCardProps {
  label: string
  value: string
  delta?: string
  deltaKind?: 'pos' | 'neg'
  sub?: string
  chart?: ReactNode
  status?: 'pos' | 'warning' | 'neg'
}

export function KpiCard({ label, value, delta, deltaKind = 'pos', sub, chart, status }: KpiCardProps) {
  return (
    <div className="cesa-kpi">
      <div className="cesa-kpi__top">
        <span className="cesa-kpi__label">{label}</span>
        {status && <StatusDot kind={status} />}
      </div>
      <div className="cesa-kpi__value cesa-mono">{value}</div>
      <div className="cesa-kpi__foot">
        <div>
          {delta && <span className={`cesa-delta cesa-delta--${deltaKind}`}>{delta}</span>}
          {sub && <div className="cesa-kpi__sub">{sub}</div>}
        </div>
        {chart && <div style={{ opacity: 0.85 }}>{chart}</div>}
      </div>
    </div>
  )
}
