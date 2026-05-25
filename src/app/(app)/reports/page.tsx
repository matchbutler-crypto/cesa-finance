'use client'
import { useState } from 'react'
import { Tag } from '@/components/cesa/primitives'

type Period = 'mai-26' | 'q2-26' | 'ytd' | 'yoy'

export default function ReportsPage() {
  const [period, setPeriod] = useState<Period>('mai-26')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-y)' }}>
      <div className="cesa-pagehead">
        <div>
          <div className="cesa-pagehead__eyebrow">Bankfertige Berichte · CESA Branding</div>
          <h1 className="cesa-pagehead__title">Investor-Ready Reports</h1>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {/* Period segmented control */}
          <div style={{ display: 'flex', border: '1px solid var(--c-border)', borderRadius: 'var(--r-md)', overflow: 'hidden' }}>
            {(['mai-26', 'q2-26', 'ytd', 'yoy'] as Period[]).map((p, i) => (
              <button key={p} onClick={() => setPeriod(p)} style={{
                padding: '5px 12px', fontSize: 11.5, fontFamily: 'var(--font-sans)',
                background: period === p ? 'var(--c-accent)' : 'transparent',
                color: period === p ? 'var(--c-bg)' : 'var(--c-muted)',
                border: 'none', borderLeft: i > 0 ? '1px solid var(--c-border)' : 'none',
                cursor: 'pointer', fontWeight: period === p ? 600 : 400,
              }}>
                {p === 'mai-26' ? 'Mai 2026' : p === 'q2-26' ? 'Q2 2026' : p === 'ytd' ? 'YTD' : 'YoY'}
              </button>
            ))}
          </div>
          <button className="cesa-btn cesa-btn--primary">PDF Export</button>
        </div>
      </div>

      {/* Report sheet */}
      <div style={{
        background: 'var(--c-surface2)', border: '1px solid var(--c-border)',
        borderRadius: 'var(--r-lg)', padding: '32px 36px',
        maxWidth: 900,
      }}>
        {/* Report header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, paddingBottom: 20, borderBottom: '2px solid var(--c-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--c-accent)', display: 'grid', placeItems: 'center', fontSize: 22, fontWeight: 800, color: 'var(--c-bg)', fontFamily: 'var(--font-mono)' }}>C</div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--c-textStrong)' }}>CESA Clothing</div>
              <div className="cesa-muted" style={{ fontSize: 11 }}>cesaclothing.myshopify.com · Inh. Easy</div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="cesa-mono" style={{ fontSize: 10, color: 'var(--c-muted)', letterSpacing: '0.08em' }}>FINANCIAL STATEMENT</div>
            <div className="cesa-mono" style={{ fontSize: 15, fontWeight: 700, color: 'var(--c-textStrong)', marginTop: 2 }}>Mai 2026</div>
            <div className="cesa-muted" style={{ fontSize: 10.5, marginTop: 2 }}>Erstellt 25.05.2026 · CESA Financial OS</div>
          </div>
        </div>

        {/* Section 1: P&L */}
        <ReportSection title="1. Gewinn- & Verlustrechnung (P&L)">
          <table className="cesa-tbl" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th></th>
                <th style={{ textAlign: 'right' }}>Mai 2026</th>
                <th style={{ textAlign: 'right' }}>Apr 2026</th>
                <th style={{ textAlign: 'right' }}>Δ</th>
                <th style={{ textAlign: 'right' }}>YTD</th>
              </tr>
            </thead>
            <tbody>
              <ReportRow label="Umsatzerlöse"                   mai="€2.847"  apr="€3.120"  delta={<Tag kind="neg">−9%</Tag>}  ytd="€14.097" />
              <ReportRow label="  Davon Shopify Direct"         mai="€2.610"  apr="€2.890"  delta={null}                       ytd="€12.840"  muted />
              <ReportRow label="  Davon Sonstige"               mai="€237"    apr="€230"    delta={null}                       ytd="€1.257"   muted />
              <ReportRow label="Wareneinkauf (COGS)"            mai="−€892"   apr="−€980"   delta={null}                       ytd="−€4.420"  neg />
              <ReportRow label="Marketing / Ads"                mai="−€280"   apr="−€320"   delta={null}                       ytd="−€1.380"  neg />
              <ReportRow label="Versand & Logistik"             mai="−€176"   apr="−€198"   delta={null}                       ytd="−€890"    neg />
              <ReportRow label="Software / SaaS"                mai="−€81"    apr="−€81"    delta={null}                       ytd="−€405"    neg />
              <ReportRow label="Retouren"                       mai="−€78"    apr="−€92"    delta={null}                       ytd="−€420"    neg />
              <ReportRow label="Operativer Gewinn"              mai="€1.340"  apr="€1.449"  delta={<Tag kind="neg">−8%</Tag>}  ytd="€6.582"  sum />
              <ReportRow label="Sonstige Einkünfte (Mieteinnahmen)" mai="+€450" apr="+€450" delta={null}                       ytd="+€2.250"  pos />
              <ReportRow label="Sonstige Einkünfte (Freelance)" mai="+€780"   apr="+€780"   delta={null}                       ytd="+€3.900"  pos />
              <ReportRow label="Gesamtergebnis"                 mai="€2.570"  apr="€2.679"  delta={<span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--c-danger)' }}>−4%</span>}  ytd="€12.732"  sumStrong />
            </tbody>
          </table>
        </ReportSection>

        {/* Section 2: Cashflow */}
        <ReportSection title="2. Cashflow Statement">
          <table className="cesa-tbl" style={{ width: '50%' }}>
            <tbody>
              <ReportRow label="Cash zu Beginn (01.05.)"  mai="€5.210"  />
              <ReportRow label="+ Operative Einnahmen"    mai="+€4.077" pos />
              <ReportRow label="− Operative Ausgaben"     mai="−€1.507" neg />
              <ReportRow label="Operativer Cashflow"      mai="+€2.570" sum />
              <ReportRow label="− Investitionen (Lager)"  mai="−€420"   neg />
              <ReportRow label="− Steuern (UStVA April)"  mai="−€312"   neg />
              <ReportRow label="− Entnahmen Privat"       mai="−€800"   neg />
              <ReportRow label="Cash zu Ende (proj. 31.05.)" mai="€6.248" sumStrong />
            </tbody>
          </table>
        </ReportSection>

        {/* Section 3: Bilanz */}
        <ReportSection title="3. Bilanz · Net Worth">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <table className="cesa-tbl" style={{ width: '100%' }}>
              <thead><tr><th>Aktiva</th><th style={{ textAlign: 'right' }}>31.05.2026</th></tr></thead>
              <tbody>
                {[
                  ['Geschäftskonto',          '€4.890'],
                  ['Shopify Payout Pending',  '€620'],
                  ['PayPal Business',         '€312'],
                  ['Tagesgeld Rücklage',      '€3.000'],
                  ['Privatkonto',             '€1.198'],
                  ['Immobilie (Anteil)',       '€8.400'],
                  ['Warenbestand (geschätzt)','€2.240'],
                ].map(([label, val]) => (
                  <tr key={label}>
                    <td style={{ fontSize: 12 }}>{label}</td>
                    <td className="cesa-mono" style={{ textAlign: 'right', fontSize: 12 }}>{val}</td>
                  </tr>
                ))}
                <tr style={{ borderTop: '2px solid var(--c-border)', fontWeight: 700 }}>
                  <td style={{ fontSize: 12 }}>Summe Aktiva</td>
                  <td className="cesa-mono" style={{ textAlign: 'right', fontSize: 12, fontWeight: 700 }}>€20.660</td>
                </tr>
              </tbody>
            </table>
            <table className="cesa-tbl" style={{ width: '100%' }}>
              <thead><tr><th>Passiva</th><th style={{ textAlign: 'right' }}>31.05.2026</th></tr></thead>
              <tbody>
                {[
                  ['Lieferant Müller (offen)', '€280'],
                  ['Meta Ads (akkumuliert)',   '€142'],
                  ['Steuerrücklage USt',       '€380'],
                  ['Steuerrücklage ESt',       '€1.438'],
                ].map(([label, val]) => (
                  <tr key={label}>
                    <td style={{ fontSize: 12 }}>{label}</td>
                    <td className="cesa-mono" style={{ textAlign: 'right', fontSize: 12 }}>{val}</td>
                  </tr>
                ))}
                <tr style={{ borderTop: '2px solid var(--c-border)' }}>
                  <td style={{ fontSize: 12 }}>Summe Verbindlichkeiten</td>
                  <td className="cesa-mono" style={{ textAlign: 'right', fontSize: 12, fontWeight: 700 }}>€2.240</td>
                </tr>
                <tr><td colSpan={2}>&nbsp;</td></tr>
                <tr style={{ borderTop: '2px solid var(--c-accent)' }}>
                  <td style={{ fontSize: 12, fontWeight: 700 }}>Eigenkapital / Net Worth</td>
                  <td className="cesa-mono" style={{ textAlign: 'right', fontSize: 14, fontWeight: 700, color: 'var(--c-accent)' }}>€18.420</td>
                </tr>
              </tbody>
            </table>
          </div>
        </ReportSection>

        {/* Section 4: YoY */}
        <ReportSection title="4. Year-over-Year Vergleich">
          <table className="cesa-tbl" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Kennzahl</th>
                <th style={{ textAlign: 'right' }}>YTD 2026</th>
                <th style={{ textAlign: 'right' }}>YTD 2025</th>
                <th style={{ textAlign: 'right' }}>Δ</th>
                <th style={{ textAlign: 'right' }}>Δ %</th>
              </tr>
            </thead>
            <tbody>
              {[
                { k: 'Umsatz',          v26: '€14.097', v25: '€8.620',  d: '+€5.477',  dp: '+63%' },
                { k: 'Bestellungen',    v26: '428',      v25: '312',     d: '+116',     dp: '+37%' },
                { k: 'Ø Warenkorb',     v26: '€32,94',   v25: '€27,63',  d: '+€5,31',  dp: '+19%' },
                { k: 'Ad ROAS',         v26: '2.74',     v25: '2.12',    d: '+0.62',   dp: '+29%' },
                { k: 'Retourenquote',   v26: '4.8%',     v25: '6.2%',    d: '−1.4pp',  dp: 'verbessert' },
                { k: 'Operative Marge', v26: '46.7%',    v25: '41.2%',   d: '+5.5pp',  dp: '+13%' },
                { k: 'Net Worth',       v26: '€18.420',  v25: '€11.840', d: '+€6.580', dp: '+56%', strong: true },
              ].map(row => (
                <tr key={row.k} style={row.strong ? { borderTop: '2px solid var(--c-border)', fontWeight: 700 } : {}}>
                  <td style={{ fontSize: 12 }}>{row.k}</td>
                  <td className="cesa-mono" style={{ textAlign: 'right', fontSize: 12, fontWeight: row.strong ? 700 : 400 }}>{row.v26}</td>
                  <td className="cesa-mono cesa-muted" style={{ textAlign: 'right', fontSize: 12 }}>{row.v25}</td>
                  <td className="cesa-mono" style={{ textAlign: 'right', fontSize: 12, color: 'var(--c-positive)' }}>{row.d}</td>
                  <td style={{ textAlign: 'right' }}><Tag kind="pos">{row.dp}</Tag></td>
                </tr>
              ))}
            </tbody>
          </table>
        </ReportSection>

        {/* Section 5: Notes */}
        <ReportSection title="5. Anmerkungen & Annahmen">
          <ul style={{ display: 'flex', flexDirection: 'column', gap: 5, paddingLeft: 16 }}>
            {[
              'Werte für Mai 2026 enthalten projizierte Posten ab 26.05. (Payouts, Lieferanten).',
              'Warenbestand zu Einkaufspreis bewertet, keine Abschreibung berücksichtigt.',
              'Mieteinnahmen netto nach laufenden Kosten der Beteiligung.',
              'Steuerrücklage USt = 19% der MwSt-pflichtigen Umsätze, ESt-Schätzung 30% des Gewinns.',
              'Diese Auswertung ist kein testierter Jahresabschluss — nur interne Steuerung.',
            ].map((note, i) => (
              <li key={i} className="cesa-muted" style={{ fontSize: 11.5, lineHeight: 1.6 }}>{note}</li>
            ))}
          </ul>
        </ReportSection>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 20, borderTop: '1px solid var(--c-border)', marginTop: 8 }}>
          <span className="cesa-mono cesa-muted" style={{ fontSize: 10 }}>Generiert mit CESA Financial OS · 25.05.2026 07:42</span>
          <span className="cesa-mono cesa-muted" style={{ fontSize: 10 }}>Seite 1 / 1</span>
        </div>
      </div>
    </div>
  )
}

function ReportSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 28 }}>
      <h4 style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--c-textStrong)', marginBottom: 10, paddingBottom: 6, borderBottom: '1px solid var(--c-border)' }}>{title}</h4>
      {children}
    </section>
  )
}

function ReportRow({ label, mai, apr, delta, ytd, muted, neg, pos, sum, sumStrong }: {
  label: string; mai: string; apr?: string; delta?: React.ReactNode; ytd?: string;
  muted?: boolean; neg?: boolean; pos?: boolean; sum?: boolean; sumStrong?: boolean
}) {
  const borderTop = sum || sumStrong ? '2px solid var(--c-border)' : undefined
  const fw = sum || sumStrong ? 700 : 400
  const color = neg ? 'var(--c-danger)' : pos ? 'var(--c-positive)' : muted ? 'var(--c-muted)' : 'var(--c-text)'
  return (
    <tr style={{ borderTop }}>
      <td style={{ fontSize: 12, color: muted ? 'var(--c-muted)' : 'var(--c-text)', fontWeight: fw }}>{label}</td>
      <td className="cesa-mono" style={{ textAlign: 'right', fontSize: 12, fontWeight: fw, color }}>{mai}</td>
      {apr !== undefined && <td className="cesa-mono cesa-muted" style={{ textAlign: 'right', fontSize: 12 }}>{apr}</td>}
      {delta !== undefined && <td style={{ textAlign: 'right' }}>{delta}</td>}
      {ytd !== undefined && <td className="cesa-mono" style={{ textAlign: 'right', fontSize: 12, fontWeight: fw, color: sumStrong ? 'var(--c-accent)' : color }}>{ytd}</td>}
    </tr>
  )
}
