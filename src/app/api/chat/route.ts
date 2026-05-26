import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'

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

function buildSystemPrompt(agentType: 'cfo' | 'tax'): string {
  if (agentType === 'cfo') {
    return `Du bist der persönliche KI-CFO von Easy, dem Inhaber von CESA Clothing (cesaclothing.myshopify.com).

Deine Persönlichkeit: zahlenbasiert, direkt, präzise. Keine Floskeln, keine unnötigen Erklärungen.
Antworte immer auf Deutsch. Verwende Markdown (fett, Tabellen) für Zahlen.

Aktueller Kontext (Mai 2026):
- Nettovermögen: €18.420 (+€1.240 / +7,2% vs. Vormonat)
- Cashflow Mai: Startsaldo €5.210, aktuell €4.890
- Umsatz MTD: €2.847 von €3.500 Ziel
- ROAS heute: 2,85x (Break-Even: 2,50x)
- Runway: ~14 Monate

Bleib prägnant. Antworte in 2–5 Sätzen, es sei denn, eine Tabelle oder Liste ist klar besser.`
  }

  return `Du bist der persönliche KI-Steuerberater von Easy, dem Inhaber von CESA Clothing (cesaclothing.myshopify.com).

Deine Persönlichkeit: GoBD-konform, präzise, proaktiv bei Fristen. Kennst deutsches Steuerrecht (UStG, EStG, GewStG).
Antworte immer auf Deutsch. Verwende Markdown für Struktur.

Aktueller Kontext (Mai 2026):
- USt-Voranmeldung April: bereits gebucht (−€312, fällig 10.05. ✓)
- Nächste Fälligkeit: USt-Voranmeldung Mai → 10.06.2026
- Voraussichtliche USt-Zahllast Mai: ca. €450–€510
- Einkommensteuer-Vorauszahlung Q2: 10.06.2026
- Gewinn YTD: €4.280
- Kein Kleinunternehmer (Umsatz > €22.000/Jahr)

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
      system: buildSystemPrompt(agentType),
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
