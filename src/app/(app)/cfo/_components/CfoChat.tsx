'use client'
import { useState, useRef, useEffect } from 'react'
import { fmtEur } from '@/lib/formatters'

interface Message {
  role: 'user' | 'agent'
  text: string
  ts: string
  chips?: string[]
}

const INITIAL_MESSAGES: Message[] = [
  {
    role: 'agent',
    text: 'Guten Morgen. Ich bin dein CFO-Agent. Hier ist dein aktuelles Lagebild:\n\n**Nettovermögen** €18.420 (+€1.240 / +7,2% vs. Vormonat)\n**Cashflow Mai** €4.890 Geschäftskonto · Endsaldo proj. €4.622\n**Umsatz MTD** €2.847 von €3.500 Ziel — On Track ✓\n**ROAS heute** 2,85x · Break-Even 2,50x ✓\n\nWomit kann ich dir helfen?',
    ts: '09:00',
    chips: ['Cashflow-Status', 'Gewinnentnahme möglich?', 'Wann Reinvestieren?', 'Ads skalieren?'],
  },
  {
    role: 'user',
    text: 'Kann ich diesen Monat €800 entnehmen ohne den Cashflow zu gefährden?',
    ts: '09:02',
  },
  {
    role: 'agent',
    text: 'Kurze Antwort: **Ja, €800 sind sicher** — aber ich empfehle €600 jetzt und €200 Ende Monat.\n\n**Warum:**\n- Proj. Endsaldo 31.05.: €4.622\n- Lieferant Müller fällig 28.05.: −€280\n- Meta Ads-Abrechnung 01.06.: −€142\n- Nach €800 Entnahme Puffer: **€3.400** → komfortabel über €1.500 Sicherheitspuffer\n\n**Empfehlung:** Entnimm jetzt €600 und warte bis nach dem 28.05. für die restlichen €200. So bleibst du über €3.600 Saldo bis Monatsende.',
    ts: '09:02',
    chips: ['Monatliche Entnahme optimieren', 'Rücklage erhöhen?', 'Nächsten Monat planen'],
  },
  {
    role: 'user',
    text: 'Wie entwickelt sich mein Nettovermögen auf Jahressicht?',
    ts: '09:05',
  },
  {
    role: 'agent',
    text: 'Basierend auf dem aktuellen Wachstumstrend (+7,2% / Monat gleitend):\n\n| Monat | Proj. NW |\n|---|---|\n| Jun 2026 | €19.750 |\n| Sep 2026 | €21.800 |\n| Dez 2026 | **€24.200** |\n\n**Treiber:** Shopify-Wachstum, Mieteinnahme stabil, Ads-ROAS über Break-Even.\n\n**Risiko:** Wenn ROAS unter 2,5x fällt oder ein Lieferant ausfällt, reduziert sich das Wachstum auf ~4% / Monat → NW Dez 2026: €21.400.\n\n**Fazit:** Du bist auf gutem Weg zu €24k Nettovermögen bis Jahresende, wenn du den aktuellen Kurs hältst.',
    ts: '09:05',
  },
]

const MOCK_REPLIES: Record<string, string> = {
  default: 'Das analysiere ich gerade. Basierend auf deinen aktuellen Finanzdaten (NW €18.420, ROAS 2,85x, Cashflow stabil) sieht die Lage gut aus. Soll ich einen konkreten Plan ausarbeiten?',
  'cashflow': 'Cashflow Mai: Startsaldo €5.210, aktuell €4.890 (-€320 durch Ads + Lieferant). Proj. Endsaldo 31.05.: **€4.622**. Kein Engpass erwartet — Minimum am 28.05.: €3.400.',
  'roas': 'ROAS heute: **2,85x** (Break-Even: 2,50x ✓). 7-Tage-Ø: 2,42x — leicht schwächer. CPP €16.80. Empfehlung: Budget stabil halten, kein Scale-up bis 7d-ROAS > 2,60x.',
  'ads': 'Heute €48 Ads-Budget · €137 Revenue → ROAS 2,85x. Budget-Empfehlung: bei €40–55/Tag bleiben bis 7d-ROAS konstant > 2,60x, dann schrittweise +20% testen.',
}

function getMockReply(input: string): string {
  const lower = input.toLowerCase()
  if (lower.includes('cashflow') || lower.includes('saldo')) return MOCK_REPLIES['cashflow']
  if (lower.includes('roas')) return MOCK_REPLIES['roas']
  if (lower.includes('ads') || lower.includes('werbung')) return MOCK_REPLIES['ads']
  return MOCK_REPLIES['default']
}

