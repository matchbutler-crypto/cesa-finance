import { describe, it, expect } from 'vitest'
import { fmtEur, fmtNum, fmtPct, fmtDate } from './formatters'

describe('fmtEur', () => {
  it('formats positive number without sign', () => {
    expect(fmtEur(1234)).toBe('€1.234')
  })
  it('formats negative number with minus sign', () => {
    expect(fmtEur(-280)).toBe('−€280')
  })
  it('formats with sign option for positive', () => {
    expect(fmtEur(1240, { sign: true })).toBe('+€1.240')
  })
  it('formats with sign option for negative', () => {
    expect(fmtEur(-142, { sign: true })).toBe('−€142')
  })
  it('returns em dash for null/undefined', () => {
    expect(fmtEur(null as unknown as number)).toBe('—')
  })
  it('formats with decimals', () => {
    expect(fmtEur(18.5, { decimals: 2 })).toBe('€18,50')
  })
})

describe('fmtNum', () => {
  it('formats integer', () => {
    expect(fmtNum(2847)).toBe('2.847')
  })
  it('formats with suffix', () => {
    expect(fmtNum(2.85, { decimals: 2, suffix: 'x' })).toBe('2,85x')
  })
})

describe('fmtPct', () => {
  it('formats percentage', () => {
    expect(fmtPct(7.2)).toBe('7,2%')
  })
  it('formats with sign for positive', () => {
    expect(fmtPct(7.2, { sign: true })).toBe('+7,2%')
  })
  it('formats with sign for negative', () => {
    expect(fmtPct(-3.1, { sign: true })).toBe('-3,1%')
  })
})

describe('fmtDate', () => {
  it('formats ISO date string', () => {
    expect(fmtDate('2026-05-28')).toMatch(/28\. Mai/)
  })
  it('returns em dash for null', () => {
    expect(fmtDate(null)).toBe('—')
  })
})
