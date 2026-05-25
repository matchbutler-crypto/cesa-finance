import { Panel, Tag, StatusDot } from '@/components/cesa/primitives'
import { fmtEur, fmtDate } from '@/lib/formatters'

interface Doc {
  id: number
  source: 'gmail' | 'upload'
  vendor: string
  subject: string
  amount: number
  date: string
  category: string
  categoryColor: string
  status: 'auto' | 'pending' | 'confirmed'
}

const DOCS: Doc[] = [
  { id: 1,  source: 'gmail',  vendor: 'Meta Platforms',       subject: 'Rechnung Meta Ads · Mai 2026',              amount: 284.40, date: '2026-05-22', category: 'Marketing',    categoryColor: 'var(--c-warning)',  status: 'auto' },
  { id: 2,  source: 'gmail',  vendor: 'Shopify Inc.',          subject: 'Invoice #INV-2026-05 · Basic Plan',         amount:  29.00, date: '2026-05-01', category: 'Abo',          categoryColor: 'var(--c-accent)',   status: 'confirmed' },
  { id: 3,  source: 'gmail',  vendor: 'Müller Textil GmbH',   subject: 'Rechnung LF-2026-0412 · Hoodie Lieferung',  amount: 420.00, date: '2026-05-10', category: 'Wareneinkauf', categoryColor: 'var(--c-positive)', status: 'confirmed' },
  { id: 4,  source: 'upload', vendor: 'DHL Paket GmbH',        subject: 'Versandrechnung Mai 2026 (KW 20)',          amount:  86.40, date: '2026-05-16', category: 'Versand',      categoryColor: '#8B5CF6',           status: 'auto' },
  { id: 5,  source: 'gmail',  vendor: 'Hostinger UAB',         subject: 'Invoice #HST-882-2026 · VPS Hosting',      amount:  14.00, date: '2026-05-02', category: 'Abo',          categoryColor: 'var(--c-accent)',   status: 'auto' },
  { id: 6,  source: 'gmail',  vendor: 'n8n GmbH',              subject: 'n8n Cloud · Monthly Invoice May 2026',     amount:  20.00, date: '2026-05-05', category: 'Abo',          categoryColor: 'var(--c-accent)',   status: 'auto' },
  { id: 7,  source: 'upload', vendor: 'Finanzamt München',     subject: 'USt-Voranmeldung April 2026',              amount: 312.00, date: '2026-05-10', category: 'Steuer',       categoryColor: 'var(--c-danger)',   status: 'confirmed' },
  { id: 8,  source: 'gmail',  vendor: 'Schmidt & Co. Textil',  subject: 'Lieferung TEE-BLK / TEE-WHT · RE 1842',    amount: 196.80, date: '2026-05-18', category: 'Wareneinkauf', categoryColor: 'var(--c-positive)', status: 'pending' },
  { id: 9,  source: 'gmail',  vendor: 'Kopfbedeckung GmbH',    subject: 'Rechnung CAP-BSC Nachlieferung',           amount:  82.00, date: '2026-05-20', category: 'Wareneinkauf', categoryColor: 'var(--c-positive)', status: 'pending' },
  { id: 10, source: 'upload', vendor: 'DATEV eG',              subject: 'Steuerberater Honorar April 2026',         amount: 240.00, date: '2026-05-14', category: 'Beratung',     categoryColor: 'var(--c-muted)',    status: 'pending' },
  { id: 11, source: 'gmail',  vendor: 'Müller Textil GmbH',   subject: 'Mahnung LF-2026-0398 (offen seit 28.04.)', amount: 280.00, date: '2026-05-23', category: 'Wareneinkauf', categoryColor: 'var(--c-positive)', status: 'pending' },
  { id: 12, source: 'gmail',  vendor: 'Stripe Inc.',           subject: 'Invoice May 2026 · Processing Fees',       amount:  18.60, date: '2026-05-21', category: 'Gebühren',     categoryColor: 'var(--c-muted)',    status: 'auto' },
]

const STATUS_LABEL: Record<string, string> = { auto: 'Auto', pending: 'Prüfen', confirmed: 'Bestätigt' }
const STATUS_TAG: Record<string, 'neutral' | 'warn' | 'pos'> = { auto: 'neutral', pending: 'warn', confirmed: 'pos' }
const STATUS_DOT: Record<string, 'info' | 'warning' | 'pos'> = { auto: 'info', pending: 'warning', confirmed: 'pos' }

