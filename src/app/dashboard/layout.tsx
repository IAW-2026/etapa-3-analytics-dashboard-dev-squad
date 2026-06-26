'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUser, useClerk } from "@clerk/nextjs";
import { useState } from 'react'
import {
  LayoutDashboard,
  BarChart3,
  TrendingUp,
  ShoppingBag,
  Sun,
  Moon,
  Menu,
  X,
  ChevronLeft,
  Truck,
  CreditCard,
  PieChart,
  LogOut
} from 'lucide-react'
import { useTheme } from '../../components/theme-provider'

const NAV_ITEMS = [
  {
    href: '/dashboard/general',
    label: 'Datos Generales',
    icon: PieChart,
  },
  {
    href: '/dashboard',
    label: 'Órdenes',
    icon: LayoutDashboard,
  },
  {
    href: '/dashboard/analytics',
    label: 'Feedback',
    icon: BarChart3,
  },
  { href: '/dashboard/seller',    label: 'Seller App', icon: ShoppingBag },
  { 
    href: '/dashboard/shipping',
    label: 'Envíos', 
    icon: Truck 
  },
  {
    href: '/dashboard/payments',
    label: 'Pagos',
    icon: CreditCard,
  },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user } = useUser();
  const { signOut } = useClerk();

  return (
    <div className="flex h-screen bg-[var(--background)] overflow-hidden">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          flex flex-col bg-[var(--sidebar-bg)] border-r border-[var(--sidebar-border)]
          transition-all duration-200 ease-in-out
          lg:h-screen
          ${collapsed ? 'w-16' : 'w-56'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo / collapse */}
        <div className="flex items-center h-14 px-3 border-b border-[var(--sidebar-border)] gap-2">
          {!collapsed && (
            <Link href="/" className="flex items-center gap-2 min-w-0">
              <TrendingUp className="w-5 h-5 text-blue-600 shrink-0" />
              <span className="text-sm font-bold text-[var(--sidebar-fg)] truncate">
                Analytics
              </span>
            </Link>
          )}
          {collapsed && (
            <Link href="/" className="mx-auto">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </Link>
          )}
          <button
            onClick={() => { setCollapsed(!collapsed); setMobileOpen(false) }}
            className="hidden lg:flex ml-auto p-1 rounded-lg hover:bg-[var(--sidebar-muted-hover)] text-[var(--sidebar-fg)] cursor-pointer"
            title={collapsed ? 'Expandir' : 'Contraer'}
          >
            <ChevronLeft className={`w-4 h-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
          </button>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden ml-auto p-1 rounded-lg hover:bg-[var(--sidebar-muted-hover)] text-[var(--sidebar-fg)] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="px-2 pt-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${active
                    ? 'bg-blue-600 text-white'
                    : 'text-[var(--sidebar-fg)] hover:bg-[var(--sidebar-muted-hover)]'
                  }
                `}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Theme toggle at bottom */}
        <div className="mt-auto px-2 py-3 border-t border-[var(--sidebar-border)]">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-[var(--sidebar-fg)] hover:bg-[var(--sidebar-muted-hover)] cursor-pointer"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 shrink-0" />
            ) : (
              <Moon className="w-5 h-5 shrink-0" />
            )}
            {!collapsed && <span>{theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}</span>}
          </button>
        </div>

        {/* Usuario */}
          <div className="px-2 py-3 border-t border-[var(--sidebar-border)]">
            {user && (
                <div className="flex items-center gap-3 px-3 mb-3">
                  <img
                    src={user.imageUrl}
                    alt={user.fullName ?? "Usuario"}
                    className="w-5 h-5 rounded-full shrink-0"
                  />

                  {!collapsed && (
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[var(--sidebar-fg)] truncate">
                        {user.fullName || user.firstName}
                      </p>
                      <p className="text-xs opacity-60 text-[var(--sidebar-fg)] truncate">
                        {user.primaryEmailAddress?.emailAddress}
                      </p>
                    </div>
                  )}
                </div>
              )}

            <button
              onClick={() => signOut({ redirectUrl: "/sign-in" })}
              className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-[var(--sidebar-fg)] hover:bg-[var(--sidebar-muted-hover)] cursor-pointer"
            >
              <LogOut className="w-5 h-5 shrink-0" />
              {!collapsed && <span>Cerrar sesión</span>}
            </button>
          </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center h-14 px-4 border-b border-[var(--border)] bg-[var(--background)] gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-1 rounded-lg hover:bg-[var(--muted-hover)] text-[var(--foreground)] cursor-pointer"
          >
            <Menu className="w-6 h-6" />
          </button>
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-bold text-[var(--foreground)]">Analytics</span>
        </div>

        {children}
      </div>
    </div>
  )
}