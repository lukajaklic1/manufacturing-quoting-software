import { useEffect, useRef, useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { Plus, Eye, Pencil, FileText, Search, Check, X, Box, ChevronDown } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { getThumbByPath } from '../lib/thumbs'
import { useCompany } from '../hooks/useCompany'
import { useLanguage } from '../hooks/useLanguage'
import Button from '../components/ui/Button'
import Pagination from '../components/ui/Pagination'
import { countQuotes } from '../utils/pluralize'
import type { Quote, QuoteStatus } from '../types/database'
import { format } from 'date-fns'

interface CompanyUser { id: string; first_name: string; last_name: string }


const PAGE_SIZE = 20
const STATUSES: QuoteStatus[] = ['draft', 'issued', 'sent', 'won', 'lost']

const STATUS_STYLE: Record<QuoteStatus, string> = {
  draft: 'bg-gray-100 text-gray-600',
  issued: 'bg-indigo-100 text-indigo-700',
  sent: 'bg-blue-100 text-blue-700',
  accepted: 'bg-green-100 text-green-700',
  rejected: 'bg-orange-100 text-orange-700',
  expired: 'bg-amber-100 text-amber-700',
  won: 'bg-green-100 text-green-700',
  lost: 'bg-orange-100 text-orange-700',
  frozen: 'bg-purple-100 text-purple-700',
}

interface Row extends Quote { customers: { name: string } | null; assignee: { first_name: string; last_name: string } | null }

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
  const [companyUsers, setCompanyUsers] = useState<CompanyUser[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<QuoteStatus | 'all'>('all')
  const [customerFilter, setCustomerFilter] = useState('all')
  const [assigneeFilter, setAssigneeFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => { if (company) { load(); loadUsers() } }, [company])

  async function loadUsers() {
    const { data } = await supabase.from('users').select('id, first_name, last_name').eq('company_id', company!.id).eq('is_active', true).order('first_name')
    if (data) setCompanyUsers(data as CompanyUser[])
  }

  async function load() {
    if (!company) return
    setLoading(true)
    const [{ data: q }, { data: calc }, { data: items }, { data: atts }] = await Promise.all([
      supabase.from('quotes').select('*, customers(name), assignee:users!assignee_id(first_name, last_name)').eq('company_id', company.id).order('created_at', { ascending: false }),
      supabase.from('calculations').select('selling_price, quote_items!inner(quote_id, quantity)').eq('company_id', company.id),
      supabase.from('quote_items').select('id, quote_id, thumb_path, position').eq('company_id', company.id).order('position'),
      supabase.from('quote_attachments').select('id, quote_item_id, thumb_path, file_name').eq('company_id', company.id).not('quote_item_id', 'is', null).order('created_at'),
    ])
    setRows((q as Row[]) ?? [])
    const map: Record<string, number> = {}
    for (const c of (calc as any[]) ?? []) {
      const qi = Array.isArray(c.quote_items) ? c.quote_items[0] : c.quote_items
      const qid = qi?.quote_id
      const qty = Number(qi?.quantity ?? 1)
      if (qid) map[qid] = (map[qid] ?? 0) + Number(c.selling_price) * qty
    }
    setAnnual(map)

    type It = { id: string; quote_id: string; thumb_path: string | null; position: number }
    type Att = { id: string; quote_item_id: string; thumb_path: string | null; file_name: string }
    const itemList = (items as It[]) ?? []
    const attList = (atts as Att[]) ?? []

    // CAD ext check
    const cadExts = ['step','stp','iges','igs','stl','obj','ply','fbx']
    const isCad = (name: string) => cadExts.includes(name.toLowerCase().split('.').pop() ?? '')

    // First CAD attachment per item (by created_at asc) — matches the rule in QuoteFormPage
    const attThumb: Record<string, { id: string; thumb_path: string | null }> = {}
    for (const a of attList) {
      if (!a.quote_item_id || !isCad(a.file_name)) continue
      if (!attThumb[a.quote_item_id]) attThumb[a.quote_item_id] = { id: a.id, thumb_path: a.thumb_path }
    }

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
      slots[qid] = await Promise.all(its.map(it => {
        // Prefer item's own thumb_path, fall back to CAD attachment thumb
        if (it.thumb_path) return getThumbByPath(it.id, it.thumb_path)
        const fb = attThumb[it.id]
        if (fb) return getThumbByPath(fb.id, fb.thumb_path)
        return Promise.resolve(null)
      }))
    }
    setPartSlots(slots)
    setLoading(false)
  }

  const customerOptions = Array.from(new Map(rows.filter(r => r.customer_id).map(r => [r.customer_id, r.customers?.name ?? '—'])).entries())
    .sort((a, b) => a[1].localeCompare(b[1]))

  const filtered = rows.filter(r => {
    const assigneeName = r.assignee ? `${r.assignee.first_name} ${r.assignee.last_name}`.toLowerCase() : ''
    const q = search.toLowerCase()
    return (
      (statusFilter === 'all' || r.status === statusFilter) &&
      (customerFilter === 'all' || r.customer_id === customerFilter) &&
      (assigneeFilter === 'all' || (assigneeFilter === 'unassigned' ? !r.assignee_id : r.assignee_id === assigneeFilter)) &&
      (!search || r.quote_number.toLowerCase().includes(q) ||
        (r.customers?.name ?? '').toLowerCase().includes(q) ||
        (r.contact_person ?? '').toLowerCase().includes(q) ||
        assigneeName.includes(q))
    )
  })

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  if (!permLoading && !hasPerm('quotes', 'view')) return <Navigate to="/dashboard" replace />

  return (
    <div className="p-4 lg:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">{s.quotes}</h1>
          <p className="text-gray-500 text-sm mt-1">{countQuotes(lang, rows.length)}</p>
        </div>
        {canEdit && <Button onClick={() => navigate('/quotes/new')} className="gap-2"><Plus className="w-4 h-4" />{s.newQuote}</Button>}
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder={t.common.search}
            className="pl-9 pr-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48" />
        </div>
        <CustomerCombo options={customerOptions} value={customerFilter} onChange={v => { setCustomerFilter(v); setPage(1) }}
          allLabel={`${s.customer}: ${t.common.all}`} placeholder={s.customer} />
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value as QuoteStatus | 'all'); setPage(1) }}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="all">{t.common.status}: {t.common.all}</option>
          {STATUSES.map(st => <option key={st} value={st}>{s.status[st]}</option>)}
        </select>
        <select value={assigneeFilter} onChange={e => { setAssigneeFilter(e.target.value); setPage(1) }}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="all">{s.assignee}: {lang === 'sl' ? 'Vsi' : 'All'}</option>
          <option value="unassigned">{s.noAssignee}</option>
          {companyUsers.map(u => <option key={u.id} value={u.id}>{u.first_name} {u.last_name}</option>)}
        </select>
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
              {[s.quoteNumber, s.customer, s.contactPerson, s.pieces, t.common.status, s.annualValue, t.common.created, s.assignee, ''].map((h, i) => (
                <th key={i} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-gray-200">
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
                        <div key={idx} className="w-11 h-11 rounded-lg border border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center shrink-0">
                          {url ? <img src={url} alt="" className="w-full h-full object-contain" /> : <Box className="w-5 h-5 text-gray-300" />}
                        </div>
                      ))}
                      {(partCounts[q.id] ?? 0) > 4 && <span className="text-xs text-gray-400 ml-0.5">+{(partCounts[q.id] ?? 0) - 4}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLE[q.status]}`}>{s.status[q.status]}</span></td>
                  <td className="px-4 py-3 text-gray-700">{(annual[q.id] ?? 0).toLocaleString('de-DE', { style: 'currency', currency: company?.currency ?? 'EUR' })}</td>
                  <td className="px-4 py-3 text-gray-500">{format(new Date(q.created_at), 'd. M. yyyy')}</td>
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <AssigneeCell
                      quoteId={q.id}
                      assigneeId={q.assignee_id}
                      assignee={q.assignee}
                      users={companyUsers}
                      canEdit={canEdit}
                      noAssigneeLabel={s.noAssignee}
                      onChange={(uid) => setRows(prev => prev.map(r => r.id === q.id ? { ...r, assignee_id: uid, assignee: companyUsers.find(u => u.id === uid) ?? null } : r))}
                    />
                  </td>
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

function AssigneeCell({ quoteId, assigneeId, assignee, users, canEdit, noAssigneeLabel, onChange }: {
  quoteId: string
  assigneeId: string | null
  assignee: { first_name: string; last_name: string } | null
  users: CompanyUser[]
  canEdit: boolean
  noAssigneeLabel: string
  onChange: (uid: string | null) => void
}) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onDoc(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  async function pick(uid: string | null) {
    setOpen(false)
    if (uid === assigneeId) return
    setSaving(true)
    await supabase.from('quotes').update({ assignee_id: uid }).eq('id', quoteId)
    onChange(uid)
    setSaving(false)
  }

  const label = assignee ? `${assignee.first_name} ${assignee.last_name}` : null

  if (!canEdit) {
    return <span className="text-sm text-gray-500">{label ?? '—'}</span>
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        disabled={saving}
        className={`flex items-center gap-1 text-sm rounded-lg px-2 py-1 transition-colors ${label ? 'text-gray-800 hover:bg-gray-100' : 'text-gray-400 hover:bg-gray-100'}`}>
        {saving ? <span className="w-3 h-3 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" /> : null}
        <span className="max-w-[120px] truncate">{label ?? noAssigneeLabel}</span>
        <ChevronDown className="w-3 h-3 shrink-0 text-gray-400" />
      </button>
      {open && (
        <div className="absolute z-30 mt-1 right-0 w-44 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          <div className="max-h-52 overflow-y-auto py-1">
            <button onClick={() => pick(null)} className="flex items-center w-full px-3 py-2 text-sm text-left hover:bg-gray-50 gap-2">
              <span className="flex-1 text-gray-400 italic">{noAssigneeLabel}</span>
              {!assigneeId && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
            </button>
            {users.map(u => (
              <button key={u.id} onClick={() => pick(u.id)} className="flex items-center w-full px-3 py-2 text-sm text-left hover:bg-gray-50 gap-2">
                <span className="flex-1 text-gray-800 truncate">{u.first_name} {u.last_name}</span>
                {assigneeId === u.id && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}
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
