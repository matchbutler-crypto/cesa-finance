import type { ReactNode, CSSProperties } from 'react'

// ── Panel ──────────────────────────────────────────────────
interface PanelProps {
  title?: string
  subtitle?: string
  action?: ReactNode
  children: ReactNode
  dense?: boolean
  style?: CSSProperties
  className?: string
}
export function Panel({ title, subtitle, action, children, dense, style, className = '' }: PanelProps) {
  return (
    <section className={`cesa-panel ${dense ? 'cesa-panel--dense' : ''} ${className}`} style={style}>
      {(title || action) && (
        <header className="cesa-panel__hd">
          <div>
            {title && <h3 className="cesa-panel__title">{title}</h3>}
            {subtitle && <div className="cesa-panel__sub">{subtitle}</div>}
          </div>
          {action && <div>{action}</div>}
        </header>
      )}
      <div className="cesa-panel__body">{children}</div>
    </section>
  )
}

// ── Tag ────────────────────────────────────────────────────
type TagKind = 'pos' | 'warn' | 'neg' | 'neutral'
interface TagProps { children: ReactNode; kind?: TagKind; dot?: boolean }
export function Tag({ children, kind = 'neutral', dot = false }: TagProps) {
  return (
    <span className={`cesa-tag cesa-tag--${kind}`}>
      {dot && <span className="cesa-tag__dot" />}
      {children}
    </span>
  )
}

// ── StatusDot ──────────────────────────────────────────────
type DotKind = 'pos' | 'warning' | 'neg' | 'info' | 'neutral'
interface StatusDotProps { kind?: DotKind; size?: number }
export function StatusDot({ kind = 'neutral', size = 8 }: StatusDotProps) {
  return <span className={`cesa-dot cesa-dot--${kind}`} style={{ width: size, height: size }} />
}

// ── Sparkline ──────────────────────────────────────────────
interface SparklineProps {
  data: number[]
  width?: number
  height?: number
  stroke?: string
  fill?: string
  strokeWidth?: number
}
export function Sparkline({ data, width = 80, height = 22, stroke, fill, strokeWidth = 1.25 }: SparklineProps) {
  if (!data || data.length < 2) return null
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const stepX = width / (data.length - 1)
  const points = data.map((v, i) => {
    const x = i * stepX
    const y = height - ((v - min) / range) * (height - 2) - 1
    return [x, y]
  })
  const path = points.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(' ')
  const area = `${path} L${width},${height} L0,${height} Z`
  return (
    <svg width={width} height={height} className="cesa-sparkline">
      {fill && <path d={area} fill={fill} />}
      <path d={path} fill="none" stroke={stroke || 'currentColor'} strokeWidth={strokeWidth} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

// ── Progress ───────────────────────────────────────────────
interface ProgressProps { value: number; max?: number; kind?: 'pos' | 'warn' | 'neg' | 'neutral'; height?: number }
export function Progress({ value, max = 100, kind = 'neutral', height = 4 }: ProgressProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  return (
    <div className="progress" style={{ height }}>
      <div className={`progress__fill progress__fill--${kind}`} style={{ width: `${pct}%` }} />
    </div>
  )
}

// ── SectionLabel ───────────────────────────────────────────
interface SectionLabelProps { children: ReactNode; right?: ReactNode }
export function SectionLabel({ children, right }: SectionLabelProps) {
  return (
    <div className="cesa-seclabel">
      <span>{children}</span>
      {right && <span>{right}</span>}
    </div>
  )
}
