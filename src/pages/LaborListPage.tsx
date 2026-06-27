import { useEffect, useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { Plus, Pencil, Trash2, HardHat, Search } from 'lucide-react'
import { format } from 'date-fns'
import { supabase } from '../lib/supabase'
import { useCompany } from '../hooks/useCompany'
import { useLanguage } from '../hooks/useLanguage'
import { toast } from '../components/ui/Toast'
import Button from '../components/ui/Button'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import Pagination from '../components/ui/Pagination'
import { effectiveLaborRate } from '../lib/laborRate'
import { usedLaborIds } from '../lib/usageCheck'
import { countWorkers } from '../utils/pluralize'
import type { LaborRate } from '../types/database'

const PAGE_SIZE = 20

export default function LaborListPage() {
  const { company, hasPerm, loading: permLoading } = useCompany()
  const canEdit = hasPerm('labor_rates', 'create')
  const { t, lang } = useLanguage()
  const s = t.qp
  const navigate = useNavigate()
  const cur = company?.currency ?? 'EUR'
  type Row = LaborRate & { editor: { first_name: string; last_name: string } | null }
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [toDelete, setToDelete] = useState<LaborRate | null>(null)
  const [used, setUsed] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const filtered = rows.filter(l => !search || l.name.toLowerCase().includes(search.toLowerCase()))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  useEffect(() => { if (company) load() }, [company])
  async function load() {
    if (!company) return
    setLoading(true)
    const { data } = await supabase.from('labor_rates').select('*, editor:users!updated_by(first_name, last_name)').eq('company_id', company.id).order('name')
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
    <div className="p-4 lg:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t.nav.labor}</h1>
          <p className="text-gray-500 text-sm mt-1">{countWorkers(lang, rows.length)}</p>
        </div>
        {canEdit && <Button onClick={() => navigate('/labor/new')} className="gap-2"><Plus className="w-4 h-4" />{s.addLabor}</Button>}
      </div>

      <div className="relative mb-4 max-w-xs">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder={s.operatorTitle}
          className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40"><div className="animate-spin rounded-full h-7 w-7 border-b-2 border-blue-600" /></div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center"><HardHat className="w-9 h-9 text-gray-200 mb-2" /><p className="text-sm text-gray-400">{s.noLabor}</p></div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100"><tr>
              {[s.operatorTitle, s.annualCost, s.ratePerHour, t.common.status, s.updatedAt, ''].map((h, i) => (
                <th key={i} className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.map(l => (
                <tr key={l.id} className={`hover:bg-gray-50 ${canEdit ? 'cursor-pointer' : ''}`} onClick={() => canEdit && navigate(`/labor/${l.id}/edit`)}>
                  <td className="px-4 py-2.5 font-medium text-gray-900">{l.name}</td>
                  <td className="px-4 py-2.5 text-gray-600">{money(l.annual_cost)}</td>
                  <td className="px-4 py-2.5 text-gray-700">{money(effectiveLaborRate(l))} /h</td>
                  <td className="px-4 py-2.5">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${l.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{l.is_active ? t.common.active : t.common.inactive}</span>
                  </td>
                  <td className="px-4 py-2.5 text-gray-500">
                    <div>{format(new Date(l.updated_at), 'd. M. yyyy')}</div>
                    {l.editor && <div className="text-xs text-gray-400">{l.editor.first_name} {l.editor.last_name}</div>}
                  </td>
                  <td className="px-4 py-2.5" onClick={e => e.stopPropagation()}>
                    <div className="flex gap-1 justify-end">
                      {canEdit && <button onClick={() => navigate(`/labor/${l.id}/edit`)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Pencil className="w-3.5 h-3.5" /></button>}
                      {canEdit && !used.has(l.id) && <button onClick={() => setToDelete(l)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Pagination total={filtered.length} page={page} pageSize={PAGE_SIZE} onChange={setPage} />

      <ConfirmDialog open={!!toDelete} onClose={() => setToDelete(null)} onConfirm={doDelete}
        title={t.nav.labor} message={s.deleteLaborConfirm} confirmLabel={t.common.delete} danger />
    </div>
  )
}
