'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const NAV = [
  { section: 'Übersicht', items: [
    { id: 'dashboard',  label: 'Dashboard',     hint: 'Net Worth · Check-in', href: '/dashboard' },
    { id: 'cashflow',   label: 'Cashflow',       hint: 'Timeline · Engpässe', href: '/cashflow' },
    { id: 'forecast',   label: 'Forecast',       hint: 'Szenarien · Crystal Ball', href: '/forecast' },
  ]},
  { section: 'Operations', items: [
    { id: 'products',   label: 'Produkte',       hint: 'Profitabilität · Marge', href: '/products' },
    { id: 'restocking', label: 'Restocking',     hint: 'Bestand · Reorder', href: '/restocking' },
    { id: 'documents',  label: 'Documents',      hint: 'Gmail · Belege', href: '/documents' },
  ]},
  { section: 'Agenten', items: [
    { id: 'cfo',        label: 'CFO',            hint: 'Finanz-Agent', href: '/cfo' },
    { id: 'tax',        label: 'Steuerberater',  hint: 'Steuer-Agent', href: '/tax' },
  ]},
  { section: 'Planung', items: [
    { id: 'goals',      label: 'Ziele',          hint: 'Goals · Waypoints', href: '/goals' },
    { id: 'seasons',    label: 'Saisonkalender', hint: 'BFCM · Weihnachten', href: '/seasons' },
    { id: 'planning',   label: 'Jahresplanung',  hint: 'Soll-Ist · Quartale', href: '/planning' },
    { id: 'reports',    label: 'Reports',        hint: 'Investor · P&L', href: '/reports' },
  ]},
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside className="cesa-sidebar" data-collapsed={collapsed ? '' : undefined}>
      <div className="cesa-sidebar__brand">
        {!collapsed && (
          <div className="cesa-brand">
            <div className="cesa-brand__mark">C</div>
            <div>
              <div className="cesa-brand__name">CESA Financial OS</div>
              <div className="cesa-brand__sub cesa-muted">cesaclothing.myshopify.com</div>
            </div>
          </div>
        )}
        {collapsed && <div className="cesa-brand__mark">C</div>}
        <button
          className="cesa-sidebar__toggle"
          onClick={() => setCollapsed(c => !c)}
          title={collapsed ? 'Seitenleiste öffnen' : 'Seitenleiste schließen'}
        >
          {collapsed ? '›' : '‹'}
        </button>
      </div>

      {!collapsed && (
        <nav className="cesa-nav">
          {NAV.map((section) => (
            <div key={section.section} className="cesa-nav__section">
              <div className="cesa-nav__hd">{section.section}</div>
              <ul>
                {section.items.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      className={`cesa-nav__b ${pathname === item.href ? 'is-active' : ''}`}
                    >
                      <span className="cesa-nav__lbl">{item.label}</span>
                      <span className="cesa-nav__hint">{item.hint}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      )}

      {!collapsed && (
        <div className="cesa-sidebar__foot">
          <div className="cesa-userchip">
            <div className="cesa-userchip__avatar">E</div>
            <div>
              <div className="cesa-userchip__name">Easy</div>
              <div className="cesa-userchip__sub">Owner · Mai 2026</div>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
