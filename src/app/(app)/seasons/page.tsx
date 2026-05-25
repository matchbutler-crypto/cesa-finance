import { SeasonsClient } from './_components/SeasonsClient'

export default function SeasonsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-y)' }}>
      <div className="cesa-pagehead">
        <div>
          <div className="cesa-pagehead__eyebrow">Proaktiv planen statt reagieren</div>
          <h1 className="cesa-pagehead__title">Saisonkalender</h1>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="cesa-btn cesa-btn--ghost">Event hinzufügen</button>
          <button className="cesa-btn cesa-btn--ghost">iCal Export</button>
        </div>
      </div>
      <SeasonsClient />
    </div>
  )
}
