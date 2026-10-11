import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch, ApiError } from '../lib/api'
import type { Brand } from '../lib/types'
import { Modal } from '../components/Modal'

type FormState = { name: string; slug: string; description: string; logo_url: string; is_active: boolean }

const EMPTY: FormState = { name: '', slug: '', description: '', logo_url: '', is_active: true }

export function Brands() {
  const queryClient = useQueryClient()
  const { data } = useQuery({
    queryKey: ['brands'],
    queryFn: () => apiFetch<{ data: Brand[] }>('/admin/brands'),
  })

  const [editing, setEditing] = useState<Brand | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY)
  const [formError, setFormError] = useState<string | null>(null)

  const brands = data?.data ?? []

  function openCreate() {
    setForm(EMPTY)
    setFormError(null)
    setCreating(true)
  }

  function openEdit(brand: Brand) {
    setForm({
      name: brand.name,
      slug: brand.slug,
      description: brand.description ?? '',
      logo_url: brand.logo_url ?? '',
      is_active: brand.is_active,
    })
    setFormError(null)
    setEditing(brand)
  }

  function close() {
    setCreating(false)
    setEditing(null)
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name,
        slug: form.slug,
        description: form.description || null,
        logo_url: form.logo_url || null,
        is_active: form.is_active,
      }
      if (editing) {
        return apiFetch(`/admin/brands/${editing.id}`, { method: 'PUT', body: payload })
      }
      return apiFetch('/admin/brands', { method: 'POST', body: payload })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] })
      close()
    },
    onError: (e) => setFormError(e instanceof ApiError ? e.message : 'Save failed.'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiFetch(`/admin/brands/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['brands'] }),
    onError: (e) => alert(e instanceof ApiError ? e.message : 'Delete failed.'),
  })

  const showModal = creating || editing !== null

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Brands</h1>
        <button
          onClick={openCreate}
          className="rounded-md bg-violet-600 px-3 py-2 text-sm font-medium text-white hover:bg-violet-700"
        >
          New brand
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Slug</th>
              <th className="px-4 py-2">Active</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {brands.map((b) => (
              <tr key={b.id}>
                <td className="px-4 py-2 font-medium">{b.name}</td>
                <td className="px-4 py-2 text-slate-500 dark:text-slate-400">{b.slug}</td>
                <td className="px-4 py-2">{b.is_active ? 'Yes' : 'No'}</td>
                <td className="px-4 py-2 text-right">
                  <button onClick={() => openEdit(b)} className="mr-3 text-violet-600 hover:underline">
                    Edit
                  </button>
                  <button
                    onClick={() => confirm(`Delete "${b.name}"?`) && deleteMutation.mutate(b.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {brands.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                  No brands yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal title={editing ? 'Edit brand' : 'New brand'} onClose={close}>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              saveMutation.mutate()
            }}
            className="space-y-3"
          >
            {formError && <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">{formError}</div>}
            <label className="block">
              <span className="mb-1 block text-sm font-medium">Name</span>
              <input
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium">Slug</span>
              <input
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                required
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium">Logo URL</span>
              <input
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                value={form.logo_url}
                onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium">Description</span>
              <textarea
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              />
              Active
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={close} className="rounded-md px-3 py-2 text-sm text-slate-600 dark:text-slate-300">
                Cancel
              </button>
              <button
                type="submit"
                disabled={saveMutation.isPending}
                className="rounded-md bg-violet-600 px-3 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-60"
              >
                Save
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
