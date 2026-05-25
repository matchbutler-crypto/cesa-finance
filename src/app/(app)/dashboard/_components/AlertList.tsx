import { StatusDot } from '@/components/cesa/primitives'

type AlertKind = 'warn' | 'info' | 'ok'

interface Alert {
  kind: AlertKind
  title: string
  sub: string
  cta?: string
}

const dotKind = (kind: AlertKind) => {
  if (kind === 'warn') return 'warning' as const
  if (kind === 'ok')   return 'pos' as const
  return 'info' as const
}

const ALERTS: Alert[] = [
  { kind: 'warn', title: 'Cap Basic läuft in 5 Tagen aus', sub: 'Nachbestellen — Lieferzeit 12 Tage', cta: 'Bestellen' },
  { kind: 'info', title: 'Shopify Payout am 26.05.',       sub: 'Erwartet ~€290' },
  { kind: 'warn', title: 'Lieferant Müller fällig 28.05.', sub: '€280 — Cash reicht' },
  { kind: 'ok',   title: 'UStVA April eingereicht',        sub: 'Nächste Frist 10.06.' },
]

export function AlertList() {
  return (
    <ul className="cesa-alerts">
      {ALERTS.map((alert, i) => (
        <li key={i} className="cesa-alert">
          <StatusDot kind={dotKind(alert.kind)} />
          <div className="cesa-alert__body">
            <div className="cesa-alert__title">{alert.title}</div>
            <div className="cesa-alert__sub">{alert.sub}</div>
          </div>
          {alert.cta && (
            <button className="cesa-btn cesa-btn--ghost cesa-btn--sm">{alert.cta}</button>
          )}
        </li>
      ))}
    </ul>
  )
}
