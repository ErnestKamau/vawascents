import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch, ApiError } from '../lib/api'
import type { Paginated, Payment } from '../lib/types'
import { formatCents } from '../components/StatCard'

const STATUSES = ['pending', 'completed', 'failed', 'refunded']

export function Payments() {
  const [status, setStatus] = useState('')
  const queryClient = useQueryClient()

  const { data } = useQuery({
    queryKey: ['payments', status],
    queryFn: () => {
      const params = new URLSearchParams()
      if (status) params.set('status', status)
      return apiFetch<Paginated<Payment>>(`/admin/payments?${params.toString()}`)
    },
  })

  const refundMutation = useMutation({
    mutationFn: (id: number) => apiFetch(`/admin/payments/${id}/refund`, { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payments'] }),
    onError: (e) => alert(e instanceof ApiError ? e.message : 'Refund failed.'),
  })

  const payments = data?.data ?? []

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">Payments</h1>

      <div className="mb-4">
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
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
            <tr>
              <th className="px-4 py-2">Order</th>
              <th className="px-4 py-2">Method</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Amount</th>
              <th className="px-4 py-2">Reference</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {payments.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-2 font-medium">{p.order?.order_number}</td>
                <td className="px-4 py-2 text-slate-500 dark:text-slate-400">{p.method}</td>
                <td className="px-4 py-2">{p.status}</td>
                <td className="px-4 py-2">{formatCents(p.amount_cents)}</td>
                <td className="px-4 py-2 text-slate-500 dark:text-slate-400">{p.transaction_reference}</td>
                <td className="px-4 py-2 text-right">
                  {p.status === 'completed' && (
                    <button
                      onClick={() => confirm('Mark this payment as refunded?') && refundMutation.mutate(p.id)}
                      className="text-red-600 hover:underline"
                    >
                      Refund
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                  No payments found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
