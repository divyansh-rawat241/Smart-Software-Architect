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
    <div className="min-h-screen px-4 py-4 md:px-6 xl:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-[1540px] gap-5 lg:grid-cols-[310px,1fr]">
        <aside className="panel-strong grid-fade relative overflow-hidden">
          <div className="absolute -left-20 top-0 h-44 w-44 rounded-full bg-[var(--brand-soft)] blur-3xl" />
          <div className="absolute bottom-0 right-0 h-52 w-52 rounded-full bg-white/10 blur-3xl dark:bg-white/5" />
          <div className="relative flex h-full flex-col gap-6">
            <div>
              <span className="pill">Architecture Atelier</span>
              <h1 className="mt-5 text-5xl leading-none">ArchAI</h1>
              <p className="mt-4 max-w-xs text-sm leading-7 text-muted">
                Create the brief, review the decision, and export the full architecture pack in one workspace.
              </p>
            </div>

            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 rounded-[1.35rem] border border-transparent px-4 py-3 text-sm font-medium transition',
                        isActive
                          ? 'border-[var(--card-border)] bg-[var(--brand-soft)] text-[var(--brand-strong)] shadow-soft'
                          : 'text-muted hover:border-[var(--card-border)] hover:bg-white/10 hover:text-[var(--text)]',
                      )
                    }
                  >
                    <Icon className="size-4" />
                    {item.label}
                  </NavLink>
                )
              })}
            </nav>

            <div className="mt-auto rounded-[1.6rem] border border-[var(--card-border)] bg-black/5 p-4 dark:bg-white/5">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--brand-strong)]">
                Local control
              </p>
              <p className="mt-3 text-sm leading-7 text-muted">
                The frontend, API, diagrams, and exports stay on your machine while you work.
              </p>
            </div>
          </div>
        </aside>

        <div className="panel-strong relative flex flex-col overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-r from-[var(--brand-soft)] via-transparent to-transparent" />
          <header className="relative flex flex-col gap-5 border-b border-[var(--card-border)] pb-6 md:flex-row md:items-start md:justify-between">
            <div className="max-w-3xl">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.34em] text-muted">
                Design room
              </p>
              <h2 className="mt-3 text-[2.65rem] leading-none md:text-[3rem]">
                One brief. Clear outputs.
              </h2>
              <p className="mt-3 text-sm leading-7 text-muted">
                Brief, requirements, architecture, diagrams, and exports stay in sync.
              </p>
            </div>
            <ThemeToggle />
          </header>
          <main className="relative flex-1 overflow-y-auto py-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
