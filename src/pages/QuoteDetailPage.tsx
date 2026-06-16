import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, Pencil } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useCompany } from '../hooks/useCompany'
import { useLanguage } from '../hooks/useLanguage'
import { toast } from '../components/ui/Toast'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import type { Quote, QuoteItem, Calculation, Customer, QuoteStatus, LostReason } from '../types/database'
import { format } from 'date-fns'

const STATUS_STYLE: Record<QuoteStatus, string> = {
  draft: 'bg-gray-100 text-gray-600', sent: 'bg-blue-100 text-blue-700',
  won: 'bg-green-100 text-green-700', lost: 'bg-red-100 text-red-700', frozen: 'bg-purple-100 text-purple-700',
}
const LOST_REASONS: LostReason[] = ['price', 'time', 'quality', 'competitor', 'other']

export default function QuoteDetailPage() {
  const { id } = useParams()
  const { company } = useCompany()
  const { t } = useLanguage()
  const s = t.qp
  const navigate = useNavigate()
  const cur = company?.currency ?? 'EUR'
  const money = (n: number) => (n ?? 0).toLocaleString('de-DE', { style: 'currency', currency: cur })

  const [quote, setQuote] = useState<Quote | null>(null)
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [items, setItems] = useState<QuoteItem[]>([])
  const [calcs, setCalcs] = useState<Record<string, Calculation>>({})
  const [loading, setLoading] = useState(true)
  const [lostOpen, setLostOpen] = useState(false)
  const [lostReason, setLostReason] = useState<LostReason>('price')

  useEffect(() => { if (id) load() }, [id])

  async function load() {
    setLoading(true)
    const { data: q } = await supabase.from('quotes').select('*').eq('id', id!).single()
    if (!q) { toast.error('Not found'); navigate('/quotes'); return }
    setQuote(q as Quote)
    const { data: cust } = await supabase.from('customers').select('*').eq('id', (q as Quote).customer_id).single()
    setCustomer(cust as Customer | null)
    const { data: its } = await supabase.from('quote_items').select('*').eq('quote_id', id!).order('position')
    setItems((its as QuoteItem[]) ?? [])
    const ids = (its as QuoteItem[] ?? []).map(i => i.id)
    if (ids.length) {
      const { data: cs } = await supabase.from('calculations').select('*').in('quote_item_id', ids)
      const m: Record<string, Calculation> = {}
      for (const c of (cs as Calculation[]) ?? []) m[c.quote_item_id] = c
      setCalcs(m)
    }
    setLoading(false)
  }

  async function setStatus(status: QuoteStatus, reason?: LostReason) {
    if (!quote) return
    const patch: Partial<Quote> = { status, updated_at: new Date().toISOString() }
    if (status === 'sent' && !quote.sent_at) patch.sent_at = new Date().toISOString()
    if (status === 'lost') patch.lost_reason = reason ?? 'other'
    const { error } = await supabase.from('quotes').update(patch).eq('id', quote.id)
    if (error) { toast.error(error.message); return }
    toast.success(t.common.saved); setLostOpen(false); load()
  }

  if (loading || !quote) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>

  const totalAnnual = items.reduce((sum, it) => sum + (calcs[it.id]?.annual_value ?? 0), 0)
  const editable = quote.status === 'draft' || quote.status === 'sent' || quote.status === 'frozen'

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      <button onClick={() => navigate('/quotes')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-4"><ChevronLeft className="w-4 h-4" />{s.quotes}</button>

      <div className="flex items-start justify-between mb-5 gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{quote.title}</h1>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLE[quote.status]}`}>{s.status[quote.status]}</span>
          </div>
          <p className="text-gray-500 text-sm mt-1 font-mono">{quote.quote_number}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {editable && <Button variant="secondary" onClick={() => navigate(`/quotes/${quote.id}/edit`)} className="gap-2"><Pencil className="w-4 h-4" />{t.common.edit}</Button>}
          {quote.status === 'draft' && <Button onClick={() => setStatus('sent')}>{s.markSent}</Button>}
          {quote.status === 'sent' && <>
            <Button onClick={() => setStatus('won')}>{s.markWon}</Button>
            <Button variant="secondary" onClick={() => setLostOpen(true)}>{s.markLost}</Button>
            <Button variant="secondary" onClick={() => setStatus('frozen')}>{s.markFrozen}</Button>
          </>}
          {quote.status === 'frozen' && <Button onClick={() => setStatus('sent')}>{s.markSent}</Button>}
        </div>
      </div>

      {/* Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
        <Info label={s.customer} value={customer?.name ?? '—'} />
        <Info label={s.validUntil} value={quote.valid_until ? format(new Date(quote.valid_until), 'd. M. yyyy') : '—'} />
        <Info label={s.deliveryDate} value={quote.delivery_date ? format(new Date(quote.delivery_date), 'd. M. yyyy') : '—'} />
        <Info label={s.annualValue} value={money(totalAnnual)} />
        {quote.status === 'lost' && quote.lost_reason && <Info label={s.lostReason} value={s.lostReasons[quote.lost_reason]} />}
      </div>

      {/* Pieces */}
      <div className="flex flex-col gap-3">
        {items.map((it, idx) => {
          const c = calcs[it.id]
          return (
            <div key={it.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-800">{idx + 1}. {it.part_name}{it.part_number ? ` · ${it.part_number}` : ''}</h3>
                <span className="text-xs text-gray-500">{s.quantity}: {it.quantity}</span>
              </div>
              {c && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                  <Info label={s.totalMaterial} value={money(c.total_raw_materials + c.total_purchased_parts)} />
                  <Info label={s.totalProcesses} value={money(c.total_processes)} />
                  <Info label={s.totalOverhead} value={money(c.total_overhead)} />
                  <Info label={s.costPerPiece} value={money(c.cost_per_piece)} />
                  <Info label={s.sellingPrice} value={money(c.selling_price)} strong />
                  <Info label={s.annualValue} value={money(c.annual_value)} strong />
                </div>
              )}
            </div>
          )
        })}
      </div>

      <Modal open={lostOpen} onClose={() => setLostOpen(false)} title={s.lostReason} size="sm">
        <div className="flex flex-col gap-1 mb-5">
          <label className="text-sm font-medium text-gray-700">{s.lostReason}</label>
          <select value={lostReason} onChange={e => setLostReason(e.target.value as LostReason)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            {LOST_REASONS.map(r => <option key={r} value={r}>{s.lostReasons[r]}</option>)}
          </select>
        </div>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setLostOpen(false)}>{t.common.cancel}</Button>
          <Button variant="danger" onClick={() => setStatus('lost', lostReason)}>{s.markLost}</Button>
        </div>
      </Modal>
    </div>
  )
}

function Info({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className={strong ? 'text-base font-bold text-gray-900' : 'text-sm font-medium text-gray-700'}>{value}</p>
    </div>
  )
}
