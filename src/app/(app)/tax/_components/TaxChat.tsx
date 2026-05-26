'use client'
import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'agent'
  text: string
  ts: string
  chips?: string[]
}

const INITIAL_MESSAGES: Message[] = [
  {
    role: 'agent',
    text: 'Hallo, ich bin dein Steuerberater-Agent. Hier ist dein steuerliches Lagebild für Mai 2026:\n\n**USt-Voranmeldung April** bereits gebucht (−€312, fällig 10.05. ✓)\n**Nächste Fälligkeit:** USt-Voranmeldung Mai → fällig **10.06.2026**\n**Voraussichtliche USt-Zahllast Mai:** ca. €450–€510 (je nach Endabrechnung)\n**Einkommensteuer-Vorauszahlung Q2** → fällig **10.06.2026**\n\nWie kann ich helfen?',
    ts: '09:00',
    chips: ['USt Mai schätzen', 'Betriebsausgaben optimieren', 'Abschreibungen prüfen', 'Jahressteuerlast 2026'],
  },
  {
    role: 'user',
    text: 'Was kann ich als Betriebsausgaben absetzen?',
    ts: '09:03',
  },
  {
    role: 'agent',
    text: 'Basierend auf deinen Mai-Belegen habe ich folgende **abzugsfähige Betriebsausgaben** identifiziert:\n\n**Sofort absetzbar (100%):**\n• Meta Ads €284 · Shopify €29 · Hostinger €14 · n8n €20\n• DHL Versand €86 · Wareneinkauf €699\n• DATEV Honorar €240\n\n**Sofort absetzbar (bei Nachweis):**\n• Heimarbeitsplatz-Anteil (falls vorhanden)\n• Smartphone/Laptop anteilig (beruflich/privat)\n\n**Nicht absetzbar:**\n• Private Entnahmen, Privatkontoabbuchungen\n\n**Gesamte Betriebsausgaben Mai (geschätzt): €1.372**\nDas senkt deine Steuerbemessungsgrundlage entsprechend.',
    ts: '09:03',
    chips: ['Vorsteuer berechnen', 'Gewinnermittlung Mai', 'Kleinunternehmer-Grenze'],
  },
  {
    role: 'user',
    text: 'Wann erreiche ich die Kleinunternehmer-Grenze?',
    ts: '09:06',
  },
  {
    role: 'agent',
    text: 'Du bist **kein Kleinunternehmer** (§19 UStG) und musst Umsatzsteuer ausweisen — das ist bei deinem Umsatzvolumen korrekt.\n\n**Zur Info:** Die Kleinunternehmergrenze liegt bei €22.000 Jahresumsatz. Du hast diese Grenze bereits weit überschritten.\n\n**Dein proj. Jahresumsatz 2026:**\n• Jan–Apr Ø: €2.960/Monat (geschätzt)\n• Mai proj.: €3.530\n• **Hochrechnung 12M: ~€37.000–€42.000**\n\n**Fazit:** Kleinunternehmerregelung ist für dich keine Option. Dafür kannst du die **Vorsteuer** aus allen Betriebsausgaben zurückholen — das spart dir reell Geld.',
    ts: '09:06',
  },
]


function now() {
  return new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
}

