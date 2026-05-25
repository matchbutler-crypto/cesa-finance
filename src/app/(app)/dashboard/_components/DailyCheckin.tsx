import { StatusDot } from '@/components/cesa/primitives'
import { fmtEur } from '@/lib/formatters'
import type { NetWorth, Ads } from '@/lib/types'

interface Props { netWorth: NetWorth; ads: Ads }

export function DailyCheckin({ netWorth, ads }: Props) {
  const bankAccount = netWorth.accounts.find(a => a.kind === 'bank' && a.name === 'Geschäftskonto')
  const storeAccount = netWorth.accounts.find(a => a.kind === 'store')
  const cashBalance = (bankAccount?.balance ?? 0) + (storeAccount?.balance ?? 0)
  const items = [
    { lbl: 'Orders gestern',  val: '4',                                        sub: '€204 GMV',           ok: true  },
    { lbl: 'Ad ROAS gestern', val: `${ads.roasYesterday.toFixed(2)}x`,          sub: `Break-even ${ads.breakEvenRoas}x`, ok: true  },
    { lbl: 'Cash heute',      val: fmtEur(cashBalance),                         sub: 'Konto + Shopify',    ok: true  },
    { lbl: 'Engpass-Risiko',  val: 'Keiner',                                   sub: 'Nächste 14 Tage',    ok: true  },
    { lbl: 'Belege offen',    val: '2',                                         sub: 'In Inbox',           ok: false },
    { lbl: 'Steuer-Fristen',  val: 'Keine',                                    sub: 'Diese Woche',        ok: true  },
  ]

  return (
    <div className="cesa-checkin">
      <div className="cesa-checkin__time cesa-mono">07:42</div>
      <div className="cesa-checkin__grid">
        {items.map((item) => (
          <div key={item.lbl} className={`cesa-checkin__row ${item.ok ? '' : 'warn'}`}>
            <div className="cesa-checkin__lbl">{item.lbl}</div>
            <div className="cesa-checkin__val cesa-mono">{item.val}</div>
            <div className="cesa-checkin__sub">{item.sub}</div>
          </div>
        ))}
      </div>
      <div className="cesa-checkin__verdict">
        <StatusDot kind="pos" size={10} />
        <span>Auf Kurs. Cap Basic heute nachbestellen.</span>
      </div>
    </div>
  )
}
