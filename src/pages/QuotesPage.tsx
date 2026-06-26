import { useEffect, useRef, useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { Plus, Eye, Pencil, FileText, Search, Check, X, Box } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { getThumbByPath } from '../lib/thumbs'
import { useCompany } from '../hooks/useCompany'
import { useLanguage } from '../hooks/useLanguage'
import Button from '../components/ui/Button'
import Pagination from '../components/ui/Pagination'
import { countQuotes } from '../utils/pluralize'
import type { Quote, QuoteStatus } from '../types/database'
import { format } from 'date-fns'


const PAGE_SIZE = 20
const STATUSES: QuoteStatus[] = ['draft', 'issued', 'sent', 'accepted', 'rejected', 'expired']

const STATUS_STYLE: Record<QuoteStatus, string> = {
  draft: 'bg-gray-100 text-gray-600',
  issued: 'bg-indigo-100 text-indigo-700',
  sent: 'bg-blue-100 text-blue-700',
  accepted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  expired: 'bg-amber-100 text-amber-700',
  won: 'bg-green-100 text-green-700',
  lost: 'bg-red-100 text-red-700',
  frozen: 'bg-purple-100 text-purple-700',
}

interface Row extends Quote { customers: { name: string } | null }

export default function QuotesPage() {
  const { company, hasPerm, loading: permLoading } = useCompany()
  const canEdit = hasPerm('quotes', 'create')
  const { t, lang } = useLanguage()
  const s = t.qp
  const navigate = useNavigate()
  const [rows, setRows] = useState<Row[]>([])
  const [annual, setAnnual] = useState<Record<string, number>>({})
  const [partSlots, setPartSlots] = useState<Record<string, (string | null)[]>>({}) // quote_id → up to 4 slots (CAD url or null placeholder)
  const [partCounts, setPartCounts] = useState<Record<string, number>>({})            // quote_id → total piece count
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<QuoteStatus | 'all'>('all')
  const [customerFilter, setCustomerFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => { if (company) load() }, [company])

  async function load() {
    if (!company) return
    setLoading(true)
    const [{ data: q }, { data: calc }, { data: items }] = await Promise.all([
      supabase.from('quotes').select('*, customers(name)').eq('company_id', company.id).order('created_at', { ascending: false }),
      supabase.from('calculations').select('annual_value, quote_items!inner(quote_id)').eq('company_id', company.id),
      supabase.from('quote_items').select('id, quote_id, thumb_path, position').eq('company_id', company.id).order('position'),
    ])
    setRows((q as Row[]) ?? [])
    const map: Record<string, number> = {}
    for (const c of (calc as any[]) ?? []) {
      const qi = Array.isArray(c.quote_items) ? c.quote_items[0] : c.quote_items
      const qid = qi?.quote_id
      if (qid) map[qid] = (map[qid] ?? 0) + Number(c.annual_value)
    }
    setAnnual(map)

    type It = { id: string; quote_id: string; thumb_path: string | null; position: number }
    const itemList = (items as It[]) ?? []

    // Count parts per quote + show existing thumbnails from the local cache
    // (downloaded once, then instant — no signed-URL call per thumbnail per load).
    const counts: Record<string, number> = {}
    const slotItems: Record<string, It[]> = {}
    for (const it of itemList) {
      counts[it.quote_id] = (counts[it.quote_id] ?? 0) + 1
      const arr = slotItems[it.quote_id] ?? (slotItems[it.quote_id] = [])
      if (arr.length < 4) arr.push(it)
    }
    setPartCounts(counts)
    const slots: Record<string, (string | null)[]> = {}
    for (const [qid, its] of Object.entries(slotItems)) {
      slots[qid] = await Promise.all(its.map(it => getThumbByPath(it.id, it.thumb_path)))
    }
    setPartSlots(slots)
    setLoading(false)
  }

  const customerOptions = Array.from(new Map(rows.filter(r => r.customer_id).map(r => [r.customer_id, r.customers?.name ?? '—'])).entries())
    .sort((a, b) => a[1].localeCompare(b[1]))

  const filtered = rows.filter(r =>
    (statusFilter === 'all' || r.status === statusFilter) &&
    (customerFilter === 'all' || r.customer_id === customerFilter) &&
    (!search || r.quote_number.toLowerCase().includes(search.toLowerCase()) ||
      (r.customers?.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (r.contact_person ?? '').toLowerCase().includes(search.toLowerCase())))

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  if (!permLoading && !hasPerm('quotes', 'view')) return <Navigate to="/dashboard" replace />

  return (
    <div className="p-4 lg:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{s.quotes}</h1>
          <p className="text-gray-500 text-sm mt-1">{countQuotes(lang, rows.length)}</p>
        </div>
        {canEdit && <Button onClick={() => navigate('/quotes/new')} className="gap-2"><Plus className="w-4 h-4" />{s.newQuote}</Button>}
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <CustomerCombo options={customerOptions} value={customerFilter} onChange={v => { setCustomerFilter(v); setPage(1) }}
          allLabel={`${s.customer}: ${t.common.all}`} placeholder={s.customer} />
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value as QuoteStatus | 'all'); setPage(1) }}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="all">{t.common.status}: {t.common.all}</option>
          {STATUSES.map(st => <option key={st} value={st}>{s.status[st]}</option>)}
        </select>
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
          <div className="overflow-x-auto"><table className="w-full text-sm min-w-[920px]">
            <thead className="bg-gray-50 border-b border-gray-100"><tr>
              {[s.quoteNumber, s.customer, s.contactPerson, s.pieces, t.common.status, s.annualValue, t.common.created, ''].map((h, i) => (
                <th key={i} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {paged.map(q => (
                <tr key={q.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => navigate(canEdit && q.status === 'draft' ? `/quotes/${q.id}/edit` : `/quotes/${q.id}`)}>
                  <td className="px-4 py-3 font-mono text-gray-700">{q.quote_number}</td>
                  <td className="px-4 py-3 text-gray-900">{q.customers?.name ?? '—'}</td>
                  <td className="px-4 py-3">
                    <div className="text-gray-900">{q.contact_person || '—'}</div>
                    {q.contact_email && <div className="text-xs text-gray-400">{q.contact_email}</div>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {(partCounts[q.id] ?? 0) > 0 && (
                        <span className="min-w-[1.25rem] h-5 px-1 rounded-full bg-gray-100 text-gray-500 text-[11px] font-medium flex items-center justify-center shrink-0">{partCounts[q.id]}</span>
                      )}
                      {(partSlots[q.id] ?? []).map((url, idx) => (
                        <div key={idx} className="w-8 h-8 rounded-md border border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center text-gray-300 shrink-0">
                          {url ? <img src={url} alt="" className="w-full h-full object-contain" /> : <Box className="w-4 h-4" />}
                        </div>
                      ))}
                      {(partCounts[q.id] ?? 0) > 4 && <span className="text-xs text-gray-400">+{(partCounts[q.id] ?? 0) - 4}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLE[q.status]}`}>{s.status[q.status]}</span></td>
                  <td className="px-4 py-3 text-gray-700">{(annual[q.id] ?? 0).toLocaleString('de-DE', { style: 'currency', currency: company?.currency ?? 'EUR' })}</td>
                  <td className="px-4 py-3 text-gray-500">{format(new Date(q.created_at), 'd. M. yyyy')}</td>
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-1 justify-end">
                      {canEdit && q.status === 'draft'
                        ? <button onClick={() => navigate(`/quotes/${q.id}/edit`)} title={t.common.edit} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Pencil className="w-3.5 h-3.5" /></button>
                        : <button onClick={() => navigate(`/quotes/${q.id}`)} title={t.common.view} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Eye className="w-3.5 h-3.5" /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </div>

      <Pagination total={filtered.length} page={page} pageSize={PAGE_SIZE} onChange={setPage} />
    </div>
  )
}

function CustomerCombo({ options, value, onChange, allLabel, placeholder }: {
  options: [string, string][]; value: string; onChange: (v: string) => void; allLabel: string; placeholder: string
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onDoc(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) { setOpen(false); setQuery('') } }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const selectedLabel = value === 'all' ? '' : (options.find(([id]) => id === value)?.[1] ?? '')
  const filtered = options.filter(([, name]) => name.toLowerCase().includes(query.toLowerCase()))

  function pick(v: string) { onChange(v); setOpen(false); setQuery('') }

  return (
    <div className="relative min-w-[200px]" ref={ref}>
      <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      <input
        value={open ? query : selectedLabel}
        onChange={e => { setQuery(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        placeholder={value === 'all' ? `${placeholder}…` : selectedLabel}
        className="w-full pl-9 pr-8 py-2 rounded-lg border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
      {value !== 'all' && !open && (
        <button onClick={() => pick('all')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"><X className="w-3.5 h-3.5" /></button>
      )}
      {open && (
        <div className="absolute z-20 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          <div className="max-h-64 overflow-y-auto py-1">
            <button onClick={() => pick('all')} className="flex items-center w-full px-3 py-2 text-sm text-left hover:bg-gray-50">
              <span className="flex-1 text-gray-500">{allLabel}</span>
              {value === 'all' && <Check className="w-4 h-4 text-blue-600" />}
            </button>
            {filtered.map(([cid, name]) => (
              <button key={cid} onClick={() => pick(cid)} className="flex items-center w-full px-3 py-2 text-sm text-left hover:bg-gray-50">
                <span className="flex-1 text-gray-900 truncate">{name}</span>
                {value === cid && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
              </button>
            ))}
            {filtered.length === 0 && <p className="px-3 py-2 text-sm text-gray-400">—</p>}
          </div>
        </div>
      )}
    </div>
  )
}
