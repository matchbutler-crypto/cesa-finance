'use client'

import { useState, useEffect, useCallback } from 'react'
import { Coins } from 'lucide-react'

interface CostData {
  today_eur: number
  month_cfo_eur: number
  month_tax_eur: number
  monthly_budget_eur: number
}

function getBarColor(pct: number): string {
  if (pct >= 90) return 'var(--c-danger)'
  if (pct >= 75) return 'var(--c-warning)'
  return 'var(--c-positive)'
}

function fmtEur(val: number) {
  return `€${val.toFixed(2)}`
}

function AgentRow({ label, amount }: { label: string; amount: number }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--c-muted)' }}>
      <span>{label}</span>
      <span style={{ fontFamily: 'var(--font-mono)' }}>{fmtEur(amount)}</span>
    </div>
  )
}

interface ApiCostWidgetProps {
  collapsed?: boolean
}

export function ApiCostWidget({ collapsed = false }: ApiCostWidgetProps) {
  const [data, setData] = useState<CostData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [editingBudget, setEditingBudget] = useState(false)
  const [budgetInput, setBudgetInput] = useState('')
  const [budgetError, setBudgetError] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/api-cost')
      if (!res.ok) throw new Error('fetch failed')
      setData(await res.json())
      setError(false)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    // Refresh every 5 minutes
    const id = setInterval(fetchData, 5 * 60 * 1000)
    return () => clearInterval(id)
  }, [fetchData])

  const monthTotal = data ? data.month_cfo_eur + data.month_tax_eur : 0
  const pct = data && data.monthly_budget_eur > 0
    ? Math.min((monthTotal / data.monthly_budget_eur) * 100, 100)
    : 0
  const barColor = getBarColor(pct)
  const isEmpty = monthTotal === 0

  function startBudgetEdit() {
    if (!data) return
    setBudgetInput(data.monthly_budget_eur.toFixed(2))
    setBudgetError(false)
    setEditingBudget(true)
  }

  async function saveBudget() {
    const val = parseFloat(budgetInput.replace(',', '.'))
    if (isNaN(val) || val <= 0) {
      setBudgetError(true)
      return
    }
    setEditingBudget(false)
    setBudgetError(false)
    setData(prev => prev ? { ...prev, monthly_budget_eur: val } : prev)

    try {
      await fetch('/api/api-cost', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monthly_budget_eur: val }),
      })
    } catch {
      // Optimistic update already applied — log silently
      console.error('Budget save failed')
    }
  }

  if (collapsed) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0', borderTop: '1px solid var(--c-border)' }}>
        <div
          className="cesa-nav__icon-b"
          data-label={loading ? 'Laden…' : error ? 'Fehler' : `${fmtEur(monthTotal)} / Monat`}
          style={{ cursor: 'default' }}
        >
          <Coins size={15} strokeWidth={1.6} color="var(--c-muted)" />
        </div>
      </div>
    )
  }

  return (
    <div style={{ borderTop: '1px solid var(--c-border)', padding: '10px 14px' }}>
      {/* Header */}
      <div style={{
        fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em',
        color: 'var(--c-subtle)', fontFamily: 'var(--font-mono)',
        marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5,
      }}>
        <Coins size={10} strokeWidth={1.6} />
        KI-Kosten
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[60, 80, 40].map(w => (
            <div key={w} style={{ height: 10, width: `${w}%`, background: 'var(--c-surface3)', borderRadius: 3 }} />
          ))}
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div style={{ fontSize: 10.5, color: 'var(--c-danger)', fontFamily: 'var(--font-mono)' }}>
          Verbindungsfehler
        </div>
      )}

      {/* Data loaded */}
      {!loading && !error && data && (
        <>
          {/* Today row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: 'var(--c-muted)', marginBottom: 6 }}>
            <span>Heute</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--c-text)' }}>{fmtEur(data.today_eur)}</span>
          </div>

          {/* Progress bar */}
          <div style={{ marginBottom: 6 }}>
            <div style={{ height: 3, background: 'var(--c-surface3)', borderRadius: 2, marginBottom: 5, overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${pct}%`,
                background: barColor, borderRadius: 2,
                transition: 'width 0.3s ease, background 0.3s ease',
              }} />
            </div>

            {/* Month label + budget editor */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11.5 }}>
              <span style={{ color: 'var(--c-muted)' }}>Monat</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ fontFamily: 'var(--font-mono)', color: barColor }}>{fmtEur(monthTotal)}</span>
                <span style={{ color: 'var(--c-subtle)', fontSize: 10 }}>/</span>
                {editingBudget ? (
                  <input
                    autoFocus
                    value={budgetInput}
                    onChange={e => { setBudgetInput(e.target.value); setBudgetError(false) }}
                    onKeyDown={e => {
                      if (e.key === 'Enter') saveBudget()
                      if (e.key === 'Escape') { setEditingBudget(false); setBudgetError(false) }
                    }}
                    onBlur={saveBudget}
                    style={{
                      width: 52,
                      background: budgetError ? 'rgba(194,107,107,0.12)' : 'var(--c-surface3)',
                      border: `1px solid ${budgetError ? 'var(--c-danger)' : 'var(--c-border)'}`,
                      borderRadius: 'var(--r-sm)', padding: '1px 4px',
                      fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--c-text)',
                      outline: 'none', textAlign: 'right',
                    }}
                  />
                ) : (
                  <button
                    onClick={startBudgetEdit}
                    title="Budget anpassen"
                    style={{
                      background: 'transparent', border: 'none', cursor: 'pointer',
                      fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--c-muted)',
                      padding: '1px 2px', borderRadius: 'var(--r-sm)',
                      textDecoration: 'underline dotted',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--c-text)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--c-muted)')}
                  >
                    {fmtEur(data.monthly_budget_eur)}
                  </button>
                )}
              </div>
            </div>

            {budgetError && (
              <div style={{ fontSize: 10, color: 'var(--c-danger)', marginTop: 2, textAlign: 'right' }}>
                Positiver Betrag erforderlich
              </div>
            )}
          </div>

          {/* Agent breakdown / empty state */}
          {isEmpty ? (
            <div style={{ fontSize: 10.5, color: 'var(--c-subtle)', fontFamily: 'var(--font-mono)', paddingTop: 2, fontStyle: 'italic' }}>
              Noch keine Anfragen diesen Monat
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3, paddingTop: 2 }}>
              <AgentRow label="CFO Agent" amount={data.month_cfo_eur} />
              <AgentRow label="Steuerberater" amount={data.month_tax_eur} />
            </div>
          )}
        </>
      )}
    </div>
  )
}
