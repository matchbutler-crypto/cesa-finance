// CESA Financial OS — Screens: CFO Chat, Steuerberater, Goals + Waypoints

// ═══════════════════════════════════════════════════════════
// 7. CFO CHAT
// ═══════════════════════════════════════════════════════════
function CFOChatScreen() {
  const d = window.CESA;
  return <ChatScreen
    title="KI CFO"
    eyebrow="Dein Chief Financial Officer · zahlenbasiert, direkt"
    persona={{
      label: 'CFO',
      role: 'Persönlicher Finanzchef',
      pitch: 'Kennt deinen Store, deine Ziele, deine Cashflow-Situation. Antwortet zahlenbasiert.',
    }}
    messages={d.cfoMessages}
    suggestions={[
      'Soll ich Ad Budget erhöhen?',
      'Wann kann ich €500 entnehmen?',
      'Welches Produkt skalieren?',
      'Wie lange reicht meine Reserve?',
    ]}
    context={[
      { label: 'Umsatz MTD',  value: fmtEur(d.forecast.mtdRevenue) },
      { label: 'ROAS heute',  value: d.ads.roas.toFixed(2) + 'x' },
      { label: 'Cash gesamt', value: fmtEur(d.netWorth.accounts.reduce((s, a) => a.kind !== 'real' ? s + a.balance : s, 0)) },
      { label: 'Runway',      value: '~14 Mo' },
    ]}
  />;
}

// ═══════════════════════════════════════════════════════════
// 8. STEUERBERATER CHAT
// ═══════════════════════════════════════════════════════════
function TaxChatScreen() {
  const d = window.CESA;
  return <ChatScreen
    title="KI Steuerberater"
    eyebrow="GoBD-konform · kennt deutsches Steuerrecht"
    persona={{
      label: 'STB',
      role: 'Persönlicher Steuerberater',
      pitch: 'Präzise und proaktiv. Warnt vor Fristen, kategorisiert Belege nach SKR03.',
    }}
    messages={d.taxMessages}
    suggestions={[
      'Ist VPS Hostinger absetzbar?',
      'Was muss ich diese Woche erledigen?',
      'Wie viel UStVA muss ich zahlen?',
      'Kleinunternehmerregelung sinnvoll?',
    ]}
    context={[
      { label: 'UStVA April',  value: 'erledigt' },
      { label: 'Nächste Frist', value: '10.06.' },
      { label: 'Belege offen', value: '2' },
      { label: 'Gewinn YTD',    value: fmtEur(4280) },
    ]}
    deadlines={[
      { date: '10.06.', label: 'UStVA Mai 2026',           kind: 'warn' },
      { date: '15.06.', label: 'Gewerbesteuer-Vorauszahlung Q2', kind: 'neutral' },
      { date: '31.07.', label: 'EÜR 2025 (verlängert)',    kind: 'neutral' },
      { date: '10.07.', label: 'UStVA Juni 2026',          kind: 'neutral' },
    ]}
  />;
}

