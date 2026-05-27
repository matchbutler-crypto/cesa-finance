const STORE = process.env.SHOPIFY_STORE ?? 'cesaclothing.myshopify.com'
const TOKEN = process.env.SHOPIFY_TOKEN ?? ''
const BASE  = `https://${STORE}/admin/api/2024-01`

async function shopifyFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'X-Shopify-Access-Token': TOKEN },
    next: { revalidate: 300 }, // 5-minute cache
  })
  if (!res.ok) throw new Error(`Shopify ${path}: ${res.status}`)
  return res.json()
}

function startOfMonth(date = new Date()): string {
  return new Date(date.getFullYear(), date.getMonth(), 1).toISOString()
}

function startOfPrevMonth(date = new Date()): string {
  return new Date(date.getFullYear(), date.getMonth() - 1, 1).toISOString()
}

function endOfPrevMonth(date = new Date()): string {
  return new Date(date.getFullYear(), date.getMonth(), 0, 23, 59, 59).toISOString()
}

interface ShopifyOrder {
  id: number
  created_at: string
  total_price: string
  financial_status: string
  line_items: { title: string; sku: string; quantity: number; price: string }[]
}

async function fetchOrders(params: string): Promise<ShopifyOrder[]> {
  const all: ShopifyOrder[] = []
  let url = `${BASE}/orders.json?status=any&financial_status=paid&limit=250&${params}`

  while (url) {
    const res = await fetch(url, {
      headers: { 'X-Shopify-Access-Token': TOKEN },
      next: { revalidate: 300 },
    })
    if (!res.ok) break
    const data = await res.json()
    all.push(...(data.orders ?? []))
    const link = res.headers.get('Link') ?? ''
    const next = link.match(/<([^>]+)>;\s*rel="next"/)
    url = next ? next[1] : ''
  }
  return all
}

export interface ShopifyDashboardData {
  mtdRevenue: number
  lastMonthRevenue: number
  dailyRevenue: number[]   // one entry per day of current month so far
  todayRevenue: number
  orderCountMtd: number
}

// Per-SKU config: values Shopify doesn't know (COGS, lead time)
// Update these when costs change — no code deploy needed for runtime values
const SKU_CONFIG: Record<string, { cogs: number; leadTime: number }> = {
  'HOD-CLS-BLK': { cogs: 22.40, leadTime: 21 },
  'HOD-CLS-GRY': { cogs: 22.40, leadTime: 21 },
  'HOD-OVS-BLK': { cogs: 26.10, leadTime: 21 },
  'CRW-BLK':     { cogs: 19.80, leadTime: 18 },
  'TEE-BLK':     { cogs:  9.60, leadTime: 14 },
  'TEE-WHT':     { cogs:  9.60, leadTime: 14 },
  'CAP-BSC':     { cogs:  7.20, leadTime: 12 },
  'CAP-LOG':     { cogs:  8.40, leadTime: 12 },
}

export interface ShopifyProductData {
  sku: string
  name: string
  price: number
  cogs: number
  leadTime: number
  units: number
  revenue: number
  stock: number
  // computed
  totalCogs: number
  margin: number
  profit: number
  daysToStockout: number
  dailyRate: number
}

interface ShopifyVariant {
  id: number
  sku: string
  price: string
  inventory_quantity: number
}

interface ShopifyProduct {
  id: number
  title: string
  variants: ShopifyVariant[]
}

export async function fetchShopifyProductData(): Promise<ShopifyProductData[]> {
  const now = new Date()
  const daysElapsed = Math.max(now.getDate(), 1)

  const [orders, productsRes] = await Promise.all([
    fetchOrders(`created_at_min=${startOfMonth(now)}&fields=id,line_items`),
    shopifyFetch<{ products: ShopifyProduct[] }>('/products.json?fields=id,title,variants&limit=250'),
  ])

  // Aggregate units + revenue per SKU from order line items
  const skuMap = new Map<string, { units: number; revenue: number; name: string; price: number }>()
  for (const order of orders) {
    for (const item of order.line_items) {
      const sku = item.sku?.trim()
      if (!sku) continue
      const existing = skuMap.get(sku)
      const itemRevenue = parseFloat(item.price) * item.quantity
      if (existing) {
        existing.units += item.quantity
        existing.revenue += itemRevenue
      } else {
        skuMap.set(sku, { units: item.quantity, revenue: itemRevenue, name: item.title, price: parseFloat(item.price) })
      }
    }
  }

  // Build stock map from Shopify product variants
  const stockMap = new Map<string, number>()
  for (const product of productsRes.products) {
    for (const variant of product.variants) {
      const sku = variant.sku?.trim()
      if (sku) stockMap.set(sku, variant.inventory_quantity ?? 0)
    }
  }

  // Merge: only return SKUs we have config for (our known products)
  const result: ShopifyProductData[] = []
  for (const [sku, config] of Object.entries(SKU_CONFIG)) {
    const sold = skuMap.get(sku) ?? { units: 0, revenue: 0, name: sku, price: 0 }
    const stock = Math.max(stockMap.get(sku) ?? 0, 0)

    // Fallback: if no sales this month, try to get price from Shopify variants
    let price = sold.price
    if (!price) {
      for (const product of productsRes.products) {
        const v = product.variants.find(v => v.sku?.trim() === sku)
        if (v) { price = parseFloat(v.price); break }
      }
    }

    const totalCogs = config.cogs * sold.units
    // Ads: rough attribution — total Meta spend is not per-SKU, so we skip for now
    const profit = sold.revenue - totalCogs
    const margin = sold.revenue > 0 ? profit / sold.revenue : 0
    const dailyRate = sold.units / daysElapsed
    const daysToStockout = dailyRate > 0 ? stock / dailyRate : 999

    result.push({
      sku,
      name: sold.name !== sku ? sold.name : (skuMap.get(sku)?.name ?? sku),
      price,
      cogs: config.cogs,
      leadTime: config.leadTime,
      units: sold.units,
      revenue: sold.revenue,
      stock,
      totalCogs,
      margin,
      profit,
      daysToStockout,
      dailyRate,
    })
  }

  return result.sort((a, b) => b.profit - a.profit)
}

export async function fetchShopifyDashboard(): Promise<ShopifyDashboardData> {
  const now = new Date()
  const daysElapsed = now.getDate()

  const [mtdOrders, prevOrders] = await Promise.all([
    fetchOrders(`created_at_min=${startOfMonth(now)}&fields=id,created_at,total_price`),
    fetchOrders(`created_at_min=${startOfPrevMonth(now)}&created_at_max=${endOfPrevMonth(now)}&fields=id,created_at,total_price`),
  ])

  const mtdRevenue = mtdOrders.reduce((s, o) => s + parseFloat(o.total_price), 0)
  const lastMonthRevenue = prevOrders.reduce((s, o) => s + parseFloat(o.total_price), 0)

  // Build daily revenue array (index 0 = day 1)
  const dailyMap = new Map<number, number>()
  for (const o of mtdOrders) {
    const day = new Date(o.created_at).getDate()
    dailyMap.set(day, (dailyMap.get(day) ?? 0) + parseFloat(o.total_price))
  }
  const dailyRevenue = Array.from({ length: daysElapsed }, (_, i) => dailyMap.get(i + 1) ?? 0)

  const todayRevenue = dailyMap.get(now.getDate()) ?? 0

  return {
    mtdRevenue,
    lastMonthRevenue,
    dailyRevenue,
    todayRevenue,
    orderCountMtd: mtdOrders.length,
  }
}
