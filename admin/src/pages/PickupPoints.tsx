import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch, ApiError } from '../lib/api'
import type { PickupPoint } from '../lib/types'

export function PickupPoints() {
  const queryClient = useQueryClient()
  const { data } = useQuery({
    queryKey: ['pickup-points'],
    queryFn: () => apiFetch<{ data: PickupPoint[] }>('/admin/pickup-points'),
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: number; is_active: boolean }) =>
      apiFetch(`/admin/pickup-points/${id}`, { method: 'PATCH', body: { is_active } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pickup-points'] }),
    onError: (e) => alert(e instanceof ApiError ? e.message : 'Update failed.'),
  })

  const points = data?.data ?? []

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">Pickup Points</h1>
      <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
        Synced from the sacco delivery partner. You can disable a point locally if it's temporarily unavailable.
      </p>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Town</th>
              <th className="px-4 py-2">Address</th>
              <th className="px-4 py-2">Hours</th>
              <th className="px-4 py-2">Active</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {points.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-2 font-medium">{p.name}</td>
                <td className="px-4 py-2 text-slate-500 dark:text-slate-400">{p.town}</td>
                <td className="px-4 py-2 text-slate-500 dark:text-slate-400">{p.address}</td>
                <td className="px-4 py-2 text-slate-500 dark:text-slate-400">{p.operating_hours}</td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => toggleMutation.mutate({ id: p.id, is_active: !p.is_active })}
                    className={
                      p.is_active
                        ? 'rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                        : 'rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                    }
                  >
                    {p.is_active ? 'Active' : 'Disabled'}
                  </button>
                </td>
              </tr>
            ))}
            {points.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                  No pickup points synced yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