function now() {
  return new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
}

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user'
  return (
    <div style={{
      display: 'flex',
      flexDirection: isUser ? 'row-reverse' : 'row',
      gap: 10, marginBottom: 16,
      alignItems: 'flex-start',
    }}>
      {/* Avatar */}
      <div style={{
        width: 28, height: 28, borderRadius: 6, flexShrink: 0,
        display: 'grid', placeItems: 'center',
        background: isUser ? 'var(--c-surface3)' : 'var(--c-accent)',
        color: isUser ? 'var(--c-muted)' : 'var(--c-bg)',
        fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
        border: '1px solid var(--c-border)',
      }}>
        {isUser ? 'E' : 'C'}
      </div>

      <div style={{ maxWidth: '78%', minWidth: 0 }}>
        <div style={{
          padding: '10px 14px',
          background: isUser ? 'var(--c-surface3)' : 'var(--c-surface2)',
          border: `1px solid ${isUser ? 'var(--c-borderStrong)' : 'var(--c-border)'}`,
          borderRadius: isUser ? '8px 8px 2px 8px' : '8px 8px 8px 2px',
          fontSize: 12.5, lineHeight: 1.6, color: 'var(--c-text)',
          whiteSpace: 'pre-wrap',
        }}>
          <MdText text={msg.text} />
        </div>
        <div style={{ fontSize: 10, color: 'var(--c-subtle)', fontFamily: 'var(--font-mono)', marginTop: 3, textAlign: isUser ? 'right' : 'left' }}>
          {msg.ts}
        </div>
        {msg.chips && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 6 }}>
            {msg.chips.map(chip => (
              <ChipButton key={chip} label={chip} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ChipButton({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '3px 9px', fontSize: 11, fontFamily: 'var(--font-sans)',
        background: 'var(--c-surface3)', border: '1px solid var(--c-border)',
        borderRadius: 20, color: 'var(--c-text)', cursor: 'pointer',
      }}
    >
      {label}
    </button>
  )
}

function MdText({ text }: { text: string }) {
  const lines = text.split('\n')
  return (
    <>
      {lines.map((line, i) => {
        const bold = line.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
        if (line.startsWith('| ')) {
          return <span key={i} style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--c-muted)' }} dangerouslySetInnerHTML={{ __html: bold + (i < lines.length - 1 ? '<br/>' : '') }} />
        }
        return <span key={i} dangerouslySetInnerHTML={{ __html: bold + (i < lines.length - 1 ? '<br/>' : '') }} />
      })}
    </>
  )
}

export function CfoChat() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, thinking])

  function send(text: string) {
    if (!text.trim() || thinking) return
    const userMsg: Message = { role: 'user', text: text.trim(), ts: now() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setThinking(true)
    setTimeout(() => {
      const reply: Message = { role: 'agent', text: getMockReply(text), ts: now() }
      setMessages(prev => [...prev, reply])
      setThinking(false)
    }, 900 + Math.random() * 600)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 0', minHeight: 0 }}>
        {messages.map((msg, i) => (
          <MessageBubble key={i} msg={msg} />
        ))}
        {thinking && (
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'flex-start' }}>
            <div style={{
              width: 28, height: 28, borderRadius: 6, flexShrink: 0,
              display: 'grid', placeItems: 'center',
              background: 'var(--c-accent)', color: 'var(--c-bg)',
              fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
              border: '1px solid var(--c-border)',
            }}>C</div>
            <div style={{
              padding: '10px 14px',
              background: 'var(--c-surface2)', border: '1px solid var(--c-border)',
              borderRadius: '8px 8px 8px 2px',
              display: 'flex', gap: 4, alignItems: 'center',
            }}>
              {[0, 1, 2].map(i => (
                <span key={i} style={{
                  width: 5, height: 5, borderRadius: '50%',
                  background: 'var(--c-muted)',
                  animation: `pulse 1.2s ${i * 0.2}s infinite`,
                  display: 'inline-block',
                }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        borderTop: '1px solid var(--c-border)',
        paddingTop: 12, display: 'flex', gap: 8,
      }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send(input))}
          placeholder="Frag deinen CFO-Agenten…"
          disabled={thinking}
          style={{
            flex: 1, background: 'var(--c-surface2)', border: '1px solid var(--c-border)',
            borderRadius: 'var(--r-md)', padding: '8px 12px',
            color: 'var(--c-text)', fontSize: 13, fontFamily: 'var(--font-sans)',
            outline: 'none',
          }}
        />
        <button
          onClick={() => send(input)}
          disabled={!input.trim() || thinking}
          style={{
            background: input.trim() && !thinking ? 'var(--c-accent)' : 'var(--c-surface3)',
            border: '1px solid var(--c-border)', borderRadius: 'var(--r-md)',
            color: input.trim() && !thinking ? 'var(--c-bg)' : 'var(--c-muted)',
            padding: '8px 16px', fontSize: 12, fontWeight: 600, cursor: input.trim() ? 'pointer' : 'default',
            transition: 'background 0.15s',
          }}
        >
          Senden
        </button>
      </div>
      <style>{`@keyframes pulse { 0%,80%,100%{opacity:.3} 40%{opacity:1} }`}</style>
    </div>
  )
}
