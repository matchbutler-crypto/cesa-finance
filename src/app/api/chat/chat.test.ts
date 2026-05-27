import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Anthropic SDK
vi.mock('@anthropic-ai/sdk', () => {
  function MockAnthropic() {
    this.messages = {
      stream: vi.fn().mockResolvedValue({
        finalMessage: vi.fn().mockResolvedValue({
          content: [{ type: 'text', text: 'Mock CFO response' }],
          usage: { input_tokens: 100, output_tokens: 50 },
        }),
      }),
    }
  }
  return { default: MockAnthropic }
})

// Mock Shopify + Meta API (now called by buildSystemPrompt)
vi.mock('@/lib/api/shopify', () => ({
  fetchShopifyDashboard: vi.fn().mockResolvedValue({
    mtdRevenue: 2847, lastMonthRevenue: 3120, dailyRevenue: [], todayRevenue: 113, orderCountMtd: 24,
  }),
  fetchShopifyProductData: vi.fn().mockResolvedValue([]),
}))
vi.mock('@/lib/api/meta', () => ({
  fetchMetaDashboard: vi.fn().mockResolvedValue({
    roas: 2.85, roasYesterday: 3.1, todaySpend: 98, todayRevenue: 279,
    yesterdaySpend: 85, yesterdayRevenue: 263, cpm: 12, ctr: 1.8, cpp: 49,
    spend7d: [], revenue7d: [], breakEvenRoas: 2.5, status: 'green',
  }),
}))

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      insert: vi.fn().mockResolvedValue({ error: null }),
    }),
  },
}))

// Mock Next.js request/response
function makeRequest(body: unknown) {
  return new Request('http://localhost/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/chat', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.ANTHROPIC_API_KEY = 'test-key'
    process.env.CLAUDE_MODEL = 'claude-sonnet-4-6'
    process.env.CLAUDE_INPUT_PRICE_USD = '0.000003'
    process.env.CLAUDE_OUTPUT_PRICE_USD = '0.000015'
  })

  it('returns 200 with text for valid CFO request', async () => {
    const { POST } = await import('./route')
    const req = makeRequest({
      message: 'Wie ist mein Cashflow?',
      history: [],
      agentType: 'cfo',
    })
    const res = await POST(req as Parameters<typeof POST>[0])
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.text).toBe('Mock CFO response')
    expect(json.usage.input_tokens).toBe(100)
    expect(json.usage.output_tokens).toBe(50)
  })

  it('returns 200 with text for valid tax request', async () => {
    const { POST } = await import('./route')
    const req = makeRequest({
      message: 'Wie viel USt muss ich zahlen?',
      history: [],
      agentType: 'tax',
    })
    const res = await POST(req as Parameters<typeof POST>[0])
    expect(res.status).toBe(200)
  })

  it('returns 400 for missing message', async () => {
    const { POST } = await import('./route')
    const req = makeRequest({ history: [], agentType: 'cfo' })
    const res = await POST(req as Parameters<typeof POST>[0])
    expect(res.status).toBe(400)
  })

  it('returns 400 for invalid agentType', async () => {
    const { POST } = await import('./route')
    const req = makeRequest({ message: 'test', history: [], agentType: 'invalid' })
    const res = await POST(req as Parameters<typeof POST>[0])
    expect(res.status).toBe(400)
  })

  it('returns 400 for message exceeding max length', async () => {
    const { POST } = await import('./route')
    const req = makeRequest({
      message: 'x'.repeat(4001),
      history: [],
      agentType: 'cfo',
    })
    const res = await POST(req as Parameters<typeof POST>[0])
    expect(res.status).toBe(400)
  })

  it('returns 400 for invalid JSON', async () => {
    const { POST } = await import('./route')
    const req = new Request('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not-json',
    })
    const res = await POST(req as Parameters<typeof POST>[0])
    expect(res.status).toBe(400)
  })
})
