import { useEffect, useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { Plus, HardHat, Search, CalendarDays, MoreVertical } from 'lucide-react'
import { SortIcon } from '../components/ui/SortIcon'
import { format } from 'date-fns'
import { supabase } from '../lib/supabase'
import { useCompany } from '../hooks/useCompany'
import { useLanguage } from '../hooks/useLanguage'
import { toast } from '../components/ui/Toast'
import Button from '../components/ui/Button'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { PageHeader } from '../components/ui/PageHeader'
import { PersonBadge } from '../components/ui/PersonBadge'
import { FilterSelect } from '../components/ui/FilterSelect'
import Pagination from '../components/ui/Pagination'
import { effectiveLaborRate } from '../lib/laborRate'
import { usedLaborIds } from '../lib/usageCheck'
import type { LaborRate } from '../types/database'

const PAGE_SIZE = 20

export default function LaborListPage() {
  const { company, hasPerm, loading: permLoading } = useCompany()
  const canEdit = hasPerm('labor_rates', 'create')
  const { t } = useLanguage()
  const s = t.qp
  const navigate = useNavigate()
  const cur = company?.currency ?? 'EUR'
  type Row = LaborRate & { editor: { first_name: string; last_name: string } | null; creator: { first_name: string; last_name: string } | null }
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [toDelete, setToDelete] = useState<LaborRate | null>(null)
  const [used, setUsed] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [page, setPage] = useState(1)
  const [sortKey, setSortKey] = useState<'name' | 'annual_cost' | 'rate' | 'is_active'>('name')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  function handleSort(k: typeof sortKey) { setSortKey(k); setSortDir(d => k === sortKey ? (d === 'asc' ? 'desc' : 'asc') : 'asc'); setPage(1) }

  const filtered = rows.filter(l =>
    (!search || l.name.toLowerCase().includes(search.toLowerCase())) &&
    (statusFilter === 'all' || (statusFilter === 'active' ? l.is_active : !l.is_active))
  )
  const sorted = [...filtered].sort((a, b) => {
    const mul = sortDir === 'asc' ? 1 : -1
    if (sortKey === 'name') return a.name.localeCompare(b.name) * mul
    if (sortKey === 'annual_cost') return (a.annual_cost - b.annual_cost) * mul
    if (sortKey === 'rate') return (effectiveLaborRate(a) - effectiveLaborRate(b)) * mul
    if (sortKey === 'is_active') return (Number(b.is_active) - Number(a.is_active)) * mul
    return 0
  })
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  useEffect(() => { if (company) load() }, [company])
  async function load() {
    if (!company) return
    setLoading(true)
    const { data } = await supabase.from('labor_rates').select('*, editor:users!updated_by(first_name, last_name), creator:users!created_by(first_name, last_name)').eq('company_id', company.id).order('name')
    setRows((data as Row[]) ?? [])
    setUsed(await usedLaborIds())
    setLoading(false)
  }
  async function doDelete() {
    if (!toDelete) return
    if (used.has(toDelete.id)) { toast.error(s.cannotDeleteLinked); setToDelete(null); return }
    const { error } = await supabase.from('labor_rates').delete().eq('id', toDelete.id)
    if (error) { toast.error(error.message); return }
    toast.success(t.common.deleted); setToDelete(null); load()
  }
  const money = (n: number) => n.toLocaleString('de-DE', { style: 'currency', currency: cur })

  if (!permLoading && !hasPerm('labor_rates', 'view')) return <Navigate to="/dashboard" replace />

  return (
    <div>
      <PageHeader title={t.nav.labor} icon={HardHat} count={rows.length} action={canEdit && <Button onClick={() => navigate('/labor/new')} className="gap-2"><Plus className="w-4 h-4" />{s.addLabor}</Button>} />
      <div className="p-4">

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative max-w-xs">
          <Search className="w-4 h-4 text-gray-900 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder={s.operatorTitle}
            className="w-full pl-9 pr-3 py-1 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <FilterSelect label={t.common.status} value={statusFilter === 'all' ? '' : statusFilter} allLabel={t.common.all}
          options={[{ value: 'active', label: t.common.active }, { value: 'inactive', label: t.common.inactive }]}
          onChange={v => { setStatusFilter((v || 'all') as typeof statusFilter); setPage(1) }} />
      </div>

      <div className="-mx-4 border-t border-b border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center h-40"><div className="animate-spin rounded-full h-7 w-7 border-b-2 border-blue-600" /></div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center"><HardHat className="w-9 h-9 text-gray-200 mb-2" /><p className="text-sm text-gray-400">{s.noLabor}</p></div>
        ) : (
          <div className="overflow-x-auto"><table className="w-full text-sm min-w-[500px]">
            <thead className="bg-gray-50 border-b border-gray-200"><tr>
              {([['name', s.operatorTitle], ['annual_cost', s.annualCost], ['rate', s.ratePerHour], ['is_active', t.common.status], ['', s.updatedAt], ['', '']] as [string, string][]).map(([key, h], i) => (
                <th key={i} className={`text-left px-4 py-2.5 text-xs font-medium text-gray-500 ${key ? 'cursor-pointer select-none hover:text-gray-700' : ''}`}
                  onClick={() => key && handleSort(key as typeof sortKey)}>
                  <span className="inline-flex items-center gap-0.5">{h}{key && <SortIcon active={sortKey === key} dir={sortDir} />}</span>
                </th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-gray-200">
              {paginated.map(l => (
                <tr key={l.id} className={`hover:bg-gray-50 ${canEdit ? 'cursor-pointer' : ''}`} onClick={() => canEdit && navigate(`/labor/${l.id}/edit`)}>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: '#e5eeff', border: '1px solid #d6e5ff' }}>
                        <HardHat className="w-3.5 h-3.5" style={{ color: '#215bcf' }} />
                      </div>
                      <span className="font-medium text-gray-900">{l.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-gray-600">{money(l.annual_cost)}</td>
                  <td className="px-4 py-2.5 text-gray-700">{money(effectiveLaborRate(l))} /h</td>
                  <td className="px-4 py-2.5">
                    <span className="px-2 py-0.5 rounded-md text-xs font-medium" style={l.is_active ? { backgroundColor: '#e0fced', border: '1px solid #d4f8e6', color: '#098259' } : { backgroundColor: '#feeee1', border: '1px solid #fee0c8', color: '#9e3f00' }}>{l.is_active ? t.common.active : t.common.inactive}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-gray-200 text-xs text-gray-900 whitespace-nowrap" style={{ backgroundColor: '#fbfbfb' }}><CalendarDays className="w-3 h-3 text-gray-500 shrink-0" />{format(new Date(l.editor ? l.updated_at : l.created_at), 'd. M. yyyy')}</span>
                      {l.editor
                        ? <PersonBadge name={`${l.editor.first_name} ${l.editor.last_name}`} />
                        : l.creator && <PersonBadge name={`${l.creator.first_name} ${l.creator.last_name}`} />}
                    </div>
                  </td>
                  <td className="px-4 py-2.5" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-end">
                      {canEdit && <button onClick={() => navigate(`/labor/${l.id}/edit`)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"><MoreVertical className="w-4 h-4" /></button>}
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
        title={t.nav.labor} message={s.deleteLaborConfirm} confirmLabel={t.common.delete} danger />
    </div>
    </div>
  )
}