export default function DocumentsPage() {
  const docs = [...DOCS].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const totalAmount  = docs.reduce((s, d) => s + d.amount, 0)
  const autoCount    = docs.filter(d => d.status === 'auto').length
  const pendingCount = docs.filter(d => d.status === 'pending').length
  const pendingAmount = docs.filter(d => d.status === 'pending').reduce((s, d) => s + d.amount, 0)

  // Category breakdown
  const byCategory: Record<string, { amount: number; count: number; color: string }> = {}
  docs.forEach(d => {
    if (!byCategory[d.category]) byCategory[d.category] = { amount: 0, count: 0, color: d.categoryColor }
    byCategory[d.category].amount += d.amount
    byCategory[d.category].count += 1
  })
  const catSorted = Object.entries(byCategory).sort((a, b) => b[1].amount - a[1].amount)
  const maxCatAmount = Math.max(...catSorted.map(([, v]) => v.amount))

  return (
    <div>
      {/* Page header */}
      <div className="cesa-pagehead">
        <div>
          <div className="cesa-pagehead__eyebrow">Mai 2026 · Gmail + Upload · {docs.length} Dokumente</div>
          <h1 className="cesa-pagehead__title">Document Inbox</h1>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {pendingCount > 0 && <Tag kind="warn" dot>{pendingCount} ausstehend</Tag>}
          <button className="cesa-btn cesa-btn--ghost">Gmail Sync</button>
          <button className="cesa-btn cesa-btn--ghost">Upload</button>
          <button className="cesa-btn cesa-btn--ghost">DATEV Export</button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="cesa-grid cesa-grid--4" style={{ marginBottom: 'var(--gap-y)' }}>
        <DocKpi label="Dokumente gesamt"   value={String(docs.length)}     sub="Mai 2026" />
        <DocKpi label="Auto-verarbeitet"   value={String(autoCount)}       sub="KI-Erkennung" kind="pos" />
        <DocKpi label="Ausstehend"         value={String(pendingCount)}    sub={`${fmtEur(pendingAmount)} offen`} kind={pendingCount > 0 ? 'warn' : 'pos'} />
        <DocKpi label="Gesamtbetrag"       value={fmtEur(totalAmount)}     sub="alle Rechnungen" />
      </div>

      {/* Inbox table + sidebar */}
      <div className="cesa-grid cesa-grid--3-2">

        {/* Document table */}
        <Panel
          title="Eingang"
          subtitle="Sortiert nach Datum · neueste zuerst"
          action={<Tag kind="neutral">{docs.length} Belege</Tag>}
        >
          <table className="cesa-tbl" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th style={{ width: 28 }}>Src</th>
                <th>Absender / Betreff</th>
                <th>Kategorie</th>
                <th className="r">Betrag</th>
                <th className="r">Datum</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {docs.map((doc) => (
                <tr key={doc.id} style={{
                  background: doc.status === 'pending'
                    ? 'color-mix(in oklab, var(--c-warning) 3%, transparent)'
                    : undefined,
                }}>
                  <td>
                    <SourceBadge source={doc.source} />
                  </td>
                  <td>
                    <div style={{ fontWeight: 500, fontSize: 12.5, color: 'var(--c-textStrong)' }}>{doc.vendor}</div>
                    <div className="cesa-muted" style={{ fontSize: 10.5, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 280 }}>
                      {doc.subject}
                    </div>
                  </td>
                  <td>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      padding: '1px 6px', borderRadius: 3,
                      fontSize: 10.5, fontFamily: 'var(--font-mono)',
                      background: `color-mix(in oklab, ${doc.categoryColor} 12%, var(--c-surface3))`,
                      color: doc.categoryColor,
                      border: `1px solid color-mix(in oklab, ${doc.categoryColor} 25%, var(--c-border))`,
                    }}>
                      {doc.category}
                    </span>
                  </td>
                  <td className="r cesa-tbl__num cesa-mono" style={{ fontWeight: 600 }}>
                    {fmtEur(doc.amount)}
                  </td>
                  <td className="r cesa-tbl__num cesa-mono cesa-muted" style={{ fontSize: 11, whiteSpace: 'nowrap' }}>
                    {fmtDate(doc.date)}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <StatusDot kind={STATUS_DOT[doc.status]} size={6} />
                      <Tag kind={STATUS_TAG[doc.status]}>{STATUS_LABEL[doc.status]}</Tag>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-y)' }}>

          {/* Pending review */}
          {pendingCount > 0 && (
            <Panel
              title="Prüfung erforderlich"
              subtitle={`${pendingCount} Dokumente · ${fmtEur(pendingAmount)}`}
              action={<Tag kind="warn" dot>{pendingCount}</Tag>}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {docs.filter(d => d.status === 'pending').map(doc => (
                  <div key={doc.id} style={{
                    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10,
                    padding: '9px 11px',
                    background: 'var(--c-surface2)',
                    border: '1px solid color-mix(in oklab, var(--c-warning) 20%, var(--c-border))',
                    borderRadius: 'var(--r-sm)',
                  }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 500, fontSize: 12, color: 'var(--c-textStrong)', marginBottom: 2 }}>
                        {doc.vendor}
                      </div>
                      <div className="cesa-muted" style={{ fontSize: 10.5 }}>{fmtDate(doc.date)} · {doc.category}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div className="cesa-mono" style={{ fontWeight: 700, fontSize: 13 }}>{fmtEur(doc.amount)}</div>
                      <div style={{ display: 'flex', gap: 4, marginTop: 4, justifyContent: 'flex-end' }}>
                        <button className="cesa-btn cesa-btn--sm" style={{ fontSize: 10, padding: '2px 6px' }}>✓ OK</button>
                        <button className="cesa-btn cesa-btn--sm cesa-btn--ghost" style={{ fontSize: 10, padding: '2px 6px' }}>Bearbeiten</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          )}

          {/* Category breakdown */}
          <Panel title="Kategorien" subtitle="Ausgaben nach Typ · Mai 2026">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {catSorted.map(([cat, info]) => (
                <div key={cat}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3, fontSize: 11.5 }}>
                    <span style={{ color: info.color, fontWeight: 500 }}>{cat}</span>
                    <span className="cesa-mono" style={{ fontWeight: 600, color: 'var(--c-textStrong)' }}>
                      {fmtEur(info.amount)}
                    </span>
                  </div>
                  <div style={{ height: 4, background: 'var(--c-surface3)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${(info.amount / maxCatAmount) * 100}%`,
                      background: info.color,
                      borderRadius: 2, opacity: 0.75,
                    }} />
                  </div>
                  <div className="cesa-muted cesa-mono" style={{ fontSize: 10, marginTop: 2 }}>
                    {info.count} Beleg{info.count > 1 ? 'e' : ''}
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          {/* Source breakdown */}
          <Panel title="Quellen" subtitle="Gmail vs. Upload">
            <div style={{ display: 'flex', gap: 10 }}>
              {[
                { label: 'Gmail', count: docs.filter(d => d.source === 'gmail').length, color: 'var(--c-accent)' },
                { label: 'Upload', count: docs.filter(d => d.source === 'upload').length, color: 'var(--c-positive)' },
              ].map(src => (
                <div key={src.label} style={{
                  flex: 1, padding: '10px 12px',
                  background: 'var(--c-surface2)', border: '1px solid var(--c-border)',
                  borderRadius: 'var(--r-sm)', textAlign: 'center',
                }}>
                  <div className="cesa-mono" style={{ fontSize: 22, fontWeight: 700, color: src.color }}>
                    {src.count}
                  </div>
                  <div className="cesa-muted" style={{ fontSize: 11, marginTop: 2 }}>{src.label}</div>
                </div>
              ))}
              <div style={{
                flex: 1, padding: '10px 12px',
                background: 'var(--c-surface2)', border: '1px solid var(--c-border)',
                borderRadius: 'var(--r-sm)', textAlign: 'center',
              }}>
                <div className="cesa-mono" style={{ fontSize: 22, fontWeight: 700, color: 'var(--c-positive)' }}>
                  {autoCount}
                </div>
                <div className="cesa-muted" style={{ fontSize: 11, marginTop: 2 }}>Auto-OK</div>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}

function SourceBadge({ source }: { source: 'gmail' | 'upload' }) {
  return (
    <span title={source === 'gmail' ? 'Gmail' : 'Manuell hochgeladen'} style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: 22, height: 22, borderRadius: 4,
      background: source === 'gmail' ? 'color-mix(in oklab, var(--c-accent) 15%, var(--c-surface3))' : 'color-mix(in oklab, var(--c-positive) 15%, var(--c-surface3))',
      fontSize: 11, fontWeight: 700,
      color: source === 'gmail' ? 'var(--c-accent)' : 'var(--c-positive)',
      border: `1px solid ${source === 'gmail' ? 'color-mix(in oklab, var(--c-accent) 25%, var(--c-border))' : 'color-mix(in oklab, var(--c-positive) 25%, var(--c-border))'}`,
    }}>
      {source === 'gmail' ? 'G' : '↑'}
    </span>
  )
}

function DocKpi({ label, value, sub, kind }: {
  label: string; value: string; sub?: string; kind?: 'pos' | 'neg' | 'warn'
}) {
  const color = kind === 'pos' ? 'var(--c-positive)' : kind === 'neg' ? 'var(--c-danger)' : kind === 'warn' ? 'var(--c-warning)' : 'var(--c-textStrong)'
  return (
    <div className="cesa-panel" style={{ padding: 'var(--pad)' }}>
      <div className="cesa-muted cesa-mono" style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>
        {label}
      </div>
      <div className="cesa-mono" style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.025em', color, lineHeight: 1.1 }}>
        {value}
      </div>
      {sub && <div className="cesa-muted cesa-mono" style={{ fontSize: 10.5, marginTop: 4 }}>{sub}</div>}
    </div>
  )
}
