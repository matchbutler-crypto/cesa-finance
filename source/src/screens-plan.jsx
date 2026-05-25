// CESA Financial OS — Screens: Saisonkalender, Jahresplanung, Investor Reports

// ═══════════════════════════════════════════════════════════
// 10. SAISONKALENDER
// ═══════════════════════════════════════════════════════════
const SEASON_EVENTS = [
  { id: 'sommer',     label: 'Sommer-Start',      date: '2026-06-01', uplift: 1.15, adBudget: 380, days: 14, status: 'upcoming',  desc: 'Saisonaler Wechsel — Caps & Tees in den Fokus.' },
  { id: 'b2s',        label: 'Back-to-School',    date: '2026-08-15', uplift: 1.22, adBudget: 520, days: 21, status: 'upcoming',  desc: 'Hoodies & Crewnecks für jüngere Zielgruppe.' },
  { id: 'bfcm',       label: 'Black Friday / CM', date: '2026-11-27', uplift: 1.85, adBudget: 980, days: 5,  status: 'upcoming',  desc: 'Stärkster Tag des Jahres. Lager 3 Wochen vorher.' },
  { id: 'xmas',       label: 'Weihnachten',       date: '2026-12-18', uplift: 1.45, adBudget: 640, days: 14, status: 'upcoming',  desc: 'Geschenk-Set Hoodie+Cap als Bundle.' },
  { id: 'vday',       label: 'Valentinstag',      date: '2027-02-10', uplift: 1.08, adBudget: 220, days: 7,  status: 'planned',   desc: 'Couple-Hoodies — letztes Jahr +8%.' },
  { id: 'spring',     label: 'Frühlings-Drop',    date: '2027-04-01', uplift: 1.18, adBudget: 320, days: 10, status: 'planned',   desc: 'Neue Kollektion — Pastellfarben.' },
];

