import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { apiFetch } from '../lib/api'
import type { Order, Paginated } from '../lib/types'
import { formatCents } from '../components/StatCard'

const STATUSES = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled']

export function Orders() {
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')

  const { data } = useQuery({
    queryKey: ['orders', status, search],
    queryFn: () => {
      const params = new URLSearchParams()
      if (status) params.set('status', status)
      if (search) params.set('search', search)
      return apiFetch<Paginated<Order>>(`/admin/orders?${params.toString()}`)
    },
  })

  const orders = data?.data ?? []

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">Orders</h1>

      <div className="mb-4 flex gap-3">
        <select
          className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <input
          className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
          placeholder="Search order number…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
            <tr>
              <th className="px-4 py-2">Order #</th>
              <th className="px-4 py-2">Customer</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Total</th>
              <th className="px-4 py-2">Placed</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {orders.map((o) => (
              <tr key={o.id}>
                <td className="px-4 py-2 font-medium">{o.order_number}</td>
                <td className="px-4 py-2 text-slate-500 dark:text-slate-400">{o.user?.name ?? '—'}</td>
                <td className="px-4 py-2">
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium dark:bg-slate-800">
                    {o.status}
                  </span>
                </td>
                <td className="px-4 py-2">{formatCents(o.total_cents)}</td>
                <td className="px-4 py-2 text-slate-500 dark:text-slate-400">
                  {o.placed_at ? new Date(o.placed_at).toLocaleDateString() : '—'}
                </td>
                <td className="px-4 py-2 text-right">
                  <Link to={`/orders/${o.id}`} className="text-violet-600 hover:underline">
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
