import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Plus, Box, Search, CalendarDays, MoreVertical } from 'lucide-react'
import { SortIcon } from '../components/ui/SortIcon'
import { format } from 'date-fns'
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
import { PageHeader } from '../components/ui/PageHeader'
import { FilterSelect } from '../components/ui/FilterSelect'
import { PersonBadge } from '../components/ui/PersonBadge'
import type { Material } from '../types/database'

const PAGE_SIZE = 20
const CATEGORIES = ['steel', 'aluminium', 'stainless', 'plastic', 'other'] as const

interface Form { name: string; category: string; density: number | null; price_per_kg: number | null; is_active: boolean }
const empty: Form = { name: '', category: '', density: null, price_per_kg: null, is_active: true }

export default function MaterialsPage() {
  const { company, hasPerm, loading: permLoading } = useCompany()
  const canEdit = hasPerm('materials', 'create')
  const { t } = useLanguage()
  const s = t.qp
  type Row = Material & { editor: { first_name: string; last_name: string } | null }
  const [rows, setRows] = useState<Row[]>([])
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
  const [sortKey, setSortKey] = useState<'name' | 'category' | 'density' | 'price_per_kg' | 'is_active'>('name')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  function handleSort(k: typeof sortKey) { setSortKey(k); setSortDir(d => k === sortKey ? (d === 'asc' ? 'desc' : 'asc') : 'asc'); setPage(1) }

  useEffect(() => { if (company) load() }, [company])
  async function load() {
    if (!company) return
    setLoading(true)
    const { data } = await supabase.from('materials').select('*, editor:users!updated_by(first_name, last_name)').eq('company_id', company.id).order('name')
    setRows((data as Row[]) ?? [])
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
  const sorted = [...filtered].sort((a, b) => {
    const mul = sortDir === 'asc' ? 1 : -1
    if (sortKey === 'name') return a.name.localeCompare(b.name) * mul
    if (sortKey === 'category') return (a.category ?? '').localeCompare(b.category ?? '') * mul
    if (sortKey === 'density') return ((a.density ?? 0) - (b.density ?? 0)) * mul
    if (sortKey === 'price_per_kg') return ((a.price_per_kg ?? 0) - (b.price_per_kg ?? 0)) * mul
    if (sortKey === 'is_active') return (Number(b.is_active) - Number(a.is_active)) * mul
    return 0
  })
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  if (!permLoading && !hasPerm('materials', 'view')) return <Navigate to="/dashboard" replace />

  return (
    <div>
      <PageHeader title={s.materials} icon={Box} count={rows.length} action={canEdit && <Button onClick={openNew} className="gap-2"><Plus className="w-4 h-4" />{s.newMaterial}</Button>} />
      <div className="p-4">

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-900 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder={t.common.search}
            className="pl-9 pr-3 py-1 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-56" />
        </div>
        <FilterSelect label={s.category} value={catFilter} allLabel={t.common.all}
          options={CATEGORIES.map(c => ({ value: c, label: s.matCat[c] }))}
          onChange={v => { setCatFilter(v); setPage(1) }} />
        <FilterSelect label={t.common.status} value={statusFilter === 'all' ? '' : statusFilter} allLabel={t.common.all}
          options={[{ value: 'active', label: t.common.activeM }, { value: 'inactive', label: t.common.inactiveM }]}
          onChange={v => { setStatusFilter((v || 'all') as typeof statusFilter); setPage(1) }} />
      </div>

      <div className="-mx-4 border-t border-b border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center h-40"><div className="animate-spin rounded-full h-7 w-7 border-b-2 border-blue-600" /></div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center"><Box className="w-9 h-9 text-gray-200 mb-2" /><p className="text-sm text-gray-400">{s.noMaterials}</p></div>
        ) : (
          <div className="overflow-x-auto"><table className="w-full text-sm min-w-[560px]">
            <thead className="bg-gray-50 border-b border-gray-200"><tr>
              {([['name', s.materialName], ['category', s.category], ['density', s.density], ['price_per_kg', s.pricePerKg], ['is_active', t.common.status], ['', s.updatedAt], ['', '']] as [string, string][]).map(([key, h], i) => (
                <th key={i} className={`text-left px-4 py-2.5 text-xs font-medium text-gray-500 ${key ? 'cursor-pointer select-none hover:text-gray-700' : ''}`}
                  onClick={() => key && handleSort(key as typeof sortKey)}>
                  <span className="inline-flex items-center gap-0.5">{h}{key && <SortIcon active={sortKey === key} dir={sortDir} />}</span>
                </th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-gray-200">
              {paginated.map(m => (
                <tr key={m.id} className={`hover:bg-gray-50 ${canEdit ? 'cursor-pointer' : ''}`} onClick={() => canEdit && openEdit(m)}>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: '#e5eeff', border: '1px solid #d6e5ff' }}>
                        <Box className="w-3.5 h-3.5" style={{ color: '#215bcf' }} />
                      </div>
                      <span className="font-medium text-gray-900">{m.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-gray-600">{m.category ? s.matCat[m.category as keyof typeof s.matCat] ?? m.category : '—'}</td>
                  <td className="px-4 py-2.5 text-gray-600">{m.density} {s.units.gcm3}</td>
                  <td className="px-4 py-2.5 text-gray-700">{money(m.price_per_kg)} {s.units.perKg}</td>
                  <td className="px-4 py-2.5"><span className="px-2 py-0.5 rounded-md text-xs font-medium" style={m.is_active ? { backgroundColor: '#e0fced', border: '1px solid #d4f8e6', color: '#098259' } : { backgroundColor: '#feeee1', border: '1px solid #fee0c8', color: '#9e3f00' }}>{m.is_active ? t.common.active : t.common.inactive}</span></td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-gray-200 text-xs text-gray-900 whitespace-nowrap" style={{ backgroundColor: '#fbfbfb' }}><CalendarDays className="w-3 h-3 text-gray-500 shrink-0" />{format(new Date(m.updated_at), 'd. M. yyyy')}</span>
                      {m.editor && <PersonBadge name={`${m.editor.first_name} ${m.editor.last_name}`} />}
                    </div>
                  </td>
                  <td className="px-4 py-2.5" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-end">
                      {canEdit && <button onClick={() => openEdit(m)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"><MoreVertical className="w-4 h-4" /></button>}
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
            <label className="text-sm font-medium text-label">{s.category}</label>
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