function MdText({ text }: { text: string }) {
  const lines = text.split('\n')
  return (
    <>
      {lines.map((line, i) => {
        const bold = line.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
        return <span key={i} dangerouslySetInnerHTML={{ __html: bold + (i < lines.length - 1 ? '<br/>' : '') }} />
      })}
    </>
  )
}

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user'
  return (
    <div style={{ display: 'flex', flexDirection: isUser ? 'row-reverse' : 'row', gap: 10, marginBottom: 16, alignItems: 'flex-start' }}>
      <div style={{
        width: 28, height: 28, borderRadius: 6, flexShrink: 0, display: 'grid', placeItems: 'center',
        background: isUser ? 'var(--c-surface3)' : 'var(--c-warning)',
        color: isUser ? 'var(--c-muted)' : 'var(--c-bg)',
        fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, border: '1px solid var(--c-border)',
      }}>
        {isUser ? 'E' : 'S'}
      </div>
      <div style={{ maxWidth: '78%', minWidth: 0 }}>
        <div style={{
          padding: '10px 14px',
          background: isUser ? 'var(--c-surface3)' : 'var(--c-surface2)',
          border: `1px solid ${isUser ? 'var(--c-borderStrong)' : 'var(--c-border)'}`,
          borderRadius: isUser ? '8px 8px 2px 8px' : '8px 8px 8px 2px',
          fontSize: 12.5, lineHeight: 1.6, color: 'var(--c-text)', whiteSpace: 'pre-wrap',
        }}>
          <MdText text={msg.text} />
        </div>
        <div style={{ fontSize: 10, color: 'var(--c-subtle)', fontFamily: 'var(--font-mono)', marginTop: 3, textAlign: isUser ? 'right' : 'left' }}>
          {msg.ts}
        </div>
        {msg.chips && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 6 }}>
            {msg.chips.map(chip => (
              <button key={chip} style={{
                padding: '3px 9px', fontSize: 11, fontFamily: 'var(--font-sans)',
                background: 'var(--c-surface3)', border: '1px solid var(--c-border)',
                borderRadius: 20, color: 'var(--c-text)', cursor: 'pointer',
              }}>{chip}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function TaxChat() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, thinking])

  async function send(text: string) {
    if (!text.trim() || thinking) return
    const updatedMessages = [...messages, { role: 'user' as const, text: text.trim(), ts: now() }]
    setMessages(updatedMessages)
    setInput('')
    setThinking(true)

    const history = updatedMessages.slice(1, -1).map(m => ({
      role: m.role === 'user' ? 'user' as const : 'assistant' as const,
      content: m.text,
    }))

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text.trim(), history, agentType: 'tax' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'API error')
      setMessages(prev => [...prev, { role: 'agent', text: data.text, ts: now() }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'agent',
        text: 'Verbindungsfehler — bitte prüfe den ANTHROPIC_API_KEY in .env.local und versuche es erneut.',
        ts: now(),
      }])
    } finally {
      setThinking(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 0', minHeight: 0 }}>
        {messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)}
        {thinking && (
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, display: 'grid', placeItems: 'center', background: 'var(--c-warning)', color: 'var(--c-bg)', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, border: '1px solid var(--c-border)' }}>S</div>
            <div style={{ padding: '10px 14px', background: 'var(--c-surface2)', border: '1px solid var(--c-border)', borderRadius: '8px 8px 8px 2px', display: 'flex', gap: 4 }}>
              {[0, 1, 2].map(i => <span key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--c-muted)', animation: `pulse 1.2s ${i * 0.2}s infinite`, display: 'inline-block' }} />)}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div style={{ borderTop: '1px solid var(--c-border)', paddingTop: 12, display: 'flex', gap: 8 }}>
        <input
          value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send(input))}
          placeholder="Steuerfrage stellen…" disabled={thinking}
          style={{ flex: 1, background: 'var(--c-surface2)', border: '1px solid var(--c-border)', borderRadius: 'var(--r-md)', padding: '8px 12px', color: 'var(--c-text)', fontSize: 13, fontFamily: 'var(--font-sans)', outline: 'none' }}
        />
        <button onClick={() => send(input)} disabled={!input.trim() || thinking} style={{
          background: input.trim() && !thinking ? 'var(--c-warning)' : 'var(--c-surface3)',
          border: '1px solid var(--c-border)', borderRadius: 'var(--r-md)',
          color: input.trim() && !thinking ? 'var(--c-bg)' : 'var(--c-muted)',
          padding: '8px 16px', fontSize: 12, fontWeight: 600, cursor: input.trim() ? 'pointer' : 'default',
        }}>Senden</button>
      </div>
      <style>{`@keyframes pulse { 0%,80%,100%{opacity:.3} 40%{opacity:1} }`}</style>
    </div>
  )
}
