import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import { fetchShopifyDashboard } from '@/lib/api/shopify'
import { fetchMetaDashboard } from '@/lib/api/meta'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const model = process.env.CLAUDE_MODEL ?? 'claude-sonnet-4-6'
const inputPricePerToken = parseFloat(process.env.CLAUDE_INPUT_PRICE_USD ?? '0.000003')
const outputPricePerToken = parseFloat(process.env.CLAUDE_OUTPUT_PRICE_USD ?? '0.000015')

const MessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
})

const RequestSchema = z.object({
  message: z.string().min(1).max(4000),
  history: z.array(MessageSchema).max(40),
  agentType: z.enum(['cfo', 'tax']),
})

function fmt(n: number) { return `€${n.toFixed(2)}` }
function fmtX(n: number) { return `${n.toFixed(2)}x` }

async function buildSystemPrompt(agentType: 'cfo' | 'tax'): Promise<string> {
  const now = new Date()
  const month = now.toLocaleString('de-DE', { month: 'long', year: 'numeric' })
  const dayOfMonth = now.getDate()

  // Fetch live data — both may fail gracefully
  const [shopify, meta] = await Promise.allSettled([
    fetchShopifyDashboard(),
    fetchMetaDashboard(),
  ])

  const s = shopify.status === 'fulfilled' ? shopify.value : null
  const m = meta.status === 'fulfilled'    ? meta.value    : null

  const umsatzMtd     = s ? fmt(s.mtdRevenue)       : 'k.A.'
  const umsatzHeute   = s ? fmt(s.todayRevenue)      : 'k.A.'
  const umsatzVormonat = s ? fmt(s.lastMonthRevenue) : 'k.A.'
  const bestellungen  = s ? `${s.orderCountMtd} Bestellungen MTD` : ''
  const roasHeute     = m ? fmtX(m.roas)             : 'k.A.'
  const roasGestern   = m ? fmtX(m.roasYesterday)    : 'k.A.'
  const adSpendHeute  = m ? fmt(m.todaySpend)        : 'k.A.'
  const dataSource    = s || m ? 'Live-Daten: Shopify + Meta Ads' : 'Hinweis: Live-Daten nicht verfügbar — beziehe dich auf die Fragen des Nutzers'

  if (agentType === 'cfo') {
    return `Du bist der persönliche KI-CFO von Easy, dem Inhaber von CESA Clothing (cesaclothing.myshopify.com).

Deine Persönlichkeit: zahlenbasiert, direkt, präzise. Keine Floskeln, keine unnötigen Erklärungen.
Antworte immer auf Deutsch. Verwende Markdown (fett, Tabellen) für Zahlen.

Aktueller Kontext (${month}, Stand: Tag ${dayOfMonth}):
- Umsatz MTD: ${umsatzMtd}${bestellungen ? ` · ${bestellungen}` : ''}
- Umsatz heute: ${umsatzHeute}
- Umsatz Vormonat gesamt: ${umsatzVormonat}
- ROAS heute: ${roasHeute} (Break-Even: 2,50x)
- ROAS gestern: ${roasGestern}
- Ad-Spend heute: ${adSpendHeute}
- Nettovermögen: ~€18.420 (statisch, wird manuell aktualisiert)
- Runway: ~14 Monate

${dataSource}

Bleib prägnant. Antworte in 2–5 Sätzen, es sei denn, eine Tabelle oder Liste ist klar besser.`
  }

  return `Du bist der persönliche KI-Steuerberater von Easy, dem Inhaber von CESA Clothing (cesaclothing.myshopify.com).

Deine Persönlichkeit: GoBD-konform, präzise, proaktiv bei Fristen. Kennst deutsches Steuerrecht (UStG, EStG, GewStG).
Antworte immer auf Deutsch. Verwende Markdown für Struktur.

Aktueller Kontext (${month}, Stand: Tag ${dayOfMonth}):
- Umsatz MTD: ${umsatzMtd} (Shopify, brutto)
- Umsatz Vormonat: ${umsatzVormonat}
- USt-Voranmeldung Vormonat: bereits gebucht (fällig 10. des Folgemonats ✓)
- Nächste Fälligkeit: USt-Voranmeldung ${month} → 10. des Folgemonats
- Einkommensteuer-Vorauszahlung Q2: 10.06.2026
- Kein Kleinunternehmer (Umsatz > €22.000/Jahr)
- GoBD-Pflicht: Belege zeitnah erfassen

${dataSource}

Bleib prägnant. Verweise auf §-Paragraphen wenn hilfreich, aber erkläre sie kurz.`
}

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = RequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { message, history, agentType } = parsed.data

  const messages: Anthropic.MessageParam[] = [
    ...history,
    { role: 'user', content: message },
  ]

  let anthropicResponse: Anthropic.Message
  try {
    const stream = await client.messages.stream({
      model,
      max_tokens: 1024,
      system: await buildSystemPrompt(agentType),
      messages,
    })
    anthropicResponse = await stream.finalMessage()
  } catch (err) {
    console.error('Claude API error:', err)
    return NextResponse.json({ error: 'Claude API unavailable' }, { status: 502 })
  }

  const { input_tokens, output_tokens } = anthropicResponse.usage
  const cost_usd = input_tokens * inputPricePerToken + output_tokens * outputPricePerToken

  // Log usage — fire-and-forget, don't block response on logging failure
  supabase.from('api_usage_logs').insert({
    agent_type: agentType,
    model,
    input_tokens,
    output_tokens,
    cost_usd,
  }).then(({ error }) => {
    if (error) console.error('Usage log error:', error.message)
  })

  const text = anthropicResponse.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map(b => b.text)
    .join('')

  return NextResponse.json({ text, usage: { input_tokens, output_tokens, cost_usd } })
}
