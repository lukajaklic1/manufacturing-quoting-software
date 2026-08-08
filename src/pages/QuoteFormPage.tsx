﻿import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, Navigate } from 'react-router-dom'
import { format } from 'date-fns'
import { ChevronLeft, Plus, Trash2, Boxes, Pencil, Eye, Download, Send, Check, X } from 'lucide-react'
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer'
import OfferPdf from '../components/OfferPdf'
import { supabase } from '../lib/supabase'
import { useCompany } from '../hooks/useCompany'
import { useLanguage } from '../hooks/useLanguage'
import { toast } from '../components/ui/Toast'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import QuoteAttachments from '../components/QuoteAttachments'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { buildSnapshot } from '../lib/offerSnapshot'
import { computeTotals } from '../hooks/useCalculator'
import { getThumbByPath, ensureThumb } from '../lib/thumbs'
import type { Customer, Quote, QuoteItem, Calculation, QuoteAttachment, QuoteStatus, OfferSnapshot } from '../types/database'
import { QuoteStatusBadge } from '../components/ui/QuoteStatusBadge'
import Pagination from '../components/ui/Pagination'

interface PieceRow { key: string; id?: string; part_name: string; part_number: string; quantity: number; thumb_path?: string | null }

// Pick a thumbnail source for a piece: first CAD, else first drawing/image/pdf.
const CAD3D = ['step', 'stp', 'iges', 'igs', 'stl', 'obj', 'ply', '3ds', '3dm', '3mf', 'fbx', 'dae', 'wrl', 'off', 'brep', 'glb', 'gltf', 'fcstd']
const IMG_EXTS = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp', 'tiff', 'tif', 'svg']
function fext(n: string) { return n.toLowerCase().split('.').pop() ?? '' }
function isCad3D(n: string) { return CAD3D.includes(fext(n)) }
function isImg(n: string) { return IMG_EXTS.includes(fext(n)) }

// Fetch a signed URL for an attachment and convert to data-url (for embedding in PDF).
async function attToDataUrl(storagePath: string): Promise<string | null> {
  try {
    const { data } = await supabase.storage.from('quotations').createSignedUrl(storagePath, 3600)
    if (!data?.signedUrl) return null
    const res = await fetch(data.signedUrl)
    if (!res.ok) return null
    const blob = await res.blob()
    return new Promise(resolve => {
      const fr = new FileReader()
      fr.onload = () => resolve(fr.result as string)
      fr.onerror = () => resolve(null)
      fr.readAsDataURL(blob)
    })
  } catch { return null }
}


let keyc = 0
const nk = () => `p${++keyc}`

