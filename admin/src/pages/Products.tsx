import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch, ApiError } from '../lib/api'
import type { Brand, Category, Paginated, Product, ProductVariant } from '../lib/types'
import { Modal } from '../components/Modal'
import { formatCents } from '../components/StatCard'

type FormState = {
  brand_id: string
  category_id: string
  name: string
  slug: string
  description: string
  gender: 'men' | 'women' | 'unisex'
  thumbnail_url: string
  is_active: boolean
  variants: ProductVariant[]
}

const EMPTY_VARIANT: ProductVariant = { sku: '', volume_ml: 50, price_cents: 0, stock_quantity: 0 }

function emptyForm(): FormState {
  return {
    brand_id: '',
    category_id: '',
    name: '',
    slug: '',
    description: '',
    gender: 'unisex',
    thumbnail_url: '',
    is_active: true,
    variants: [{ ...EMPTY_VARIANT }],
  }
}

export function Products() {
  const queryClient = useQueryClient()

  const { data } = useQuery({
    queryKey: ['products'],
    queryFn: () => apiFetch<Paginated<Product>>('/admin/products'),
  })
  const { data: brandsData } = useQuery({
    queryKey: ['brands'],
    queryFn: () => apiFetch<{ data: Brand[] }>('/admin/brands'),
  })
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiFetch<{ data: Category[] }>('/admin/categories'),
  })

  const products = data?.data ?? []
  const brands = brandsData?.data ?? []
  const categories = categoriesData?.data ?? []

  const [editing, setEditing] = useState<Product | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm())
  const [formError, setFormError] = useState<string | null>(null)

  function openCreate() {
    setForm(emptyForm())
    setFormError(null)
    setCreating(true)
  }

  function openEdit(product: Product) {
    setForm({
      brand_id: String(product.brand_id),
      category_id: String(product.category_id),
      name: product.name,
      slug: product.slug,
      description: product.description ?? '',
      gender: product.gender,
      thumbnail_url: product.thumbnail_url ?? '',
      is_active: product.is_active,
      variants: product.variants.map((v) => ({ ...v })),
    })
    setFormError(null)
    setEditing(product)
  }

  function close() {
    setCreating(false)
    setEditing(null)
  }

  function updateVariant(index: number, patch: Partial<ProductVariant>) {
    setForm((f) => ({
      ...f,
      variants: f.variants.map((v, i) => (i === index ? { ...v, ...patch } : v)),
    }))
  }

  function addVariant() {
    setForm((f) => ({ ...f, variants: [...f.variants, { ...EMPTY_VARIANT }] }))
  }

  function removeVariant(index: number) {
    setForm((f) => ({ ...f, variants: f.variants.filter((_, i) => i !== index) }))
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        brand_id: Number(form.brand_id),
        category_id: Number(form.category_id),
        name: form.name,
        slug: form.slug,
        description: form.description || null,
        gender: form.gender,
        thumbnail_url: form.thumbnail_url || null,
        is_active: form.is_active,
        variants: form.variants.map((v) => ({
          ...(v.id ? { id: v.id } : {}),
          sku: v.sku,
          volume_ml: Number(v.volume_ml),
          price_cents: Number(v.price_cents),
          stock_quantity: Number(v.stock_quantity),
        })),
      }
      if (editing) {
        return apiFetch(`/admin/products/${editing.id}`, { method: 'PUT', body: payload })
      }
      return apiFetch('/admin/products', { method: 'POST', body: payload })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      close()
    },
    onError: (e) => setFormError(e instanceof ApiError ? e.message : 'Save failed.'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiFetch(`/admin/products/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
    onError: (e) => alert(e instanceof ApiError ? e.message : 'Delete failed.'),
  })

  const showModal = creating || editing !== null

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Products</h1>
        <button
          onClick={openCreate}
          className="rounded-md bg-violet-600 px-3 py-2 text-sm font-medium text-white hover:bg-violet-700"
        >
          New product
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Brand</th>
              <th className="px-4 py-2">Category</th>
              <th className="px-4 py-2">Variants</th>
              <th className="px-4 py-2">Active</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {products.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-2 font-medium">{p.name}</td>
                <td className="px-4 py-2 text-slate-500 dark:text-slate-400">{p.brand?.name}</td>
                <td className="px-4 py-2 text-slate-500 dark:text-slate-400">{p.category?.name}</td>
                <td className="px-4 py-2 text-slate-500 dark:text-slate-400">
                  {p.variants.length} ({p.variants.map((v) => formatCents(v.price_cents)).join(', ')})
                </td>
                <td className="px-4 py-2">{p.is_active ? 'Yes' : 'No'}</td>
                <td className="px-4 py-2 text-right">
                  <button onClick={() => openEdit(p)} className="mr-3 text-violet-600 hover:underline">
                    Edit
                  </button>
                  <button
                    onClick={() => confirm(`Delete "${p.name}"?`) && deleteMutation.mutate(p.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                  No products yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal title={editing ? 'Edit product' : 'New product'} onClose={close}>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              saveMutation.mutate()
            }}
            className="max-h-[70vh] space-y-3 overflow-y-auto pr-1"
          >
            {formError && (
              <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
                {formError}
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1 block text-sm font-medium">Brand</span>
                <select
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                  value={form.brand_id}
                  onChange={(e) => setForm({ ...form, brand_id: e.target.value })}
                  required
                >
                  <option value="" disabled>
                    Select…
                  </option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium">Category</span>
                <select
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                  value={form.category_id}
                  onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                  required
                >
                  <option value="" disabled>
                    Select…
                  </option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="block">
              <span className="mb-1 block text-sm font-medium">Name</span>
              <input
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
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
                <span className="mb-1 block text-sm font-medium">Gender</span>
                <select
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value as FormState['gender'] })}
                >
                  <option value="unisex">Unisex</option>
                  <option value="men">Men</option>
                  <option value="women">Women</option>
                </select>
              </label>
            </div>
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

            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium">Variants</span>
                <button
                  type="button"
                  onClick={addVariant}
                  className="text-sm text-violet-600 hover:underline"
                >
                  + Add variant
                </button>
              </div>
              <div className="space-y-2">
                {form.variants.map((v, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 rounded-md border border-slate-200 p-2 dark:border-slate-700">
                    <input
                      className="col-span-4 rounded-md border border-slate-300 px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-800"
                      placeholder="SKU"
                      value={v.sku}
                      onChange={(e) => updateVariant(i, { sku: e.target.value })}
                      required
                    />
                    <input
                      type="number"
                      className="col-span-2 rounded-md border border-slate-300 px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-800"
                      placeholder="ml"
                      value={v.volume_ml}
                      onChange={(e) => updateVariant(i, { volume_ml: Number(e.target.value) })}
                      required
                    />
                    <input
                      type="number"
                      className="col-span-2 rounded-md border border-slate-300 px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-800"
                      placeholder="Price (cents)"
                      value={v.price_cents}
                      onChange={(e) => updateVariant(i, { price_cents: Number(e.target.value) })}
                      required
                    />
                    <input
                      type="number"
                      className="col-span-2 rounded-md border border-slate-300 px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-800"
                      placeholder="Stock"
                      value={v.stock_quantity}
                      onChange={(e) => updateVariant(i, { stock_quantity: Number(e.target.value) })}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => removeVariant(i)}
                      disabled={form.variants.length === 1}
                      className="col-span-2 text-xs text-red-600 hover:underline disabled:opacity-40"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

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
