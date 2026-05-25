// CESA Financial OS — App shell, sidebar, routing

const NAV = [
  { section: 'Übersicht', items: [
    { id: 'dashboard',  label: 'Dashboard',         hint: 'Net Worth · Check-in' },
    { id: 'cashflow',   label: 'Cashflow',          hint: 'Timeline · Engpässe' },
    { id: 'forecast',   label: 'Forecast',          hint: 'Szenarien · Crystal Ball' },
  ]},
  { section: 'Operations', items: [
    { id: 'products',   label: 'Produkte',          hint: 'Profitabilität · Marge' },
    { id: 'restocking', label: 'Restocking',        hint: 'Bestand · Reorder' },
    { id: 'documents',  label: 'Documents',         hint: 'Gmail · Belege · UStVA' },
  ]},
  { section: 'Agenten', items: [
    { id: 'cfo',        label: 'CFO',               hint: 'Finanz-Agent' },
    { id: 'tax',        label: 'Steuerberater',     hint: 'Steuer-Agent' },
  ]},
  { section: 'Planung', items: [
    { id: 'goals',      label: 'Ziele',             hint: 'Goals · Waypoints' },
    { id: 'seasons',    label: 'Saisonkalender',    hint: 'BFCM · Weihnachten' },
    { id: 'planning',   label: 'Jahresplanung',     hint: 'Soll-Ist · Quartale' },
    { id: 'reports',    label: 'Reports',           hint: 'Investor · P&L · Bilanz' },
  ]},
];

const SCREEN_LABELS = NAV.flatMap(s => s.items).reduce((acc, i) => (acc[i.id] = i.label, acc), {});

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "pipe",
  "layout": "topnav",
  "density": "compact",
  "forecastViz": "fan",
  "scenarioUi": "chat"
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [route, setRoute] = React.useState(() => (location.hash.replace('#', '') || 'dashboard'));

  React.useEffect(() => {
    const onHash = () => setRoute(location.hash.replace('#', '') || 'dashboard');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  React.useEffect(() => { window.applyCESATheme(t.theme); }, [t.theme]);
  React.useEffect(() => { document.documentElement.setAttribute('data-density', t.density); }, [t.density]);
  React.useEffect(() => { document.documentElement.setAttribute('data-layout', t.layout); }, [t.layout]);

  const go = (id) => { location.hash = id; setRoute(id); };

  const screen = (() => {
    switch (route) {
      case 'dashboard':  return <DashboardScreen tweaks={t} layout={t.layout} />;
      case 'cashflow':   return <CashflowScreen />;
      case 'forecast':   return <ForecastScreen tweaks={t} setTweak={setTweak} />;
      case 'products':   return <ProductsScreen />;
      case 'restocking': return <RestockingScreen />;
      case 'documents':  return <DocumentsScreen />;
      case 'cfo':        return <CFOChatScreen />;
      case 'tax':        return <TaxChatScreen />;
      case 'goals':      return <GoalsScreen />;
      case 'seasons':    return <SeasonsScreen />;
      case 'planning':   return <PlanningScreen />;
      case 'reports':    return <ReportsScreen />;
      default:           return <DashboardScreen tweaks={t} layout={t.layout} />;
    }
  })();

  return (
    <div className="app" data-layout={t.layout}>
      {t.layout === 'topnav' ? (
        <TopNav route={route} go={go} />
      ) : (
        <Sidebar route={route} go={go} />
      )}
      <main className="app__main" data-screen-label={SCREEN_LABELS[route]}>
        {screen}
      </main>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Theme" />
        <TweakRadio label="Stil" value={t.theme}
          options={[
            { value: 'linear',    label: 'Linear' },
            { value: 'bloomberg', label: 'Bloomberg' },
            { value: 'mercury',   label: 'Mercury' },
            { value: 'pipe',      label: 'Pipe' },
          ]}
          onChange={(v) => setTweak('theme', v)} />

        <TweakSection label="Layout" />
        <TweakRadio label="Navigation" value={t.layout}
          options={[
            { value: 'sidebar', label: 'Sidebar' },
            { value: 'topnav',  label: 'Top Nav' },
            { value: 'bento',   label: 'Bento' },
          ]}
          onChange={(v) => setTweak('layout', v)} />

        <TweakRadio label="Dichte" value={t.density}
          options={[
            { value: 'compact', label: 'Compact' },
            { value: 'regular', label: 'Regular' },
            { value: 'comfy',   label: 'Comfy' },
          ]}
          onChange={(v) => setTweak('density', v)} />

        <TweakSection label="Forecast-Visualisierung" />
        <TweakRadio label="Stil" value={t.forecastViz}
          options={[
            { value: 'line', label: 'Linie' },
            { value: 'fan',  label: 'Fan' },
            { value: 'area', label: 'Area' },
          ]}
          onChange={(v) => setTweak('forecastViz', v)} />

        <TweakSection label="Scenario Builder" />
        <TweakRadio label="UI" value={t.scenarioUi}
          options={[
            { value: 'sliders', label: 'Slider' },
            { value: 'cards',   label: 'Karten' },
            { value: 'chat',    label: 'Chat' },
          ]}
          onChange={(v) => setTweak('scenarioUi', v)} />
      </TweaksPanel>
    </div>
  );
}

function Sidebar({ route, go }) {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <div className="brand">
          <div className="brand__mark">C</div>
          <div>
            <div className="brand__name">CESA Financial OS</div>
            <div className="brand__sub muted">cesaclothing.myshopify.com</div>
          </div>
        </div>
        <button className="iconbtn" title="Quick search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>
        </button>
      </div>

      <nav className="nav">
        {NAV.map((s) => (
          <div key={s.section} className="nav__section">
            <div className="nav__hd">{s.section}</div>
            <ul>
              {s.items.map((it) => (
                <li key={it.id}>
                  <button className={`nav__b ${route === it.id ? 'is-active' : ''}`} onClick={() => go(it.id)}>
                    <span className="nav__lbl">{it.label}</span>
                    <span className="nav__hint muted">{it.hint}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="sidebar__foot">
        <div className="userchip">
          <div className="userchip__avatar">E</div>
          <div>
            <div className="userchip__name">Easy</div>
            <div className="userchip__sub muted">Owner · Mai 2026</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function TopNav({ route, go }) {
  return (
    <header className="topnav">
      <div className="topnav__brand">
        <div className="brand__mark">C</div>
        <span className="brand__name">CESA Financial OS</span>
      </div>
      <nav className="topnav__nav">
        {NAV.flatMap(s => s.items).map((it) => (
          <button key={it.id} className={`topnav__b ${route === it.id ? 'is-active' : ''}`} onClick={() => go(it.id)}>
            {it.label}
          </button>
        ))}
      </nav>
      <div className="topnav__user">
        <span className="muted small">Easy</span>
      </div>
    </header>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
