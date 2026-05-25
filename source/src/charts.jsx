// CESA Financial OS — Charts (alle als pure SVG, kein dependency)

// ───── ForecastChart ─────
// Drei Linien: actual (solid), projected (dashed), target (horizontal dashed)
// Varianten: 'line' | 'fan' | 'area'
function ForecastChart({ data, variant = 'line', width = 720, height = 240, theme }) {
  const { daily, target, daysInMonth, daysElapsed, mtdRevenue, dailyRunRate, projectedMonthEnd } = data;
  const padL = 44, padR = 16, padT = 12, padB = 24;
  const W = width - padL - padR;
  const H = height - padT - padB;

  // Cumulative actual
  const cumActual = [];
  daily.reduce((acc, v, i) => { const s = acc + v; cumActual.push(s); return s; }, 0);

  // Cumulative projected = cumActual + runRate * remaining
  const cumProjected = [];
  for (let d = 1; d <= daysInMonth; d++) {
    if (d <= daysElapsed) cumProjected.push(cumActual[d - 1]);
    else cumProjected.push(mtdRevenue + dailyRunRate * (d - daysElapsed));
  }
  const lastActual = cumActual[cumActual.length - 1];

  const maxY = Math.max(target * 1.15, projectedMonthEnd * 1.1, lastActual * 1.2);
  const sx = (d) => padL + ((d - 1) / (daysInMonth - 1)) * W;
  const sy = (v) => padT + H - (v / maxY) * H;

  // Gridlines (4 horizontal)
  const grids = [0, 0.25, 0.5, 0.75, 1].map((p) => ({
    y: padT + H - p * H,
    label: '€' + Math.round((maxY * p) / 100) * 100,
  }));

  const actualPath = cumActual.map((v, i) => `${i === 0 ? 'M' : 'L'}${sx(i + 1)},${sy(v)}`).join(' ');
  const projectedPath = cumProjected
    .slice(daysElapsed - 1) // overlap last actual
    .map((v, i) => `${i === 0 ? 'M' : 'L'}${sx(daysElapsed + i)},${sy(v)}`)
    .join(' ');

  // Fan: two extra projection lines (optimistic +15%, pessimistic -15%)
  const fanHi = cumProjected.slice(daysElapsed - 1).map((v, i) => {
    if (i === 0) return v;
    return mtdRevenue + dailyRunRate * 1.18 * (daysElapsed - 1 + i - (daysElapsed - 1));
  });
  const fanLo = cumProjected.slice(daysElapsed - 1).map((v, i) => {
    if (i === 0) return v;
    return mtdRevenue + dailyRunRate * 0.82 * (daysElapsed - 1 + i - (daysElapsed - 1));
  });
  const fanArea =
    fanHi.map((v, i) => `${i === 0 ? 'M' : 'L'}${sx(daysElapsed + i)},${sy(v)}`).join(' ') +
    ' ' +
    fanLo.slice().reverse().map((v, i) => `L${sx(daysElapsed + (fanLo.length - 1 - i))},${sy(v)}`).join(' ') +
    ' Z';

  // Area mode: fill under actual
  const actualArea =
    actualPath + ` L${sx(daysElapsed)},${sy(0)} L${sx(1)},${sy(0)} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="chart" preserveAspectRatio="none">
      {/* Gridlines */}
      {grids.map((g, i) => (
        <g key={i}>
          <line x1={padL} x2={width - padR} y1={g.y} y2={g.y} stroke="var(--c-grid)" strokeWidth="1" />
          <text x={padL - 6} y={g.y + 3} textAnchor="end" className="chart__axis">
            {fmtEur(Math.round((maxY * (1 - i * 0.25)) / 100) * 100)}
          </text>
        </g>
      ))}

      {/* X-axis labels (5,10,15,20,25,30) */}
      {[5, 10, 15, 20, 25, 30].filter((d) => d <= daysInMonth).map((d) => (
        <text key={d} x={sx(d)} y={height - 6} textAnchor="middle" className="chart__axis">{d}</text>
      ))}

      {/* Target line */}
      <line x1={padL} x2={width - padR} y1={sy(target)} y2={sy(target)} stroke="var(--c-warning)" strokeDasharray="4 4" strokeWidth="1" opacity="0.8" />
      <text x={width - padR} y={sy(target) - 5} textAnchor="end" className="chart__lbl chart__lbl--warning">
        Ziel {fmtEur(target)}
      </text>

      {/* Fan area for fan variant */}
      {variant === 'fan' && (
        <path d={fanArea} fill="var(--c-accent)" opacity="0.12" />
      )}

      {/* Area under actual */}
      {variant === 'area' && (
        <path d={actualArea} fill="var(--c-accent)" opacity="0.10" />
      )}

      {/* Projected line (dashed) */}
      <path d={projectedPath} fill="none" stroke="var(--c-accent)" strokeDasharray="3 3" strokeWidth="1.5" opacity="0.85" />

      {/* Actual line */}
      <path d={actualPath} fill="none" stroke="var(--c-text)" strokeWidth="1.75" strokeLinejoin="round" />

      {/* Today marker */}
      <line x1={sx(daysElapsed)} x2={sx(daysElapsed)} y1={padT} y2={padT + H} stroke="var(--c-borderStrong)" strokeWidth="1" strokeDasharray="2 3" />
      <circle cx={sx(daysElapsed)} cy={sy(lastActual)} r="3" fill="var(--c-text)" />

      {/* Endpoint label */}
      <text x={sx(daysInMonth) - 4} y={sy(projectedMonthEnd) - 6} textAnchor="end" className="chart__lbl chart__lbl--accent">
        Proj. {fmtEur(projectedMonthEnd)}
      </text>
    </svg>
  );
}

// ───── CashflowBars (tägliche Ein-/Ausgaben) ─────
function CashflowBars({ data, width = 880, height = 200 }) {
  const { entries, startBalance, today, } = data;
  const days = 31;
  const padL = 50, padR = 16, padT = 12, padB = 22;
  const W = width - padL - padR;
  const H = height - padT - padB;

  // Aggregate by day
  const byDay = {};
  for (let d = 1; d <= days; d++) byDay[d] = { in: 0, out: 0, projected: false };
  entries.forEach((e) => {
    const slot = byDay[e.day];
    if (e.amount > 0) slot.in += e.amount;
    else slot.out += -e.amount;
    if (e.projected) slot.projected = true;
  });

  const maxBar = Math.max(...Object.values(byDay).flatMap((v) => [v.in, v.out]), 100);
  const sx = (d) => padL + ((d - 1) / (days - 1)) * W;
  const barW = Math.max(2, (W / days) * 0.6);
  const zeroY = padT + H / 2;
  const sy = (v) => (v / maxBar) * (H / 2 - 4);

  // Cumulative line
  let cum = startBalance;
  const cumPts = [];
  for (let d = 1; d <= days; d++) {
    cum += byDay[d].in - byDay[d].out;
    cumPts.push(cum);
  }
  const minCum = Math.min(...cumPts, startBalance);
  const maxCum = Math.max(...cumPts, startBalance);
  const cumRange = maxCum - minCum || 1;
  const cumY = (v) => padT + H - ((v - minCum) / cumRange) * H;
  const cumPath = cumPts.map((v, i) => `${i === 0 ? 'M' : 'L'}${sx(i + 1)},${cumY(v)}`).join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="chart" preserveAspectRatio="none">
      {/* Zero line */}
      <line x1={padL} x2={width - padR} y1={zeroY} y2={zeroY} stroke="var(--c-border)" strokeWidth="1" />

      {/* Bars */}
      {Object.entries(byDay).map(([d, v]) => {
        const day = parseInt(d, 10);
        const x = sx(day) - barW / 2;
        const isProj = v.projected;
        return (
          <g key={d} opacity={isProj ? 0.5 : 1}>
            {v.in > 0 && (
              <rect x={x} y={zeroY - sy(v.in)} width={barW} height={sy(v.in)} fill="var(--c-positive)" />
            )}
            {v.out > 0 && (
              <rect x={x} y={zeroY} width={barW} height={sy(v.out)} fill="var(--c-danger)" />
            )}
          </g>
        );
      })}

      {/* Cumulative balance line (overlay, separate scale on right) */}
      {/* Actually overlay using its own subtle dashed line for context */}

      {/* Today marker */}
      <line x1={sx(today)} x2={sx(today)} y1={padT} y2={padT + H} stroke="var(--c-borderStrong)" strokeWidth="1" strokeDasharray="2 3" />

      {/* Day labels */}
      {[1, 5, 10, 15, 20, 25, 30].map((d) => (
        <text key={d} x={sx(d)} y={height - 4} textAnchor="middle" className="chart__axis">{d}</text>
      ))}

      {/* Y axis labels */}
      <text x={padL - 6} y={zeroY - sy(maxBar) + 4} textAnchor="end" className="chart__axis">{fmtEur(maxBar)}</text>
      <text x={padL - 6} y={zeroY + 3} textAnchor="end" className="chart__axis">0</text>
      <text x={padL - 6} y={zeroY + sy(maxBar) + 4} textAnchor="end" className="chart__axis">{fmtEur(-maxBar)}</text>
    </svg>
  );
}

// ───── NetWorthChart (12M history + 12M forecast) ─────
function NetWorthChart({ history, forecast, width = 520, height = 140 }) {
  const padL = 8, padR = 8, padT = 8, padB = 18;
  const W = width - padL - padR;
  const H = height - padT - padB;
  const all = [...history, ...forecast.slice(1)];
  const min = Math.min(...all) * 0.95;
  const max = Math.max(...all) * 1.02;
  const range = max - min || 1;
  const sx = (i) => padL + (i / (all.length - 1)) * W;
  const sy = (v) => padT + H - ((v - min) / range) * H;

  const histPath = history.map((v, i) => `${i === 0 ? 'M' : 'L'}${sx(i)},${sy(v)}`).join(' ');
  const fcPath = forecast.map((v, i) => `${i === 0 ? 'M' : 'L'}${sx(history.length - 1 + i)},${sy(v)}`).join(' ');
  const histArea = histPath + ` L${sx(history.length - 1)},${padT + H} L${sx(0)},${padT + H} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="chart" preserveAspectRatio="none">
      <path d={histArea} fill="var(--c-text)" opacity="0.06" />
      <path d={histPath} fill="none" stroke="var(--c-text)" strokeWidth="1.5" />
      <path d={fcPath} fill="none" stroke="var(--c-accent)" strokeWidth="1.5" strokeDasharray="3 3" />
      <circle cx={sx(history.length - 1)} cy={sy(history[history.length - 1])} r="3" fill="var(--c-text)" />
      <text x={padL} y={height - 4} className="chart__axis">−12M</text>
      <text x={sx(history.length - 1)} y={height - 4} textAnchor="middle" className="chart__axis">heute</text>
      <text x={width - padR} y={height - 4} textAnchor="end" className="chart__axis">+12M</text>
    </svg>
  );
}

// ───── Mini Bar Chart (für Sparkline-Boxes) ─────
function MiniBars({ data, width = 80, height = 28, kind = 'neutral' }) {
  if (!data || !data.length) return null;
  const max = Math.max(...data);
  const w = width / data.length;
  const gap = Math.max(1, w * 0.2);
  return (
    <svg width={width} height={height} className="minibars">
      {data.map((v, i) => {
        const h = (v / max) * (height - 2);
        return <rect key={i} x={i * w + gap / 2} y={height - h} width={w - gap} height={h}
          fill={kind === 'pos' ? 'var(--c-positive)' : kind === 'neg' ? 'var(--c-danger)' : 'var(--c-muted)'} />;
      })}
    </svg>
  );
}

Object.assign(window, { ForecastChart, CashflowBars, NetWorthChart, MiniBars });
