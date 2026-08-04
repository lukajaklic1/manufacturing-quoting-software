import { useEffect, useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { Plus, Pencil, Trash2, Factory, Search } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useCompany } from '../hooks/useCompany'
import { useLanguage } from '../hooks/useLanguage'
import { toast } from '../components/ui/Toast'
import Button from '../components/ui/Button'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import Pagination from '../components/ui/Pagination'
import { effectiveMachineRate } from '../lib/machineRate'
import { usedMachineIds } from '../lib/usageCheck'
import { countMachines } from '../utils/pluralize'
import { PageHeader } from '../components/ui/PageHeader'
import { FilterSelect } from '../components/ui/FilterSelect'
import { format } from 'date-fns'
import type { Machine } from '../types/database'

const PAGE_SIZE = 20

export default function MachinesPage() {
  const { company, hasPerm, loading: permLoading } = useCompany()
  const canEdit = hasPerm('machine_rates', 'create')
  const { t, lang } = useLanguage()
  const s = t.qp
  const navigate = useNavigate()
  const cur = company?.currency ?? 'EUR'
  type Row = Machine & { editor: { first_name: string; last_name: string } | null }
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [toDelete, setToDelete] = useState<Machine | null>(null)
  const [used, setUsed] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [page, setPage] = useState(1)

  const filtered = rows.filter(m =>
    (catFilter === 'all' || m.category === catFilter) &&
    (statusFilter === 'all' || (statusFilter === 'active' ? m.is_active : !m.is_active)) &&
    (!search || m.name.toLowerCase().includes(search.toLowerCase()) || (m.model ?? '').toLowerCase().includes(search.toLowerCase())))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  useEffect(() => { if (company) load() }, [company])
  async function load() {
    if (!company) return
    setLoading(true)
    const { data } = await supabase.from('machines').select('*, editor:users!updated_by(first_name, last_name)').eq('company_id', company.id).order('name')
    setRows((data as Row[]) ?? [])
    setUsed(await usedMachineIds())
    setLoading(false)
  }
  async function doDelete() {
    if (!toDelete) return
    if (used.has(toDelete.id)) { toast.error(s.cannotDeleteLinked); setToDelete(null); return }
    const { error } = await supabase.from('machines').delete().eq('id', toDelete.id)
    if (error) { toast.error(error.message); return }
    toast.success(t.common.deleted); setToDelete(null); load()
  }
  const rate = (m: Machine) => effectiveMachineRate(m).toLocaleString('de-DE', { style: 'currency', currency: cur })

  if (!permLoading && !hasPerm('machine_rates', 'view')) return <Navigate to="/dashboard" replace />

  return (
    <div>
      <PageHeader title={t.nav.machines} icon={Factory} count={rows.length} action={canEdit && <Button onClick={() => navigate('/machines/new')} className="gap-2"><Plus className="w-4 h-4" />{s.addMachine}</Button>} />
      <div className="p-4">

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-gray-900 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder={`${s.machineName} / ${s.machineModel}`}
            className="w-full pl-9 pr-3 py-1 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <FilterSelect label={s.category} value={catFilter === 'all' ? '' : catFilter} allLabel={t.common.all}
          options={Object.entries(s.cat).map(([k, label]) => ({ value: k, label: label as string }))}
          onChange={v => { setCatFilter(v || 'all'); setPage(1) }} />
        <FilterSelect label={t.common.status} value={statusFilter === 'all' ? '' : statusFilter} allLabel={t.common.all}
          options={[{ value: 'active', label: t.common.active }, { value: 'inactive', label: t.common.inactive }]}
          onChange={v => { setStatusFilter((v || 'all') as typeof statusFilter); setPage(1) }} />
      </div>

      <div className="-mx-4 border-t border-b border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center h-40"><div className="animate-spin rounded-full h-7 w-7 border-b-2 border-blue-600" /></div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center"><Factory className="w-9 h-9 text-gray-200 mb-2" /><p className="text-sm text-gray-400">{s.noMachines}</p></div>
        ) : (
          <div className="overflow-x-auto"><table className="w-full text-sm min-w-[560px]">
            <thead className="bg-gray-50 border-b border-gray-200"><tr>
              {[s.machineName, s.machineModel, s.category, s.ratePerHour, t.common.status, s.updatedAt, ''].map((h, i) => (
                <th key={i} className="text-left px-4 py-2.5 text-xs font-medium text-gray-500">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-gray-200">
              {paginated.map(m => (
                <tr key={m.id} className={`hover:bg-gray-50 ${canEdit ? 'cursor-pointer' : ''}`} onClick={() => canEdit && navigate(`/machines/${m.id}/edit`)}>
                  <td className="px-4 py-2.5 font-medium text-gray-900">{m.name}</td>
                  <td className="px-4 py-2.5 text-gray-600">{m.model || '—'}</td>
                  <td className="px-4 py-2.5 text-gray-600">{m.category ? s.cat[m.category] : '—'}</td>
                  <td className="px-4 py-2.5 text-gray-700">{rate(m)} /h</td>
                  <td className="px-4 py-2.5">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${m.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{m.is_active ? t.common.active : t.common.inactive}</span>
                  </td>
                  <td className="px-4 py-2.5 text-gray-500">
                    <div>{format(new Date(m.updated_at), 'd. M. yyyy')}</div>
                    {m.editor && <div className="text-xs text-gray-400">{m.editor.first_name} {m.editor.last_name}</div>}
                  </td>
                  <td className="px-4 py-2.5" onClick={e => e.stopPropagation()}>
                    <div className="flex gap-1 justify-end">
                      {canEdit && <button onClick={() => navigate(`/machines/${m.id}/edit`)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Pencil className="w-3.5 h-3.5" /></button>}
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

      <ConfirmDialog open={!!toDelete} onClose={() => setToDelete(null)} onConfirm={doDelete}
        title={s.deleteMachine} message={s.deleteMachineConfirm} confirmLabel={t.common.delete} danger />
    </div>
    </div>
  )
}
