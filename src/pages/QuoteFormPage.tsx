import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, Plus, Trash2, ChevronDown, ChevronRight, Layers } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useCompany } from '../hooks/useCompany'
import { useLanguage } from '../hooks/useLanguage'
import { toast } from '../components/ui/Toast'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import NumberInput from '../components/ui/NumberInput'
import { computeTotals, rawTotal, purchasedTotal, processTotal, packagingTotal } from '../hooks/useCalculator'
import { currencySymbol } from '../lib/currency'
import type {
  Customer, Machine, LaborRate, Quote, QuoteItem, Calculation,
  RawMaterialRow, PurchasedPartRow, ProcessRow, PackagingRow,
} from '../types/database'

interface Piece {
  key: string
  id?: string
  part_name: string
  part_number: string
  quantity: number
  notes: string
  raw_materials: RawMaterialRow[]
  purchased_parts: PurchasedPartRow[]
  processes: ProcessRow[]
  packaging: PackagingRow[]
  oh_material_pct: number
  oh_mfg_pct: number
  oh_sga_pct: number
  oh_logistics_pct: number
  oh_rd_pct: number
  profit_pct: number
}

let keyc = 0
const nk = () => `p${++keyc}`

export default function QuoteFormPage() {
  const { id } = useParams()
  const editMode = !!id
  const { company } = useCompany()
  const { t } = useLanguage()
  const s = t.qp
  const navigate = useNavigate()
  const cur = company?.currency ?? 'EUR'
  const money = (n: number) => n.toLocaleString('de-DE', { style: 'currency', currency: cur })

  const [customers, setCustomers] = useState<Customer[]>([])
  const [machines, setMachines] = useState<Machine[]>([])
  const [laborRates, setLaborRates] = useState<LaborRate[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [customerId, setCustomerId] = useState('')
  const [title, setTitle] = useState('')
  const [validUntil, setValidUntil] = useState('')
  const [deliveryDate, setDeliveryDate] = useState('')
  const [notes, setNotes] = useState('')
  const [pieces, setPieces] = useState<Piece[]>([])
  const [openPiece, setOpenPiece] = useState<string | null>(null)

  function newPiece(): Piece {
    return {
      key: nk(), part_name: '', part_number: '', quantity: 1, notes: '',
      raw_materials: [], purchased_parts: [], processes: [], packaging: [],
      oh_material_pct: company?.overhead_material_pct ?? 0,
      oh_mfg_pct: company?.overhead_mfg_pct ?? 0,
      oh_sga_pct: company?.overhead_sga_pct ?? 0,
      oh_logistics_pct: company?.overhead_logistics_pct ?? 0,
      oh_rd_pct: company?.overhead_rd_pct ?? 0,
      profit_pct: company?.overhead_profit_pct ?? 15,
    }
  }

  useEffect(() => { if (company) init() }, [company, id])

  async function init() {
    if (!company) return
    setLoading(true)
    const [{ data: cust }, { data: mach }, { data: ws }] = await Promise.all([
      supabase.from('customers').select('*').eq('company_id', company.id).order('name'),
      supabase.from('machines').select('*').eq('company_id', company.id).eq('is_active', true).order('name'),
      supabase.from('labor_rates').select('*').eq('company_id', company.id).eq('is_active', true).order('name'),
    ])
    setCustomers((cust as Customer[]) ?? [])
    setMachines((mach as Machine[]) ?? [])
    setLaborRates((ws as LaborRate[]) ?? [])

    if (editMode && id) {
      const { data: q } = await supabase.from('quotes').select('*').eq('id', id).single()
      if (q) {
        const quote = q as Quote
        setCustomerId(quote.customer_id); setTitle(quote.title)
        setValidUntil(quote.valid_until ?? ''); setDeliveryDate(quote.delivery_date ?? ''); setNotes(quote.notes ?? '')
        const { data: items } = await supabase.from('quote_items').select('*').eq('quote_id', id).order('position')
        const itemIds = (items as QuoteItem[] ?? []).map(i => i.id)
        const { data: calcs } = itemIds.length
          ? await supabase.from('calculations').select('*').in('quote_item_id', itemIds)
          : { data: [] }
        const calcMap: Record<string, Calculation> = {}
        for (const c of (calcs as Calculation[]) ?? []) calcMap[c.quote_item_id] = c
        const ps: Piece[] = (items as QuoteItem[] ?? []).map(it => {
          const c = calcMap[it.id]
          return {
            key: nk(), id: it.id, part_name: it.part_name, part_number: it.part_number ?? '',
            quantity: it.quantity, notes: it.notes ?? '',
            raw_materials: c?.raw_materials ?? [], purchased_parts: c?.purchased_parts ?? [],
            processes: c?.processes ?? [], packaging: c?.packaging ?? [],
            oh_material_pct: c?.oh_material_pct ?? company.overhead_material_pct,
            oh_mfg_pct: c?.oh_mfg_pct ?? company.overhead_mfg_pct,
            oh_sga_pct: c?.oh_sga_pct ?? company.overhead_sga_pct,
            oh_logistics_pct: c?.oh_logistics_pct ?? company.overhead_logistics_pct,
            oh_rd_pct: c?.oh_rd_pct ?? company.overhead_rd_pct,
            profit_pct: c?.profit_pct ?? company.overhead_profit_pct,
          }
        })
        setPieces(ps.length ? ps : [newPiece()])
        setOpenPiece(ps[0]?.key ?? null)
      }
    } else {
      const p = newPiece()
      setPieces([p]); setOpenPiece(p.key)
    }
    setLoading(false)
  }

  function patchPiece(key: string, patch: Partial<Piece>) {
    setPieces(ps => ps.map(p => p.key === key ? { ...p, ...patch } : p))
  }
  function addPiece() { const p = newPiece(); setPieces(ps => [...ps, p]); setOpenPiece(p.key) }
  function removePiece(key: string) { setPieces(ps => ps.filter(p => p.key !== key)) }

  async function save() {
    if (!company || !customerId || !title.trim()) return
    setSaving(true)
    let quoteId = id
    if (editMode && id) {
      const { error } = await supabase.from('quotes').update({
        customer_id: customerId, title: title.trim(),
        valid_until: validUntil || null, delivery_date: deliveryDate || null, notes: notes.trim() || null,
        updated_at: new Date().toISOString(),
      }).eq('id', id)
      if (error) { setSaving(false); toast.error(error.message); return }
      await supabase.from('quote_items').delete().eq('quote_id', id)
    } else {
      const { data: qnum, error: ne } = await (supabase as any).rpc('generate_quote_number', { p_company_id: company.id })
      if (ne) { setSaving(false); toast.error(ne.message); return }
      const { data: created, error } = await supabase.from('quotes').insert({
        company_id: company.id, customer_id: customerId, quote_number: qnum, title: title.trim(),
        status: 'draft', valid_until: validUntil || null, delivery_date: deliveryDate || null,
        notes: notes.trim() || null, created_by: (await supabase.auth.getUser()).data.user!.id,
      }).select('id').single()
      if (error) { setSaving(false); toast.error(error.message); return }
      quoteId = (created as { id: string }).id
    }

    // Insert items + calcs
    for (let i = 0; i < pieces.length; i++) {
      const p = pieces[i]
      const { data: item, error: ie } = await supabase.from('quote_items').insert({
        quote_id: quoteId, company_id: company.id, position: i + 1,
        part_name: p.part_name.trim() || `#${i + 1}`, part_number: p.part_number.trim() || null,
        quantity: p.quantity || 0, notes: p.notes.trim() || null,
      }).select('id').single()
      if (ie) { setSaving(false); toast.error(ie.message); return }
      const totals = computeTotals(p, p.quantity)
      const { error: ce } = await supabase.from('calculations').insert({
        quote_item_id: (item as { id: string }).id, company_id: company.id, version: 1,
        raw_materials: p.raw_materials, purchased_parts: p.purchased_parts, processes: p.processes,
        tooling: [], investments: [], packaging: p.packaging,
        oh_material_pct: p.oh_material_pct, oh_mfg_pct: p.oh_mfg_pct, oh_sga_pct: p.oh_sga_pct,
        oh_logistics_pct: p.oh_logistics_pct, oh_rd_pct: p.oh_rd_pct, profit_pct: p.profit_pct,
        ...totals,
      })
      if (ce) { setSaving(false); toast.error(ce.message); return }
    }
    setSaving(false)
    toast.success(t.common.saved)
    navigate(`/quotes/${quoteId}`)
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      <button onClick={() => navigate('/quotes')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-4"><ChevronLeft className="w-4 h-4" />{s.quotes}</button>
      <h1 className="text-2xl font-bold text-gray-900 mb-5">{editMode ? s.editQuote : s.newQuote}</h1>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">{s.customer}</label>
            <select value={customerId} onChange={e => setCustomerId(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              <option value="">{t.common.select}</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <Input id="q-title" label={s.title} value={title} onChange={e => setTitle(e.target.value)} />
          <Input id="q-valid" label={s.validUntil} type="date" value={validUntil} onChange={e => setValidUntil(e.target.value)} />
          <Input id="q-deliv" label={s.deliveryDate} type="date" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} />
          <div className="sm:col-span-2 flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">{s.notes}</label>
            <textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
        </div>
      </div>

      {/* Pieces */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-700">{s.pieces} ({pieces.length})</h2>
        <Button variant="secondary" onClick={addPiece} className="gap-2"><Plus className="w-4 h-4" />{s.addPiece}</Button>
      </div>

      <div className="flex flex-col gap-3 mb-6">
        {pieces.map((p, idx) => (
          <PieceCard key={p.key} piece={p} index={idx} open={openPiece === p.key}
            onToggle={() => setOpenPiece(openPiece === p.key ? null : p.key)}
            onPatch={patch => patchPiece(p.key, patch)} onRemove={() => removePiece(p.key)}
            canRemove={pieces.length > 1} machines={machines} laborRates={laborRates} money={money} cur={cur} />
        ))}
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={() => navigate('/quotes')} disabled={saving}>{t.common.cancel}</Button>
        <Button loading={saving} onClick={save} disabled={!customerId || !title.trim()}>{s.saveDraft}</Button>
      </div>
    </div>
  )
}

// ─────────────── Piece card ───────────────
function PieceCard({ piece: p, index, open, onToggle, onPatch, onRemove, canRemove, machines, laborRates, money, cur }: {
  piece: Piece; index: number; open: boolean; onToggle: () => void
  onPatch: (patch: Partial<Piece>) => void; onRemove: () => void; canRemove: boolean
  machines: Machine[]; laborRates: LaborRate[]; money: (n: number) => string; cur: string
}) {
  const { t } = useLanguage()
  const s = t.qp
  const u = s.units
  const sym = currencySymbol(cur)
  const totals = computeTotals(p, p.quantity)
  const totalUnit = `${sym}/${u.piece}`
  const priceUnit = (unit: string) => unit ? `${sym}/${unit}` : sym
  const fmt = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 4 })

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 cursor-pointer" onClick={onToggle}>
        {open ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
        <span className="text-sm font-semibold text-gray-800">{index + 1}. {p.part_name || s.partName}</span>
        <span className="ml-auto text-sm text-gray-500">{money(totals.selling_price)}</span>
        {canRemove && <button onClick={e => { e.stopPropagation(); onRemove() }} className="p-1 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>}
      </div>

      {open && (
        <div className="p-5 flex flex-col gap-6">
          {/* Part info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input id={`pn-${p.key}`} label={s.partName} value={p.part_name} onChange={e => onPatch({ part_name: e.target.value })} />
            <Input id={`pnum-${p.key}`} label={s.partNumber} value={p.part_number} onChange={e => onPatch({ part_number: e.target.value })} />
            <NumberInput id={`pq-${p.key}`} label={s.quantity} unit={u.piece} value={p.quantity} onValue={v => onPatch({ quantity: v ?? 0 })} />
          </div>

          {/* Raw materials */}
          <Section title={s.rawMaterials} onAdd={() => onPatch({ raw_materials: [...p.raw_materials, { name: '', unit: '', qty_per_piece: 0, price_per_unit: 0, scrap_pct: 0, total: 0 }] })} addLabel={s.addRow}>
            {p.raw_materials.map((r, i) => (
              <RowCard key={i} onRemove={() => onPatch({ raw_materials: p.raw_materials.filter((_, j) => j !== i) })}>
                <Input id={`rm-n-${i}`} label={s.matName} value={r.name} onChange={e => onPatch({ raw_materials: upd(p.raw_materials, i, { name: e.target.value }) })} />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <NumberInput id={`rm-q-${i}`} label={s.qtyPerPiece} unit={r.unit || u.piece} value={r.qty_per_piece} onValue={v => onPatch({ raw_materials: upd(p.raw_materials, i, { qty_per_piece: v ?? 0 }) })} />
                  <NumberInput id={`rm-p-${i}`} label={s.pricePerUnit} unit={priceUnit(r.unit)} value={r.price_per_unit} onValue={v => onPatch({ raw_materials: upd(p.raw_materials, i, { price_per_unit: v ?? 0 }) })} />
                  <NumberInput id={`rm-s-${i}`} label={s.scrapPct} unit={u.pct} value={r.scrap_pct} onValue={v => onPatch({ raw_materials: upd(p.raw_materials, i, { scrap_pct: v ?? 0 }) })} />
                  <ResultField label={s.total} value={fmt(rawTotal(r))} unit={totalUnit} />
                </div>
                <Input id={`rm-u-${i}`} label={s.unit} value={r.unit} onChange={e => onPatch({ raw_materials: upd(p.raw_materials, i, { unit: e.target.value }) })} className="sm:max-w-[160px]" />
              </RowCard>
            ))}
          </Section>

          {/* Purchased parts */}
          <Section title={s.purchasedParts} onAdd={() => onPatch({ purchased_parts: [...p.purchased_parts, { name: '', supplier: '', unit: '', qty_per_piece: 0, price_per_unit: 0, total: 0 }] })} addLabel={s.addRow}>
            {p.purchased_parts.map((r, i) => (
              <RowCard key={i} onRemove={() => onPatch({ purchased_parts: p.purchased_parts.filter((_, j) => j !== i) })}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input id={`pp-n-${i}`} label={s.matName} value={r.name} onChange={e => onPatch({ purchased_parts: upd(p.purchased_parts, i, { name: e.target.value }) })} />
                  <Input id={`pp-sup-${i}`} label={s.supplier} value={r.supplier} onChange={e => onPatch({ purchased_parts: upd(p.purchased_parts, i, { supplier: e.target.value }) })} />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <NumberInput id={`pp-q-${i}`} label={s.qtyPerPiece} unit={u.piece} value={r.qty_per_piece} onValue={v => onPatch({ purchased_parts: upd(p.purchased_parts, i, { qty_per_piece: v ?? 0 }) })} />
                  <NumberInput id={`pp-p-${i}`} label={s.pricePerUnit} unit={sym} value={r.price_per_unit} onValue={v => onPatch({ purchased_parts: upd(p.purchased_parts, i, { price_per_unit: v ?? 0 }) })} />
                  <ResultField label={s.total} value={fmt(purchasedTotal(r))} unit={totalUnit} />
                </div>
              </RowCard>
            ))}
          </Section>

          {/* Processes */}
          <Section title={s.processes} onAdd={() => onPatch({ processes: [...p.processes, { ref_type: 'machine', ref_id: null, name: '', hourly_rate: 0, setup_min: 0, cycle_min: 0, total: 0 }] })} addLabel={s.addRow}>
            {p.processes.map((r, i) => {
              const machineOpts = [
                ...machines.map(m => ({ id: m.id, type: 'machine' as const, name: m.name, rate: (m.use_manual_rate ? m.hourly_rate_manual : m.hourly_rate_computed) ?? 0 })),
                ...laborRates.map(w => ({ id: w.id, type: 'workstation' as const, name: w.name, rate: (w.hourly_rate_computed ?? 0) })),
              ]
              return (
                <RowCard key={i} onRemove={() => onPatch({ processes: p.processes.filter((_, j) => j !== i) })}>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">{s.machineOrStation}</label>
                    <select value={r.ref_id ?? ''} onChange={e => {
                      const opt = machineOpts.find(o => o.id === e.target.value)
                      onPatch({ processes: upd(p.processes, i, opt ? { ref_id: opt.id, ref_type: opt.type, name: opt.name, hourly_rate: opt.rate } : { ref_id: null }) })
                    }} className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                      <option value="">—</option>
                      {machineOpts.map(o => <option key={o.id} value={o.id}>{o.name} ({o.rate} {sym}/h)</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <NumberInput id={`pr-r-${i}`} label={s.hourlyRate} unit={`${sym} ${u.perHour}`} value={r.hourly_rate} onValue={v => onPatch({ processes: upd(p.processes, i, { hourly_rate: v ?? 0 }) })} />
                    <NumberInput id={`pr-s-${i}`} label={s.setupMin} unit={u.min} value={r.setup_min} onValue={v => onPatch({ processes: upd(p.processes, i, { setup_min: v ?? 0 }) })} />
                    <NumberInput id={`pr-c-${i}`} label={s.cycleMin} unit={u.min} value={r.cycle_min} onValue={v => onPatch({ processes: upd(p.processes, i, { cycle_min: v ?? 0 }) })} />
                    <ResultField label={s.total} value={fmt(processTotal(r, p.quantity))} unit={totalUnit} />
                  </div>
                </RowCard>
              )
            })}
          </Section>

          {/* Packaging */}
          <Section title={s.packaging} onAdd={() => onPatch({ packaging: [...p.packaging, { name: '', qty_per_piece: 0, price_per_unit: 0, total: 0 }] })} addLabel={s.addRow}>
            {p.packaging.map((r, i) => (
              <RowCard key={i} onRemove={() => onPatch({ packaging: p.packaging.filter((_, j) => j !== i) })}>
                <Input id={`pk-n-${i}`} label={s.matName} value={r.name} onChange={e => onPatch({ packaging: upd(p.packaging, i, { name: e.target.value }) })} />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <NumberInput id={`pk-q-${i}`} label={s.qtyPerPiece} unit={u.piece} value={r.qty_per_piece} onValue={v => onPatch({ packaging: upd(p.packaging, i, { qty_per_piece: v ?? 0 }) })} />
                  <NumberInput id={`pk-p-${i}`} label={s.pricePerUnit} unit={sym} value={r.price_per_unit} onValue={v => onPatch({ packaging: upd(p.packaging, i, { price_per_unit: v ?? 0 }) })} />
                  <ResultField label={s.total} value={fmt(packagingTotal(r))} unit={totalUnit} />
                </div>
              </RowCard>
            ))}
          </Section>

          {/* Overhead */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{s.overhead}</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {([['oh_material_pct', s.materialOh], ['oh_mfg_pct', s.mfgOh], ['oh_sga_pct', s.sga], ['oh_logistics_pct', s.logistics], ['oh_rd_pct', s.rd], ['profit_pct', s.profit]] as const).map(([k, label]) => (
                <NumberInput key={k} id={`${k}-${p.key}`} label={label} unit={u.pct} value={p[k]} onValue={v => onPatch({ [k]: v ?? 0 } as Partial<Piece>)} />
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <Stat label={s.totalMaterial} value={money(totals.total_raw_materials + totals.total_purchased_parts)} />
            <Stat label={s.totalProcesses} value={money(totals.total_processes)} />
            <Stat label={s.totalOverhead} value={money(totals.total_overhead)} />
            <Stat label={s.costPerPiece} value={money(totals.cost_per_piece)} />
            <Stat label={s.sellingPrice} value={money(totals.selling_price)} strong />
            <Stat label={s.annualValue} value={money(totals.annual_value)} strong />
          </div>
        </div>
      )}
    </div>
  )
}

function Section({ title, onAdd, addLabel, children }: { title: string; onAdd: () => void; addLabel: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5"><Layers className="w-3.5 h-3.5" />{title}</h4>
        <button onClick={onAdd} className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"><Plus className="w-3.5 h-3.5" />{addLabel}</button>
      </div>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  )
}

function RowCard({ onRemove, children }: { onRemove: () => void; children: React.ReactNode }) {
  return (
    <div className="relative rounded-lg border border-gray-200 p-4 pr-9 flex flex-col gap-3">
      <button onClick={onRemove} className="absolute top-3 right-3 text-gray-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
      {children}
    </div>
  )
}

function ResultField({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50">
        <span className="flex-1 min-w-0 px-3 py-2 text-sm font-medium text-gray-800 truncate">{value}</span>
        <span className="px-3 text-sm text-gray-400 whitespace-nowrap border-l border-gray-200 self-stretch flex items-center">{unit}</span>
      </div>
    </div>
  )
}

function Stat({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className={strong ? 'text-base font-bold text-gray-900' : 'text-sm font-medium text-gray-700'}>{value}</p>
    </div>
  )
}

function upd<T>(arr: T[], i: number, patch: Partial<T>): T[] {
  return arr.map((x, j) => j === i ? { ...x, ...patch } : x)
}
