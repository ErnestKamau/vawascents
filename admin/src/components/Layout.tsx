import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import clsx from 'clsx'

const NAV = [
  { to: '/', label: 'Dashboard' },
  { to: '/categories', label: 'Categories' },
  { to: '/brands', label: 'Brands' },
  { to: '/products', label: 'Products' },
  { to: '/orders', label: 'Orders' },
  { to: '/payments', label: 'Payments' },
  { to: '/pickup-points', label: 'Pickup Points' },
]

export function Layout() {
  const { user, logout } = useAuth()

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 border-r border-slate-200 bg-white px-4 py-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-8 px-2 text-lg font-semibold">VawaScents Admin</div>
        <nav className="flex flex-col gap-1">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                clsx(
                  'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3 dark:border-slate-800 dark:bg-slate-900">
          <div />
          <div className="flex items-center gap-3 text-sm">
            <span className="text-slate-500 dark:text-slate-400">{user?.name}</span>
            <button
              onClick={logout}
              className="rounded-md border border-slate-300 px-3 py-1.5 font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Log out
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
