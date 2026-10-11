import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '../lib/api'
import type { DashboardData } from '../lib/types'
import { StatCard, formatCents } from '../components/StatCard'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

export function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => apiFetch<{ data: DashboardData }>('/admin/dashboard'),
  })

  if (isLoading || !data) return <div className="text-slate-400">Loading…</div>

  const { revenue_cents, orders_by_status, low_stock_variants, needs_attention } = data.data

  const statusChartData = Object.entries(orders_by_status).map(([status, count]) => ({
    status,
    count,
  }))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-4 text-xl font-semibold">Dashboard</h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Revenue today" value={formatCents(revenue_cents.today)} />
          <StatCard label="Revenue (7 days)" value={formatCents(revenue_cents.last_7_days)} />
          <StatCard label="Revenue (30 days)" value={formatCents(revenue_cents.last_30_days)} />
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-3 text-sm font-semibold text-slate-600 dark:text-slate-300">
          Orders by status
        </h2>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={statusChartData}>
            <XAxis dataKey="status" fontSize={12} />
            <YAxis allowDecimals={false} fontSize={12} />
            <Tooltip />
            <Bar dataKey="count" fill="#7c3aed" radius={4} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-3 text-sm font-semibold text-slate-600 dark:text-slate-300">
            Low stock variants
          </h2>
          {low_stock_variants.length === 0 ? (
            <p className="text-sm text-slate-400">Nothing low on stock.</p>
          ) : (
            <ul className="divide-y divide-slate-100 text-sm dark:divide-slate-800">
              {low_stock_variants.map((v) => (
                <li key={v.id} className="flex justify-between py-2">
                  <span>
                    {v.product.name} — {v.sku}
                  </span>
                  <span className="font-medium text-amber-600 dark:text-amber-400">
                    {v.stock_quantity} left
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-3 text-sm font-semibold text-slate-600 dark:text-slate-300">
            Needs attention
          </h2>
          {needs_attention.length === 0 ? (
            <p className="text-sm text-slate-400">All clear.</p>
          ) : (
            <ul className="divide-y divide-slate-100 text-sm dark:divide-slate-800">
              {needs_attention.map((o) => (
                <li key={o.id} className="flex justify-between py-2">
                  <span>{o.order_number}</span>
                  <span className="text-slate-500 dark:text-slate-400">{o.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
