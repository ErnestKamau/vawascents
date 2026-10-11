import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch, ApiError } from '../lib/api'
import type { Category } from '../lib/types'
import { Modal } from '../components/Modal'

type FormState = { name: string; slug: string; description: string; parent_id: string; is_active: boolean }

const EMPTY: FormState = { name: '', slug: '', description: '', parent_id: '', is_active: true }

export function Categories() {
  const queryClient = useQueryClient()
  const { data } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiFetch<{ data: Category[] }>('/admin/categories'),
  })

  const [editing, setEditing] = useState<Category | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY)
  const [formError, setFormError] = useState<string | null>(null)

  const categories = data?.data ?? []

  function openCreate() {
    setForm(EMPTY)
    setFormError(null)
    setCreating(true)
  }

  function openEdit(category: Category) {
    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description ?? '',
      parent_id: category.parent_id ? String(category.parent_id) : '',
      is_active: category.is_active,
    })
    setFormError(null)
    setEditing(category)
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
        parent_id: form.parent_id ? Number(form.parent_id) : null,
        is_active: form.is_active,
      }
      if (editing) {
        return apiFetch(`/admin/categories/${editing.id}`, { method: 'PUT', body: payload })
      }
      return apiFetch('/admin/categories', { method: 'POST', body: payload })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      close()
    },
    onError: (e) => setFormError(e instanceof ApiError ? e.message : 'Save failed.'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiFetch(`/admin/categories/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
    onError: (e) => alert(e instanceof ApiError ? e.message : 'Delete failed.'),
  })

  const showModal = creating || editing !== null

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Categories</h1>
        <button
          onClick={openCreate}
          className="rounded-md bg-violet-600 px-3 py-2 text-sm font-medium text-white hover:bg-violet-700"
        >
          New category
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Slug</th>
              <th className="px-4 py-2">Parent</th>
              <th className="px-4 py-2">Active</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {categories.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-2 font-medium">{c.name}</td>
                <td className="px-4 py-2 text-slate-500 dark:text-slate-400">{c.slug}</td>
                <td className="px-4 py-2 text-slate-500 dark:text-slate-400">
                  {categories.find((p) => p.id === c.parent_id)?.name ?? '—'}
                </td>
                <td className="px-4 py-2">{c.is_active ? 'Yes' : 'No'}</td>
                <td className="px-4 py-2 text-right">
                  <button onClick={() => openEdit(c)} className="mr-3 text-violet-600 hover:underline">
                    Edit
                  </button>
                  <button
                    onClick={() => confirm(`Delete "${c.name}"?`) && deleteMutation.mutate(c.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                  No categories yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal title={editing ? 'Edit category' : 'New category'} onClose={close}>
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
              <span className="mb-1 block text-sm font-medium">Parent category</span>
              <select
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                value={form.parent_id}
                onChange={(e) => setForm({ ...form, parent_id: e.target.value })}
              >
                <option value="">None</option>
                {categories
                  .filter((c) => c.id !== editing?.id)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
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
