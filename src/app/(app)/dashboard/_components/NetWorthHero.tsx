import { NetWorthChart } from '@/components/cesa/charts'
import { fmtEur, fmtPct } from '@/lib/formatters'
import type { NetWorth } from '@/lib/types'

interface Props { netWorth: NetWorth }

export function NetWorthHero({ netWorth: nw }: Props) {
  return (
    <div className="cesa-grid cesa-grid--hero">
      <section className="cesa-panel cesa-panel--hero">
        <div className="cesa-panel__body">
          <div className="cesa-hero">
            <div>
              <div className="cesa-hero__label">Gesamtvermögen</div>
              <div className="cesa-hero__value cesa-mono">{fmtEur(nw.total)}</div>
              <div className="cesa-hero__sub">
                <span className="cesa-delta cesa-delta--pos">{fmtEur(nw.delta30d, { sign: true })}</span>
                <span className="cesa-muted">letzte 30 Tage · {fmtPct(nw.delta30dPct, { sign: true })}</span>
              </div>
            </div>
            <div className="cesa-hero__r">
              <NetWorthChart history={nw.history} forecast={nw.forecast12m} width={520} height={130} />
            </div>
          </div>

          <div className="cesa-hero__projection">
            <div className="cesa-kv">
              <span>Projektion 12M</span>
              <b className="cesa-mono">{fmtEur(nw.forecast12m[nw.forecast12m.length - 1])}</b>
            </div>
            <div className="cesa-kv">
              <span>Monatliches Wachstum</span>
              <b className="cesa-mono">{fmtEur(Math.round((nw.forecast12m[nw.forecast12m.length - 1] - nw.total) / 12))}</b>
            </div>
            <div className="cesa-kv">
              <span>Ziel Ø Wachstum</span>
              <b className="cesa-mono cesa-muted">{fmtEur(500)}</b>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
