import { Panel, Tag, StatusDot } from '@/components/cesa/primitives'
import { fmtEur } from '@/lib/formatters'
import { TaxChat } from './_components/TaxChat'

const DEADLINES = [
  { label: 'USt-Voranmeldung Mai',        date: '10.06.2026', amount: 450,  status: 'upcoming', daysLeft: 16 },
  { label: 'ESt-Vorauszahlung Q2 2026',   date: '10.06.2026', amount: 620,  status: 'upcoming', daysLeft: 16 },
  { label: 'USt-Voranmeldung April',      date: '10.05.2026', amount: 312,  status: 'done',     daysLeft: 0 },
  { label: 'Jahreserklärung 2025',        date: '31.07.2026', amount: 0,    status: 'future',   daysLeft: 67 },
]

const SUGGESTED = [
  'USt Mai berechnen',
  'Abschreibungen optimieren',
  'Betriebsausgaben prüfen',
  'Jahressteuerlast 2026',
  'Vorsteuer zurückholen',
  'Gewinnermittlung EÜR',
]

export default function TaxPage() {
  const upcoming = DEADLINES.filter(d => d.status === 'upcoming')
  const totalUpcoming = upcoming.reduce((s, d) => s + d.amount, 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 44px)' }}>
      {/* Page header */}
      <div className="cesa-pagehead" style={{ marginBottom: 14, flexShrink: 0 }}>
        <div>
          <div className="cesa-pagehead__eyebrow">KI-Agent · GPT-4o · Steuerrecht DE</div>
          <h1 className="cesa-pagehead__title">Steuerberater Agent</h1>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <StatusDot kind="pos" size={7} />
          <span className="cesa-muted" style={{ fontSize: 11.5 }}>Online · EÜR · UStG · EStG</span>
          <button className="cesa-btn cesa-btn--ghost">Verlauf</button>
          <button className="cesa-btn cesa-btn--ghost">Neue Session</button>
        </div>
      </div>

      {/* Main layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 'var(--gap-x)', flex: 1, minHeight: 0 }}>

        {/* Chat */}
        <Panel style={{ display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
          <div className="cesa-panel__hd" style={{ flexShrink: 0 }}>
            <div>
              <h3 className="cesa-panel__title">Gespräch</h3>
              <div className="cesa-panel__sub">Mai 2026 · Session #1 · Kein Ersatz für Steuerberater</div>
            </div>
            <Tag kind="warn">Beta</Tag>
          </div>
          <div className="cesa-panel__body" style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <TaxChat />
          </div>
        </Panel>

        {/* Right sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-y)', overflowY: 'auto' }}>

          {/* Upcoming deadlines */}
          <Panel
            title="Fristen"
            subtitle="Steuerliche Fälligkeiten"
            action={<Tag kind="warn" dot>{upcoming.length} offen</Tag>}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {DEADLINES.map((d, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8,
                  padding: '8px 10px',
                  background: d.status === 'done' ? 'transparent' : 'var(--c-surface2)',
                  border: `1px solid ${d.status === 'upcoming' ? 'color-mix(in oklab, var(--c-warning) 25%, var(--c-border))' : 'var(--c-border)'}`,
                  borderRadius: 'var(--r-sm)',
                  opacity: d.status === 'done' ? 0.55 : 1,
                }}>
                  <div>
                    <div style={{ fontSize: 11.5, color: d.status === 'done' ? 'var(--c-muted)' : 'var(--c-textStrong)', fontWeight: d.status === 'upcoming' ? 500 : 400 }}>
                      {d.label}
                    </div>
                    <div className="cesa-mono cesa-muted" style={{ fontSize: 10, marginTop: 2 }}>
                      {d.date}
                      {d.status === 'upcoming' && <span style={{ color: 'var(--c-warning)', marginLeft: 4 }}>in {d.daysLeft}d</span>}
                      {d.status === 'done' && <span style={{ color: 'var(--c-positive)', marginLeft: 4 }}>✓ erledigt</span>}
                    </div>
                  </div>
                  {d.amount > 0 && (
                    <span className="cesa-mono" style={{ fontSize: 12, fontWeight: 600, color: d.status === 'done' ? 'var(--c-muted)' : 'var(--c-danger)', flexShrink: 0 }}>
                      {fmtEur(d.amount)}
                    </span>
                  )}
                </div>
              ))}
              <div style={{
                display: 'flex', justifyContent: 'space-between', padding: '6px 10px',
                background: 'var(--c-surface3)', borderRadius: 'var(--r-sm)', fontSize: 12, fontWeight: 600,
              }}>
                <span className="cesa-strong">Fällig Jun 2026</span>
                <span className="cesa-mono" style={{ color: 'var(--c-danger)' }}>{fmtEur(totalUpcoming)}</span>
              </div>
            </div>
          </Panel>

          {/* Suggested prompts */}
          <Panel title="Vorschläge" subtitle="Häufige Steuerfragen">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {SUGGESTED.map(q => (
                <button key={q} style={{
                  textAlign: 'left', padding: '7px 10px',
                  background: 'var(--c-surface2)', border: '1px solid var(--c-border)',
                  borderRadius: 'var(--r-sm)', fontSize: 11.5, color: 'var(--c-text)',
                  cursor: 'pointer', fontFamily: 'var(--font-sans)',
                }}>
                  {q}
                </button>
              ))}
            </div>
          </Panel>

          {/* Disclaimer */}
          <Panel title="Hinweis" subtitle="Rechtlicher Hinweis">
            <div style={{
              fontSize: 10.5, color: 'var(--c-muted)', lineHeight: 1.6,
              padding: '8px 10px', background: 'var(--c-surface2)',
              border: '1px solid var(--c-border)', borderRadius: 'var(--r-sm)',
            }}>
              Dieser Agent gibt <b>keine verbindliche Steuerberatung</b>. Alle Angaben basieren auf allgemeinen steuerrechtlichen Grundsätzen (DE 2026). Bitte konsultiere für rechtsverbindliche Auskünfte einen zugelassenen Steuerberater.
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}
