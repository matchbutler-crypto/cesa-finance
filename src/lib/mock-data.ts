import type { CesaData, Product } from './types'

const rawProducts = [
  { sku: 'HOD-CLS-BLK', name: 'Hoodie Classic Schwarz',  price: 69.90, cogs: 22.40, ads: 8.20,  returns: 4.10, units: 18, stock: 24, leadTime: 21 },
  { sku: 'HOD-CLS-GRY', name: 'Hoodie Classic Grau',      price: 69.90, cogs: 22.40, ads: 6.80,  returns: 3.50, units: 14, stock: 18, leadTime: 21 },
  { sku: 'HOD-OVS-BLK', name: 'Hoodie Oversize Schwarz',  price: 79.90, cogs: 26.10, ads: 12.40, returns: 6.20, units: 11, stock: 9,  leadTime: 21 },
  { sku: 'CRW-BLK',     name: 'Crewneck Schwarz',         price: 59.90, cogs: 19.80, ads: 5.20,  returns: 2.40, units: 9,  stock: 22, leadTime: 18 },
  { sku: 'TEE-BLK',     name: 'Tee Heavy Schwarz',        price: 34.90, cogs: 9.60,  ads: 3.10,  returns: 1.20, units: 22, stock: 48, leadTime: 14 },
  { sku: 'TEE-WHT',     name: 'Tee Heavy Weiß',           price: 34.90, cogs: 9.60,  ads: 2.40,  returns: 1.80, units: 16, stock: 34, leadTime: 14 },
  { sku: 'CAP-BSC',     name: 'Cap Basic',                price: 29.90, cogs: 7.20,  ads: 4.80,  returns: 2.10, units: 12, stock: 6,  leadTime: 12 },
  { sku: 'CAP-LOG',     name: 'Cap Logo Stick',           price: 32.90, cogs: 8.40,  ads: 3.60,  returns: 0.90, units: 8,  stock: 14, leadTime: 12 },
]

function computeProduct(p: typeof rawProducts[0]): Product {
  const revenue = p.price * p.units
  const totalCogs = p.cogs * p.units
  const totalAds = p.ads * p.units
  const totalReturns = p.returns * p.units
  const profit = revenue - totalCogs - totalAds - totalReturns
  const margin = profit / revenue
  const dailyRate = p.units / 25
  const daysToStockout = p.stock / Math.max(dailyRate, 0.01)
  return { ...p, revenue, totalCogs, totalAds, totalReturns, profit, margin, dailyRate, daysToStockout }
}

export const MOCK_DATA: CesaData = {
  netWorth: {
    total: 18420,
    delta30d: 1240,
    delta30dPct: 7.2,
    accounts: [
      { name: 'Geschäftskonto',      kind: 'bank',    balance: 4890, change:  320 },
      { name: 'Shopify Payout',      kind: 'store',   balance:  620, change: -180 },
      { name: 'PayPal Business',     kind: 'paypal',  balance:  312, change:   44 },
      { name: 'Tagesgeld Rücklage',  kind: 'savings', balance: 3000, change:    0 },
      { name: 'Privatkonto',         kind: 'bank',    balance: 1198, change:   95 },
      { name: 'Immobilie (Anteil)',  kind: 'real',    balance: 8400, change:    0 },
    ],
    liabilities: [
      { name: 'Lieferant Müller (offen)', amount: 280, due: '2026-05-28' },
      { name: 'Meta Ads (akkumuliert)',   amount: 142, due: '2026-06-01' },
    ],
    history:    [14820, 15010, 15240, 15680, 15940, 16210, 16480, 16820, 17100, 17380, 17680, 18420],
    forecast12m:[18420, 18760, 19120, 19490, 19880, 20290, 20720, 21180, 21650, 22150, 22680, 23230],
  },
  forecast: {
    target: 3500,
    mtdRevenue: 2847,
    daysElapsed: 25,
    daysInMonth: 31,
    dailyRunRate: 113.9,
    projectedMonthEnd: 3530,
    daysToTarget: 5.7,
    daily: [94,128,76,142,188,102,88,156,134,98,176,84,110,92,124,142,96,168,130,102,88,154,92,116,137],
    lastMonth: 3120,
    twoMonthsAgo: 2840,
  },
  ads: {
    todaySpend: 48, yesterdaySpend: 42,
    todayRevenue: 137, yesterdayRevenue: 116,
    roas: 2.85, roasYesterday: 2.76, roasLastWeek: 2.42, breakEvenRoas: 2.5,
    cpm: 8.40, ctr: 1.8, cpp: 16.80, status: 'green',
    spend7d:   [38, 42, 45, 48, 44, 42, 48],
    revenue7d: [102,116,128,142,122,116,137],
  },
  products: rawProducts.map(computeProduct),
  cashflow: {
    startBalance: 5210,
    today: 25,
    entries: [
      { day: 1,  label: 'Shopify Basic Plan',     amount:  -29, kind: 'subscription' },
      { day: 1,  label: 'Mieteinnahme',            amount: +450, kind: 'rental' },
      { day: 2,  label: 'Hostinger VPS',           amount:  -14, kind: 'subscription' },
      { day: 3,  label: 'Shopify Payout',          amount: +312, kind: 'payout' },
      { day: 4,  label: 'Meta Ads',                amount:  -42, kind: 'ads' },
      { day: 5,  label: 'n8n Cloud',               amount:  -20, kind: 'subscription' },
      { day: 6,  label: 'Shopify Payout',          amount: +284, kind: 'payout' },
      { day: 7,  label: 'Meta Ads',                amount:  -38, kind: 'ads' },
      { day: 9,  label: 'Shopify Payout',          amount: +396, kind: 'payout' },
      { day: 10, label: 'Lieferant Schmidt',       amount: -420, kind: 'supplier' },
      { day: 10, label: 'USt-Voranmeldung April',  amount: -312, kind: 'tax' },
      { day: 12, label: 'Shopify Payout',          amount: +218, kind: 'payout' },
      { day: 14, label: 'Meta Ads',                amount:  -52, kind: 'ads' },
      { day: 15, label: 'Shopify Payout',          amount: +340, kind: 'payout' },
      { day: 16, label: 'Versand DHL',             amount:  -86, kind: 'shipping' },
      { day: 18, label: 'Shopify Payout',          amount: +274, kind: 'payout' },
      { day: 20, label: 'Freelance Honorar',       amount: +780, kind: 'income' },
      { day: 22, label: 'Meta Ads',                amount:  -48, kind: 'ads' },
      { day: 23, label: 'Shopify Payout',          amount: +312, kind: 'payout' },
      { day: 26, label: 'Shopify Payout (proj.)',  amount: +290, kind: 'payout',  projected: true },
      { day: 28, label: 'Lieferant Müller',        amount: -280, kind: 'supplier',projected: true },
      { day: 29, label: 'Shopify Payout (proj.)',  amount: +260, kind: 'payout',  projected: true },
      { day: 30, label: 'Versand DHL (proj.)',     amount:  -90, kind: 'shipping',projected: true },
      { day: 31, label: 'Meta Ads (proj.)',        amount: -180, kind: 'ads',     projected: true },
    ],
  },
}
