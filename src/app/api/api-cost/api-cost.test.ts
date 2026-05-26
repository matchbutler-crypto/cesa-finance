import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockFrom = vi.fn()

vi.mock('@/lib/supabase', () => ({
  supabase: { from: mockFrom },
}))

function makeUsageChain(data: unknown[]) {
  return {
    select: vi.fn().mockReturnThis(),
    gte: vi.fn().mockResolvedValue({ data, error: null }),
  }
}

function setupSupabaseMock(todayData: unknown[], monthData: unknown[], settingsData: unknown) {
  // Track call count per table to differentiate today vs month queries
  let usageCallCount = 0
  mockFrom.mockImplementation((table: string) => {
    if (table === 'api_usage_logs') {
      usageCallCount++
      return usageCallCount === 1 ? makeUsageChain(todayData) : makeUsageChain(monthData)
    }
    if (table === 'api_settings') {
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: settingsData, error: null }),
        update: vi.fn().mockReturnThis(),
      }
    }
  })
}

describe('GET /api/api-cost', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.NEXT_PUBLIC_USD_EUR_RATE = '0.93'
  })

  it('returns 200 with zero values on empty db', async () => {
    setupSupabaseMock([], [], { monthly_budget_eur: 10 })
    const { GET } = await import('./route')
    const res = await GET()
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.today_eur).toBe(0)
    expect(json.month_cfo_eur).toBe(0)
    expect(json.month_tax_eur).toBe(0)
    expect(json.monthly_budget_eur).toBe(10)
  })

  it('aggregates costs by agent type correctly', async () => {
    const monthData = [
      { agent_type: 'cfo', cost_usd: 0.001 },
      { agent_type: 'cfo', cost_usd: 0.002 },
      { agent_type: 'tax', cost_usd: 0.0005 },
    ]
    setupSupabaseMock([], monthData, { monthly_budget_eur: 10 })
    const { GET } = await import('./route')
    const res = await GET()
    const json = await res.json()
    // 0.003 USD * 0.93 = 0.00279 EUR (rounded)
    expect(json.month_cfo_eur).toBeGreaterThan(0)
    expect(json.month_tax_eur).toBeGreaterThan(0)
    expect(json.month_cfo_eur).toBeGreaterThan(json.month_tax_eur)
  })
})

describe('PUT /api/api-cost', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 200 for valid budget update', async () => {
    mockFrom.mockReturnValue({
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null }),
    })
    const { PUT } = await import('./route')
    const req = new Request('http://localhost/api/api-cost', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ monthly_budget_eur: 15 }),
    })
    const res = await PUT(req as Parameters<typeof PUT>[0])
    expect(res.status).toBe(200)
  })

  it('returns 400 for negative budget', async () => {
    const { PUT } = await import('./route')
    const req = new Request('http://localhost/api/api-cost', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ monthly_budget_eur: -5 }),
    })
    const res = await PUT(req as Parameters<typeof PUT>[0])
    expect(res.status).toBe(400)
  })

  it('returns 400 for zero budget', async () => {
    const { PUT } = await import('./route')
    const req = new Request('http://localhost/api/api-cost', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ monthly_budget_eur: 0 }),
    })
    const res = await PUT(req as Parameters<typeof PUT>[0])
    expect(res.status).toBe(400)
  })

  it('returns 400 for invalid JSON', async () => {
    const { PUT } = await import('./route')
    const req = new Request('http://localhost/api/api-cost', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: 'not-json',
    })
    const res = await PUT(req as Parameters<typeof PUT>[0])
    expect(res.status).toBe(400)
  })
})
