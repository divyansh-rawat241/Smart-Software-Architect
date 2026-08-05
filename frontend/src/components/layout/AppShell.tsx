import {
  BarChart3,
  ClipboardList,
  FileText,
  Home,
  Image,
  LayoutDashboard,
  Network,
  Settings,
} from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { cn } from '../../lib/utils'
import { ThemeToggle } from './ThemeToggle'

const navItems = [
  { to: '/', label: 'Overview', icon: Home },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/wizard', label: 'Requirements', icon: ClipboardList },
  { to: '/architecture', label: 'Architecture', icon: Network },
  { to: '/comparison', label: 'Comparison', icon: BarChart3 },
  { to: '/diagrams', label: 'Diagrams', icon: Image },
  { to: '/docs', label: 'Report', icon: FileText },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function AppShell() {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-56 shrink-0 border-r p-4 lg:block" style={{ borderColor: 'var(--card-border)', background: 'var(--surface)' }}>
        <div className="mb-6">
          <h1 className="text-lg font-bold" style={{ color: 'var(--brand)' }}>ArchAI</h1>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition',
                    isActive
                      ? 'text-amber-700 dark:text-amber-400'
                      : 'hover:bg-black/5 dark:hover:bg-white/5',
                  )
                }
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            )
          })}
        </nav>

        <div className="mt-auto pt-6 text-xs" style={{ color: 'var(--text-muted)' }}>
          Local development mode
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b px-6 py-3" style={{ borderColor: 'var(--card-border)', background: 'var(--surface)' }}>
          <div className="lg:hidden">
            <h1 className="text-lg font-bold" style={{ color: 'var(--brand)' }}>ArchAI</h1>
          </div>
          <div className="hidden lg:block">
            <h2 className="text-base font-semibold">Design room</h2>
          </div>
          <ThemeToggle />
        </header>

        <div className="flex lg:hidden">
          <nav className="flex gap-1 overflow-x-auto px-4 py-2">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition',
                      isActive
                        ? 'text-amber-700 dark:text-amber-400'
                        : 'hover:bg-black/5 dark:hover:bg-white/5',
                    )
                  }
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </NavLink>
              )
            })}
          </nav>
        </div>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
