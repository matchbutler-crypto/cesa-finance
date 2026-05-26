import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'

const usdEurRate = parseFloat(process.env.NEXT_PUBLIC_USD_EUR_RATE ?? '0.93')

function toEur(usd: number) {
  return Math.round(usd * usdEurRate * 10000) / 10000
}

export async function GET() {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const [todayRes, monthRes, settingsRes] = await Promise.all([
    supabase
      .from('api_usage_logs')
      .select('cost_usd')
      .gte('created_at', todayStart),
    supabase
      .from('api_usage_logs')
      .select('agent_type, cost_usd')
      .gte('created_at', monthStart),
    supabase
      .from('api_settings')
      .select('monthly_budget_eur')
      .eq('id', 1)
      .single(),
  ])

  if (todayRes.error || monthRes.error) {
    console.error('Supabase error:', todayRes.error ?? monthRes.error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  const today_usd = (todayRes.data ?? []).reduce((s, r) => s + Number(r.cost_usd), 0)
  const month_cfo_usd = (monthRes.data ?? [])
    .filter(r => r.agent_type === 'cfo')
    .reduce((s, r) => s + Number(r.cost_usd), 0)
  const month_tax_usd = (monthRes.data ?? [])
    .filter(r => r.agent_type === 'tax')
    .reduce((s, r) => s + Number(r.cost_usd), 0)

  const monthly_budget_eur = settingsRes.data?.monthly_budget_eur ?? 10

  return NextResponse.json({
    today_eur: toEur(today_usd),
    month_cfo_eur: toEur(month_cfo_usd),
    month_tax_eur: toEur(month_tax_usd),
    monthly_budget_eur: Number(monthly_budget_eur),
  })
}

const BudgetSchema = z.object({
  monthly_budget_eur: z.number().positive(),
})

export async function PUT(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = BudgetSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { error } = await supabase
    .from('api_settings')
    .update({ monthly_budget_eur: parsed.data.monthly_budget_eur, updated_at: new Date().toISOString() })
    .eq('id', 1)

  if (error) {
    console.error('Budget update error:', error.message)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
