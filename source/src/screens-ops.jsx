// CESA Financial OS — Screens: Products, Restocking, Documents

// ═══════════════════════════════════════════════════════════
// 4. PRODUKT-PROFITABILITÄT
// ═══════════════════════════════════════════════════════════
function ProductsScreen() {
  const d = window.CESA;
  const products = [...d.products].sort((a, b) => b.profit - a.profit);
  const totals = products.reduce((acc, p) => ({
    revenue: acc.revenue + p.revenue,
    cogs:    acc.cogs + p.totalCogs,
    ads:     acc.ads + p.totalAds,
    returns: acc.returns + p.totalReturns,
    profit:  acc.profit + p.profit,
    units:   acc.units + p.units,
  }), { revenue: 0, cogs: 0, ads: 0, returns: 0, profit: 0, units: 0 });

  return (
    <div className="screen screen--products">
      <PageHead title="Produkt-Profitabilität" eyebrow="Echter Profit · MTD Mai 2026"
        actions={<>
          <button className="btn btn--ghost">Spalten</button>
          <button className="btn btn--ghost">Export CSV</button>
        </>}
      />

      <div className="grid grid--5">
        <Stat label="Umsatz total" value={fmtEur(totals.revenue, { decimals: 0 })} />
        <Stat label="COGS" value={fmtEur(-totals.cogs, { decimals: 0 })} />
        <Stat label="Ad Spend allokiert" value={fmtEur(-totals.ads, { decimals: 0 })} />
        <Stat label="Retouren" value={fmtEur(-totals.returns, { decimals: 0 })} />
        <Stat label="Echter Profit" value={fmtEur(totals.profit, { decimals: 0 })} delta={`${(totals.profit / totals.revenue * 100).toFixed(0)}% Marge`} deltaKind="pos" />
      </div>

      <Panel title="Ranking nach Profit" subtitle="Nicht Umsatz — was wirklich übrig bleibt">
        <table className="tbl tbl--full tbl--products">
          <thead>
            <tr>
              <th className="r">#</th>
              <th>Produkt</th>
              <th className="r">Stk</th>
              <th className="r">Preis</th>
              <th className="r">Umsatz</th>
              <th className="r">COGS</th>
              <th className="r">Ads</th>
              <th className="r">Retouren</th>
              <th className="r">Profit</th>
              <th className="r">Marge</th>
              <th>Empfehlung</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p, i) => {
              const rec = p.margin > 0.45 ? { label: 'skalieren', kind: 'pos' }
                        : p.margin > 0.35 ? { label: 'halten', kind: 'neutral' }
                        : p.margin > 0.25 ? { label: 'beobachten', kind: 'warn' }
                        : { label: 'pricing prüfen', kind: 'neg' };
              return (
                <tr key={p.sku}>
                  <td className="r mono muted">{String(i + 1).padStart(2, '0')}</td>
                  <td>
                    <div>{p.name}</div>
                    <div className="muted small mono">{p.sku}</div>
                  </td>
                  <td className="r mono">{p.units}</td>
                  <td className="r mono muted">{fmtEur(p.price, { decimals: 2 })}</td>
                  <td className="r mono">{fmtEur(p.revenue, { decimals: 0 })}</td>
                  <td className="r mono neg">{fmtEur(-p.totalCogs, { decimals: 0 })}</td>
                  <td className="r mono neg">{fmtEur(-p.totalAds, { decimals: 0 })}</td>
                  <td className="r mono neg">{fmtEur(-p.totalReturns, { decimals: 0 })}</td>
                  <td className="r mono strong">{fmtEur(p.profit, { decimals: 0 })}</td>
                  <td className="r"><MarginBar value={p.margin} /></td>
                  <td><Tag kind={rec.kind}>{rec.label}</Tag></td>
                </tr>
              );
            })}
            <tr className="tbl__sum">
              <td></td>
              <td>Total · {products.length} SKUs</td>
              <td className="r mono">{totals.units}</td>
              <td></td>
              <td className="r mono">{fmtEur(totals.revenue, { decimals: 0 })}</td>
              <td className="r mono neg">{fmtEur(-totals.cogs, { decimals: 0 })}</td>
              <td className="r mono neg">{fmtEur(-totals.ads, { decimals: 0 })}</td>
              <td className="r mono neg">{fmtEur(-totals.returns, { decimals: 0 })}</td>
              <td className="r mono strong">{fmtEur(totals.profit, { decimals: 0 })}</td>
              <td className="r mono">{(totals.profit / totals.revenue * 100).toFixed(0)}%</td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </Panel>

      <div className="grid grid--2-1">
        <Panel title="Retouren-Analyse" subtitle="Gerade Fashion-kritisch">
          <table className="tbl">
            <thead>
              <tr><th>Produkt</th><th className="r">Retouren-€</th><th className="r">% Umsatz</th><th>Häufigster Grund</th></tr>
            </thead>
            <tbody>
              {products.filter(p => p.totalReturns > 0).slice(0, 5).map((p) => {
                const returnPct = p.totalReturns / p.revenue * 100;
                return (
                  <tr key={p.sku}>
                    <td>{p.name}</td>
                    <td className="r mono neg">{fmtEur(-p.totalReturns, { decimals: 0 })}</td>
                    <td className="r mono"><Tag kind={returnPct > 8 ? 'warn' : 'neutral'}>{returnPct.toFixed(1)}%</Tag></td>
                    <td className="muted">{returnPct > 8 ? 'Größe zu klein' : 'Farbe nicht wie erwartet'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Panel>
        <Panel title="Margen-Verteilung">
          <ul className="kvlist kvlist--bars">
            {[
              { range: '> 45% (skalieren)', count: products.filter(p => p.margin > 0.45).length, kind: 'pos' },
              { range: '35–45% (halten)',  count: products.filter(p => p.margin > 0.35 && p.margin <= 0.45).length, kind: 'neutral' },
              { range: '25–35% (warn)',    count: products.filter(p => p.margin > 0.25 && p.margin <= 0.35).length, kind: 'warn' },
              { range: '< 25% (prüfen)',   count: products.filter(p => p.margin <= 0.25).length, kind: 'neg' },
            ].map((r) => (
              <li key={r.range}>
                <span>{r.range}</span>
                <div className="bar"><div className={`bar__fill bar__fill--${r.kind}`} style={{ width: (r.count / products.length * 100) + '%' }} /></div>
                <b className="mono">{r.count}</b>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}

function MarginBar({ value }) {
  const pct = Math.max(0, Math.min(100, value * 100));
  const kind = value > 0.45 ? 'pos' : value > 0.35 ? 'neutral' : value > 0.25 ? 'warn' : 'neg';
  return (
    <div className="marginbar">
      <span className="mono">{(value * 100).toFixed(0)}%</span>
      <div className="bar bar--sm"><div className={`bar__fill bar__fill--${kind}`} style={{ width: pct + '%' }} /></div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════
// 5. RESTOCKING INTELLIGENCE
// ═══════════════════════════════════════════════════════════
function RestockingScreen() {
  const d = window.CESA;
  const rows = [...d.products]
    .map(p => ({
      ...p,
      sellThrough: (p.units / (p.units + p.stock)),
      reorderPoint: Math.round(p.leadTime * (p.units / 25) + 5),
      reorderCost: Math.round(p.leadTime * (p.units / 25) * 2 * p.cogs),
      status: p.daysToStockout < 7 ? 'red' : p.daysToStockout < 14 ? 'amber' : 'green',
    }))
    .sort((a, b) => a.daysToStockout - b.daysToStockout);

  const critical = rows.filter(r => r.status === 'red');
  const warning = rows.filter(r => r.status === 'amber');

  return (
    <div className="screen screen--restock">
      <PageHead title="Restocking Intelligence" eyebrow="Nie wieder ausverkauft"
        actions={<button className="btn btn--ghost">Bestellung erstellen</button>}
      />

      <div className="grid grid--3">
        <AlertBox kind="danger" title={`${critical.length} kritisch`} body={`< 7 Tage Restbestand`} list={critical.map(r => r.name)} />
        <AlertBox kind="warning" title={`${warning.length} beobachten`} body="7–14 Tage Restbestand" list={warning.map(r => r.name)} />
        <AlertBox kind="positive" title={`${rows.length - critical.length - warning.length} OK`} body="> 14 Tage Restbestand" list={[]} />
      </div>

      <Panel title="Bestand & Wiederbestellung" subtitle="Sortiert nach Dringlichkeit">
        <table className="tbl tbl--full tbl--restock">
          <thead>
            <tr>
              <th></th>
              <th>Produkt</th>
              <th className="r">Bestand</th>
              <th className="r">Verkauf/Tag</th>
              <th>Reichweite</th>
              <th className="r">Lieferzeit</th>
              <th className="r">Reorder Point</th>
              <th className="r">Kosten Nachbest.</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.sku}>
                <td><StatusDot kind={r.status === 'red' ? 'neg' : r.status === 'amber' ? 'warning' : 'pos'} /></td>
                <td>
                  <div>{r.name}</div>
                  <div className="muted small mono">{r.sku}</div>
                </td>
                <td className="r mono">{r.stock}</td>
                <td className="r mono">{r.dailyRate.toFixed(2)}</td>
                <td><ReachBar days={r.daysToStockout} /></td>
                <td className="r mono">{r.leadTime} d</td>
                <td className="r mono">{r.reorderPoint} Stk</td>
                <td className="r mono">{fmtEur(r.reorderCost)}</td>
                <td>
                  {r.status === 'red' && <Tag kind="neg">sofort bestellen</Tag>}
                  {r.status === 'amber' && <Tag kind="warn">planen</Tag>}
                  {r.status === 'green' && <Tag kind="pos">ok</Tag>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>

      <div className="grid grid--2-1">
        <Panel title="Cashflow-Impact" subtitle="Wenn alle empfohlenen Bestellungen ausgelöst werden">
          <div className="impact">
            <div className="impact__row"><span>Empfohlene Bestellungen gesamt</span><b className="mono">{fmtEur(rows.filter(r => r.status !== 'green').reduce((s, r) => s + r.reorderCost, 0))}</b></div>
            <div className="impact__row"><span>Cash Reserve heute</span><b className="mono">{fmtEur(d.netWorth.accounts[0].balance)}</b></div>
            <div className="impact__row"><span>Reserve nach Bestellung</span><b className="mono pos">{fmtEur(d.netWorth.accounts[0].balance - rows.filter(r => r.status !== 'green').reduce((s, r) => s + r.reorderCost, 0))}</b></div>
            <div className="impact__row impact__row--strong"><span>Cashflow-Status</span><Tag kind="pos">tragfähig</Tag></div>
          </div>
        </Panel>
        <Panel title="Lieferanten">
          <table className="tbl">
            <tbody>
              {d.suppliers.map((s) => (
                <tr key={s.name}>
                  <td>
                    <div>{s.name}</div>
                    <div className="muted small">{s.terms} · {s.leadTime ? `${s.leadTime}d Lieferzeit` : 'on demand'}</div>
                  </td>
                  <td className="r">
                    {s.open > 0
                      ? <span className="mono neg">{fmtEur(-s.open)}</span>
                      : <span className="muted">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </div>
    </div>
  );
}

function ReachBar({ days }) {
  const kind = days < 7 ? 'neg' : days < 14 ? 'warn' : 'pos';
  const pct = Math.min(100, days / 30 * 100);
  return (
    <div className="reachbar">
      <div className="bar bar--sm"><div className={`bar__fill bar__fill--${kind}`} style={{ width: pct + '%' }} /></div>
      <span className="mono">{days.toFixed(1)} d</span>
    </div>
  );
}

function AlertBox({ kind, title, body, list }) {
  return (
    <div className={`abox abox--${kind}`}>
      <div className="abox__hd">
        <StatusDot kind={kind === 'danger' ? 'neg' : kind === 'warning' ? 'warning' : 'pos'} size={10} />
        <b>{title}</b>
      </div>
      <div className="abox__body">{body}</div>
      {list && list.length > 0 && (
        <ul className="abox__list">
          {list.map((l) => <li key={l}>{l}</li>)}
        </ul>
      )}
    </div>
  );
}


// ═══════════════════════════════════════════════════════════
// 6. DOCUMENT INBOX
// ═══════════════════════════════════════════════════════════
function DocumentsScreen() {
  const d = window.CESA;
  const [selected, setSelected] = React.useState(d.documents[1].id);
  const sel = d.documents.find(x => x.id === selected);

  const skr03 = {
    '4200': 'Werbekosten',
    '4970': 'Bürobedarf / Software',
    '3200': 'Wareneinkauf',
    '4910': 'Versandkosten',
    '4530': 'Kfz-Kosten',
  };

  const monthTotal = d.documents.reduce((s, x) => s + x.amount, 0);
  const pending = d.documents.filter(x => x.status === 'pending').length;

  return (
    <div className="screen screen--docs">
      <PageHead title="Document Inbox" eyebrow="Gmail + Belege · automatisch erfasst"
        actions={<>
          <button className="btn btn--ghost">Gmail-Sync</button>
          <button className="btn btn--primary">Upload</button>
        </>}
      />

      <div className="grid grid--4">
        <Stat label="Belege Mai" value={d.documents.length} sub={`${pending} zu bestätigen`} />
        <Stat label="Summe Belege" value={fmtEur(monthTotal, { decimals: 0 })} />
        <Stat label="Auto-Klassifiziert" value={`${Math.round(d.documents.filter(x => x.status === 'auto').length / d.documents.length * 100)}%`} sub={`${d.documents.filter(x => x.status === 'auto').length}/${d.documents.length} Belege`} />
        <Stat label="UStVA Voraus." value={fmtEur(312)} sub="Fällig 10.06." />
      </div>

      <div className="docs">
        <Panel title="Inbox" subtitle="Letzte 30 Tage" className="docs__list">
          <div className="seg seg--full">
            <button className="seg__b is-active">Alle</button>
            <button className="seg__b">Gmail</button>
            <button className="seg__b">Upload</button>
            <button className="seg__b">Offen ({pending})</button>
          </div>
          <ul className="docs__rows">
            {d.documents.map((x) => (
              <li key={x.id} className={`docs__row ${selected === x.id ? 'is-active' : ''}`} onClick={() => setSelected(x.id)}>
                <div className="docs__src">
                  <span className={`pill pill--${x.source}`}>{x.source === 'gmail' ? 'GM' : 'UPL'}</span>
                </div>
                <div className="docs__main">
                  <div className="docs__vendor">{x.vendor}</div>
                  <div className="docs__subject muted small">{x.subject}</div>
                </div>
                <div className="docs__meta">
                  <div className="mono">{fmtEur(x.amount, { decimals: 2 })}</div>
                  <div className="muted small mono">{fmtDate(x.date)}</div>
                </div>
                <div className="docs__status">
                  {x.status === 'auto' && <Tag kind="pos">auto</Tag>}
                  {x.status === 'pending' && <Tag kind="warn">prüfen</Tag>}
                  {x.status === 'confirmed' && <Tag kind="neutral">ok</Tag>}
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title={sel.vendor} subtitle={sel.subject} className="docs__detail">
          <div className="receipt">
            <div className="receipt__paper">
              <div className="receipt__head">
                <div className="receipt__vendor">{sel.vendor}</div>
                <div className="receipt__id muted mono">RCH-{String(sel.id).padStart(5, '0')}</div>
              </div>
              <div className="receipt__lines">
                <div className="kv"><span>Rechnungsdatum</span><b className="mono">{fmtDate(sel.date)}</b></div>
                <div className="kv"><span>Betrag (brutto)</span><b className="mono">{fmtEur(sel.amount, { decimals: 2 })}</b></div>
                <div className="kv"><span>Davon MwSt 19%</span><b className="mono">{fmtEur(sel.amount * 0.19 / 1.19, { decimals: 2 })}</b></div>
                <div className="kv"><span>Vorsteuer abziehbar</span><b className="mono">{fmtEur(sel.amount * 0.19 / 1.19, { decimals: 2 })}</b></div>
                <div className="kv"><span>Netto</span><b className="mono">{fmtEur(sel.amount / 1.19, { decimals: 2 })}</b></div>
              </div>
            </div>
            <div className="receipt__side">
              <SectionLabel>KI-Erkennung</SectionLabel>
              <div className="kv"><span>Kategorie</span><b>SKR03 {sel.category} — {skr03[sel.category]}</b></div>
              <div className="kv"><span>Zahlungsziel</span><b className="mono">{fmtDate(new Date(new Date(sel.date).getTime() + 14 * 86400000))}</b></div>
              <div className="kv"><span>Duplikat</span><b>nein</b></div>
              <div className="kv"><span>Confidence</span><b className="mono">96%</b></div>

              <SectionLabel>Aktionen</SectionLabel>
              <div className="docs__actions">
                <button className="btn btn--primary">Buchen (lexoffice)</button>
                <button className="btn btn--ghost">Kategorie ändern</button>
                <button className="btn btn--ghost">Original öffnen</button>
              </div>

              <SectionLabel>Quelle</SectionLabel>
              <div className="muted small">
                {sel.source === 'gmail'
                  ? `Aus Gmail "${sel.subject}" am ${fmtDate(sel.date)}`
                  : `Hochgeladen am ${fmtDate(sel.date)} (PDF)`}
              </div>
            </div>
          </div>
        </Panel>
      </div>

      <Panel title="Manuelle Positionen" subtitle="Wiederkehrende Fixkosten">
        <table className="tbl tbl--full">
          <thead><tr><th>Position</th><th>Kategorie</th><th>Frequenz</th><th className="r">Betrag</th><th>Nächste Fälligkeit</th></tr></thead>
          <tbody>
            <tr><td>Shopify Basic Plan</td><td>4970</td><td>monatlich</td><td className="r mono">{fmtEur(-29)}</td><td className="mono">01.06.</td></tr>
            <tr><td>Hostinger VPS</td><td>4970</td><td>monatlich</td><td className="r mono">{fmtEur(-14)}</td><td className="mono">02.06.</td></tr>
            <tr><td>n8n Cloud</td><td>4970</td><td>monatlich</td><td className="r mono">{fmtEur(-20)}</td><td className="mono">05.06.</td></tr>
            <tr><td>Claude API</td><td>4970</td><td>monatlich</td><td className="r mono">{fmtEur(-18)}</td><td className="mono">20.06.</td></tr>
            <tr><td>Steuerberater-Beratung</td><td>4960</td><td>quartalsweise</td><td className="r mono">{fmtEur(-180)}</td><td className="mono">01.07.</td></tr>
          </tbody>
        </table>
      </Panel>
    </div>
  );
}

Object.assign(window, { ProductsScreen, RestockingScreen, DocumentsScreen });
