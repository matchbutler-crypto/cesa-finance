// CESA Financial OS — Screens: Dashboard, Cashflow, Forecast

// ═══════════════════════════════════════════════════════════
// 1. DASHBOARD — Net Worth + Daily Check-in
// ═══════════════════════════════════════════════════════════
function DashboardScreen({ tweaks, layout }) {
  const d = window.CESA;
  const nw = d.netWorth;

  return (
    <div className={`screen screen--dashboard layout--${layout}`}>
      <PageHead
        title="Dashboard"
        eyebrow="Mai 2026 · Tag 25/31"
        actions={<div className="actions">
          <button className="btn btn--ghost">Waypoint setzen</button>
          <button className="btn btn--ghost">Export</button>
        </div>}
      />

      {/* Hero: Net Worth + Forecast 12M */}
      <div className="grid grid--hero">
        <Panel className="panel--hero">
          <div className="hero">
            <div className="hero__l">
              <div className="hero__label">Gesamtvermögen</div>
              <div className="hero__value mono">{fmtEur(nw.total)}</div>
              <div className="hero__sub">
                <span className="delta delta--pos">{fmtEur(nw.delta30d, { sign: true })}</span>
                <span className="muted">letzte 30 Tage · {fmtPct(nw.delta30dPct, { sign: true })}</span>
              </div>
            </div>
            <div className="hero__r">
              <NetWorthChart history={nw.history} forecast={nw.forecast12m} width={520} height={130} />
            </div>
          </div>
          <div className="hero__projection">
            <div className="kv"><span>Projektion 12M</span><b className="mono">{fmtEur(nw.forecast12m[nw.forecast12m.length - 1])}</b></div>
            <div className="kv"><span>Monatliches Wachstum</span><b className="mono">{fmtEur(Math.round((nw.forecast12m[11] - nw.total) / 12))}</b></div>
            <div className="kv"><span>Ziel Ø Wachstum</span><b className="mono muted">{fmtEur(500)}</b></div>
          </div>
        </Panel>
      </div>

      {/* Account breakdown + Daily check-in */}
      <div className="grid grid--3-2">
        <Panel title="Kontensaldo" subtitle="Aufschlüsselung Vermögen" action={<Tag kind="neutral">{nw.accounts.length} Konten</Tag>}>
          <table className="tbl tbl--rows">
            <tbody>
              {nw.accounts.map((a) => (
                <tr key={a.name}>
                  <td className="tbl__pill"><span className={`pill pill--${a.kind}`}>{accountAbbrev(a.kind)}</span></td>
                  <td className="tbl__name">{a.name}</td>
                  <td className="tbl__num mono">{fmtEur(a.balance)}</td>
                  <td className="tbl__num">
                    {a.change !== 0
                      ? <span className={`delta delta--${a.change > 0 ? 'pos' : 'neg'}`}>{fmtEur(a.change, { sign: true })}</span>
                      : <span className="muted">—</span>}
                  </td>
                </tr>
              ))}
              <tr className="tbl__sum">
                <td colSpan="2">Summe Aktiva</td>
                <td className="tbl__num mono">{fmtEur(nw.accounts.reduce((s, a) => s + a.balance, 0))}</td>
                <td className="tbl__num"><span className="delta delta--pos">{fmtEur(nw.accounts.reduce((s, a) => s + a.change, 0), { sign: true })}</span></td>
              </tr>
              {nw.liabilities.map((l) => (
                <tr key={l.name} className="tbl__liab">
                  <td className="tbl__pill"><span className="pill pill--liab">VBL</span></td>
                  <td className="tbl__name">{l.name}</td>
                  <td className="tbl__num mono">{fmtEur(-l.amount)}</td>
                  <td className="tbl__num muted">fällig {fmtDate(l.due)}</td>
                </tr>
              ))}
              <tr className="tbl__sum tbl__sum--strong">
                <td colSpan="2">Nettovermögen</td>
                <td className="tbl__num mono">{fmtEur(nw.total)}</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </Panel>

        <Panel title="Heute" subtitle="Daily Check-in · 30 Sekunden">
          <DailyCheckin />
        </Panel>
      </div>

      {/* Quick widgets */}
      <div className="grid grid--4">
        <KpiCard label="Umsatz MTD"     value={fmtEur(d.forecast.mtdRevenue)} delta={fmtPct((d.forecast.mtdRevenue / d.forecast.lastMonth - 1) * 100, { sign: true })} deltaKind="pos" sub={`Ziel ${fmtEur(d.forecast.target)}`} chart={<Sparkline data={d.forecast.daily} width={92} height={28} stroke="var(--c-text)" />} />
          <KpiCard label="Projektion EOM" value={fmtEur(d.forecast.projectedMonthEnd)} delta={`+${(d.forecast.projectedMonthEnd - d.forecast.target).toFixed(0)} vs. Ziel`} deltaKind="pos" sub={`Run rate ${fmtEur(d.forecast.dailyRunRate, { decimals: 0 })}/Tag`} />
        <KpiCard label="Ad ROAS heute"  value={d.ads.roas.toFixed(2) + 'x'} delta={`Break-even ${d.ads.breakEvenRoas}x`} deltaKind="pos" sub="Skalieren empfohlen" status="green" />
        <KpiCard label="Cash Reserve"   value={fmtEur(nw.accounts.find(a => a.kind === 'savings').balance + nw.accounts[0].balance)} delta="≈ 38 Tage Fixkosten" deltaKind="pos" sub="Liquidität gesund" />
      </div>

      {/* Bottom: Alerts + Top products mini */}
      <div className="grid grid--3-2">
        <Panel title="Aufmerksamkeit" subtitle="Was diese Woche zählt">
          <ul className="alerts">
            <AlertRow kind="warn" title="Cap Basic läuft in 5 Tagen aus" sub="Nachbestellen — Lieferzeit 12 Tage" cta="Bestellen" />
            <AlertRow kind="info" title="Shopify Payout am 26.05." sub="Erwartet ~€290" />
            <AlertRow kind="warn" title="Lieferant Müller fällig 28.05." sub="€280 — Cash reicht" />
            <AlertRow kind="ok"   title="UStVA April eingereicht" sub="Nächste Frist 10.06." />
          </ul>
        </Panel>

        <Panel title="Top 3 Produkte" subtitle="Echter Profit (MTD)">
          <table className="tbl">
            <tbody>
              {[...d.products].sort((a,b) => b.profit - a.profit).slice(0, 3).map((p) => (
                <tr key={p.sku}>
                  <td className="tbl__name">
                    <div>{p.name}</div>
                    <div className="muted small">{p.sku} · {p.units} Stk</div>
                  </td>
                  <td className="tbl__num mono">{fmtEur(p.profit, { decimals: 0 })}</td>
                  <td className="tbl__num"><Tag kind={p.margin > 0.45 ? 'pos' : p.margin > 0.35 ? 'neutral' : 'warn'}>{fmtPct(p.margin * 100, { decimals: 0 })}</Tag></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </div>
    </div>
  );
}

function accountAbbrev(kind) {
  return { bank: 'BNK', store: 'SHP', paypal: 'PP', savings: 'TG', real: 'IMO' }[kind] || '—';
}

function KpiCard({ label, value, delta, deltaKind, sub, chart, status }) {
  return (
    <div className="kpi">
      <div className="kpi__top">
        <span className="kpi__label">{label}</span>
        {status && <StatusDot kind={status} />}
      </div>
      <div className="kpi__value mono">{value}</div>
      <div className="kpi__foot">
        <div>
          {delta && <span className={`delta delta--${deltaKind || 'pos'}`}>{delta}</span>}
          {sub && <div className="kpi__sub">{sub}</div>}
        </div>
        {chart && <div className="kpi__chart">{chart}</div>}
      </div>
    </div>
  );
}

function AlertRow({ kind, title, sub, cta }) {
  return (
    <li className={`alert alert--${kind}`}>
      <StatusDot kind={kind === 'warn' ? 'warning' : kind === 'ok' ? 'pos' : 'info'} />
      <div className="alert__body">
        <div className="alert__title">{title}</div>
        <div className="alert__sub">{sub}</div>
      </div>
      {cta && <button className="btn btn--ghost btn--sm">{cta}</button>}
    </li>
  );
}

function DailyCheckin() {
  const d = window.CESA;
  const items = [
    { lbl: 'Orders gestern',    val: '4',         sub: '€204 GMV',        ok: true },
    { lbl: 'Ad ROAS gestern',   val: d.ads.roasYesterday.toFixed(2) + 'x', sub: 'Break-even 2.5x', ok: true },
    { lbl: 'Cash heute',        val: fmtEur(d.netWorth.accounts[0].balance + d.netWorth.accounts[1].balance), sub: 'Konto + Shopify', ok: true },
    { lbl: 'Engpass-Risiko',    val: 'Keiner',    sub: 'Nächste 14 Tage',   ok: true },
    { lbl: 'Belege offen',      val: '2',         sub: 'In Inbox',          ok: false },
    { lbl: 'Steuer-Fristen',    val: 'Keine',     sub: 'Diese Woche',       ok: true },
  ];
  return (
    <div className="checkin">
      <div className="checkin__time mono">07:42</div>
      <div className="checkin__grid">
        {items.map((it) => (
          <div key={it.lbl} className={`checkin__row ${it.ok ? 'ok' : 'warn'}`}>
            <div className="checkin__lbl">{it.lbl}</div>
            <div className="checkin__val mono">{it.val}</div>
            <div className="checkin__sub">{it.sub}</div>
          </div>
        ))}
      </div>
      <div className="checkin__verdict">
        <StatusDot kind="pos" size={10} />
        <span>Auf Kurs. Cap Basic heute nachbestellen.</span>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════
// 2. CASHFLOW TIMELINE
// ═══════════════════════════════════════════════════════════
function CashflowScreen() {
  const d = window.CESA;
  const cf = d.cashflow;
  const totalIn = cf.entries.filter(e => e.amount > 0 && !e.projected).reduce((s, e) => s + e.amount, 0);
  const totalOut = cf.entries.filter(e => e.amount < 0 && !e.projected).reduce((s, e) => s - e.amount, 0);
  const projIn = cf.entries.filter(e => e.amount > 0 && e.projected).reduce((s, e) => s + e.amount, 0);
  const projOut = cf.entries.filter(e => e.amount < 0 && e.projected).reduce((s, e) => s - e.amount, 0);

  return (
    <div className="screen screen--cashflow">
      <PageHead title="Cashflow Timeline" eyebrow="Mai 2026 · tagesbasiert"
        actions={<>
          <button className="btn btn--ghost">Konto wählen</button>
          <button className="btn btn--ghost">CSV Import</button>
        </>}
      />

      <div className="grid grid--4">
        <Stat label="Startsaldo 1.05." value={fmtEur(cf.startBalance)} />
        <Stat label="Einnahmen MTD" value={fmtEur(totalIn)} sub={`+${fmtEur(projIn)} projiziert`} />
        <Stat label="Ausgaben MTD"  value={fmtEur(-totalOut)} sub={`−${fmtEur(projOut)} projiziert`} />
        <Stat label="Endsaldo Proj." value={fmtEur(cf.startBalance + totalIn - totalOut + projIn - projOut)} sub="31.05.2026" />
      </div>

      <Panel title="Tägliche Ein-/Ausgaben" subtitle="Grün = Eingang · Rot = Ausgang · gestrichelt = projiziert">
        <CashflowBars data={cf} width={1080} height={220} />
      </Panel>

      <div className="grid grid--3-2">
        <Panel title="Transaktionen" subtitle="Chronologisch" action={
          <div className="seg">
            <button className="seg__b is-active">Alle</button>
            <button className="seg__b">Eingang</button>
            <button className="seg__b">Ausgang</button>
            <button className="seg__b">Projiziert</button>
          </div>
        }>
          <table className="tbl tbl--full">
            <thead>
              <tr><th>Datum</th><th>Beschreibung</th><th>Kategorie</th><th className="r">Betrag</th><th className="r">Saldo</th></tr>
            </thead>
            <tbody>
              {(() => {
                let bal = cf.startBalance;
                return cf.entries.map((e, i) => {
                  bal += e.amount;
                  return (
                    <tr key={i} className={e.projected ? 'is-proj' : ''}>
                      <td className="mono">{String(e.day).padStart(2, '0')}.05.</td>
                      <td>{e.label}{e.projected && <Tag kind="neutral">proj.</Tag>}</td>
                      <td><span className={`pill pill--${e.kind}`}>{e.kind}</span></td>
                      <td className={`r mono ${e.amount > 0 ? 'pos' : 'neg'}`}>{fmtEur(e.amount, { sign: true })}</td>
                      <td className="r mono muted">{fmtEur(bal)}</td>
                    </tr>
                  );
                });
              })()}
            </tbody>
          </table>
        </Panel>

        <div className="stack">
          <Panel title="Engpass-Alarm">
            <div className="alert-box alert-box--ok">
              <StatusDot kind="pos" />
              <div>
                <b>Kein Engpass erwartet</b>
                <div className="muted">Minimum Saldo 28.05.: {fmtEur(4220)} (Schwellwert {fmtEur(500)})</div>
              </div>
            </div>
          </Panel>
          <Panel title="Nächste Payouts">
            <ul className="kvlist">
              <li><span>Di 26.05.</span><b className="mono pos">{fmtEur(290)}</b></li>
              <li><span>Fr 29.05.</span><b className="mono pos">{fmtEur(260)}</b></li>
              <li><span>Mo 01.06.</span><b className="mono pos">{fmtEur(310)}</b></li>
            </ul>
          </Panel>
          <Panel title="Fällige Zahlungen">
            <ul className="kvlist">
              <li><span>Mi 28.05. · Lief. Müller</span><b className="mono neg">{fmtEur(-280)}</b></li>
              <li><span>Sa 31.05. · Meta Ads</span><b className="mono neg">{fmtEur(-180)}</b></li>
              <li><span>Mo 01.06. · Mieteinnahme</span><b className="mono pos">{fmtEur(450)}</b></li>
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════
// 3. FORECAST + SCENARIO BUILDER
// ═══════════════════════════════════════════════════════════
function ForecastScreen({ tweaks, setTweak }) {
  const d = window.CESA;
  const f = d.forecast;
  const [adDelta, setAdDelta] = React.useState(0);
  const [discountRate, setDiscountRate] = React.useState(0);
  const [pauseDays, setPauseDays] = React.useState(0);

  // Apply scenario adjustments to projection
  const adjustedRunRate = f.dailyRunRate * (1 + adDelta / 100 * 0.4) * (1 - pauseDays * 0.05 / 30);
  const adjustedProj = f.mtdRevenue + adjustedRunRate * (f.daysInMonth - f.daysElapsed);
  const baseProj = f.projectedMonthEnd;
  const adjustedData = { ...f, projectedMonthEnd: adjustedProj, dailyRunRate: adjustedRunRate };

  return (
    <div className="screen screen--forecast">
      <PageHead title="Forecast & Szenarien" eyebrow="Wohin steuern wir diesen Monat"
        actions={
          <div className="seg">
            <button className={`seg__b ${tweaks.forecastViz === 'line' ? 'is-active' : ''}`} onClick={() => setTweak('forecastViz', 'line')}>Linie</button>
            <button className={`seg__b ${tweaks.forecastViz === 'fan' ? 'is-active' : ''}`} onClick={() => setTweak('forecastViz', 'fan')}>Fan</button>
            <button className={`seg__b ${tweaks.forecastViz === 'area' ? 'is-active' : ''}`} onClick={() => setTweak('forecastViz', 'area')}>Area</button>
          </div>
        }
      />

      <div className="grid grid--4">
        <Stat label="Actual MTD" value={fmtEur(f.mtdRevenue)} sub={`${f.daysElapsed}/${f.daysInMonth} Tage`} />
        <Stat label="Run rate / Tag" value={fmtEur(adjustedRunRate, { decimals: 0 })} delta={adDelta !== 0 ? fmtPct((adjustedRunRate / f.dailyRunRate - 1) * 100, { sign: true }) : null} deltaKind={adDelta > 0 ? 'pos' : 'neg'} />
        <Stat label="Projektion EOM" value={fmtEur(adjustedProj)} delta={adDelta !== 0 ? fmtEur(adjustedProj - baseProj, { sign: true }) : `${fmtEur(adjustedProj - f.target, { sign: true })} vs. Ziel`} deltaKind={adjustedProj > f.target ? 'pos' : 'neg'} />
        <Stat label="Tage bis Ziel" value={f.daysToTarget.toFixed(1)} sub={`bei aktueller Run rate`} />
      </div>

      <div className="grid grid--2-1">
        <Panel title="Forecast Chart" subtitle={`Variante: ${tweaks.forecastViz}`}>
          <ForecastChart data={adjustedData} variant={tweaks.forecastViz} width={760} height={300} />
          <div className="legend">
            <span><span className="legend__sw legend__sw--text" /> Actual</span>
            <span><span className="legend__sw legend__sw--accent legend__sw--dashed" /> Projektion</span>
            <span><span className="legend__sw legend__sw--warning legend__sw--dashed" /> Ziel {fmtEur(f.target)}</span>
          </div>
        </Panel>

        <Panel title="Szenarien" subtitle="Was wäre wenn …" className="panel--scenario">
          <ScenarioBuilder
            variant={tweaks.scenarioUi}
            adDelta={adDelta} setAdDelta={setAdDelta}
            discountRate={discountRate} setDiscountRate={setDiscountRate}
            pauseDays={pauseDays} setPauseDays={setPauseDays}
            setTweak={setTweak}
            currentUi={tweaks.scenarioUi}
          />
        </Panel>
      </div>

      <div className="grid grid--2-1">
        <Panel title="Should I Buy This?" subtitle="Opportunity Cost Rechner">
          <ShouldIBuy />
        </Panel>
        <Panel title="Vergleich" subtitle="Letzte 3 Monate">
          <table className="tbl">
            <tbody>
              <tr><td>Mai 2026 (proj.)</td><td className="r mono">{fmtEur(adjustedProj)}</td><td className="r"><Tag kind={adjustedProj > f.target ? 'pos' : 'warn'}>{adjustedProj > f.target ? 'on track' : 'unter Ziel'}</Tag></td></tr>
              <tr><td>April 2026</td><td className="r mono">{fmtEur(f.lastMonth)}</td><td className="r"><Tag kind="pos">+10%</Tag></td></tr>
              <tr><td>März 2026</td><td className="r mono">{fmtEur(f.twoMonthsAgo)}</td><td className="r"><Tag kind="pos">+17%</Tag></td></tr>
              <tr><td>Februar 2026</td><td className="r mono">{fmtEur(2410)}</td><td className="r"><Tag kind="neutral">±0</Tag></td></tr>
            </tbody>
          </table>
        </Panel>
      </div>
    </div>
  );
}

function ScenarioBuilder({ variant, adDelta, setAdDelta, discountRate, setDiscountRate, pauseDays, setPauseDays, setTweak }) {
  if (variant === 'sliders') {
    return (
      <div className="scen scen--sliders">
        <ScenarioToggleBar setTweak={setTweak} active={variant} />
        <SliderRow label="Ad Budget Änderung" min={-50} max={100} step={5} value={adDelta} onChange={setAdDelta} unit="%" />
        <SliderRow label="Rabatt-Aktion"      min={0}    max={40}  step={5} value={discountRate} onChange={setDiscountRate} unit="%" />
        <SliderRow label="Ads pausieren"      min={0}    max={14}  step={1} value={pauseDays} onChange={setPauseDays} unit=" Tage" />
        <div className="scen__readout">
          <div className="kv"><span>Umsatzimpact (proj.)</span><b className="mono pos">{fmtEur(adDelta * 7, { sign: true })}</b></div>
          <div className="kv"><span>ROAS-Risiko</span><b className="mono">{adDelta > 50 ? 'erhöht' : 'gering'}</b></div>
        </div>
      </div>
    );
  }
  if (variant === 'cards') {
    return (
      <div className="scen scen--cards">
        <ScenarioToggleBar setTweak={setTweak} active={variant} />
        <div className="scards">
          <ScenarioCard title="Ad Budget +20%" sub="+€8/Tag" impact="+€180 Umsatz" risk="gering" active={adDelta === 20} onClick={() => setAdDelta(20)} />
          <ScenarioCard title="Ad Budget +50%" sub="+€20/Tag" impact="+€420 Umsatz" risk="mittel" active={adDelta === 50} onClick={() => setAdDelta(50)} />
          <ScenarioCard title="Ads pausieren 7 Tage" sub="€0/Tag" impact="−€760 Umsatz" risk="hoch" active={pauseDays === 7} onClick={() => { setPauseDays(7); setAdDelta(0); }} />
          <ScenarioCard title="Rabatt 20% (Wochenende)" sub="Black Friday Sim" impact="+€340 Umsatz" risk="margin −18%" active={discountRate === 20} onClick={() => setDiscountRate(20)} />
          <ScenarioCard title="Neue Kollektion launchen" sub="€2k Vorab" impact="+€5.4k Q3" risk="Cashflow" active={false} />
          <ScenarioCard title="Job-Verlust Stress-Test" sub="−€780/Mo" impact="Runway 14 Mo" risk="manageable" active={false} />
        </div>
      </div>
    );
  }
  // conversational
  return (
    <div className="scen scen--chat">
      <ScenarioToggleBar setTweak={setTweak} active={variant} />
      <div className="convo">
        <div className="convo__msg convo__msg--bot">Möchtest du etwas ausprobieren? Beschreib es mir.</div>
        <div className="convo__msg convo__msg--user">Was wenn ich Ad Budget um 30% erhöhe?</div>
        <div className="convo__msg convo__msg--bot">
          Bei +30% Ad Budget (+€12/Tag) und aktuellem ROAS 2.85:
          <ul>
            <li>Projizierter Mehrumsatz: <b className="mono">+€255 bis Monatsende</b></li>
            <li>Run rate steigt von €114 auf €127/Tag</li>
            <li>Cashflow bleibt positiv — Reserve sinkt um €84</li>
          </ul>
          <b>Empfehlung:</b> Vertretbar, aber CPM steigt aktuell. Starte mit +20%.
        </div>
        <div className="convo__msg convo__msg--user">Und wenn Black Friday einen 1.6x Uplift bringt?</div>
        <div className="convo__msg convo__msg--bot">
          Mit Uplift 1.6x über 4 Tage + verdoppeltem Ad Budget:
          <ul>
            <li>Erwarteter Extra-Umsatz: <b className="mono">+€1.840</b></li>
            <li>Lager-Check: Hoodie Classic reicht, Cap Basic muss bis dahin nachbestellt sein</li>
            <li>Cashflow-Spike Mitte Dez — Payouts erst nach 2 Tagen</li>
          </ul>
        </div>
      </div>
      <div className="convo__input">
        <input placeholder="Szenario beschreiben …" />
        <button className="btn btn--primary">Senden</button>
      </div>
    </div>
  );
}

function ScenarioToggleBar({ setTweak, active }) {
  return (
    <div className="seg seg--full">
      <button className={`seg__b ${active === 'sliders' ? 'is-active' : ''}`} onClick={() => setTweak('scenarioUi', 'sliders')}>Slider</button>
      <button className={`seg__b ${active === 'cards' ? 'is-active' : ''}`} onClick={() => setTweak('scenarioUi', 'cards')}>Karten</button>
      <button className={`seg__b ${active === 'chat' ? 'is-active' : ''}`} onClick={() => setTweak('scenarioUi', 'chat')}>Konversation</button>
    </div>
  );
}

function ScenarioCard({ title, sub, impact, risk, active, onClick }) {
  return (
    <button className={`scard ${active ? 'is-active' : ''}`} onClick={onClick}>
      <div className="scard__title">{title}</div>
      <div className="scard__sub muted">{sub}</div>
      <div className="scard__impact mono">{impact}</div>
      <div className="scard__risk">Risiko: <b>{risk}</b></div>
    </button>
  );
}

function SliderRow({ label, min, max, step, value, onChange, unit = '' }) {
  return (
    <div className="srow">
      <div className="srow__hd">
        <span>{label}</span>
        <b className="mono">{value > 0 ? '+' : ''}{value}{unit}</b>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} />
      <div className="srow__scale mono muted">
        <span>{min}{unit}</span><span>0</span><span>{max}{unit}</span>
      </div>
    </div>
  );
}

function ShouldIBuy() {
  const [amount, setAmount] = React.useState(2000);
  const roas = 2.85;
  const margin = 0.42;
  const fixedDaily = 168;
  const adsRev = amount * roas;
  const breakEvenUnits = Math.ceil(amount / (29.90 * margin));
  const daysCovered = (amount / fixedDaily).toFixed(0);
  return (
    <div className="sib">
      <label className="sib__lbl">Geplante Ausgabe</label>
      <div className="sib__input">
        <span className="mono muted">€</span>
        <input type="number" value={amount} onChange={(e) => setAmount(parseFloat(e.target.value) || 0)} />
      </div>
      <table className="tbl tbl--rows">
        <tbody>
          <tr><td>Als Meta Ads → Umsatz</td><td className="r mono">{fmtEur(adsRev, { decimals: 0 })}</td></tr>
          <tr><td>Break-even Units (€29.90 Cap)</td><td className="r mono">{breakEvenUnits} Stk</td></tr>
          <tr><td>Deckt Fixkosten für</td><td className="r mono">{daysCovered} Tage</td></tr>
          <tr><td>Opportunity Cost (Runway)</td><td className="r mono">{(amount / 1200).toFixed(1)} Monate</td></tr>
        </tbody>
      </table>
    </div>
  );
}

function PageHead({ title, eyebrow, actions }) {
  return (
    <header className="pagehead">
      <div>
        {eyebrow && <div className="pagehead__eyebrow">{eyebrow}</div>}
        <h1 className="pagehead__title">{title}</h1>
      </div>
      {actions && <div className="pagehead__actions">{actions}</div>}
    </header>
  );
}

Object.assign(window, {
  DashboardScreen, CashflowScreen, ForecastScreen,
  PageHead, KpiCard, AlertRow, ScenarioBuilder,
});