export default function QuoteFormPage({ readOnly = false }: { readOnly?: boolean }) {
  const { id } = useParams()
  const editMode = !!id
  const { company, hasPerm, isAdmin } = useCompany()
  const { t, lang } = useLanguage()
  const s = t.qp
  const u = s.units
  const navigate = useNavigate()
  const cur = company?.currency ?? 'EUR'
  const money = (n: number) => (n ?? 0).toLocaleString('de-DE', { style: 'currency', currency: cur })

  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [quoteNumber, setQuoteNumber] = useState('')
  const [alreadySent, setAlreadySent] = useState(false)
  const [status, setStatusState] = useState<QuoteStatus>('draft')
  const [confirm, setConfirm] = useState<null | 'won' | 'lost'>(null)
  const [tab, setTab] = useState<'overview' | 'pdf'>('overview')
  const [snapshot, setSnapshot] = useState<OfferSnapshot | null>(null)
  const isSaved = !!quoteNumber
  const [customerId, setCustomerId] = useState('')
  const [contactPerson, setContactPerson] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [paymentTerms, setPaymentTerms] = useState('')
  const [parity, setParity] = useState('')
  const [validUntil, setValidUntil] = useState('')
  const [leadTime, setLeadTime] = useState('')
  const [notes, setNotes] = useState('')
  const [pieces, setPieces] = useState<PieceRow[]>([{ key: nk(), part_name: '', part_number: '', quantity: 1 }])
  const [removedIds, setRemovedIds] = useState<string[]>([])
  const [prices, setPrices] = useState<Record<string, { sell: number; annual: number; quantities?: number[]; allPrices?: number[] }>>({}) // item id â†' totals
  const [attachments, setAttachments] = useState<QuoteAttachment[]>([])
  const [pieceToDelete, setPieceToDelete] = useState<string | null>(null)
  const [deleteQuoteOpen, setDeleteQuoteOpen] = useState(false)
  const [pieceThumbs, setPieceThumbs] = useState<Record<string, string>>({})
  const [piecePage, setPiecePage] = useState(1)
  const PIECE_PAGE_SIZE = 20
  // pieceId â†' cadAttachmentId that currently provides the thumbnail
  const pieceThumbSourceRef = useRef<Record<string, string>>({})

  useEffect(() => { if (company) init() }, [company, id])

  // Refresh snapshot when readOnly is true (after issue completes)
  useEffect(() => {
    if (readOnly && id) {
      supabase.from('quotes').select('snapshot, status').eq('id', id).single().then(({ data: q }) => {
        if (q) {
          setStatusState((q as any).status)
          if ((q as any).snapshot) setSnapshot((q as any).snapshot as OfferSnapshot)
        }
      })
    }
  }, [readOnly, id])

  // Read-only review: seed piece thumbnails from the frozen snapshot (instant, no CAD re-render).
  useEffect(() => {
    if (!readOnly || !snapshot) return
    setPieceThumbs(prev => {
      const next = { ...prev }
      pieces.forEach((p, idx) => {
        if (!p.id || next[p.id]) return
        const snapItem =
          snapshot.items.find(si => p.part_number && si.number === p.part_number && si.name === p.part_name) ||
          snapshot.items.find(si => si.name === p.part_name && (si.number ?? '') === (p.part_number ?? '')) ||
          snapshot.items[idx]
        if (snapItem?.thumb) next[p.id] = snapItem.thumb
      })
      return next
    })
  }, [readOnly, snapshot, pieces])

  // Thumbnail per piece: priority = CAD (3D viewer baked) > image > PDF.
  // Always re-evaluates when attachments change; uses pieceThumbSourceRef to detect
  // when the source attachment changed (e.g. deleted) and clears stale state.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      for (const p of pieces) {
        if (!p.id) continue
        const atts = attachments.filter(a => a.quote_item_id === p.id)
        // Fallback: quote-level attachments (no quote_item_id) when item has none
        const quoteLevelAtts = atts.length === 0 ? attachments.filter(a => !a.quote_item_id) : []

        // Pick best source: item-level first (CAD > image > PDF), then same priority at quote level
        const pickBest = (pool: typeof atts) =>
          pool.find(a => isCad3D(a.file_name)) ??
          pool.find(a => isImg(a.file_name)) ??
          pool.find(a => fext(a.file_name) === 'pdf') ??
          null
        const src = pickBest(atts) ?? pickBest(quoteLevelAtts)

        if (!src) {
          if (pieceThumbs[p.id]) setPieceThumbs(prev => { const n = { ...prev }; delete n[p.id!]; return n })
          delete pieceThumbSourceRef.current[p.id]
          if (p.thumb_path) clearPieceThumb(p.id)
          continue
        }

        // Source unchanged â€" skip
        if (pieceThumbs[p.id] && pieceThumbSourceRef.current[p.id] === src.id) continue

        // Source changed â€" clear stale thumb
        if (pieceThumbSourceRef.current[p.id] && pieceThumbSourceRef.current[p.id] !== src.id) {
          if (!cancelled) setPieceThumbs(prev => { const n = { ...prev }; delete n[p.id!]; return n })
          if (p.thumb_path) { clearPieceThumb(p.id); p.thumb_path = null }
        }

        let dataUrl: string | null = null

        if (isCad3D(src.file_name)) {
          // CAD: use persisted thumbnail baked by 3D viewer in CalculationPage
          dataUrl = await getThumbByPath(src.id, src.thumb_path)
        } else if (isImg(src.file_name)) {
          // Image: check cache first, then fetch from storage as data-url
          dataUrl = await getThumbByPath(src.id, null)
          if (!dataUrl) dataUrl = await attToDataUrl(src.storage_path)
        } else {
          // PDF: auto-render first page via pdf.js
          dataUrl = await ensureThumb(src)
        }

        if (dataUrl && !cancelled) {
          setPieceThumbs(prev => ({ ...prev, [p.id!]: dataUrl! }))
          pieceThumbSourceRef.current[p.id] = src.id
        }
      }
    })()
    return () => { cancelled = true }
  }, [attachments, pieces])

  // Remove a stale (non-CAD) thumbnail from a quote item.
  async function clearPieceThumb(itemId: string) {
    await supabase.from('quote_items').update({ thumb_path: null }).eq('id', itemId)
    setPieces(ps => ps.map(p => p.id === itemId ? { ...p, thumb_path: null } : p))
  }

  // Upload a generated thumbnail PNG to storage and save its path on the quote item.

  async function init() {
    if (!company) return
    setLoading(true)
    const { data: cust } = await supabase.from('customers').select('*').eq('company_id', company.id).order('name')
    setCustomers((cust as Customer[]) ?? [])

    if (editMode && id) {
      const { data: q } = await supabase.from('quotes').select('*').eq('id', id).single()
      if (q) {
        const quote = q as Quote
        setStatusState(quote.status)
        if (readOnly && quote.snapshot) setSnapshot(quote.snapshot as OfferSnapshot)
        // Edit mode: draft/issued/sent editable; locked ones redirect to read-only review.
        if (!readOnly && !['draft', 'issued', 'sent', 'frozen'].includes(quote.status)) { navigate(`/quotes/${id}`, { replace: true }); return }
        setAlreadySent(['sent', 'accepted', 'rejected', 'expired', 'won', 'lost', 'frozen'].includes(quote.status))
        setQuoteNumber(quote.quote_number ?? '')
        setCustomerId(quote.customer_id)
        setContactPerson(quote.contact_person ?? ''); setContactEmail(quote.contact_email ?? ''); setContactPhone(quote.contact_phone ?? '')
        setPaymentTerms(quote.payment_terms ?? ''); setParity(quote.parity ?? '')
        setValidUntil(quote.valid_until ?? ''); setLeadTime(quote.lead_time ?? ''); setNotes(quote.notes ?? '')
      }
      const { data: items } = await supabase.from('quote_items').select('*').eq('quote_id', id).order('position')
      const its = (items as QuoteItem[]) ?? []
      setPieces(its.length ? its.map(it => ({ key: nk(), id: it.id, part_name: it.part_name, part_number: it.part_number ?? '', quantity: it.quantity, thumb_path: it.thumb_path })) : [{ key: nk(), part_name: '', part_number: '', quantity: 1 }])
      const ids = its.map(i => i.id)
      if (ids.length) {
        const { data: calcs } = await supabase.from('calculations').select('*').in('quote_item_id', ids)
        const m: Record<string, { sell: number; annual: number; quantities?: number[]; allPrices?: number[] }> = {}
        for (const cc of (calcs as any[]) ?? []) {
          const qtys: number[] = (cc.quantities ?? []).filter((q: number) => q > 0)
          const allPrices = qtys.map((q: number) => computeTotals(cc, q).selling_price)
          m[cc.quote_item_id] = { sell: cc.selling_price, annual: cc.annual_value, quantities: qtys, allPrices }
        }
        setPrices(m)
      }
      const { data: att } = await supabase.from('quote_attachments').select('*').eq('quote_id', id).order('created_at')
      setAttachments((att as QuoteAttachment[]) ?? [])
    }
    setLoading(false)
  }

  function addPiece() { setPieces(ps => [...ps, { key: nk(), part_name: '', part_number: '', quantity: 1 }]) }
  function removePiece(key: string) {
    setPieces(ps => {
      const p = ps.find(x => x.key === key)
      if (p?.id) setRemovedIds(r => [...r, p.id!])
      return ps.filter(x => x.key !== key)
    })
  }

  // Persist quote + pieces; returns quoteId + map keyâ†'itemId. Preserves existing calculations.
  async function persist(): Promise<{ quoteId: string; ids: Record<string, string> } | null> {
    if (!company || !customerId) { toast.error(s.fillCustomerTitle); return null }
    const cname = customers.find(c => c.id === customerId)?.name ?? ''
    const fields = {
      customer_id: customerId, title: cname,
      contact_person: contactPerson.trim() || null, contact_email: contactEmail.trim() || null, contact_phone: contactPhone.trim() || null,
      payment_terms: paymentTerms.trim() || null, parity: parity.trim() || null,
      valid_until: validUntil || null, lead_time: leadTime.trim() || null, delivery_date: null, notes: notes.trim() || null,
    }
    let quoteId = id
    if (editMode && id) {
      const { error } = await supabase.from('quotes').update({ ...fields, updated_at: new Date().toISOString() }).eq('id', id)
      if (error) { toast.error(error.message); return null }
    } else {
      const { data: qnum, error: ne } = await (supabase as any).rpc('generate_quote_number', { p_company_id: company.id })
      if (ne) { toast.error(ne.message); return null }
      const { data: created, error } = await supabase.from('quotes').insert({
        ...fields, company_id: company.id, quote_number: qnum, status: 'draft',
        created_by: (await supabase.auth.getUser()).data.user!.id,
      }).select('id').single()
      if (error) { toast.error(error.message); return null }
      quoteId = (created as { id: string }).id
    }

    for (const remId of removedIds) await supabase.from('quote_items').delete().eq('id', remId)

    const ids: Record<string, string> = {}
    const next: PieceRow[] = []
    for (let i = 0; i < pieces.length; i++) {
      const p = pieces[i]
      const base = { part_name: p.part_name.trim() || `#${i + 1}`, part_number: p.part_number.trim() || null, quantity: p.quantity || 0, position: i + 1 }
      if (p.id) {
        await supabase.from('quote_items').update(base).eq('id', p.id)
        ids[p.key] = p.id; next.push(p)
      } else {
        const { data: item, error } = await supabase.from('quote_items').insert({ ...base, quote_id: quoteId, company_id: company.id }).select('id').single()
        if (error) { toast.error(error.message); return null }
        const newId = (item as { id: string }).id
        ids[p.key] = newId; next.push({ ...p, id: newId })
      }
    }
    setPieces(next); setRemovedIds([])
    return { quoteId: quoteId!, ids }
  }

  async function save() {
    setSaving(true)
    const res = await persist()
    setSaving(false)
    if (!res) return
    toast.success(t.common.saved)
    if (editMode && status !== 'draft') navigate(`/quotes/${res.quoteId}`)
    else navigate(`/quotes/${res.quoteId}/edit`, { replace: true })
  }

  // Issue the offer: save, validate, freeze a snapshot, set status â†' issued, go to read-only review.
  async function issue() {
    if (!company) return
    setSaving(true)
    const res = await persist()
    if (!res) { setSaving(false); return }
    const [{ data: cust }, { data: its }] = await Promise.all([
      supabase.from('customers').select('*').eq('id', customerId).single(),
      supabase.from('quote_items').select('*').eq('quote_id', res.quoteId).order('position'),
    ])
    const items = (its as QuoteItem[]) ?? []
    const calcs: Record<string, Calculation> = {}
    if (items.length) {
      const { data: cs } = await supabase.from('calculations').select('*').in('quote_item_id', items.map(i => i.id))
      for (const c of (cs as Calculation[]) ?? []) calcs[c.quote_item_id] = c
    }
    if (items.length === 0) { setSaving(false); toast.error(s.validateNoPieces); return }

    // pieceThumbs state is already populated (keyed by quote_item id)
    const itemThumbs: Record<string, string> = { ...pieceThumbs }

    const snap = await buildSnapshot({ ...({} as Quote), quote_number: quoteNumber, valid_until: validUntil || null, lead_time: leadTime || null, payment_terms: paymentTerms || null, parity: parity || null, contact_person: contactPerson || null, contact_email: contactEmail || null, contact_phone: contactPhone || null, notes: notes || null } as Quote, cust as Customer | null, company, items, calcs, itemThumbs)
    if (snap.items.some(it => !(it.quantities[0]?.unit_price > 0))) { setSaving(false); toast.error(s.validateNoPrice); return }
    const newStatus = status === 'sent' ? 'sent' : 'issued'
    const { error } = await supabase.from('quotes').update({ snapshot: snap, status: newStatus, issued_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', res.quoteId)
    setSaving(false)
    if (error) { toast.error(error.message); return }
    toast.success(s.offerIssued)
    navigate(`/quotes/${res.quoteId}`)
  }

  async function changeStatus(next: QuoteStatus) {
    if (!id) return
    const patch: Partial<Quote> = { status: next, updated_at: new Date().toISOString() }
    if (next === 'sent') patch.sent_at = new Date().toISOString()
    const { error } = await supabase.from('quotes').update(patch).eq('id', id)
    if (error) { toast.error(error.message); return }
    setStatusState(next); setAlreadySent(['sent', 'accepted', 'rejected', 'expired', 'won', 'lost', 'frozen'].includes(next)); toast.success(t.common.saved)
  }

  async function deleteQuote() {
    if (!id) return
    const { error } = await supabase.from('quotes').delete().eq('id', id)
    if (error) { toast.error(error.message); return }
    toast.success(t.common.deleted); navigate('/quotes')
  }

  async function calculate(key: string) {
    setSaving(true)
    const res = await persist()
    setSaving(false)
    if (!res) return
    navigate(`/quotes/${res.quoteId}/items/${res.ids[key]}`)
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
  if (!readOnly && company && !hasPerm('quotes', 'create')) return <Navigate to="/quotes" replace />

  const grand = pieces.reduce((a, p) => {
    const pr = p.id ? prices[p.id] : undefined
    return { turnover: a.turnover + (pr?.annual ?? 0), sell: a.sell }
  }, { turnover: 0, sell: 0 })

  return (
    <div className="p-4 lg:p-6">
      {/* Top nav bar */}
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => navigate('/quotes')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"><ChevronLeft className="w-4 h-4" />{s.quotes}</button>
      </div>
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
          <h1 className="text-xl font-semibold tracking-tight text-gray-900">
            {readOnly ? s.reviewTitle : (editMode ? s.editQuote : s.newQuote)}
          </h1>
          {quoteNumber && <span className="font-mono text-sm" style={{ color: '#7f7f7f' }} spellCheck={false}>{quoteNumber}</span>}
          {readOnly && <QuoteStatusBadge status={status} label={s.status[status]} />}
        </div>
        <div className="flex flex-wrap gap-2">
          {!readOnly && <>
            {isSaved && status === 'draft' && <Button variant="secondary" onClick={() => setDeleteQuoteOpen(true)} disabled={saving} className="text-red-600"><Trash2 className="w-4 h-4" /></Button>}
            {!isSaved && <Button variant="secondary" onClick={() => navigate('/quotes')} disabled={saving}>{t.common.back}</Button>}
            {isSaved && status !== 'draft' && <Button variant="secondary" onClick={() => navigate(`/quotes/${id}`)} disabled={saving}>{t.common.back}</Button>}
            {status === 'draft'
              ? <><Button variant="secondary" loading={saving} onClick={save} disabled={!customerId}>{t.common.save}</Button>
                  <Button loading={saving} onClick={issue} disabled={!customerId}>{s.issueOffer}</Button></>
              : <Button loading={saving} onClick={save} disabled={!customerId}>{s.saveChanges}</Button>
            }
          </>}
          {readOnly && <>
            {hasPerm('quotes', 'create') && (status === 'draft' || status === 'issued' || status === 'sent') &&
              <Button variant="secondary" onClick={() => { window.location.href = `/quotes/${id}/edit` }} className="gap-1.5"><Pencil className="w-3.5 h-3.5" />{s.editOffer}</Button>}
            {hasPerm('quotes', 'create') && status === 'draft' &&
              <Button loading={saving} onClick={issue} disabled={!customerId} className="gap-1.5">{s.issueOffer}</Button>}
            {status !== 'draft' && snapshot && <PDFDownloadLink document={<OfferPdf snap={snapshot} lang={lang} />} fileName={`Ponudba_${quoteNumber}.pdf`}>
              <Button variant="secondary" className="gap-1.5"><Download className="w-3.5 h-3.5" />{s.downloadPdf}</Button>
            </PDFDownloadLink>}
            {hasPerm('quotes', 'create') && status === 'issued' && <Button onClick={() => changeStatus('sent')} className="gap-1.5"><Send className="w-3.5 h-3.5" />{s.markSentLabel}</Button>}
            {hasPerm('quotes', 'create') && status === 'sent' && <>
              <Button onClick={() => setConfirm('won')} className="gap-1.5"><Check className="w-3.5 h-3.5" />{s.markAccepted}</Button>
              <Button variant="secondary" onClick={() => setConfirm('lost')} className="gap-1.5"><X className="w-3.5 h-3.5" />{s.markRejected}</Button>
            </>}
            {(status === 'won' || status === 'lost') && isAdmin &&
              <Button variant="secondary" onClick={() => changeStatus('sent')} className="gap-1.5">{s.adminRevert}</Button>}
          </>}
        </div>
      </div>

      {!readOnly && alreadySent && (
        <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800">{s.alreadySent}</div>
      )}

      {readOnly && (
        <div className="flex items-center gap-1 border-b border-gray-200 mb-5">
          {([['overview', s.tabOverview], ['pdf', s.tabPdf]] as const).map(([k, label]) => (
            <button key={k} onClick={() => setTab(k)}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${tab === k ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>{label}</button>
          ))}
        </div>
      )}

      {tab === 'overview' ? (
      <>{/* Top: quote data (left) + attachments (right) â€" frozen in read-only review */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {/* LEFT COLUMN - Quote Form */}
        <div className={readOnly ? 'pointer-events-none select-none' : ''}>
          <fieldset disabled={readOnly}>
          {/* Quote header */}
          <div className={`bg-white rounded-xl border p-6 ${readOnly ? 'border-[#eeeff1]' : 'border-gray-200'}`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-[#7f7f7f]">{s.customer}</label>
                {readOnly
                  ? <div className="rounded-lg border px-3 py-2 text-sm" style={{ backgroundColor: '#f9fafb', borderColor: '#eeeff1', color: '#52525b' }}>
                      {customers.find(c => c.id === customerId)?.name || '—'}
                    </div>
                  : <select value={customerId} onChange={e => {
                      const cid = e.target.value
                      setCustomerId(cid)
                      const c = customers.find(x => x.id === cid)
                      if (c) { setContactPerson(c.contact_person ?? ''); setContactEmail(c.email ?? ''); setContactPhone(c.phone ?? ''); setPaymentTerms(c.payment_terms ?? ''); setParity(c.parity ?? '') }
                    }} className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                      <option value="">{t.common.select}</option>
                      {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>}
              </div>
              <Input id="q-contact" label={s.contactPerson} value={contactPerson} onChange={e => setContactPerson(e.target.value)} />
              <Input id="q-email" label={t.common.email} type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} />
              <Input id="q-phone" label={t.common.phone} value={contactPhone} onChange={e => setContactPhone(e.target.value)} />
              <Input id="q-payment" label={s.paymentTerms} value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)} />
              <Input id="q-parity" label={s.parity} value={parity} onChange={e => setParity(e.target.value)} />
              <Input id="q-valid" label={s.validUntil}
                type={readOnly ? 'text' : 'date'}
                value={readOnly ? (validUntil ? format(new Date(validUntil), 'd. M. yyyy') : '') : validUntil}
                onChange={e => setValidUntil(e.target.value)} />
              <Input id="q-lead" label={s.leadTime} placeholder={readOnly ? '' : s.leadTimeHint} value={leadTime} onChange={e => setLeadTime(e.target.value)} />
              <div className="sm:col-span-2 flex flex-col gap-1">
                <label className="text-xs font-medium text-[#7f7f7f]">{s.notes}</label>
                <textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:bg-gray-50 disabled:text-[#52525b] disabled:border-[#eeeff1] disabled:cursor-not-allowed" />
              </div>
            </div>
          </div>
          </fieldset>
        </div>

        {/* RIGHT COLUMN - Attachments */}
        <div>
          {company && <QuoteAttachments quoteId={id} companyId={company.id} attachments={attachments} onChange={setAttachments} readonly={readOnly} preview />}
        </div>
      </div>

      {/* Pieces table */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-700">{s.pieces} ({pieces.length})</h2>
        {!readOnly && <Button variant="secondary" onClick={addPiece} className="gap-2"><Plus className="w-4 h-4" />{s.addPiece}</Button>}
      </div>
      <div className={`bg-white rounded-xl border overflow-x-auto mb-6 ${readOnly ? 'border-[#eeeff1]' : 'border-gray-200'}`}>
        <table className="w-full text-sm min-w-[720px]">
          <thead className={`bg-gray-50 border-b ${readOnly ? 'border-[#eeeff1]' : 'border-gray-200'}`}><tr>
            {['', s.partName, s.partNumber, s.quantity, s.sellingPrice, ''].map((h, i) => (
              <th key={i} className="text-left px-4 py-2.5 text-xs font-medium text-gray-500">{h}</th>
            ))}
          </tr></thead>
          <tbody className={`divide-y ${readOnly ? 'divide-[#eeeff1]' : 'divide-gray-200'}`}>
            {pieces.slice((piecePage - 1) * PIECE_PAGE_SIZE, piecePage * PIECE_PAGE_SIZE).map((p, idx) => (
              <tr key={p.key} className="hover:bg-[#fbfbfb] cursor-pointer" onClick={() => readOnly ? (p.id && navigate(`/quotes/${id}/items/${p.id}?ro=1`)) : calculate(p.key)}>
                <td className="px-4 py-2 w-14">
                  <div className="w-11 h-11 rounded-lg bg-gray-100 flex items-center justify-center text-gray-300 overflow-hidden">
                    {p.id && pieceThumbs[p.id] ? <img src={pieceThumbs[p.id]} alt="" className="w-full h-full object-contain" /> : <Boxes className="w-5 h-5" />}
                  </div>
                </td>
                <td className="px-2 py-2 text-sm font-medium text-gray-900">{p.part_name || `#${idx + 1}`}</td>
                <td className="px-2 py-2 w-32 text-sm text-gray-600">{p.part_number || 'â€"'}</td>
                <td className="px-2 py-2 w-56 text-sm text-gray-700 whitespace-nowrap">{p.id && prices[p.id]?.quantities?.filter(q => q > 0).length ? prices[p.id].quantities!.filter(q => q > 0).map(q => q.toLocaleString('de-DE')).join(', ') + ' ' + u.piece : p.quantity.toLocaleString('de-DE') + ' ' + u.piece}</td>
                <td className="px-4 py-2 text-gray-800 font-medium whitespace-nowrap">{p.id && prices[p.id] ? money(prices[p.id].sell) : 'â€"'}</td>
                <td className="px-4 py-2" onClick={e => e.stopPropagation()}>
                  <div className="flex gap-1 justify-end">
                    {readOnly
                      ? <button onClick={() => p.id && navigate(`/quotes/${id}/items/${p.id}?ro=1`)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-blue-600 hover:bg-blue-50"><Eye className="w-3.5 h-3.5" />{t.common.view}</button>
                      : <>
                        <button onClick={() => calculate(p.key)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-blue-600 hover:bg-blue-50"><Pencil className="w-3.5 h-3.5" />{t.common.edit}</button>
                        {pieces.length > 1 && <button onClick={() => setPieceToDelete(p.key)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>}
                      </>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination total={pieces.length} page={piecePage} pageSize={PIECE_PAGE_SIZE} onChange={setPiecePage} />

      {/* Totals */}
      <div className={`bg-white rounded-xl border p-5 flex flex-wrap items-center justify-end gap-8 ${readOnly ? 'border-[#eeeff1]' : 'border-gray-200'}`}>
        <div className="text-right">
          <p className="text-xs text-gray-500">{s.totalTurnover}</p>
          <p className="text-2xl font-bold text-blue-600">{money(grand.turnover)}</p>
        </div>
      </div>

      <ConfirmDialog open={!!pieceToDelete} onClose={() => setPieceToDelete(null)}
        onConfirm={() => { if (pieceToDelete) removePiece(pieceToDelete); setPieceToDelete(null) }}
        title={s.pieces} message={s.deletePieceConfirm} confirmLabel={t.common.delete} danger />

      </>
      ) : (
        snapshot ? (
          <div className="bg-white rounded-xl border border-gray-200 h-[800px]">
            <PDFViewer key={lang} style={{ width: '100%', height: '100%' }}>
              <OfferPdf snap={snapshot} lang={lang} />
            </PDFViewer>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-400">{s.saveQuoteFirst}</div>
        )
      )}

      <ConfirmDialog open={deleteQuoteOpen} onClose={() => setDeleteQuoteOpen(false)}
        onConfirm={() => { setDeleteQuoteOpen(false); deleteQuote() }}
        title={s.quotes} message={s.deleteQuoteConfirm} confirmLabel={t.common.delete} danger />

      <ConfirmDialog open={!!confirm} onClose={() => setConfirm(null)}
        onConfirm={() => { if (confirm) changeStatus(confirm); setConfirm(null) }}
        title={confirm === 'lost' ? s.markRejected : s.markAccepted}
        message={confirm === 'lost' ? s.confirmLost : s.confirmWon}
        confirmLabel={confirm === 'lost' ? s.markRejected : s.markAccepted} danger={confirm === 'lost'} />
    </div>
  )
}
