export function fmtEur(n: number | null | undefined, opts: { sign?: boolean; decimals?: number } = {}): string {
  const { sign = false, decimals = 0 } = opts
  if (n == null || isNaN(n)) return '—'
  const abs = Math.abs(n)
  const s = abs.toLocaleString('de-DE', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
  const prefix = sign ? (n > 0 ? '+' : n < 0 ? '−' : '') : (n < 0 ? '−' : '')
  return `${prefix}€${s}`
}

export function fmtNum(n: number | null | undefined, opts: { decimals?: number; suffix?: string } = {}): string {
  const { decimals = 0, suffix = '' } = opts
  if (n == null || isNaN(n)) return '—'
  return n.toLocaleString('de-DE', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix
}

export function fmtPct(n: number | null | undefined, opts: { decimals?: number; sign?: boolean } = {}): string {
  const { decimals = 1, sign = false } = opts
  if (n == null || isNaN(n)) return '—'
  const v = n.toLocaleString('de-DE', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
  return (sign && n > 0 ? '+' : '') + v + '%'
}

export function fmtDate(d: string | Date | null | undefined): string {
  if (!d) return '—'
  const date = typeof d === 'string' ? new Date(d) : d
  return date.toLocaleDateString('de-DE', { day: '2-digit', month: 'long' })
}
