import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Eye, Pencil, Trash2, FileText, Search } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useCompany } from '../hooks/useCompany'
import { useLanguage } from '../hooks/useLanguage'
import { toast } from '../components/ui/Toast'
import Button from '../components/ui/Button'
import Pagination from '../components/ui/Pagination'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import type { Quote, QuoteStatus } from '../types/database'
import { format } from 'date-fns'

const PAGE_SIZE = 20
const STATUSES: QuoteStatus[] = ['draft', 'sent', 'won', 'lost', 'frozen']

const STATUS_STYLE: Record<QuoteStatus, string> = {
  draft: 'bg-gray-100 text-gray-600',
  sent: 'bg-blue-100 text-blue-700',
  won: 'bg-green-100 text-green-700',
  lost: 'bg-red-100 text-red-700',
  frozen: 'bg-purple-100 text-purple-700',
}

interface Row extends Quote { customers: { name: string } | null }

export default function QuotesPage() {
  const { company } = useCompany()
  const { t } = useLanguage()
  const s = t.qp
  const navigate = useNavigate()
  const [rows, setRows] = useState<Row[]>([])
  const [annual, setAnnual] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<QuoteStatus | 'all'>('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [toDelete, setToDelete] = useState<Quote | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => { if (company) load() }, [company])

  async function load() {
    if (!company) return
    setLoading(true)
    const [{ data: q }, { data: calc }] = await Promise.all([
      supabase.from('quotes').select('*, customers(name)').eq('company_id', company.id).order('created_at', { ascending: false }),
      supabase.from('calculations').select('annual_value, quote_items!inner(quote_id)').eq('company_id', company.id),
    ])
    setRows((q as Row[]) ?? [])
    const map: Record<string, number> = {}
    for (const c of (calc as any[]) ?? []) {
      const qi = Array.isArray(c.quote_items) ? c.quote_items[0] : c.quote_items
      const qid = qi?.quote_id
      if (qid) map[qid] = (map[qid] ?? 0) + Number(c.annual_value)
    }
    setAnnual(map)
    setLoading(false)
  }

  async function doDelete() {
    if (!toDelete) return
    setDeleting(true)
    const { error } = await supabase.from('quotes').delete().eq('id', toDelete.id)
    setDeleting(false)
    if (error) { toast.error(error.message); return }
    toast.success(t.common.deleted); setToDelete(null); load()
  }

  const filtered = rows.filter(r =>
    (statusFilter === 'all' || r.status === statusFilter) &&
    (!search || r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.quote_number.toLowerCase().includes(search.toLowerCase()) ||
      (r.customers?.name ?? '').toLowerCase().includes(search.toLowerCase())))

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="p-4 lg:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{s.quotes}</h1>
          <p className="text-gray-500 text-sm mt-1">{rows.length} {s.quotes.toLowerCase()}</p>
        </div>
        <Button onClick={() => navigate('/quotes/new')} className="gap-2"><Plus className="w-4 h-4" />{s.newQuote}</Button>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        {(['all', ...STATUSES] as const).map(st => (
          <button key={st} onClick={() => { setStatusFilter(st); setPage(1) }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              statusFilter === st ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {st === 'all' ? t.common.all : s.status[st]}
          </button>
        ))}
        <div className="relative ml-auto max-w-xs w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder={t.common.search}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <FileText className="w-10 h-10 text-gray-200 mb-3" />
            <p className="text-sm text-gray-400">{s.noQuotes}</p>
          </div>
        ) : (
          <div className="overflow-x-auto"><table className="w-full text-sm min-w-[760px]">
            <thead className="bg-gray-50 border-b border-gray-100"><tr>
              {[s.quoteNumber, s.customer, s.title, t.common.status, s.annualValue, t.common.created, ''].map((h, i) => (
                <th key={i} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {paged.map(q => (
                <tr key={q.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => navigate(`/quotes/${q.id}`)}>
                  <td className="px-4 py-3 font-mono text-gray-700">{q.quote_number}</td>
                  <td className="px-4 py-3 text-gray-900">{q.customers?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{q.title}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLE[q.status]}`}>{s.status[q.status]}</span></td>
                  <td className="px-4 py-3 text-gray-700">{(annual[q.id] ?? 0).toLocaleString('de-DE', { style: 'currency', currency: company?.currency ?? 'EUR' })}</td>
                  <td className="px-4 py-3 text-gray-500">{format(new Date(q.created_at), 'd. M. yyyy')}</td>
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => navigate(`/quotes/${q.id}`)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Eye className="w-3.5 h-3.5" /></button>
                      <button onClick={() => navigate(`/quotes/${q.id}/edit`)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setToDelete(q)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
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
        title={s.quotes} message={s.deleteCustomerConfirm} confirmLabel={t.common.delete} danger loading={deleting} />
    </div>
  )
}
