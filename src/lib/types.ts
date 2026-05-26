export interface Account {
  name: string
  kind: 'bank' | 'store' | 'paypal' | 'savings' | 'real'
  balance: number
  change: number
}

export interface Liability {
  name: string
  amount: number
  due: string
}

export interface NetWorth {
  total: number
  delta30d: number
  delta30dPct: number
  accounts: Account[]
  liabilities: Liability[]
  history: number[]
  forecast12m: number[]
}

export interface Forecast {
  target: number
  mtdRevenue: number
  daysElapsed: number
  daysInMonth: number
  dailyRunRate: number
  projectedMonthEnd: number
  daysToTarget: number
  daily: number[]
  lastMonth: number
  twoMonthsAgo: number
}

export interface Ads {
  todaySpend: number
  yesterdaySpend: number
  todayRevenue: number
  yesterdayRevenue: number
  roas: number
  roasYesterday: number
  roasLastWeek: number
  breakEvenRoas: number
  cpm: number
  ctr: number
  cpp: number
  status: 'green' | 'yellow' | 'red'
  spend7d: number[]
  revenue7d: number[]
}

export interface Product {
  sku: string
  name: string
  price: number
  cogs: number
  ads: number
  returns: number
  units: number
  stock: number
  leadTime: number
  revenue: number
  totalCogs: number
  totalAds: number
  totalReturns: number
  profit: number
  margin: number
  dailyRate: number
  daysToStockout: number
}

export type CashflowKind = 'payout' | 'ads' | 'supplier' | 'subscription' | 'rental' | 'income' | 'tax' | 'shipping'

export interface CashflowEntry {
  day: number
  label: string
  amount: number
  kind: CashflowKind
  projected?: boolean
}

export interface Goal {
  id: number
  label: string
  current: number
  target: number
  due: string
  unit: '€' | 'x' | '€/mo'
  kind: 'revenue' | 'roas' | 'savings' | 'passive'
  pace: 'on-track' | 'achieved' | 'behind'
}

export interface Document {
  id: number
  source: 'gmail' | 'upload'
  vendor: string
  amount: number
  date: string
  category: string
  status: 'auto' | 'pending' | 'confirmed'
  subject: string
}

export interface Cashflow {
  startBalance: number
  entries: CashflowEntry[]
  today: number
}

export type ExpenseTopf =
  | 'Arbeitsmittel'
  | 'Fixkosten'
  | 'Logistik'
  | 'Marketing'
  | 'Personal'
  | 'Privat'
  | 'Privat Fixkosten'
  | 'Schulden'
  | 'Steuer'

export type ExpenseBank = 'N26' | 'SPK' | 'TRANSFERWISE' | 'PAYPAL'

export interface Expense {
  id: string
  abgebucht: boolean
  datum: string | null        // ISO date string
  mit_mwst: boolean
  brutto: number | null
  mwst: number | null
  topf: ExpenseTopf | null
  zahlungstyp: string | null  // Überweisung | Lastschrift | Dauerauftrag
  bank: ExpenseBank | null
  kategorie: string | null
  details: string | null
  fix_variabel: 'Fix' | 'Variabel' | null
  dauerauftrag: boolean
  monat: string               // MAI, JUNI, …
  jahr: number
  created_at: string
}

export interface CesaData {
  netWorth: NetWorth
  forecast: Forecast
  ads: Ads
  products: Product[]
  cashflow: Cashflow
}
