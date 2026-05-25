'use client'

interface Month {
  m: string
  target: number
  actual: number | null
}

export function RunningTotalChart({ months }: { months: Month[] }) {
  const w = 640, h = 180
  const padL = 8, padR = 8, padT = 12, padB = 24
  const W = w - padL - padR
  const H = h - padT - padB

  let cumT = 0, cumA = 0
  const tPts = months.map(m => { cumT += m.target; return cumT })
  const aPts = months.map(m => { if (m.actual) cumA += m.actual; return m.actual ? cumA : null })
  const max = Math.max(...tPts)
  const sx = (i: number) => padL + (i / (months.length - 1)) * W
  const sy = (v: number) => padT + H - (v / max) * H

  const tPath = tPts.map((v, i) => `${i === 0 ? 'M' : 'L'}${sx(i).toFixed(1)},${sy(v).toFixed(1)}`).join(' ')
  const aPts2 = aPts.map((v, i) => v == null ? null : `${aPts.slice(0, i).every(x => x == null) ? 'M' : 'L'}${sx(i).toFixed(1)},${sy(v).toFixed(1)}`)
  const aPath = aPts2.filter(Boolean).join(' ')

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" style={{ display: 'block' }}>
      <path d={tPath} fill="none" stroke="var(--c-muted)" strokeWidth="1.5" strokeDasharray="4 3" />
      <path d={aPath} fill="none" stroke="var(--c-accent)" strokeWidth="2" />
      {months.map((m, i) => (
        <text key={m.m} x={sx(i)} y={h - 6} textAnchor="middle" style={{ fontSize: 9, fontFamily: 'var(--font-mono)', fill: 'var(--c-muted)' }}>{m.m}</text>
      ))}
      {aPts.map((v, i) => v && (
        <circle key={i} cx={sx(i)} cy={sy(v)} r="2.5" fill="var(--c-accent)" />
      ))}
    </svg>
  )
}
