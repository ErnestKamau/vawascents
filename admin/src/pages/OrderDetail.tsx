import { useParams, Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch, ApiError } from '../lib/api'
import type { Order } from '../lib/types'
import { formatCents } from '../components/StatCard'

const NEXT_STATUS: Record<string, string[]> = {
  pending: ['cancelled'],
  paid: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
}

export function OrderDetail() {
  const { id } = useParams()
  const queryClient = useQueryClient()

  const { data } = useQuery({
    queryKey: ['order', id],
    queryFn: () => apiFetch<{ data: Order }>(`/admin/orders/${id}`),
  })

  const statusMutation = useMutation({
    mutationFn: (status: string) =>
      apiFetch(`/admin/orders/${id}/status`, { method: 'PATCH', body: { status } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', id] })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
    onError: (e) => alert(e instanceof ApiError ? e.message : 'Could not update status.'),
  })

  if (!data) return <div className="text-slate-400">Loading…</div>

  const order = data.data
  const nextOptions = NEXT_STATUS[order.status] ?? []

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <Link to="/orders" className="text-sm text-violet-600 hover:underline">
          ← Back to orders
        </Link>
        <h1 className="mt-2 text-xl font-semibold">{order.order_number}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {order.user?.name} · {order.user?.email}
        </p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Status</span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium dark:bg-slate-800">
            {order.status}
          </span>
        </div>
        {nextOptions.length > 0 && (
          <div className="flex gap-2">
            {nextOptions.map((next) => (
              <button
                key={next}
                onClick={() => statusMutation.mutate(next)}
                disabled={statusMutation.isPending}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-100 disabled:opacity-60 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                Mark {next}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-3 text-sm font-semibold text-slate-600 dark:text-slate-300">Items</h2>
        <table className="w-full text-left text-sm">
          <thead className="text-slate-500 dark:text-slate-400">
            <tr>
              <th className="py-1">Product</th>
              <th className="py-1">SKU</th>
              <th className="py-1">Qty</th>
              <th className="py-1">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {order.items?.map((item) => (
              <tr key={item.id}>
                <td className="py-1.5">{item.product_name}</td>
                <td className="py-1.5 text-slate-500 dark:text-slate-400">{item.sku}</td>
                <td className="py-1.5">{item.quantity}</td>
                <td className="py-1.5">{formatCents(item.subtotal_cents)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-3 flex justify-end text-sm font-semibold">
          Total: {formatCents(order.total_cents)}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-2 text-sm font-semibold text-slate-600 dark:text-slate-300">Payment</h2>
          {order.payment ? (
            <div className="text-sm">
              <p>Method: {order.payment.method}</p>
              <p>Status: {order.payment.status}</p>
              <p>Amount: {formatCents(order.payment.amount_cents)}</p>
            </div>
          ) : (
            <p className="text-sm text-slate-400">No payment recorded.</p>
          )}
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-2 text-sm font-semibold text-slate-600 dark:text-slate-300">Delivery</h2>
          {order.delivery ? (
            <div className="text-sm">
              <p>Pickup point: {order.delivery.pickup_point?.name ?? '—'}</p>
              <p>Status: {order.delivery.status}</p>
              {order.delivery.status_events && order.delivery.status_events.length > 0 && (
                <ul className="mt-2 space-y-1 text-xs text-slate-500 dark:text-slate-400">
                  {order.delivery.status_events.map((ev) => (
                    <li key={ev.id}>
                      {new Date(ev.occurred_at).toLocaleString()} — {ev.status}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <p className="text-sm text-slate-400">No delivery booked yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}
