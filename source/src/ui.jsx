// CESA Financial OS — Shared UI primitives
// Card, Stat, Sparkline, Tag, Section, Table

const fmtEur = (n, opts = {}) => {
  const { sign = false, decimals = 0 } = opts;
  if (n == null || isNaN(n)) return '—';
  const abs = Math.abs(n);
  const s = abs.toLocaleString('de-DE', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  const prefix = sign ? (n > 0 ? '+' : n < 0 ? '−' : '') : (n < 0 ? '−' : '');
  return `${prefix}€${s}`;
};

const fmtNum = (n, opts = {}) => {
  const { decimals = 0, suffix = '' } = opts;
  if (n == null || isNaN(n)) return '—';
  return n.toLocaleString('de-DE', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
};

const fmtPct = (n, opts = {}) => {
  const { decimals = 1, sign = false } = opts;
  if (n == null || isNaN(n)) return '—';
  const v = n.toLocaleString('de-DE', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return (sign && n > 0 ? '+' : '') + v + '%';
};

const fmtDate = (d) => {
  if (!d) return '—';
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleDateString('de-DE', { day: '2-digit', month: 'short' });
};

// ───── Card / Panel ─────
function Panel({ title, subtitle, action, children, dense, style, className = '' }) {
  return (
    <section className={`panel ${dense ? 'panel--dense' : ''} ${className}`} style={style}>
      {(title || action) && (
        <header className="panel__hd">
          <div>
            {title && <h3 className="panel__title">{title}</h3>}
            {subtitle && <div className="panel__sub">{subtitle}</div>}
          </div>
          {action && <div className="panel__action">{action}</div>}
        </header>
      )}
      <div className="panel__body">{children}</div>
    </section>
  );
}

// ───── Stat (zahl + label + delta) ─────
function Stat({ label, value, sub, delta, deltaKind, mono = true, size = 'md', hint }) {
  const cls = ['stat', `stat--${size}`].join(' ');
  return (
    <div className={cls}>
      <div className="stat__label">
        {label}
        {hint && <span className="stat__hint" title={hint}>?</span>}
      </div>
      <div className={`stat__value ${mono ? 'mono' : ''}`}>{value}</div>
      {(sub || delta) && (
        <div className="stat__foot">
          {delta != null && (
            <span className={`delta delta--${deltaKind || (delta >= 0 ? 'pos' : 'neg')}`}>
              {typeof delta === 'string' ? delta : fmtPct(delta, { sign: true })}
            </span>
          )}
          {sub && <span className="stat__sub">{sub}</span>}
        </div>
      )}
    </div>
  );
}

// ───── Tag / Pill ─────
function Tag({ children, kind = 'neutral', dot = false }) {
  return (
    <span className={`tag tag--${kind}`}>
      {dot && <span className="tag__dot" />}
      {children}
    </span>
  );
}

// ───── Status Dot ─────
function StatusDot({ kind = 'neutral', size = 8 }) {
  return <span className={`dot dot--${kind}`} style={{ width: size, height: size }} />;
}

// ───── Sparkline (SVG) ─────
function Sparkline({ data, width = 80, height = 22, stroke, fill, strokeWidth = 1.25 }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);
  const points = data.map((v, i) => {
    const x = i * stepX;
    const y = height - ((v - min) / range) * (height - 2) - 1;
    return [x, y];
  });
  const path = points.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(' ');
  const area = `${path} L${width},${height} L0,${height} Z`;
  return (
    <svg width={width} height={height} className="sparkline">
      {fill && <path d={area} fill={fill} />}
      <path d={path} fill="none" stroke={stroke || 'currentColor'} strokeWidth={strokeWidth} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

// ───── Progress bar ─────
function Progress({ value, max = 100, kind = 'neutral', height = 4, showLabel = false }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="progress" style={{ height }}>
      <div className={`progress__fill progress__fill--${kind}`} style={{ width: pct + '%' }} />
      {showLabel && <span className="progress__lbl mono">{pct.toFixed(0)}%</span>}
    </div>
  );
}

// ───── Section divider (kleines uppercase Label) ─────
function SectionLabel({ children, right }) {
  return (
    <div className="seclabel">
      <span>{children}</span>
      {right && <span className="seclabel__r">{right}</span>}
    </div>
  );
}

// ───── KBD ─────
function Kbd({ children }) {
  return <kbd className="kbd">{children}</kbd>;
}

// Expose
Object.assign(window, { Panel, Stat, Tag, StatusDot, Sparkline, Progress, SectionLabel, Kbd, fmtEur, fmtNum, fmtPct, fmtDate });
