import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Plus, Pencil, Trash2, Box, Search } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { usedMaterialIds } from '../lib/usageCheck'
import { useCompany } from '../hooks/useCompany'
import { useLanguage } from '../hooks/useLanguage'
import { toast } from '../components/ui/Toast'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import NumberInput from '../components/ui/NumberInput'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import Pagination from '../components/ui/Pagination'
import { countMaterials } from '../utils/pluralize'
import { PageHeader } from '../components/ui/PageHeader'
import type { Material } from '../types/database'

const PAGE_SIZE = 20
const CATEGORIES = ['steel', 'aluminium', 'stainless', 'plastic', 'other'] as const

interface Form { name: string; category: string; density: number | null; price_per_kg: number | null; is_active: boolean }
const empty: Form = { name: '', category: '', density: null, price_per_kg: null, is_active: true }

export default function MaterialsPage() {
  const { company, hasPerm, loading: permLoading } = useCompany()
  const canEdit = hasPerm('materials', 'create')
  const { t, lang } = useLanguage()
  const s = t.qp
  const [rows, setRows] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Material | null>(null)
  const [form, setForm] = useState<Form>(empty)
  const [saving, setSaving] = useState(false)
  const [toDelete, setToDelete] = useState<Material | null>(null)
  const [used, setUsed] = useState<Set<string>>(new Set())
  const [page, setPage] = useState(1)
  const [catFilter, setCatFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')

  useEffect(() => { if (company) load() }, [company])
  async function load() {
    if (!company) return
    setLoading(true)
    const { data } = await supabase.from('materials').select('*').eq('company_id', company.id).order('name')
    setRows((data as Material[]) ?? [])
    setUsed(await usedMaterialIds())
    setLoading(false)
  }
  function openNew() { setEditing(null); setForm(empty); setOpen(true) }
  function openEdit(m: Material) {
    setEditing(m)
    setForm({ name: m.name, category: m.category ?? '', density: m.density, price_per_kg: m.price_per_kg, is_active: m.is_active })
    setOpen(true)
  }
  async function save() {
    if (!company || !form.name.trim()) return
    setSaving(true)
    const payload = {
      name: form.name.trim(), category: form.category || null,
      density: form.density ?? 0, price_per_kg: form.price_per_kg ?? 0,
      is_active: form.is_active,
    }
    const { error } = editing
      ? await supabase.from('materials').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', editing.id)
      : await supabase.from('materials').insert({ ...payload, company_id: company.id })
    setSaving(false)
    if (error) { toast.error(error.message); return }
    toast.success(t.common.saved); setOpen(false); load()
  }
  async function doDelete() {
    if (!toDelete) return
    if (used.has(toDelete.id)) { toast.error(s.cannotDeleteLinked); setToDelete(null); return }
    const { error } = await supabase.from('materials').delete().eq('id', toDelete.id)
    if (error) { toast.error(error.message); return }
    toast.success(t.common.deleted); setToDelete(null); load()
  }

  const cur = company?.currency ?? 'EUR'
  const money = (n: number) => n.toLocaleString('de-DE', { style: 'currency', currency: cur, maximumFractionDigits: 4 })
  const filtered = rows.filter(m =>
    (!search || m.name.toLowerCase().includes(search.toLowerCase())) &&
    (!catFilter || m.category === catFilter) &&
    (statusFilter === 'all' || (statusFilter === 'active' ? m.is_active : !m.is_active))
  )
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  if (!permLoading && !hasPerm('materials', 'view')) return <Navigate to="/dashboard" replace />

  return (
    <div>
      <PageHeader title={s.materials} action={canEdit && <Button onClick={openNew} className="gap-2"><Plus className="w-4 h-4" />{s.newMaterial}</Button>} />
      <div className="p-4 lg:p-6">
      <p className="text-gray-500 text-sm mb-4">{countMaterials(lang, rows.length)}</p>
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-900 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder={t.common.search}
            className="pl-9 pr-3 py-1 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-56" />
        </div>
        <select value={catFilter} onChange={e => { setCatFilter(e.target.value); setPage(1) }}
          className="rounded-lg border border-gray-200 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
          <option value="">{s.category}: {t.common.all}</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{s.matCat[c]}</option>)}
        </select>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value as typeof statusFilter); setPage(1) }}
          className="rounded-lg border border-gray-200 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
          <option value="all">{t.common.status}: {t.common.all}</option>
          <option value="active">{t.common.activeM}</option>
          <option value="inactive">{t.common.inactiveM}</option>
        </select>
      </div>

      <div className="-mx-4 lg:-mx-6 border-t border-b border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center h-40"><div className="animate-spin rounded-full h-7 w-7 border-b-2 border-blue-600" /></div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center"><Box className="w-9 h-9 text-gray-200 mb-2" /><p className="text-sm text-gray-400">{s.noMaterials}</p></div>
        ) : (
          <div className="overflow-x-auto"><table className="w-full text-sm min-w-[560px]">
            <thead className="bg-gray-50 border-b border-gray-200"><tr>
              {[s.materialName, s.category, s.density, s.pricePerKg, t.common.status, ''].map((h, i) => (
                <th key={i} className="text-left px-4 py-2.5 text-xs font-medium text-gray-500">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-gray-200">
              {paginated.map(m => (
                <tr key={m.id} className={`hover:bg-gray-50 ${canEdit ? 'cursor-pointer' : ''}`} onClick={() => canEdit && openEdit(m)}>
                  <td className="px-4 py-2.5 font-medium text-gray-900">{m.name}</td>
                  <td className="px-4 py-2.5 text-gray-600">{m.category ? s.matCat[m.category as keyof typeof s.matCat] ?? m.category : '—'}</td>
                  <td className="px-4 py-2.5 text-gray-600">{m.density} {s.units.gcm3}</td>
                  <td className="px-4 py-2.5 text-gray-700">{money(m.price_per_kg)} {s.units.perKg}</td>
                  <td className="px-4 py-2.5"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${m.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{m.is_active ? t.common.active : t.common.inactive}</span></td>
                  <td className="px-4 py-2.5" onClick={e => e.stopPropagation()}>
                    <div className="flex gap-1 justify-end">
                      {canEdit && <button onClick={() => openEdit(m)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Pencil className="w-3.5 h-3.5" /></button>}
                      {canEdit && !used.has(m.id) && <button onClick={() => setToDelete(m)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </div>

      <Pagination total={filtered.length} page={page} pageSize={PAGE_SIZE} onChange={setPage} />

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? s.editMaterial : s.newMaterial} size="md">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2"><Input id="m-name" label={s.materialName} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">{s.category}</label>
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              <option value="">—</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{s.matCat[c]}</option>)}
            </select>
          </div>
          <NumberInput label={s.density} unit={s.units.gcm3} value={form.density} onValue={v => setForm(f => ({ ...f, density: v }))} />
          <NumberInput label={s.pricePerKg} unit={`${(company?.currency ?? 'EUR')} ${s.units.perKg}`} value={form.price_per_kg} onValue={v => setForm(f => ({ ...f, price_per_kg: v }))} />
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-700 mt-4">
          <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
            className="rounded border-gray-200 text-blue-600 focus:ring-blue-500" />{t.common.active}
        </label>
        <div className="flex gap-3 justify-end mt-5">
          <Button variant="secondary" onClick={() => setOpen(false)}>{t.common.cancel}</Button>
          <Button loading={saving} onClick={save} disabled={!form.name.trim()}>{t.common.save}</Button>
        </div>
      </Modal>

      <ConfirmDialog open={!!toDelete} onClose={() => setToDelete(null)} onConfirm={doDelete}
        title={s.deleteMaterial} message={s.deleteMaterialConfirm} confirmLabel={t.common.delete} danger />
    </div>
    </div>
  )
}
