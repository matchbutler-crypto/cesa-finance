'use client'
import { useState } from 'react'
import { fmtEur } from '@/lib/formatters'

interface ScenarioBand {
  label: string
  dailyRate: number
  color: string
}

interface Props {
  daily: number[]       // actuals, length = daysElapsed
  daysInMonth: number
  daysElapsed: number
  target: number
  scenarios: ScenarioBand[]
}

export function ForecastChart({ daily, daysInMonth, daysElapsed, target, scenarios }: Props) {
  const [hovered, setHovered] = useState<number | null>(null)

  const W = 1080
  const H = 260
  const PAD_L = 56
  const PAD_R = 16
  const PAD_T = 20
  const PAD_B = 32
  const chartW = W - PAD_L - PAD_R
  const chartH = H - PAD_T - PAD_B

  const remainingDays = daysInMonth - daysElapsed
  const mtdRevenue = daily.reduce((s, v) => s + v, 0)
  const targetDailyNeeded = Math.max(0, (target - mtdRevenue) / remainingDays)

  // Build all bars: actuals + 3 scenario projections
  const maxActual = Math.max(...daily, targetDailyNeeded * 1.4, 100)
  const maxVal = Math.ceil(maxActual / 50) * 50

  const barW = chartW / daysInMonth
  const barInner = Math.max(barW - 4, 3)

  function xPos(day: number) { // 1-indexed
    return PAD_L + (day - 1) * barW + barW / 2
  }
  function yBar(val: number) {
    return PAD_T + chartH - (val / maxVal) * chartH
  }
  function barH(val: number) {
    return (val / maxVal) * chartH
  }

  // Grid lines
  const gridSteps = [0.25, 0.5, 0.75, 1.0]

  // Cumulative line for actuals
  let cumSum = 0
  const cumulativePoints = daily.map((v, i) => {
    cumSum += v
    return { x: xPos(i + 1), y: PAD_T + chartH - (cumSum / target) * chartH * 0.8 }
  })

  // Target line (daily needed)
  const targetLineY = yBar(targetDailyNeeded)

  return (
    <div style={{ position: 'relative' }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{ display: 'block', overflow: 'visible' }}
        onMouseLeave={() => setHovered(null)}
      >
        {/* Grid lines */}
        {gridSteps.map((step) => {
          const val = maxVal * step
          const y = yBar(val)
          return (
            <g key={step}>
              <line x1={PAD_L} y1={y} x2={W - PAD_R} y2={y}
                stroke="var(--c-border)" strokeWidth={0.5} strokeDasharray="3 3" />
              <text x={PAD_L - 5} y={y + 3.5} textAnchor="end"
                fontSize={9} fill="var(--c-muted)" fontFamily="var(--font-mono)">
                {fmtEur(val)}
              </text>
            </g>
          )
        })}

        {/* Target daily needed line */}
        {targetDailyNeeded > 0 && (
          <g>
            <line
              x1={xPos(daysElapsed + 1)} y1={targetLineY}
              x2={W - PAD_R} y2={targetLineY}
              stroke="var(--c-warning)" strokeWidth={1.5} strokeDasharray="5 3"
              opacity={0.8}
            />
            <rect
              x={W - PAD_R - 78} y={targetLineY - 10}
              width={75} height={13}
              fill="var(--c-surface2)" rx={2}
            />
            <text x={W - PAD_R - 40} y={targetLineY + 0}
              textAnchor="middle" fontSize={8.5}
              fill="var(--c-warning)" fontFamily="var(--font-mono)">
              nötig {fmtEur(targetDailyNeeded)}/Tag
            </text>
          </g>
        )}

        {/* Current run rate line (actuals zone) */}
        {daily.length > 0 && (() => {
          const runRate = mtdRevenue / daysElapsed
          const rrY = yBar(runRate)
          return (
            <g>
              <line x1={PAD_L} y1={rrY} x2={xPos(daysElapsed)} y2={rrY}
                stroke="var(--c-accent)" strokeWidth={1} strokeDasharray="4 3" opacity={0.5} />
            </g>
          )
        })()}

        {/* Scenario projection areas (days daysElapsed+1 to daysInMonth) */}
        {scenarios.map((sc, si) => {
          const x1 = xPos(daysElapsed + 1) - barW / 2
          const x2 = xPos(daysInMonth) + barW / 2
          const y1 = yBar(sc.dailyRate)
          return (
            <rect key={si}
              x={x1} y={y1}
              width={x2 - x1} height={barH(sc.dailyRate)}
              fill={sc.color} opacity={0.06}
            />
          )
        })}

        {/* Vertical divider: today */}
        <line
          x1={xPos(daysElapsed) + barW / 2} y1={PAD_T}
          x2={xPos(daysElapsed) + barW / 2} y2={PAD_T + chartH}
          stroke="var(--c-accent)" strokeWidth={1} strokeDasharray="4 3" opacity={0.5}
        />
        <text
          x={xPos(daysElapsed) + barW / 2 + 5} y={PAD_T + 10}
          fontSize={9} fill="var(--c-accent)" fontFamily="var(--font-mono)">
          heute
        </text>

        {/* Actual bars (days 1–daysElapsed) */}
        {daily.map((val, i) => {
          const day = i + 1
          const cx = xPos(day)
          const isHot = hovered === day
          const runRate = mtdRevenue / daysElapsed
          const aboveRate = val >= runRate
          return (
            <g key={day}
              onMouseEnter={() => setHovered(day)}
              style={{ cursor: 'pointer' }}
            >
              <rect
                x={cx - barInner / 2} y={yBar(val)}
                width={barInner} height={barH(val)}
                fill={aboveRate ? 'var(--c-positive)' : 'var(--c-accent)'}
                opacity={isHot ? 1 : 0.75}
                rx={1.5}
              />
            </g>
          )
        })}

        {/* Projected bars for each scenario (transparent, layered) */}
        {scenarios.map((sc, si) => (
          Array.from({ length: remainingDays }, (_, di) => {
            const day = daysElapsed + 1 + di
            const cx = xPos(day)
            const perScenarioW = Math.max((barInner / scenarios.length) - 1, 2)
            const offsetX = (si - (scenarios.length - 1) / 2) * (perScenarioW + 1)
            return (
              <rect key={`${si}-${di}`}
                x={cx + offsetX - perScenarioW / 2} y={yBar(sc.dailyRate)}
                width={perScenarioW} height={barH(sc.dailyRate)}
                fill={sc.color} opacity={0.4}
                rx={1}
              />
            )
          })
        ))}

        {/* Day labels */}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => (
          (d === 1 || d % 5 === 0) ? (
            <text key={d}
              x={xPos(d)} y={PAD_T + chartH + 14}
              textAnchor="middle" fontSize={9}
              fill="var(--c-muted)" fontFamily="var(--font-mono)">
              {String(d).padStart(2, '0')}
            </text>
          ) : null
        ))}
      </svg>

      {/* Hover tooltip */}
      {hovered !== null && hovered <= daily.length && (
        <div style={{
          position: 'absolute',
          left: `calc(${((xPos(hovered)) / W) * 100}% - 56px)`,
          top: `${((yBar(daily[hovered - 1]) - PAD_T) / (H - PAD_T - PAD_B)) * 100}%`,
          transform: 'translateY(-110%)',
          background: 'var(--c-surface3)',
          border: '1px solid var(--c-borderStrong)',
          borderRadius: 5,
          padding: '5px 9px',
          fontSize: 11,
          fontFamily: 'var(--font-mono)',
          pointerEvents: 'none',
          zIndex: 10,
          whiteSpace: 'nowrap',
        }}>
          <div style={{ color: 'var(--c-muted)', fontSize: 10, marginBottom: 1 }}>
            {String(hovered).padStart(2, '0')}.05.2026
          </div>
          <div style={{ color: 'var(--c-textStrong)', fontWeight: 600 }}>
            {fmtEur(daily[hovered - 1])}
          </div>
        </div>
      )}

      {/* Legend */}
      <div style={{
        display: 'flex', gap: 14, padding: '8px 0 0',
        fontSize: 10.5, color: 'var(--c-muted)', fontFamily: 'var(--font-mono)',
        flexWrap: 'wrap',
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 10, height: 3, background: 'var(--c-positive)', borderRadius: 2, display: 'inline-block' }} />
          über Ø
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 10, height: 3, background: 'var(--c-accent)', borderRadius: 2, display: 'inline-block' }} />
          unter Ø
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 10, height: 1, background: 'var(--c-warning)', borderRadius: 2, display: 'inline-block', borderTop: '1px dashed var(--c-warning)' }} />
          nötiger Tagesdurchschnitt
        </span>
        {scenarios.map(sc => (
          <span key={sc.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 8, height: 8, background: sc.color, borderRadius: 2, opacity: 0.6, display: 'inline-block' }} />
            {sc.label}
          </span>
        ))}
      </div>
    </div>
  )
}
