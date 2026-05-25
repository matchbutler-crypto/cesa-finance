// CESA Financial OS — Demo-Daten (kleinerer Store, €1–5k/Monat)
// Stand: 25. Mai 2026

window.CESA = (function () {
  const today = new Date('2026-05-25');
  const daysInMonth = 31;
  const dayOfMonth = 25;

  // ───── Net Worth Breakdown ─────
  const netWorth = {
    total: 18420,
    delta30d: +1240,
    delta30dPct: 7.2,
    accounts: [
      { name: 'Geschäftskonto', kind: 'bank',     balance: 4890, change: +320 },
      { name: 'Shopify Payout', kind: 'store',    balance: 620,  change: -180 },
      { name: 'PayPal Business', kind: 'paypal',  balance: 312,  change: +44 },
      { name: 'Tagesgeld Rücklage', kind: 'savings', balance: 3000, change: 0 },
      { name: 'Privatkonto', kind: 'bank',        balance: 1198, change: +95 },
      { name: 'Immobilie (Anteil)', kind: 'real', balance: 8400, change: +0 },
    ],
    liabilities: [
      { name: 'Lieferant Müller (offen)', amount: 280, due: '2026-05-28' },
      { name: 'Meta Ads (akkumuliert)',   amount: 142, due: '2026-06-01' },
    ],
    history: [
      // last 12 months net worth (in €)
      14820, 15010, 15240, 15680, 15940, 16210, 16480, 16820, 17100, 17380, 17680, 18420,
    ],
    forecast12m: [
      18420, 18760, 19120, 19490, 19880, 20290, 20720, 21180, 21650, 22150, 22680, 23230,
    ],
  };

  // ───── Forecast — Mai 2026 ─────
  const forecast = {
    target: 3500,
    mtdRevenue: 2847,
    daysElapsed: dayOfMonth,
    daysInMonth: daysInMonth,
    dailyRunRate: 113.9,
    projectedMonthEnd: 3530,
    daysToTarget: 5.7,
    // Tägliche Umsätze seit Monatsanfang
    daily: [
      94, 128, 76, 142, 188, 102, 88, 156, 134, 98,
      176, 84, 110, 92, 124, 142, 96, 168, 130, 102,
      88, 154, 92, 116, 137,
    ],
    // Letzter Monat zum Vergleich
    lastMonth: 3120,
    twoMonthsAgo: 2840,
  };

  // ───── Cashflow Timeline — Mai 2026 ─────
  // Jeder Eintrag: { day, label, amount (+ = in, - = out), kind }
  const cashflow = {
    startBalance: 5210,
    entries: [
      { day: 1,  label: 'Shopify Basic Plan',    amount: -29,   kind: 'subscription' },
      { day: 1,  label: 'Mieteinnahme',          amount: +450,  kind: 'rental' },
      { day: 2,  label: 'Hostinger VPS',         amount: -14,   kind: 'subscription' },
      { day: 3,  label: 'Shopify Payout',        amount: +312,  kind: 'payout' },
      { day: 4,  label: 'Meta Ads',              amount: -42,   kind: 'ads' },
      { day: 5,  label: 'n8n Cloud',             amount: -20,   kind: 'subscription' },
      { day: 6,  label: 'Shopify Payout',        amount: +284,  kind: 'payout' },
      { day: 7,  label: 'Meta Ads',              amount: -38,   kind: 'ads' },
      { day: 9,  label: 'Shopify Payout',        amount: +396,  kind: 'payout' },
      { day: 10, label: 'Lieferant Schmidt',     amount: -420,  kind: 'supplier' },
      { day: 10, label: 'USt-Voranmeldung April',amount: -312,  kind: 'tax' },
      { day: 12, label: 'Shopify Payout',        amount: +218,  kind: 'payout' },
      { day: 14, label: 'Meta Ads',              amount: -52,   kind: 'ads' },
      { day: 15, label: 'Shopify Payout',        amount: +340,  kind: 'payout' },
      { day: 16, label: 'Versand DHL',           amount: -86,   kind: 'shipping' },
      { day: 18, label: 'Shopify Payout',        amount: +274,  kind: 'payout' },
      { day: 20, label: 'Freelance Honorar',     amount: +780,  kind: 'income' },
      { day: 22, label: 'Meta Ads',              amount: -48,   kind: 'ads' },
      { day: 23, label: 'Shopify Payout',        amount: +312,  kind: 'payout' },
      // Projektion (heute = 25)
      { day: 26, label: 'Shopify Payout (proj.)', amount: +290, kind: 'payout', projected: true },
      { day: 28, label: 'Lieferant Müller',       amount: -280, kind: 'supplier', projected: true },
      { day: 29, label: 'Shopify Payout (proj.)', amount: +260, kind: 'payout', projected: true },
      { day: 30, label: 'Versand DHL (proj.)',    amount: -90,  kind: 'shipping', projected: true },
      { day: 31, label: 'Meta Ads (proj.)',       amount: -180, kind: 'ads', projected: true },
    ],
    today: 25,
  };

  // ───── Produkte ─────
  const products = [
    { sku: 'HOD-CLS-BLK', name: 'Hoodie Classic Schwarz',  price: 69.90, cogs: 22.40, ads: 8.20, returns: 4.10, units: 18, stock: 24, leadTime: 21 },
    { sku: 'HOD-CLS-GRY', name: 'Hoodie Classic Grau',      price: 69.90, cogs: 22.40, ads: 6.80, returns: 3.50, units: 14, stock: 18, leadTime: 21 },
    { sku: 'HOD-OVS-BLK', name: 'Hoodie Oversize Schwarz',  price: 79.90, cogs: 26.10, ads: 12.40, returns: 6.20, units: 11, stock: 9,  leadTime: 21 },
    { sku: 'CRW-BLK',     name: 'Crewneck Schwarz',         price: 59.90, cogs: 19.80, ads: 5.20, returns: 2.40, units: 9,  stock: 22, leadTime: 18 },
    { sku: 'TEE-BLK',     name: 'Tee Heavy Schwarz',        price: 34.90, cogs: 9.60,  ads: 3.10, returns: 1.20, units: 22, stock: 48, leadTime: 14 },
    { sku: 'TEE-WHT',     name: 'Tee Heavy Weiß',           price: 34.90, cogs: 9.60,  ads: 2.40, returns: 1.80, units: 16, stock: 34, leadTime: 14 },
    { sku: 'CAP-BSC',     name: 'Cap Basic',                price: 29.90, cogs: 7.20,  ads: 4.80, returns: 2.10, units: 12, stock: 6,  leadTime: 12 },
    { sku: 'CAP-LOG',     name: 'Cap Logo Stick',           price: 32.90, cogs: 8.40,  ads: 3.60, returns: 0.90, units: 8,  stock: 14, leadTime: 12 },
  ].map(p => {
    const revenue = p.price * p.units;
    const totalCogs = p.cogs * p.units;
    const totalAds  = p.ads  * p.units;
    const totalReturns = p.returns * p.units;
    const profit = revenue - totalCogs - totalAds - totalReturns;
    const margin = profit / revenue;
    const dailyRate = p.units / 25; // MTD
    const daysToStockout = p.stock / Math.max(dailyRate, 0.01);
    return { ...p, revenue, totalCogs, totalAds, totalReturns, profit, margin, dailyRate, daysToStockout };
  });

  // ───── Ad Profitability ─────
  const ads = {
    todaySpend: 48,
    yesterdaySpend: 42,
    todayRevenue: 137,
    yesterdayRevenue: 116,
    roas: 2.85,
    roasYesterday: 2.76,
    roasLastWeek: 2.42,
    breakEvenRoas: 2.5,
    cpm: 8.40,
    ctr: 1.8,
    cpp: 16.80,
    status: 'green', // green | yellow | red
    spend7d: [38, 42, 45, 48, 44, 42, 48],
    revenue7d: [102, 116, 128, 142, 122, 116, 137],
  };

  // ───── Documents Inbox ─────
  const documents = [
    { id: 1, source: 'gmail',  vendor: 'Hostinger',         amount: 14.00,  date: '2026-05-02', category: '4970', status: 'auto',     subject: 'Rechnung Hostinger VPS Mai 2026' },
    { id: 2, source: 'gmail',  vendor: 'Meta Ireland',      amount: 142.30, date: '2026-05-22', category: '4200', status: 'pending',  subject: 'Meta Platforms Rechnung 5/2026' },
    { id: 3, source: 'upload', vendor: 'Lieferant Schmidt', amount: 420.00, date: '2026-05-09', category: '3200', status: 'confirmed',subject: 'Lieferung Hoodies Mai-Charge' },
    { id: 4, source: 'gmail',  vendor: 'DHL',               amount: 86.40,  date: '2026-05-16', category: '4910', status: 'auto',     subject: 'DHL Frachtbrief Mai KW20' },
    { id: 5, source: 'gmail',  vendor: 'Shopify',           amount: 29.00,  date: '2026-05-01', category: '4970', status: 'auto',     subject: 'Shopify Basic Plan Mai' },
    { id: 6, source: 'upload', vendor: 'Tankstelle Aral',   amount: 64.20,  date: '2026-05-12', category: '4530', status: 'pending',  subject: 'Beleg Aral 12.05.' },
    { id: 7, source: 'gmail',  vendor: 'n8n Cloud',         amount: 20.00,  date: '2026-05-05', category: '4970', status: 'auto',     subject: 'n8n Cloud Subscription' },
    { id: 8, source: 'gmail',  vendor: 'Anthropic',         amount: 18.00,  date: '2026-05-20', category: '4970', status: 'auto',     subject: 'Claude API Usage Mai' },
  ];

  // ───── Goals ─────
  const goals = [
    { id: 1, label: 'Erster €5k Monat',         current: 2847,  target: 5000,  due: '2026-12-31', unit: '€',   kind: 'revenue', pace: 'on-track' },
    { id: 2, label: 'Ad ROAS ≥ 2.5 (Break-even)', current: 2.85, target: 2.5,  due: 'laufend',     unit: 'x',   kind: 'roas',    pace: 'achieved' },
    { id: 3, label: '3-Monats Cashpuffer',      current: 3000,  target: 9000,  due: '2027-03-31', unit: '€',   kind: 'savings', pace: 'behind' },
    { id: 4, label: 'Finanzielle Freiheit',     current: 450,   target: 3200,  due: '2041-08-31', unit: '€/mo',kind: 'passive', pace: 'on-track' },
  ];

  // ───── Waypoints (monatliche Check-ins) ─────
  const waypoints = [
    { month: 'Apr 2026', actualRevenue: 3120, forecast: 2950, actualCash: 5210, note: 'Lieferung verspätet, Stock-out bei Cap Basic 4 Tage.' },
    { month: 'Mär 2026', actualRevenue: 2840, forecast: 2700, actualCash: 4890, note: 'Erstes Mal über €2.500.' },
    { month: 'Feb 2026', actualRevenue: 2410, forecast: 2600, actualCash: 4420, note: 'Valentinstag-Push hat nicht funktioniert.' },
    { month: 'Jan 2026', actualRevenue: 2180, forecast: 2400, actualCash: 4100, note: 'Saisonales Tief wie erwartet.' },
  ];

  // ───── CFO Chat (vorbereitete Beispiel-Antworten) ─────
  const cfoMessages = [
    { role: 'assistant', text: 'Guten Morgen Easy. Drei Punkte für heute:\n\n1. ROAS gestern 2.76 — über Break-even (2.5). Ad-Budget kann bleiben.\n2. Lieferant Müller fällig am 28.05. — €280. Cash reicht.\n3. Cap Basic Stock in 5 Tagen leer. Heute nachbestellen.' },
    { role: 'user', text: 'Soll ich mein Ad Budget diese Woche erhöhen?' },
    { role: 'assistant', text: 'ROAS liegt bei 2.85 (Break-even: 2.5). Cash Reserve: €620 im Store + €4.890 Bank.\n\nIch würde Budget um 20% erhöhen — das entspricht +€8/Tag und projiziert +€180 Mehreinnahmen bei aktuellem ROAS. Cashflow bleibt deutlich positiv.\n\nWeniger empfehlenswert wäre +50% — CPM steigt aktuell (Anzeigen-Müdigkeit), ROAS könnte unter 2.5 fallen.' },
    { role: 'user', text: 'Wann kann ich mir €500 aus dem Store nehmen?' },
    { role: 'assistant', text: 'Nächster Shopify Payout: Dienstag 26.05. ~€290. Lieferant Müller fällig 28.05.: €280.\n\nEmpfehlung: nicht €500 sondern €340 entnehmen — Puffer für laufende Ads bleibt erhalten.\n\nVollständige €500 wären nach dem Payout am 29.05. möglich. Dann hättest du noch €430 Reserve im Store-Konto.' },
  ];

  const taxMessages = [
    { role: 'assistant', text: 'Hallo Easy. Anstehend diese Woche:\n\n• UStVA April fällig 10.05. — bereits erledigt (€312)\n• Belege Mai: 6 erfasst, 2 zu bestätigen\n• Gewerbesteuer-Vorauszahlung Q2 fällig 15.06.' },
    { role: 'user', text: 'Ist mein VPS bei Hostinger absetzbar?' },
    { role: 'assistant', text: 'Ja, vollständig als Betriebsausgabe absetzbar.\n\n• SKR03 Konto 4970 (Bürobedarf/Software)\n• Achte auf ausgewiesene MwSt in der Rechnung — dann 19% Vorsteuer abziehbar\n• Bei €14/Monat: €168/Jahr Betriebsausgabe, davon €26,82 Vorsteuer' },
    { role: 'user', text: 'Was muss ich diese Woche steuerlich erledigen?' },
    { role: 'assistant', text: 'Diese Woche keine zwingenden Fristen — UStVA April ist eingereicht.\n\nEmpfehlung: 2 offene Belege bestätigen (Aral Tankstelle €64.20, Meta €142.30) damit deine Bücher tagesaktuell sind.\n\nNächste Frist: Gewerbesteuer-Vorauszahlung Q2 am 15.06.2026 — voraussichtlich €0 (Gewinn unter Freibetrag €24.500).' },
  ];

  // ───── Suppliers ─────
  const suppliers = [
    { name: 'Schmidt Textil GmbH',  terms: '14 Tage netto', leadTime: 21, open: 0,    next: null,         performance: 0.92 },
    { name: 'Müller Print',          terms: '30 Tage netto', leadTime: 7,  open: 280,  next: '2026-05-28', performance: 0.88 },
    { name: 'CapWorks UA',           terms: 'Vorkasse',      leadTime: 28, open: 0,    next: null,         performance: 0.78 },
    { name: 'DHL Geschäftskunden',   terms: 'Monatlich',     leadTime: null, open: 86, next: '2026-06-15', performance: 1.00 },
  ];

  return {
    today, dayOfMonth, daysInMonth,
    netWorth, forecast, cashflow, products, ads, documents, goals, waypoints,
    cfoMessages, taxMessages, suppliers,
  };
})();
