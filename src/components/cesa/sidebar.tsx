'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard, TrendingUp, Telescope,
  Package, RefreshCw, FileText,
  Bot, Calculator,
  Target, CalendarDays, BarChart2, BookOpen,
} from 'lucide-react'

const NAV = [
  { section: 'Übersicht', items: [
    { id: 'dashboard',  label: 'Dashboard',     hint: 'Net Worth · Check-in',     href: '/dashboard', Icon: LayoutDashboard },
    { id: 'cashflow',   label: 'Cashflow',       hint: 'Timeline · Engpässe',       href: '/cashflow',  Icon: TrendingUp },
    { id: 'forecast',   label: 'Forecast',       hint: 'Szenarien · Crystal Ball',  href: '/forecast',  Icon: Telescope },
  ]},
  { section: 'Operations', items: [
    { id: 'products',   label: 'Produkte',       hint: 'Profitabilität · Marge',    href: '/products',   Icon: Package },
    { id: 'restocking', label: 'Restocking',     hint: 'Bestand · Reorder',         href: '/restocking', Icon: RefreshCw },
    { id: 'documents',  label: 'Documents',      hint: 'Gmail · Belege',            href: '/documents',  Icon: FileText },
  ]},
  { section: 'Agenten', items: [
    { id: 'cfo',        label: 'CFO',            hint: 'Finanz-Agent',              href: '/cfo',        Icon: Bot },
    { id: 'tax',        label: 'Steuerberater',  hint: 'Steuer-Agent',              href: '/tax',        Icon: Calculator },
  ]},
  { section: 'Planung', items: [
    { id: 'goals',      label: 'Ziele',          hint: 'Goals · Waypoints',         href: '/goals',     Icon: Target },
    { id: 'seasons',    label: 'Saisonkalender', hint: 'BFCM · Weihnachten',        href: '/seasons',   Icon: CalendarDays },
    { id: 'planning',   label: 'Jahresplanung',  hint: 'Soll-Ist · Quartale',       href: '/planning',  Icon: BarChart2 },
    { id: 'reports',    label: 'Reports',        hint: 'Investor · P&L',            href: '/reports',   Icon: BookOpen },
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
                      <item.Icon size={13} style={{ flexShrink: 0, opacity: 0.6 }} />
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

      {collapsed && (
        <nav className="cesa-nav cesa-nav--icons">
          {NAV.map((section, si) => (
            <div key={section.section} className={`cesa-nav__icon-group${si > 0 ? ' cesa-nav__icon-group--sep' : ''}`}>
              {section.items.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`cesa-nav__icon-b ${pathname === item.href ? 'is-active' : ''}`}
                  title={item.label}
                >
                  <item.Icon size={16} />
                </Link>
              ))}
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