function ChatScreen({ title, eyebrow, persona, messages, suggestions, context, deadlines }) {
  const [draft, setDraft] = React.useState('');
  const [thread, setThread] = React.useState(messages);
  const endRef = React.useRef(null);

  React.useEffect(() => { endRef.current?.parentElement?.scrollTo?.({ top: 99999, behavior: 'smooth' }); }, [thread]);

  const send = (text) => {
    const t = (text || draft).trim();
    if (!t) return;
    setThread([...thread, { role: 'user', text: t }, { role: 'assistant', text: '…ich rechne nach. (Beispiel-Antwort wäre hier — Live-Modell deaktiviert in diesem Mockup.)' }]);
    setDraft('');
  };

  return (
    <div className="screen screen--chat">
      <PageHead title={title} eyebrow={eyebrow} />

      <div className="chat">
        <div className="chat__main">
          <Panel className="chat__panel">
            <div className="chat__head">
              <div className="chat__avatar">{persona.label}</div>
              <div>
                <div className="chat__role">{persona.role}</div>
                <div className="chat__pitch muted">{persona.pitch}</div>
              </div>
              <div className="chat__model">
                <Tag kind="neutral" dot>claude-sonnet-4.5</Tag>
              </div>
            </div>

            <div className="chat__thread">
              {thread.map((m, i) => (
                <div key={i} className={`bubble bubble--${m.role}`}>
                  {m.role === 'assistant' && <div className="bubble__who">{persona.label}</div>}
                  <div className="bubble__text">{m.text.split('\n').map((l, j) => <p key={j}>{l}</p>)}</div>
                </div>
              ))}
              <div ref={endRef} />
            </div>

            <div className="chat__suggest">
              {suggestions.map((s) => (
                <button key={s} className="chip" onClick={() => send(s)}>{s}</button>
              ))}
            </div>

            <div className="chat__input">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
                placeholder={`Frag den ${persona.label}…`}
              />
              <button className="btn btn--primary" onClick={() => send()}>Senden <Kbd>↵</Kbd></button>
            </div>
          </Panel>
        </div>

        <div className="chat__side">
          <Panel title="Kontext" subtitle="Was der Agent gerade weiß">
            <ul className="kvlist">
              {context.map((c) => (
                <li key={c.label}><span>{c.label}</span><b className="mono">{c.value}</b></li>
              ))}
            </ul>
          </Panel>

          {deadlines && (
            <Panel title="Fristen-Kalender">
              <ul className="kvlist">
                {deadlines.map((dl) => (
                  <li key={dl.label}>
                    <span>
                      <span className="mono muted">{dl.date}</span>
                      <span style={{ marginLeft: 8 }}>{dl.label}</span>
                    </span>
                    <Tag kind={dl.kind}>{dl.kind === 'warn' ? 'demnächst' : 'geplant'}</Tag>
                  </li>
                ))}
              </ul>
            </Panel>
          )}

          {!deadlines && (
            <Panel title="Letzte Empfehlungen">
              <ul className="reclist">
                <li><StatusDot kind="pos" /><span>Ad Budget +20% (umgesetzt)</span></li>
                <li><StatusDot kind="pos" /><span>Lieferant Müller bezahlt 28.05.</span></li>
                <li><StatusDot kind="warning" /><span>Cap Basic nachbestellen</span></li>
              </ul>
            </Panel>
          )}

          <Panel title="Hinweis">
            <div className="muted small">
              Antworten in diesem Mockup sind vorbereitet. Im Live-Betrieb fließt der vollständige Store-Kontext (Cashflow, ROAS, Bestände, Ziele) als System-Prompt zu Claude.
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════
// 9. GOALS + WAYPOINTS
// ═══════════════════════════════════════════════════════════
function GoalsScreen() {
  const d = window.CESA;
  return (
    <div className="screen screen--goals">
      <PageHead title="Ziele & Waypoints" eyebrow="Nicht irgendwann — ein Datum"
        actions={<>
          <button className="btn btn--ghost">Neues Ziel</button>
          <button className="btn btn--primary">Waypoint setzen</button>
        </>}
      />

      <Panel title="Aktive Ziele" subtitle={`${d.goals.length} verfolgt`}>
        <div className="goals">
          {d.goals.map((g) => {
            const pct = Math.min(100, g.current / g.target * 100);
            return (
              <div key={g.id} className="goal">
                <div className="goal__hd">
                  <div>
                    <div className="goal__label">{g.label}</div>
                    <div className="muted small">Fällig {g.due}</div>
                  </div>
                  <Tag kind={g.pace === 'achieved' ? 'pos' : g.pace === 'on-track' ? 'neutral' : 'warn'}>
                    {g.pace === 'achieved' ? 'erreicht' : g.pace === 'on-track' ? 'on track' : 'hinter Plan'}
                  </Tag>
                </div>
                <div className="goal__nums">
                  <span className="mono strong">{g.unit === '€' ? fmtEur(g.current) : g.unit === 'x' ? g.current.toFixed(2) + 'x' : fmtEur(g.current) + '/mo'}</span>
                  <span className="muted mono">/ {g.unit === '€' ? fmtEur(g.target) : g.unit === 'x' ? g.target.toFixed(2) + 'x' : fmtEur(g.target) + '/mo'}</span>
                </div>
                <Progress value={pct} kind={g.pace === 'behind' ? 'warn' : 'pos'} height={6} />
                <div className="goal__foot muted small">
                  {g.pace === 'achieved' ? 'Ziel übertroffen.'
                    : g.pace === 'on-track' ? `Bei aktuellem Tempo erreichbar.`
                    : `Mehrbedarf: ${fmtEur(g.target - g.current)} bis ${g.due}`}
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      <div className="grid grid--2-1">
        <Panel title="Waypoints" subtitle="Monatliche Check-ins · Ist vs. Forecast">
          <table className="tbl tbl--full">
            <thead>
              <tr><th>Monat</th><th className="r">Forecast</th><th className="r">Actual</th><th className="r">Δ</th><th className="r">Cash Ende</th><th>Notiz</th></tr>
            </thead>
            <tbody>
              {d.waypoints.map((w) => {
                const delta = (w.actualRevenue / w.forecast - 1) * 100;
                return (
                  <tr key={w.month}>
                    <td className="mono">{w.month}</td>
                    <td className="r mono muted">{fmtEur(w.forecast)}</td>
                    <td className="r mono">{fmtEur(w.actualRevenue)}</td>
                    <td className="r"><span className={`delta delta--${delta > 0 ? 'pos' : 'neg'}`}>{fmtPct(delta, { sign: true })}</span></td>
                    <td className="r mono">{fmtEur(w.actualCash)}</td>
                    <td className="muted small">{w.note}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Panel>

        <Panel title="Forecast-Genauigkeit" subtitle="Letzte 4 Monate">
          <div className="accuracy">
            <div className="accuracy__main mono">+8.4%</div>
            <div className="accuracy__sub muted">Deine Forecasts sind im Schnitt 8% zu konservativ. Tendenz: konsistent.</div>
          </div>
          <SectionLabel>Verteilung</SectionLabel>
          <ul className="kvlist">
            <li><span>Beste Abweichung</span><b className="mono pos">+5.7% (Apr)</b></li>
            <li><span>Schlechteste</span><b className="mono neg">−7.3% (Feb)</b></li>
            <li><span>Trend</span><b>verbessert sich</b></li>
          </ul>
        </Panel>
      </div>
    </div>
  );
}

Object.assign(window, { CFOChatScreen, TaxChatScreen, GoalsScreen, ChatScreen });