function SeasonsScreen() {
  const today = new Date('2026-05-25');
  const [selected, setSelected] = React.useState('bfcm');
  const ev = SEASON_EVENTS.find(e => e.id === selected);
  const daysTo = Math.ceil((new Date(ev.date) - today) / (1000 * 60 * 60 * 24));

  return (
    <div className="screen screen--seasons">
      <PageHead title="Saisonkalender" eyebrow="Proaktiv planen statt reagieren"
        actions={<>
          <button className="btn btn--ghost">Event hinzufügen</button>
          <button className="btn btn--ghost">iCal Export</button>
        </>}
      />

      <Panel title="Jahresübersicht 2026 / 2027" subtitle="Geplante Saison-Events">
        <YearTimeline today={today} events={SEASON_EVENTS} selected={selected} onSelect={setSelected} />
      </Panel>

      <div className="grid grid--2-1">
        <Panel title={ev.label} subtitle={ev.desc}
          action={<Tag kind={daysTo < 30 ? 'warn' : 'neutral'}>{daysTo > 0 ? `in ${daysTo} Tagen` : `vor ${-daysTo} Tagen`}</Tag>}>
          <div className="event-detail">
            <div className="event-detail__grid">
              <Stat label="Historischer Uplift" value={`${ev.uplift.toFixed(2)}x`} sub="vs. Wochendurchschnitt" />
              <Stat label="Empf. Ad Budget" value={fmtEur(ev.adBudget)} sub={`über ${ev.days} Tage`} />
              <Stat label="Lager-Aufbau bis" value={fmtDate(new Date(new Date(ev.date).getTime() - 21 * 86400000))} sub="3 Wochen Vorlauf" />
              <Stat label="Erwarteter Mehrumsatz" value={fmtEur(Math.round(ev.adBudget * 2.85))} sub={`bei ROAS 2.85`} />
            </div>

            <SectionLabel>Checkliste</SectionLabel>
            <ul className="checklist">
              {(ev.id === 'bfcm' ? bfcmChecklist : defaultChecklist).map((item, i) => (
                <li key={i} className={`checklist__item ${item.done ? 'is-done' : ''}`}>
                  <span className={`checklist__box ${item.done ? 'is-done' : ''}`} />
                  <span className="checklist__lbl">{item.label}</span>
                  {item.due && <span className="muted mono small">{item.due}</span>}
                </li>
              ))}
            </ul>

            <SectionLabel>Historisch · Vorjahre</SectionLabel>
            <table className="tbl">
              <thead><tr><th>Jahr</th><th className="r">Umsatz Event</th><th className="r">vs. Normal-Wo.</th><th className="r">Ad ROAS</th><th>Notiz</th></tr></thead>
              <tbody>
                <tr><td className="mono">2025</td><td className="r mono">€2.840</td><td className="r"><Tag kind="pos">+1.92x</Tag></td><td className="r mono">3.10</td><td className="muted small">Bester BF bisher</td></tr>
                <tr><td className="mono">2024</td><td className="r mono">€1.620</td><td className="r"><Tag kind="pos">+1.74x</Tag></td><td className="r mono">2.80</td><td className="muted small">Caps ausverkauft Tag 2</td></tr>
              </tbody>
            </table>
          </div>
        </Panel>

        <div className="stack">
          <Panel title="Cashflow-Vorausschau">
            <ul className="kvlist">
              <li><span>Lager-Investment (3 Wo. vorher)</span><b className="mono neg">{fmtEur(-1800)}</b></li>
              <li><span>Ad Budget (5 Tage)</span><b className="mono neg">{fmtEur(-ev.adBudget)}</b></li>
              <li><span>Erwartete Payouts</span><b className="mono pos">{fmtEur(Math.round(ev.adBudget * 2.85))}</b></li>
              <li><span>Netto-Impact</span><b className="mono">{fmtEur(Math.round(ev.adBudget * 2.85) - 1800 - ev.adBudget)}</b></li>
            </ul>
          </Panel>
          <Panel title="Risiken">
            <ul className="reclist">
              <li><StatusDot kind="warning" /><span>Lieferzeit Müller Print 7 Tage — Mitte Nov. bestellen</span></li>
              <li><StatusDot kind="warning" /><span>Cap Basic Stock-Risiko (12 Tage Lieferzeit)</span></li>
              <li><StatusDot kind="pos" /><span>Cashflow reicht für Vorab-Investment</span></li>
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}

const bfcmChecklist = [
  { label: 'Lieferanten-Bestellung Hoodies', due: '06.11.', done: false },
  { label: 'Lieferanten-Bestellung Caps',    due: '06.11.', done: false },
  { label: 'Ad Creatives finalisieren',      due: '20.11.', done: false },
  { label: 'Landing Page BFCM',              due: '24.11.', done: false },
  { label: 'Email-Kampagne vorbereiten',     due: '25.11.', done: false },
  { label: 'Cashflow-Reserve €1.800',        due: '20.11.', done: false },
];
const defaultChecklist = [
  { label: 'Lieferanten-Bestellung',         due: '−21d',   done: false },
  { label: 'Ad Creatives finalisieren',      due: '−7d',    done: false },
  { label: 'Landing Page anpassen',          due: '−3d',    done: false },
  { label: 'Email-Kampagne vorbereiten',     due: '−2d',    done: false },
];

function YearTimeline({ today, events, selected, onSelect }) {
  const months = ['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez','Jan','Feb','Mär','Apr'];
  const startMonth = 4; // Mai 2026
  const startYear = 2026;
  const totalCols = 12; // show 12 months from Mai 2026

  // Map event date to column index
  const colOf = (dateStr) => {
    const d = new Date(dateStr);
    const monthIdx = (d.getFullYear() - startYear) * 12 + d.getMonth() - startMonth;
    return Math.max(0, Math.min(totalCols - 1, monthIdx));
  };

  return (
    <div className="ytl">
      <div className="ytl__months">
        {Array.from({ length: totalCols }).map((_, i) => {
          const m = (startMonth + i) % 12;
          const y = startYear + Math.floor((startMonth + i) / 12);
          return (
            <div key={i} className="ytl__m">
              <span className="ytl__mname mono">{months[m]}</span>
              {m === 0 && <span className="muted mono small">{y}</span>}
            </div>
          );
        })}
      </div>
      <div className="ytl__track">
        {events.map((e) => {
          const col = colOf(e.date);
          const pos = (col / totalCols) * 100;
          const width = (e.days / 30 / totalCols) * 100;
          return (
            <button key={e.id}
              className={`ytl__ev ytl__ev--${e.id === selected ? 'active' : 'inactive'}`}
              style={{ left: pos + '%', width: `max(120px, ${width}%)` }}
              onClick={() => onSelect(e.id)}>
              <span className="ytl__evlbl">{e.label}</span>
              <span className="ytl__evdate mono muted">{fmtDate(e.date)} · {e.uplift.toFixed(2)}x</span>
            </button>
          );
        })}
        <div className="ytl__today" style={{ left: '0%' }} title="heute">
          <span className="mono">heute</span>
        </div>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════
// 11. JAHRESPLANUNG
// ═══════════════════════════════════════════════════════════
function PlanningScreen() {
  // 12 Monate 2026 — Target + Actual (bis Mai)
  const months = [
    { m: 'Jan', target: 2400, actual: 2180, ads: 240, profit: 720 },
    { m: 'Feb', target: 2600, actual: 2410, ads: 260, profit: 810 },
    { m: 'Mär', target: 2700, actual: 2840, ads: 280, profit: 980 },
    { m: 'Apr', target: 2950, actual: 3120, ads: 320, profit: 1080 },
    { m: 'Mai', target: 3500, actual: 2847, ads: 280, profit: 940, current: true },
    { m: 'Jun', target: 3600, actual: null, ads: 340, profit: null },
    { m: 'Jul', target: 3400, actual: null, ads: 320, profit: null },
    { m: 'Aug', target: 3800, actual: null, ads: 420, profit: null },
    { m: 'Sep', target: 4200, actual: null, ads: 480, profit: null },
    { m: 'Okt', target: 4400, actual: null, ads: 460, profit: null },
    { m: 'Nov', target: 6800, actual: null, ads: 980, profit: null },
    { m: 'Dez', target: 5800, actual: null, ads: 720, profit: null },
  ];
  const ytdTarget = months.slice(0, 5).reduce((s, m) => s + m.target, 0);
  const ytdActual = months.slice(0, 5).reduce((s, m) => s + (m.actual || 0), 0);
  const yearTarget = months.reduce((s, m) => s + m.target, 0);
  const projection = ytdActual + months.slice(5).reduce((s, m) => s + m.target * 1.04, 0);
  const max = Math.max(...months.map(m => m.target));

  const quarters = [
    { q: 'Q1', months: months.slice(0, 3), status: 'done' },
    { q: 'Q2', months: months.slice(3, 6), status: 'active' },
    { q: 'Q3', months: months.slice(6, 9), status: 'upcoming' },
    { q: 'Q4', months: months.slice(9, 12), status: 'upcoming' },
  ];

  return (
    <div className="screen screen--planning">
      <PageHead title="Jahresplanung 2026" eyebrow="Soll vs. Ist · monatlich"
        actions={<>
          <button className="btn btn--ghost">Ziele bearbeiten</button>
          <button className="btn btn--ghost">Export</button>
        </>}
      />

      <div className="grid grid--4">
        <Stat label="Ziel 2026" value={fmtEur(yearTarget)} sub="12 Monate" />
        <Stat label="YTD Actual" value={fmtEur(ytdActual)} delta={fmtPct((ytdActual / ytdTarget - 1) * 100, { sign: true })} deltaKind={ytdActual >= ytdTarget ? 'pos' : 'neg'} />
        <Stat label="YTD vs. Ziel" value={fmtEur(ytdActual - ytdTarget, { sign: true })} sub={`${fmtPct(ytdActual / ytdTarget * 100, { decimals: 0 })} erreicht`} />
        <Stat label="Jahresprognose" value={fmtEur(Math.round(projection))} delta={fmtPct((projection / yearTarget - 1) * 100, { sign: true })} deltaKind={projection >= yearTarget ? 'pos' : 'neg'} />
      </div>

      <Panel title="Monatliche Ziele vs. Actual" subtitle="Gantt-Übersicht — graue Balken = Ziel, dunkler = Actual">
        <div className="ygantt">
          <div className="ygantt__rows">
            {months.map((m) => {
              const tPct = (m.target / max) * 100;
              const aPct = m.actual ? (m.actual / max) * 100 : 0;
              const isOver = m.actual && m.actual > m.target;
              return (
                <div key={m.m} className={`ygantt__row ${m.current ? 'is-current' : ''}`}>
                  <div className="ygantt__lbl mono">{m.m}</div>
                  <div className="ygantt__track">
                    <div className="ygantt__target" style={{ width: tPct + '%' }}>
                      <span className="ygantt__tlbl mono muted">{fmtEur(m.target)}</span>
                    </div>
                    {m.actual && (
                      <div className={`ygantt__actual ${isOver ? 'is-over' : ''}`} style={{ width: aPct + '%' }}>
                        <span className="ygantt__alb mono">{fmtEur(m.actual)}</span>
                      </div>
                    )}
                  </div>
                  <div className="ygantt__delta">
                    {m.actual ? (
                      <span className={`delta delta--${m.actual >= m.target ? 'pos' : 'neg'}`}>
                        {fmtPct((m.actual / m.target - 1) * 100, { sign: true, decimals: 0 })}
                      </span>
                    ) : (
                      <span className="muted small mono">geplant</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Panel>

      <Panel title="Quartals-Review" subtitle="Performance pro Quartal">
        <div className="quarters">
          {quarters.map((q) => {
            const t = q.months.reduce((s, m) => s + m.target, 0);
            const a = q.months.reduce((s, m) => s + (m.actual || 0), 0);
            const p = q.months.reduce((s, m) => s + (m.profit || 0), 0);
            return (
              <div key={q.q} className={`quarter quarter--${q.status}`}>
                <div className="quarter__hd">
                  <span className="quarter__q">{q.q} 2026</span>
                  <Tag kind={q.status === 'done' ? 'pos' : q.status === 'active' ? 'neutral' : 'warn'}>
                    {q.status === 'done' ? 'abgeschlossen' : q.status === 'active' ? 'laufend' : 'geplant'}
                  </Tag>
                </div>
                <div className="quarter__nums">
                  <div>
                    <div className="kpi__label">Ziel</div>
                    <div className="mono strong">{fmtEur(t)}</div>
                  </div>
                  <div>
                    <div className="kpi__label">Actual</div>
                    <div className="mono strong">{q.status !== 'upcoming' ? fmtEur(a) : '—'}</div>
                  </div>
                  <div>
                    <div className="kpi__label">Profit</div>
                    <div className="mono strong">{q.status === 'done' ? fmtEur(p) : '—'}</div>
                  </div>
                </div>
                <div className="quarter__months mono muted">
                  {q.months.map(m => m.m).join(' · ')}
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      <div className="grid grid--2-1">
        <Panel title="Running Total · 2026" subtitle="Kumulativer Umsatz vs. Ziel">
          <RunningTotalChart months={months} />
        </Panel>
        <Panel title="Was bis Ziel?" subtitle="Was muss passieren">
          <ul className="kvlist">
            <li><span>Differenz zu Jahresziel</span><b className="mono neg">{fmtEur(yearTarget - projection)}</b></li>
            <li><span>Benötigte Run rate Δ</span><b className="mono">+{fmtPct(((yearTarget - ytdActual) / (yearTarget - ytdTarget) - 1) * 100, { decimals: 0 })}</b></li>
            <li><span>BFCM-Uplift kritisch</span><b>+€2.400 Annahme</b></li>
            <li><span>Notwendiger Ø-Monat ab Jun</span><b className="mono">{fmtEur(Math.round((yearTarget - ytdActual) / 7))}</b></li>
          </ul>
        </Panel>
      </div>
    </div>
  );
}

function RunningTotalChart({ months }) {
  const w = 640, h = 200;
  const padL = 8, padR = 8, padT = 12, padB = 24;
  const W = w - padL - padR;
  const H = h - padT - padB;

  let cumT = 0, cumA = 0;
  const tPts = months.map((m) => { cumT += m.target; return cumT; });
  const aPts = months.map((m) => { if (m.actual) cumA += m.actual; return m.actual ? cumA : null; });
  const max = Math.max(...tPts);
  const sx = (i) => padL + (i / (months.length - 1)) * W;
  const sy = (v) => padT + H - (v / max) * H;

  const tPath = tPts.map((v, i) => `${i === 0 ? 'M' : 'L'}${sx(i)},${sy(v)}`).join(' ');
  const aPath = aPts.map((v, i) => v == null ? null : `${aPts.slice(0, i).every(x => x == null) ? 'M' : 'L'}${sx(i)},${sy(v)}`).filter(Boolean).join(' ');

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="chart" preserveAspectRatio="none">
      <path d={tPath} fill="none" stroke="var(--c-muted)" strokeWidth="1.5" strokeDasharray="3 3" />
      <path d={aPath} fill="none" stroke="var(--c-text)" strokeWidth="2" />
      {months.map((m, i) => (
        <text key={m.m} x={sx(i)} y={h - 6} textAnchor="middle" className="chart__axis">{m.m}</text>
      ))}
      {aPts.map((v, i) => v && <circle key={i} cx={sx(i)} cy={sy(v)} r="2.5" fill="var(--c-text)" />)}
    </svg>
  );
}


// ═══════════════════════════════════════════════════════════
// 12. INVESTOR-READY REPORTS
// ═══════════════════════════════════════════════════════════
function ReportsScreen() {
  const [period, setPeriod] = React.useState('mai-26');

  return (
    <div className="screen screen--reports">
      <PageHead title="Investor-Ready Reports" eyebrow="Bankfertige Berichte · CESA Branding"
        actions={<>
          <div className="seg">
            <button className={`seg__b ${period === 'mai-26' ? 'is-active' : ''}`} onClick={() => setPeriod('mai-26')}>Mai 2026</button>
            <button className={`seg__b ${period === 'q2-26' ? 'is-active' : ''}`} onClick={() => setPeriod('q2-26')}>Q2 2026</button>
            <button className={`seg__b ${period === 'ytd' ? 'is-active' : ''}`} onClick={() => setPeriod('ytd')}>YTD</button>
            <button className={`seg__b ${period === 'yoy' ? 'is-active' : ''}`} onClick={() => setPeriod('yoy')}>YoY</button>
          </div>
          <button className="btn btn--primary">PDF Export</button>
        </>}
      />

      <div className="report">
        <div className="report__sheet">
          <div className="report__head">
            <div>
              <div className="brand brand--report">
                <div className="brand__mark">C</div>
                <div>
                  <div className="brand__name">CESA Clothing</div>
                  <div className="muted small">cesaclothing.myshopify.com · Inh. Easy</div>
                </div>
              </div>
            </div>
            <div className="report__meta">
              <div className="mono small muted">FINANCIAL STATEMENT</div>
              <div className="mono strong">Mai 2026</div>
              <div className="muted small">Erstellt 25.05.2026 · CESA Financial OS</div>
            </div>
          </div>

          <section className="report__sec">
            <h4 className="report__h">1. Gewinn- & Verlustrechnung (P&L)</h4>
            <table className="tbl tbl--full tbl--report">
              <thead>
                <tr><th></th><th className="r">Mai 2026</th><th className="r">Apr 2026</th><th className="r">Δ</th><th className="r">YTD</th></tr>
              </thead>
              <tbody>
                <tr><td>Umsatzerlöse</td><td className="r mono">€2.847</td><td className="r mono">€3.120</td><td className="r"><span className="delta delta--neg">−9%</span></td><td className="r mono">€14.097</td></tr>
                <tr><td className="muted">  Davon Shopify Direct</td><td className="r mono muted">€2.610</td><td className="r mono muted">€2.890</td><td className="r"></td><td className="r mono muted">€12.840</td></tr>
                <tr><td className="muted">  Davon Sonstige</td><td className="r mono muted">€237</td><td className="r mono muted">€230</td><td className="r"></td><td className="r mono muted">€1.257</td></tr>
                <tr><td>Wareneinkauf (COGS)</td><td className="r mono neg">−€892</td><td className="r mono neg">−€980</td><td className="r"></td><td className="r mono neg">−€4.420</td></tr>
                <tr><td>Marketing / Ads</td><td className="r mono neg">−€280</td><td className="r mono neg">−€320</td><td className="r"></td><td className="r mono neg">−€1.380</td></tr>
                <tr><td>Versand & Logistik</td><td className="r mono neg">−€176</td><td className="r mono neg">−€198</td><td className="r"></td><td className="r mono neg">−€890</td></tr>
                <tr><td>Software / SaaS</td><td className="r mono neg">−€81</td><td className="r mono neg">−€81</td><td className="r"></td><td className="r mono neg">−€405</td></tr>
                <tr><td>Retouren</td><td className="r mono neg">−€78</td><td className="r mono neg">−€92</td><td className="r"></td><td className="r mono neg">−€420</td></tr>
                <tr className="tbl__sum"><td>Operativer Gewinn</td><td className="r mono strong">€1.340</td><td className="r mono strong">€1.449</td><td className="r"><Tag kind="neg">−8%</Tag></td><td className="r mono strong">€6.582</td></tr>
                <tr><td>Sonstige Einkünfte (Mieteinnahmen)</td><td className="r mono pos">+€450</td><td className="r mono pos">+€450</td><td className="r"></td><td className="r mono pos">+€2.250</td></tr>
                <tr><td>Sonstige Einkünfte (Freelance)</td><td className="r mono pos">+€780</td><td className="r mono pos">+€780</td><td className="r"></td><td className="r mono pos">+€3.900</td></tr>
                <tr className="tbl__sum tbl__sum--strong"><td>Gesamtergebnis</td><td className="r mono strong">€2.570</td><td className="r mono strong">€2.679</td><td className="r"><span className="delta delta--neg">−4%</span></td><td className="r mono strong">€12.732</td></tr>
              </tbody>
            </table>
          </section>

          <section className="report__sec">
            <h4 className="report__h">2. Cashflow Statement</h4>
            <table className="tbl tbl--full tbl--report">
              <tbody>
                <tr><td>Cash zu Beginn (01.05.)</td><td className="r mono">€5.210</td></tr>
                <tr><td>+ Operative Einnahmen</td><td className="r mono pos">+€4.077</td></tr>
                <tr><td>− Operative Ausgaben</td><td className="r mono neg">−€1.507</td></tr>
                <tr className="tbl__sum"><td>Operativer Cashflow</td><td className="r mono strong">+€2.570</td></tr>
                <tr><td>− Investitionen (Lager)</td><td className="r mono neg">−€420</td></tr>
                <tr><td>− Steuern (UStVA April)</td><td className="r mono neg">−€312</td></tr>
                <tr><td>− Entnahmen Privat</td><td className="r mono neg">−€800</td></tr>
                <tr className="tbl__sum tbl__sum--strong"><td>Cash zu Ende (proj. 31.05.)</td><td className="r mono strong">€6.248</td></tr>
              </tbody>
            </table>
          </section>

          <section className="report__sec">
            <h4 className="report__h">3. Bilanz · Net Worth</h4>
            <div className="grid grid--2">
              <table className="tbl tbl--full tbl--report">
                <thead><tr><th>Aktiva</th><th className="r">31.05.2026</th></tr></thead>
                <tbody>
                  <tr><td>Geschäftskonto</td><td className="r mono">€4.890</td></tr>
                  <tr><td>Shopify Payout Pending</td><td className="r mono">€620</td></tr>
                  <tr><td>PayPal Business</td><td className="r mono">€312</td></tr>
                  <tr><td>Tagesgeld Rücklage</td><td className="r mono">€3.000</td></tr>
                  <tr><td>Privatkonto</td><td className="r mono">€1.198</td></tr>
                  <tr><td>Immobilie (Anteil)</td><td className="r mono">€8.400</td></tr>
                  <tr><td>Warenbestand (geschätzt)</td><td className="r mono">€2.240</td></tr>
                  <tr className="tbl__sum"><td>Summe Aktiva</td><td className="r mono strong">€20.660</td></tr>
                </tbody>
              </table>
              <table className="tbl tbl--full tbl--report">
                <thead><tr><th>Passiva</th><th className="r">31.05.2026</th></tr></thead>
                <tbody>
                  <tr><td>Lieferant Müller (offen)</td><td className="r mono">€280</td></tr>
                  <tr><td>Meta Ads (akkumuliert)</td><td className="r mono">€142</td></tr>
                  <tr><td>Steuerrücklage USt</td><td className="r mono">€380</td></tr>
                  <tr><td>Steuerrücklage ESt</td><td className="r mono">€1.438</td></tr>
                  <tr className="tbl__sum"><td>Summe Verbindlichkeiten</td><td className="r mono strong">€2.240</td></tr>
                  <tr><td></td><td></td></tr>
                  <tr className="tbl__sum tbl__sum--strong"><td>Eigenkapital / Net Worth</td><td className="r mono strong">€18.420</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="report__sec">
            <h4 className="report__h">4. Year-over-Year Vergleich</h4>
            <table className="tbl tbl--full tbl--report">
              <thead><tr><th>Kennzahl</th><th className="r">YTD 2026</th><th className="r">YTD 2025</th><th className="r">Δ</th><th className="r">Δ %</th></tr></thead>
              <tbody>
                <tr><td>Umsatz</td><td className="r mono">€14.097</td><td className="r mono">€8.620</td><td className="r mono pos">+€5.477</td><td className="r"><Tag kind="pos">+63%</Tag></td></tr>
                <tr><td>Bestellungen</td><td className="r mono">428</td><td className="r mono">312</td><td className="r mono pos">+116</td><td className="r"><Tag kind="pos">+37%</Tag></td></tr>
                <tr><td>Ø Warenkorb</td><td className="r mono">€32,94</td><td className="r mono">€27,63</td><td className="r mono pos">+€5,31</td><td className="r"><Tag kind="pos">+19%</Tag></td></tr>
                <tr><td>Ad ROAS</td><td className="r mono">2.74</td><td className="r mono">2.12</td><td className="r mono pos">+0.62</td><td className="r"><Tag kind="pos">+29%</Tag></td></tr>
                <tr><td>Retourenquote</td><td className="r mono">4.8%</td><td className="r mono">6.2%</td><td className="r mono pos">−1.4pp</td><td className="r"><Tag kind="pos">verbessert</Tag></td></tr>
                <tr><td>Operative Marge</td><td className="r mono">46.7%</td><td className="r mono">41.2%</td><td className="r mono pos">+5.5pp</td><td className="r"><Tag kind="pos">+13%</Tag></td></tr>
                <tr className="tbl__sum tbl__sum--strong"><td>Net Worth</td><td className="r mono strong">€18.420</td><td className="r mono strong">€11.840</td><td className="r mono pos strong">+€6.580</td><td className="r"><Tag kind="pos">+56%</Tag></td></tr>
              </tbody>
            </table>
          </section>

          <section className="report__sec report__sec--note">
            <h4 className="report__h">5. Anmerkungen & Annahmen</h4>
            <ul className="report__notes">
              <li>Werte für Mai 2026 enthalten projizierte Posten ab 26.05. (Payouts, Lieferanten).</li>
              <li>Warenbestand zu Einkaufspreis bewertet, keine Abschreibung berücksichtigt.</li>
              <li>Mieteinnahmen netto nach laufenden Kosten der Beteiligung.</li>
              <li>Steuerrücklage USt = 19% der MwSt-pflichtigen Umsätze, ESt-Schätzung 30% des Gewinns.</li>
              <li>Diese Auswertung ist kein testierter Jahresabschluss — nur interne Steuerung.</li>
            </ul>
          </section>

          <div className="report__foot">
            <span className="muted small mono">Generiert mit CESA Financial OS · 25.05.2026 07:42</span>
            <span className="muted small mono">Seite 1 / 1</span>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { SeasonsScreen, PlanningScreen, ReportsScreen });
