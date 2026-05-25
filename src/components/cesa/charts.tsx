interface NetWorthChartProps {
  history: number[]
  forecast: number[]
  width?: number
  height?: number
}

export function NetWorthChart({ history, forecast, width = 520, height = 140 }: NetWorthChartProps) {
  const padL = 8, padR = 8, padT = 8, padB = 18
  const W = width - padL - padR
  const H = height - padT - padB
  const all = [...history, ...forecast.slice(1)]
  const min = Math.min(...all) * 0.95
  const max = Math.max(...all) * 1.02
  const range = max - min || 1
  const sx = (i: number) => padL + (i / (all.length - 1)) * W
  const sy = (v: number) => padT + H - ((v - min) / range) * H

  const histPath = history.map((v, i) => `${i === 0 ? 'M' : 'L'}${sx(i)},${sy(v)}`).join(' ')
  const fcPath = forecast.map((v, i) => `${i === 0 ? 'M' : 'L'}${sx(history.length - 1 + i)},${sy(v)}`).join(' ')
  const histArea = `${histPath} L${sx(history.length - 1)},${padT + H} L${sx(0)},${padT + H} Z`

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="cesa-chart" preserveAspectRatio="none">
      <path d={histArea} fill="var(--c-text)" opacity="0.06" />
      <path d={histPath} fill="none" stroke="var(--c-text)" strokeWidth="1.5" />
      <path d={fcPath} fill="none" stroke="var(--c-accent)" strokeWidth="1.5" strokeDasharray="3 3" />
      <circle cx={sx(history.length - 1)} cy={sy(history[history.length - 1])} r="3" fill="var(--c-text)" />
      <text x={padL} y={height - 4} className="cesa-chart__axis">−12M</text>
      <text x={sx(history.length - 1)} y={height - 4} textAnchor="middle" className="cesa-chart__axis">heute</text>
      <text x={width - padR} y={height - 4} textAnchor="end" className="cesa-chart__axis">+12M</text>
    </svg>
  )
}

interface MiniBarsProps {
  data: number[]
  width?: number
  height?: number
  kind?: 'pos' | 'neg' | 'neutral'
}

export function MiniBars({ data, width = 80, height = 28, kind = 'neutral' }: MiniBarsProps) {
  if (!data || !data.length) return null
  const max = Math.max(...data)
  const w = width / data.length
  const gap = Math.max(1, w * 0.2)
  const colorMap = { pos: 'var(--c-positive)', neg: 'var(--c-danger)', neutral: 'var(--c-muted)' }
  return (
    <svg width={width} height={height} className="cesa-minibars">
      {data.map((v, i) => {
        const h = (v / max) * (height - 2)
        return (
          <rect key={i} x={i * w + gap / 2} y={height - h} width={w - gap} height={h} fill={colorMap[kind]} />
        )
      })}
    </svg>
  )
}
