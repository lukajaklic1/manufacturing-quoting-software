import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'
import { useNavigate, useParams, useSearchParams, Navigate } from 'react-router-dom'
import { ChevronLeft, ChevronDown, Plus, Trash2, Boxes, ShoppingCart, Cog, Package, Wrench } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useCompany } from '../hooks/useCompany'
import { useLanguage } from '../hooks/useLanguage'
import { translations } from '../i18n/translations'
import { toast } from '../components/ui/Toast'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import NumberInput from '../components/ui/NumberInput'
import QuoteAttachments from '../components/QuoteAttachments'
import { computeTotals, rawTotal, purchasedTotal, processTotal, packagingTotal, toolingTotal } from '../hooks/useCalculator'
import { rawWeight, rawVolumeCm3 } from '../lib/materialWeight'
import { currencySymbol } from '../lib/currency'
import { buildSnapshot } from '../lib/offerSnapshot'
import type {
  Machine, LaborRate, Material, MaterialShape, QuoteItem, Calculation, QuoteAttachment,
  RawMaterialRow, PurchasedPartRow, ProcessRow, PackagingRow, ToolingRow, InvestmentRow,
} from '../types/database'

interface CalcState {
  part_name: string; part_number: string; quantities: number[]; notes: string
  raw_materials: RawMaterialRow[]; purchased_parts: PurchasedPartRow[]; processes: ProcessRow[]; packaging: PackagingRow[]
  tooling: ToolingRow[]; investments: InvestmentRow[]
  oh_material_pct: number; oh_mfg_pct: number; oh_sga_pct: number; oh_logistics_pct: number; oh_rd_pct: number; profit_pct: number
}

function upd<T>(arr: T[], i: number, patch: Partial<T>): T[] { return arr.map((x, j) => j === i ? { ...x, ...patch } : x) }

export default function CalculationPage() {
  const { quoteId, itemId } = useParams()
  const [sp] = useSearchParams()
  const ro = sp.get('ro') === '1' // read-only view (issued offer)
  const { company, hasPerm } = useCompany()
  const { t } = useLanguage()
  const s = t.qp
  const u = s.units
  const navigate = useNavigate()
  const cur = company?.currency ?? 'EUR'
  const sym = currencySymbol(cur)
  const money = (n: number) => (n ?? 0).toLocaleString('de-DE', { style: 'currency', currency: cur })

  const [c, setC] = useState<CalcState | null>(null)
  const [machines, setMachines] = useState<Machine[]>([])
  const [labor, setLabor] = useState<LaborRate[]>([])
  const [materials, setMaterials] = useState<Material[]>([])
  const [attachments, setAttachments] = useState<QuoteAttachment[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const lsKey = (section: string) => `cf_collapsed_${itemId}_${section}`
  const lsLoad = (section: string) => {
    try { return new Set<number>(JSON.parse(localStorage.getItem(lsKey(section)) ?? '[]')) }
    catch { return new Set<number>() }
  }
  const [collapsedProcs, setCollapsedProcs] = useState<Set<number>>(() => lsLoad('procs'))
  const [collapsedMats, setCollapsedMats] = useState<Set<number>>(() => lsLoad('mats'))
  const [collapsedParts, setCollapsedParts] = useState<Set<number>>(() => lsLoad('parts'))
  const [collapsedTooling, setCollapsedTooling] = useState<Set<number>>(() => lsLoad('tooling'))
  const [collapsedPack, setCollapsedPack] = useState<Set<number>>(() => lsLoad('pack'))

  const toggler = (setter: Dispatch<SetStateAction<Set<number>>>, section: string) => (i: number) =>
    setter(prev => {
      const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i)
      localStorage.setItem(lsKey(section), JSON.stringify([...n]))
      return n
    })

  useEffect(() => { if (company && itemId) init() }, [company, itemId])

  async function init() {
    if (!company || !itemId) return
    setLoading(true)
    const [{ data: item }, { data: calc }, { data: mach }, { data: lab }, { data: mat }, { data: att }] = await Promise.all([
      supabase.from('quote_items').select('*').eq('id', itemId).single(),
      supabase.from('calculations').select('*').eq('quote_item_id', itemId).maybeSingle(),
      supabase.from('machines').select('*').eq('company_id', company.id).eq('is_active', true).order('name'),
      supabase.from('labor_rates').select('*').eq('company_id', company.id).eq('is_active', true).order('name'),
      supabase.from('materials').select('*').eq('company_id', company.id).eq('is_active', true).order('name'),
      supabase.from('quote_attachments').select('*').eq('quote_item_id', itemId).order('created_at'),
    ])
    setMachines((mach as Machine[]) ?? [])
    setLabor((lab as LaborRate[]) ?? [])
    setMaterials((mat as Material[]) ?? [])
    setAttachments((att as QuoteAttachment[]) ?? [])
    const it = item as QuoteItem | null
    const cal = calc as Calculation | null
    // Existing calc → its quantities; brand-new piece (no calc yet) → default 1 / 10 / 100.
    const loadedQ = (Array.isArray(cal?.quantities) && cal!.quantities.length)
      ? cal!.quantities
      : (cal ? [it?.quantity ?? 1] : [1, 10, 100])
    const q3 = [loadedQ[0] ?? 1, loadedQ[1] ?? (cal ? 0 : 10), loadedQ[2] ?? (cal ? 0 : 100)]
    setC({
      part_name: it?.part_name ?? '', part_number: it?.part_number ?? '', quantities: q3, notes: it?.notes ?? '',
      raw_materials: cal?.raw_materials ?? [], purchased_parts: cal?.purchased_parts ?? [], processes: cal?.processes ?? [], packaging: cal?.packaging ?? [],
      tooling: cal?.tooling ?? [], investments: cal?.investments ?? [],
      oh_material_pct: cal?.oh_material_pct ?? company.overhead_material_pct,
      oh_mfg_pct: cal?.oh_mfg_pct ?? company.overhead_mfg_pct,
      oh_sga_pct: cal?.oh_sga_pct ?? company.overhead_sga_pct,
      oh_logistics_pct: cal?.oh_logistics_pct ?? company.overhead_logistics_pct,
      oh_rd_pct: cal?.oh_rd_pct ?? company.overhead_rd_pct,
      profit_pct: cal?.profit_pct ?? company.overhead_profit_pct,
    })
    setLoading(false)
  }

  function patch(p: Partial<CalcState>) { setC(c => c ? { ...c, ...p } : c) }

  async function save() {
    if (!c || !itemId) return
    setSaving(true)
    const primaryQty = c.quantities[0] || 0
    const totals = computeTotals(c, primaryQty)
    const cleanQ = c.quantities.filter(q => q > 0)
    const { error: ie } = await supabase.from('quote_items').update({
      part_name: c.part_name.trim() || '#', part_number: c.part_number.trim() || null,
      quantity: primaryQty, notes: c.notes.trim() || null,
    }).eq('id', itemId)
    if (ie) { setSaving(false); toast.error(ie.message); return }
    const { error: ce } = await supabase.from('calculations').upsert({
      quote_item_id: itemId, company_id: company!.id, version: 1,
      quantities: cleanQ.length ? cleanQ : [primaryQty],
      raw_materials: c.raw_materials, purchased_parts: c.purchased_parts, processes: c.processes,
      tooling: c.tooling, investments: c.investments, packaging: c.packaging,
      oh_material_pct: c.oh_material_pct, oh_mfg_pct: c.oh_mfg_pct, oh_sga_pct: c.oh_sga_pct,
      oh_logistics_pct: c.oh_logistics_pct, oh_rd_pct: c.oh_rd_pct, profit_pct: c.profit_pct,
      ...totals, updated_at: new Date().toISOString(),
    }, { onConflict: 'quote_item_id' })
    setSaving(false)
    if (ce) { toast.error(ce.message); return }

    // If the quote already has a snapshot, rebuild it so the PDF stays in sync with saved data.
    if (quoteId) {
      const { data: quote } = await supabase.from('quotes').select('*').eq('id', quoteId).single()
      if ((quote as any)?.snapshot) {
        const [{ data: allItems }, { data: cust }] = await Promise.all([
          supabase.from('quote_items').select('*').eq('quote_id', quoteId).order('position'),
          supabase.from('customers').select('*').eq('id', (quote as any).customer_id).single(),
        ])
        const items = (allItems as QuoteItem[]) ?? []
        if (items.length) {
          const { data: cs } = await supabase.from('calculations').select('*').in('quote_item_id', items.map(i => i.id))
          const calcsMap: Record<string, Calculation> = {}
          for (const c of (cs as Calculation[]) ?? []) calcsMap[c.quote_item_id] = c
          const thumbs: Record<string, string> = {}
          for (const it of items) { if ((it as any).thumb_path) thumbs[it.id] = (it as any).thumb_path }
          const newSnap = await buildSnapshot(quote as any, cust as any, company, items, calcsMap, thumbs)
          await supabase.from('quotes').update({ snapshot: newSnap, updated_at: new Date().toISOString() }).eq('id', quoteId)
        }
      }
    }

    toast.success(t.common.saved)
  }

  if (loading || !c) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
  if (!ro && company && !hasPerm('quotes', 'create')) return <Navigate to="/quotes" replace />

  const primaryQty = c.quantities[0] || 0
  const totals = computeTotals(c, primaryQty)
  // Overhead cascade (per piece at the primary quantity) — mirrors computeTotals.
  const ohMatBase = totals.total_raw_materials + totals.total_purchased_parts + totals.total_packaging
  const ohMfgBase = totals.total_processes + totals.total_tooling
  const ohMatAmt = ohMatBase * (c.oh_material_pct || 0) / 100
  const ohMfgAmt = ohMfgBase * (c.oh_mfg_pct || 0) / 100
  const ohSubtotal = ohMatBase + ohMfgBase + ohMatAmt + ohMfgAmt
  const ohSgaAmt = ohSubtotal * (c.oh_sga_pct || 0) / 100
  const ohLogAmt = ohSubtotal * (c.oh_logistics_pct || 0) / 100
  const ohRdAmt = ohSubtotal * (c.oh_rd_pct || 0) / 100
  const activeQtys = c.quantities.filter(q => q > 0)
  const qtyResults = (activeQtys.length ? activeQtys : [primaryQty]).map(q => ({ q, t: computeTotals(c, q) }))
  const machineRate = (m: Machine) => (m.use_manual_rate ? m.hourly_rate_manual : m.hourly_rate_computed) ?? 0
  const laborRate = (l: LaborRate) => l.hourly_rate_computed ?? 0

  return (
    <div className="p-4 lg:p-6 lg:h-full lg:flex lg:flex-col">
      <button onClick={() => navigate(ro ? `/quotes/${quoteId}` : `/quotes/${quoteId}/edit`)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-4 shrink-0"><ChevronLeft className="w-4 h-4" />{ro ? s.reviewTitle : s.reviewOffer}</button>

      <div className="flex items-center justify-between gap-3 mb-5 flex-wrap shrink-0">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">{c.part_name || s.partName}</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => navigate(ro ? `/quotes/${quoteId}` : `/quotes/${quoteId}/edit`)} disabled={saving}>{t.common.back}</Button>
          {!ro && <Button loading={saving} onClick={save}>{t.common.save}</Button>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:flex-1 lg:min-h-0">
        <fieldset disabled={ro} style={{ display: 'contents' }}>
        {/* Calculator — scrolls inside its own column (scrollbar sits at the column edge) */}
        <div className="flex flex-col gap-5 lg:overflow-y-auto lg:pr-3 lg:pb-6">
          <div className={ro ? 'pointer-events-none select-none contents' : 'contents'}>
          {/* Part info + quantities */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input id="pn" label={s.partName} value={c.part_name} onChange={e => patch({ part_name: e.target.value })} />
              <Input id="pnum" label={s.partNumber} value={c.part_number} onChange={e => patch({ part_number: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium text-label">{s.quantity}</label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                {[0, 1, 2].map(i => (
                  <NumberInput key={i} unit={u.piece} value={c.quantities[i] ?? 0}
                    onValue={v => { const q = [...c.quantities]; q[i] = v ?? 0; patch({ quantities: q }) }}
                    className="rounded-md border-gray-200 px-2 py-1 text-sm disabled:bg-gray-50 disabled:text-gray-400" />
                ))}
              </div>
            </div>
          </div>

          {/* Raw materials */}
          <SectionPanel icon={Boxes} title={s.rawMaterials} addLabel={s.addMaterial} ro={ro}
            onAdd={() => patch({ raw_materials: [...c.raw_materials, { material_id: null, name: '', density: 0, price_per_kg: 0, shape: 'sheet', length: 0, width: 0, thickness: 0, diameter: 0, wall: 0, manual_weight: 0, pieces_per_stock: 1, scrap_pct: 0, weight: 0, total: 0 }] })}>
            {c.raw_materials.length === 0 ? <Empty /> : (
              <div className="flex flex-col gap-3">
                {c.raw_materials.map((r, i) => {
                  const set = (pp: Partial<RawMaterialRow>) => patch({ raw_materials: upd(c.raw_materials, i, pp) })
                  const collapsed = collapsedMats.has(i)
                  return (
                    <div key={i} className="relative rounded-xl bg-white border border-gray-200 p-3 pr-16">
                      <div className="absolute top-2.5 right-2.5 flex items-center gap-2" style={{ pointerEvents: 'auto' }}>
                        <div role="button" onClick={() => toggler(setCollapsedMats, 'mats')(i)} className="text-gray-400 hover:text-gray-700 cursor-pointer"><ChevronDown className={`w-4 h-4 transition-transform duration-150 ${collapsed ? '-rotate-90' : ''}`} /></div>
                        {!ro && <button onClick={() => patch({ raw_materials: c.raw_materials.filter((_, j) => j !== i) })} className="text-gray-300 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>}
                      </div>
                      {collapsed ? (
                        <div>
                          <div className="text-[15px] font-bold text-gray-900">{r.name || s.shapes[r.shape as MaterialShape] || '—'}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{s.total}: <b className="text-gray-700">{money(rawTotal(r))}</b></div>
                        </div>
                      ) : (<>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-medium text-label">{s.shape}</label>
                          <select value={r.shape} onChange={e => set({ shape: e.target.value as MaterialShape })}
                            className="rounded-md border border-gray-200 px-2 py-2 text-[15px] font-bold text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400">
                            {(['sheet', 'round_bar', 'rect_bar', 'round_tube', 'square_tube', 'other'] as MaterialShape[]).map(sh => <option key={sh} value={sh}>{s.shapes[sh]}</option>)}
                          </select>
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-medium text-label">{s.selectMaterial}</label>
                          <select value={r.material_id ?? ''} onChange={e => {
                            const mat = materials.find(m => m.id === e.target.value)
                            set(mat ? { material_id: mat.id, name: mat.name, density: mat.density, price_per_kg: mat.price_per_kg } : { material_id: null })
                          }} className="rounded-md border border-gray-200 px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400">
                            <option value="">—</option>
                            {materials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                          </select>
                        </div>
                        <Mini label={s.pricePerKg} unit={`${sym} ${u.perKg}`} value={r.price_per_kg} onValue={v => set({ price_per_kg: v ?? 0 })} decimals={2} />
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                        {r.shape === 'round_bar' ? (<>
                          <Mini label={s.diameter} unit={u.mm} value={r.diameter} onValue={v => set({ diameter: v ?? 0 })} />
                          <Mini label={s.length} unit={u.mm} value={r.length} onValue={v => set({ length: v ?? 0 })} />
                        </>) : r.shape === 'round_tube' ? (<>
                          <Mini label={s.diameter} unit={u.mm} value={r.diameter} onValue={v => set({ diameter: v ?? 0 })} />
                          <Mini label={s.wall} unit={u.mm} value={r.wall} onValue={v => set({ wall: v ?? 0 })} />
                          <Mini label={s.length} unit={u.mm} value={r.length} onValue={v => set({ length: v ?? 0 })} />
                        </>) : r.shape === 'square_tube' ? (<>
                          <Mini label={s.width} unit={u.mm} value={r.width} onValue={v => set({ width: v ?? 0 })} />
                          <Mini label={s.thickness} unit={u.mm} value={r.thickness} onValue={v => set({ thickness: v ?? 0 })} />
                          <Mini label={s.wall} unit={u.mm} value={r.wall} onValue={v => set({ wall: v ?? 0 })} />
                          <Mini label={s.length} unit={u.mm} value={r.length} onValue={v => set({ length: v ?? 0 })} />
                        </>) : r.shape === 'rect_bar' ? (<>
                          <Mini label={s.width} unit={u.mm} value={r.width} onValue={v => set({ width: v ?? 0 })} />
                          <Mini label={s.thickness} unit={u.mm} value={r.thickness} onValue={v => set({ thickness: v ?? 0 })} />
                          <Mini label={s.length} unit={u.mm} value={r.length} onValue={v => set({ length: v ?? 0 })} />
                        </>) : r.shape === 'other' ? (
                          <Mini label={`${s.manualWeight} (${u.kg})`} value={r.manual_weight} onValue={v => set({ manual_weight: v ?? 0 })} decimals={3} />
                        ) : (<>
                          <Mini label={s.length} unit={u.mm} value={r.length} onValue={v => set({ length: v ?? 0 })} />
                          <Mini label={s.width} unit={u.mm} value={r.width} onValue={v => set({ width: v ?? 0 })} />
                          <Mini label={s.thickness} unit={u.mm} value={r.thickness} onValue={v => set({ thickness: v ?? 0 })} />
                        </>)}
                        <Mini label={s.piecesPerStock} value={r.pieces_per_stock ?? 1} onValue={v => set({ pieces_per_stock: v ?? 1 })} />
                        <Mini label={s.scrapPct} unit={u.pct} value={r.scrap_pct} onValue={v => set({ scrap_pct: v ?? 0 })} />
                      </div>
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 mt-3 text-sm border-t border-gray-200 pt-2">
                        {r.shape !== 'other' && <span className="text-gray-500">{s.density}: <b className="text-gray-800">{(Number(r.density) || 0).toLocaleString('de-DE', { maximumFractionDigits: 2 })} {u.gcm3}</b></span>}
                        {r.shape !== 'other' && <span className="text-gray-500">{s.volume}: <b className="text-gray-800">{rawVolumeCm3(r).toLocaleString('de-DE', { maximumFractionDigits: 2 })} {u.cm3}</b></span>}
                        {/* volume + density hidden for 'other' (manual weight, no geometry) */}
                        <span className="text-gray-500">{s.weight}: <b className="text-gray-800">{rawWeight(r).toLocaleString('de-DE', { maximumFractionDigits: 3 })} {u.kg}</b></span>
                        <span className="ml-auto text-gray-500">{s.total}: <b className="text-gray-900">{money(rawTotal(r))}</b></span>
                      </div>
                      </>)}
                    </div>
                  )
                })}
                <div className="flex justify-end pt-1 text-sm"><span className="text-gray-500">{s.totalMaterial}: <b className="text-gray-900">{money(totals.total_raw_materials)}</b></span></div>
              </div>
            )}
          </SectionPanel>

          {/* Purchased parts */}
          <SectionPanel icon={ShoppingCart} title={s.purchasedParts} addLabel={s.addPurchased} ro={ro}
            onAdd={() => patch({ purchased_parts: [...c.purchased_parts, { name: '', supplier: '', unit: '', qty_per_piece: 1, price_per_unit: 0, scrap_pct: 0, total: 0 }] })}>
            {c.purchased_parts.length === 0 ? <Empty /> : (
              <div className="flex flex-col gap-3">
                {c.purchased_parts.map((r, i) => {
                  const set = (pp: Partial<PurchasedPartRow>) => patch({ purchased_parts: upd(c.purchased_parts, i, pp) })
                  const collapsed = collapsedParts.has(i)
                  return (
                    <div key={i} className="relative rounded-xl bg-white border border-gray-200 p-3 pr-16">
                      <div className="absolute top-2.5 right-2.5 flex items-center gap-2" style={{ pointerEvents: 'auto' }}>
                        <div role="button" onClick={() => toggler(setCollapsedParts, 'parts')(i)} className="text-gray-400 hover:text-gray-700 cursor-pointer"><ChevronDown className={`w-4 h-4 transition-transform duration-150 ${collapsed ? '-rotate-90' : ''}`} /></div>
                        {!ro && <button onClick={() => patch({ purchased_parts: c.purchased_parts.filter((_, j) => j !== i) })} className="text-gray-300 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>}
                      </div>
                      {collapsed ? (
                        <div>
                          <div className="text-[15px] font-bold text-gray-900">{r.name || '—'}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{s.total}: <b className="text-gray-700">{money(purchasedTotal(r))}</b>/{u.piece}</div>
                        </div>
                      ) : (<>
                      <div className="flex flex-col gap-1 mb-3">
                        <label className="text-xs font-medium text-label">{s.purchasedName}</label>
                        <input value={r.name} onChange={e => set({ name: e.target.value })}
                          className="rounded-md border border-gray-200 px-2 py-2 text-[15px] font-bold text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400" />
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <div className="flex flex-col gap-1 col-span-2 sm:col-span-1">
                          <label className="text-xs font-medium text-label">{s.supplier}</label>
                          <input value={r.supplier} onChange={e => set({ supplier: e.target.value })}
                            className="rounded-md border border-gray-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400" />
                        </div>
                        <Mini label={s.qtyPerPiece} value={r.qty_per_piece} onValue={v => set({ qty_per_piece: v ?? 0 })} />
                        <Mini label={`${s.pricePerUnit} (${sym})`} value={r.price_per_unit} onValue={v => set({ price_per_unit: v ?? 0 })} decimals={2} />
                        <Mini label={s.scrapPct} unit={u.pct} value={r.scrap_pct ?? 0} onValue={v => set({ scrap_pct: v ?? 0 })} />
                      </div>
                      <div className="flex items-center justify-end mt-3 text-sm border-t border-gray-200 pt-2">
                        <span className="text-gray-500">{s.total}: <b className="text-gray-900">{money(purchasedTotal(r))}</b>/{u.piece}</span>
                      </div>
                      </>)}
                    </div>
                  )
                })}
                <div className="flex justify-end pt-1 text-sm"><span className="text-gray-500">{s.purchasedParts}: <b className="text-gray-900">{money(totals.total_purchased_parts)}</b></span></div>
              </div>
            )}
          </SectionPanel>

          {/* Processes */}
          <SectionPanel icon={Cog} title={s.processes} addLabel={s.addProcess} ro={ro}
            onAdd={() => patch({ processes: [...c.processes, { name: '', machine_id: null, machine_rate: 0, operators: 1, operator_id: null, operator_rate: 0, setup_id: null, setup_rate: 0, setup_qty: 1, setup_with_operator: true, batch_size: 0, setup_min: 0, cycle_min: 0, pieces_per_cycle: 1, total: 0 }] })}>
            {c.processes.length === 0 ? <Empty /> : (
              <div className="flex flex-col gap-3">
                {c.processes.map((r, i) => {
                  const set = (pp: Partial<ProcessRow>) => patch({ processes: upd(c.processes, i, pp) })
                  const mRate = Number(r.machine_rate ?? r.hourly_rate ?? 0) || 0
                  const cavities = (Number(r.pieces_per_cycle) || 1) || 1
                  const opCost = (Number(r.operators) || 0) * (Number(r.operator_rate) || 0)
                  const runCost = (Number(r.cycle_min) || 0) / 60 / cavities * (mRate + opCost)
                  const setupQty = r.setup_qty == null ? 1 : (Number(r.setup_qty) || 0)
                  const setupOp = r.setup_with_operator ? opCost : 0
                  const setupPerBatch = (Number(r.setup_min) || 0) / 60 * (mRate + setupQty * (Number(r.setup_rate) || 0) + setupOp)
                  const collapsed = collapsedProcs.has(i)
                  const toggleCollapse = () => toggler(setCollapsedProcs, 'procs')(i)
                  return (
                    <div key={i} className="relative rounded-xl bg-white border border-gray-200 p-3 pr-16">
                      {/* Top-right: chevron + trash */}
                      <div className="absolute top-2.5 right-2.5 flex items-center gap-2" style={{ pointerEvents: 'auto' }}>
                        <div role="button" onClick={toggleCollapse} className="text-gray-400 hover:text-gray-700 cursor-pointer">
                          <ChevronDown className={`w-4 h-4 transition-transform duration-150 ${collapsed ? '-rotate-90' : ''}`} />
                        </div>
                        {!ro && (
                          <button onClick={() => patch({ processes: c.processes.filter((_, j) => j !== i) })}
                            className="text-gray-300 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                        )}
                      </div>

                      {collapsed ? (
                        /* Collapsed view: just name + prices per qty */
                        <div>
                          <div className="text-[15px] font-bold text-gray-900 mb-1">{r.name || '—'}</div>
                          <div className="flex flex-wrap gap-x-4 text-xs text-gray-500">
                            {qtyResults.map(({ q }) => (
                              <span key={q}>{q.toLocaleString('de-DE')} {u.piece}: <b className="text-gray-700">{money(processTotal(r, q))}</b>/{u.piece}</span>
                            ))}
                          </div>
                        </div>
                      ) : (<>
                      {/* Operation name dropdown */}
                      <div className="flex flex-col gap-1 mb-3">
                        <label className="text-xs font-medium text-label">{s.operationName}</label>
                        {(() => {
                          const allLists = [translations.en.qp.operationList as unknown as string[], translations.sl.qp.operationList as unknown as string[]]
                          const opIdx = r.name ? allLists.reduce<number>((found, list) => found >= 0 ? found : list.indexOf(r.name), -1) : -1
                          return (
                            <select value={opIdx >= 0 ? String(opIdx) : (r.name ? '__custom' : '')}
                              onChange={e => { const idx = parseInt(e.target.value); if (!isNaN(idx)) set({ name: s.operationList[idx] }) }}
                              className="rounded-md border border-gray-200 px-2 py-2 text-[15px] font-bold text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400">
                              <option value="">—</option>
                              {s.operationList.map((op, idx) => <option key={idx} value={String(idx)}>{op}</option>)}
                              {r.name && opIdx === -1 && <option value="__custom">{r.name}</option>}
                            </select>
                          )
                        })()}
                      </div>

                      {/* Machine + its hourly rate */}
                      <div className="flex items-end gap-2">
                        <div className="flex flex-col gap-1 flex-1 min-w-0">
                          <label className="text-xs font-medium text-label">{s.machine}</label>
                          <select value={r.machine_id ?? ''} onChange={e => {
                            const m = machines.find(x => x.id === e.target.value)
                            set(m ? { machine_id: m.id, machine_rate: machineRate(m) } : { machine_id: null, machine_rate: 0 })
                          }} className="rounded-md border border-gray-200 px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400">
                            <option value="">—</option>
                            {machines.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                          </select>
                        </div>
                        <div className="w-28 shrink-0"><Mini label={`${s.machine} (${sym}/h)`} value={r.machine_rate ?? 0} onValue={v => set({ machine_rate: v ?? 0 })} decimals={2} /></div>
                      </div>

                      <div className="mt-4 mb-3 pb-1.5 border-b border-gray-200 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">{s.runCost}</div>
                      {/* Cycle + cavities — thirds, aligned with the operator row below */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <Mini label={`${s.cycleMin} (${u.min})`} value={r.cycle_min} onValue={v => set({ cycle_min: v ?? 0 })} decimals={2} />
                        <Mini label={s.piecesPerCycle} value={r.pieces_per_cycle ?? 1} onValue={v => set({ pieces_per_cycle: v ?? 1 })} />
                      </div>
                      {/* Operator: who + how many + rate (one row) */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                        <div className="flex flex-col gap-1 col-span-2 sm:col-span-1">
                          <label className="text-xs font-medium text-label">{s.operator}</label>
                          <select value={r.operator_id ?? ''} onChange={e => {
                            const l = labor.find(x => x.id === e.target.value)
                            set(l ? { operator_id: l.id, operator_rate: laborRate(l) } : { operator_id: null, operator_rate: 0 })
                          }} className="rounded-md border border-gray-200 px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400">
                            <option value="">—</option>
                            {labor.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                          </select>
                        </div>
                        <Mini label={s.operators} value={r.operators} onValue={v => set({ operators: v ?? 0 })} />
                        <Mini label={`${s.operator} (${sym}/h)`} value={r.operator_rate ?? 0} onValue={v => set({ operator_rate: v ?? 0 })} decimals={2} />
                      </div>

                      <div className="mt-4 mb-3 pb-1.5 border-b border-gray-200 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">{s.setupCost}</div>
                      {/* Setup: time + #technologists + technologist + rate */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <Mini label={`${s.setupCost} (${u.min})`} value={r.setup_min} onValue={v => set({ setup_min: v ?? 0 })} decimals={2} />
                        <Mini label={s.technologists} value={r.setup_qty ?? 1} onValue={v => set({ setup_qty: v ?? 0 })} />
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-medium text-label">{s.technologist}</label>
                          <select value={r.setup_id ?? ''} onChange={e => {
                            const l = labor.find(x => x.id === e.target.value)
                            set(l ? { setup_id: l.id, setup_rate: laborRate(l) } : { setup_id: null, setup_rate: 0 })
                          }} className="rounded-md border border-gray-200 px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400">
                            <option value="">—</option>
                            {labor.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                          </select>
                        </div>
                        <Mini label={`${s.technologist} (${sym}/h)`} value={r.setup_rate ?? 0} onValue={v => set({ setup_rate: v ?? 0 })} decimals={2} />
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                        <Mini label={s.batchSize} unit={u.piece} value={r.batch_size ?? 0} onValue={v => set({ batch_size: v ?? 0 })} />
                      </div>
                      <label className="flex items-center gap-2 text-xs text-gray-600 mt-2 cursor-pointer">
                        <input type="checkbox" checked={r.setup_with_operator ?? false} onChange={e => set({ setup_with_operator: e.target.checked })}
                          className="rounded border-gray-200 text-blue-600 focus:ring-blue-500" />
                        {s.setupWithOperator}
                      </label>

                      {/* Breakdown — fixed parts (run/pc, setup/batch); total per quantity below */}
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 mt-3 text-sm border-t border-gray-200 pt-2">
                        <span className="text-gray-500">{s.runCost}: <b className="text-gray-800">{money(runCost)}</b>/{u.piece}</span>
                        <span className="text-gray-500">{s.setupCost}: <b className="text-gray-800">{money(setupPerBatch)}</b> {s.perBatch}</span>
                      </div>
                      <div className="flex flex-wrap gap-x-5 gap-y-0.5 mt-1.5 text-xs text-gray-500">
                        <span className="text-gray-400">{s.total}/{u.piece}:</span>
                        {qtyResults.map(({ q }) => (
                          <span key={q}>{q.toLocaleString('de-DE')} {u.piece}: <b className="text-gray-700">{money(processTotal(r, q))}</b>/{u.piece}</span>
                        ))}
                      </div>
                      </>)}
                    </div>

                  )
                })}
                <div className="flex justify-end pt-1 text-sm"><span className="text-gray-500">{s.totalProcesses}: <b className="text-gray-900">{money(totals.total_processes)}</b></span></div>
              </div>
            )}
          </SectionPanel>

          {/* Tooling */}
          <SectionPanel icon={Wrench} title={s.tooling} addLabel={s.addTooling} ro={ro}
            onAdd={() => patch({ tooling: [...c.tooling, { name: '', tool_cost: 0, lifetime_pcs: 0, cost_per_piece: 0 }] })}>
            {c.tooling.length === 0 ? <Empty /> : (
              <div className="flex flex-col gap-3">
                {c.tooling.map((r, i) => {
                  const set = (pp: Partial<ToolingRow>) => patch({ tooling: upd(c.tooling, i, pp) })
                  const collapsed = collapsedTooling.has(i)
                  return (
                    <div key={i} className="relative rounded-xl bg-white border border-gray-200 p-3 pr-16">
                      <div className="absolute top-2.5 right-2.5 flex items-center gap-2" style={{ pointerEvents: 'auto' }}>
                        <div role="button" onClick={() => toggler(setCollapsedTooling, 'tooling')(i)} className="text-gray-400 hover:text-gray-700 cursor-pointer"><ChevronDown className={`w-4 h-4 transition-transform duration-150 ${collapsed ? '-rotate-90' : ''}`} /></div>
                        {!ro && <button onClick={() => patch({ tooling: c.tooling.filter((_, j) => j !== i) })} className="text-gray-300 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>}
                      </div>
                      {collapsed ? (
                        <div>
                          <div className="text-[15px] font-bold text-gray-900">{r.name || '—'}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{s.total}: <b className="text-gray-700">{money(toolingTotal(r))}</b>/{u.piece}</div>
                        </div>
                      ) : (<>
                      <div className="flex flex-col gap-1 mb-3">
                        <label className="text-xs font-medium text-label">{s.toolName}</label>
                        <input value={r.name} onChange={e => set({ name: e.target.value })}
                          className="rounded-md border border-gray-200 px-2 py-2 text-[15px] font-bold text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400" />
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <Mini label={`${s.toolCost} (${sym})`} value={r.tool_cost} onValue={v => set({ tool_cost: v ?? 0 })} decimals={2} />
                        <Mini label={s.piecesPerTool} value={r.lifetime_pcs} onValue={v => set({ lifetime_pcs: v ?? 0 })} />
                        <Mini label={s.scrapPct} unit={u.pct} value={r.scrap_pct ?? 0} onValue={v => set({ scrap_pct: v ?? 0 })} />
                      </div>
                      <div className="flex items-center justify-end mt-3 text-sm border-t border-gray-200 pt-2">
                        <span className="text-gray-500">{s.total}: <b className="text-gray-900">{money(toolingTotal(r))}</b>/{u.piece}</span>
                      </div>
                      </>)}
                    </div>
                  )
                })}
                <div className="flex justify-end pt-1 text-sm"><span className="text-gray-500">{s.tooling}: <b className="text-gray-900">{money(totals.total_tooling)}</b></span></div>
              </div>
            )}
          </SectionPanel>

          {/* Packaging */}
          <SectionPanel icon={Package} title={s.packaging} addLabel={s.addPackaging} ro={ro}
            onAdd={() => patch({ packaging: [...c.packaging, { name: '', price_per_unit: 0, pieces_per_unit: 1, total: 0 }] })} /* price_per_unit = cost per piece (pieces_per_unit fixed at 1) */>
            {c.packaging.length === 0 ? <Empty /> : (
              <div className="flex flex-col gap-3">
                {c.packaging.map((r, i) => {
                  const set = (pp: Partial<PackagingRow>) => patch({ packaging: upd(c.packaging, i, pp) })
                  const collapsed = collapsedPack.has(i)
                  return (
                    <div key={i} className="relative rounded-xl bg-white border border-gray-200 p-3 pr-16">
                      <div className="absolute top-2.5 right-2.5 flex items-center gap-2" style={{ pointerEvents: 'auto' }}>
                        <div role="button" onClick={() => toggler(setCollapsedPack, 'pack')(i)} className="text-gray-400 hover:text-gray-700 cursor-pointer"><ChevronDown className={`w-4 h-4 transition-transform duration-150 ${collapsed ? '-rotate-90' : ''}`} /></div>
                        {!ro && <button onClick={() => patch({ packaging: c.packaging.filter((_, j) => j !== i) })} className="text-gray-300 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>}
                      </div>
                      {collapsed ? (
                        <div>
                          <div className="text-[15px] font-bold text-gray-900">{r.name || '—'}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{s.total}: <b className="text-gray-700">{money(packagingTotal(r))}</b>/{u.piece}</div>
                        </div>
                      ) : (<>
                      <div className="flex flex-col gap-1 mb-3">
                        <label className="text-xs font-medium text-label">{s.packagingName}</label>
                        <input value={r.name} onChange={e => set({ name: e.target.value })}
                          className="rounded-md border border-gray-200 px-2 py-2 text-[15px] font-bold text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400" />
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <Mini label={`${s.costPerPieceShort} (${sym})`} value={r.price_per_unit} onValue={v => set({ price_per_unit: v ?? 0 })} decimals={2} />
                      </div>
                      </>)}
                    </div>
                  )
                })}
                <div className="flex justify-end pt-1 text-sm"><span className="text-gray-500">{s.packaging}: <b className="text-gray-900">{money(c.packaging.reduce((s2, r) => s2 + packagingTotal(r), 0))}</b>/{u.piece}</span></div>
              </div>
            )}
          </SectionPanel>

          {/* Overhead — cascade with visible subtotal */}
          <div>
            <h4 className="text-[15px] font-bold text-gray-800 mb-3 px-0.5 pb-2 border-b border-gray-200">{s.overhead}</h4>
            <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-2.5 text-sm">
              <div className="flex items-center justify-between text-gray-600"><span>{s.rawMaterials} + {s.purchasedParts} + {s.packaging}</span><span className="text-gray-800">{money(ohMatBase)}</span></div>
              <div className="flex items-center justify-between text-gray-600"><span>{s.processes} + {s.tooling}</span><span className="text-gray-800">{money(ohMfgBase)}</span></div>
              <div className="flex items-center justify-between border-y border-gray-200 py-2 my-0.5 font-medium text-gray-700">
                <span>{s.directCosts}</span><b className="text-gray-900">{money(ohMatBase + ohMfgBase)}</b>
              </div>
              <OhRow label={s.materialOh} pct={c.oh_material_pct} onPct={v => patch({ oh_material_pct: v })} value={money(ohMatAmt)} />
              <OhRow label={s.mfgOh} pct={c.oh_mfg_pct} onPct={v => patch({ oh_mfg_pct: v })} value={money(ohMfgAmt)} />
              <div className="flex items-center justify-between border-y border-gray-200 py-2 my-0.5 font-medium text-gray-700">
                <span>{s.subtotalBase}</span><b className="text-gray-900">{money(ohSubtotal)}</b>
              </div>
              <OhRow label={s.sga} pct={c.oh_sga_pct} onPct={v => patch({ oh_sga_pct: v })} value={money(ohSgaAmt)} />
              <OhRow label={s.logistics} pct={c.oh_logistics_pct} onPct={v => patch({ oh_logistics_pct: v })} value={money(ohLogAmt)} />
              <OhRow label={s.rd} pct={c.oh_rd_pct} onPct={v => patch({ oh_rd_pct: v })} value={money(ohRdAmt)} />
              <div className="flex items-center justify-between border-t border-gray-200 pt-2 mt-0.5 font-semibold text-gray-800">
                <span>{s.totalOverheadSum}</span><b className="text-gray-900">{money(totals.total_overhead)}</b>
              </div>
              <div className="flex items-center justify-between border-t border-gray-200 pt-2 mt-0.5 font-medium text-gray-700">
                <span>{s.costPerPiece}</span><b className="text-gray-900">{money(totals.cost_per_piece)}</b>
              </div>
              <div className="border-t border-gray-200 pt-2.5 mt-1">
                <OhRow label={s.profit} pct={c.profit_pct} onPct={v => patch({ profit_pct: v })} value={money(totals.selling_price - totals.cost_per_piece)} />
              </div>
              <div className="flex items-center justify-between border-t border-gray-200 pt-2 mt-0.5 text-base font-bold text-gray-900">
                <span>{s.sellingPrice}</span><b>{money(totals.selling_price)}</b>
              </div>
            </div>
          </div>

          {/* Results per quantity */}
          <div>
            <h4 className="text-[15px] font-bold text-gray-800 flex items-center gap-2 mb-3 px-0.5 pb-2 border-b border-gray-200">{s.calcResults}</h4>
            <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-2.5"></th>
                    {qtyResults.map(({ q }, i) => (
                      <th key={i} className="text-right px-4 py-2.5 text-sm font-bold text-gray-900 whitespace-nowrap">{q.toLocaleString('de-DE')} {u.piece}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <ResRow label={s.totalMaterial} cells={qtyResults.map(({ t }) => money(t.total_raw_materials + t.total_purchased_parts))} />
                  <ResRow label={s.totalProcesses} cells={qtyResults.map(({ t }) => money(t.total_processes + t.total_tooling))} />
                  <ResRow label={s.packaging} cells={qtyResults.map(({ t }) => money(t.total_packaging))} />
                  <ResRow label={s.totalOverhead} cells={qtyResults.map(({ t }) => money(t.total_overhead))} />
                  <ResRow label={s.costPerPiece} cells={qtyResults.map(({ t }) => money(t.cost_per_piece))} />
                  <ResRow label={s.marginEur} cells={qtyResults.map(({ t }) => money(t.selling_price - t.cost_per_piece))} />
                  <ResRow label={s.sellingPrice} cells={qtyResults.map(({ t }) => money(t.selling_price))} strong />
                  <ResRow label={s.annualValue} cells={qtyResults.map(({ t }) => money(t.annual_value))} strong />
                </tbody>
              </table>
            </div>
          </div>
          </div>{/* end pointer-events wrapper */}
        </div>

        </fieldset>

        {/* Piece attachments — big fixed preview; also shown in the quote-level shared box */}
        <div className="h-[520px] lg:h-full lg:min-h-0">
          {company && <QuoteAttachments quoteId={quoteId} companyId={company.id} quoteItemId={itemId} attachments={attachments} onChange={setAttachments} inline readonly={ro} />}
        </div>
      </div>


    </div>
  )
}

function SectionPanel({ icon: Icon, title, onAdd, addLabel, children, ro }: { icon: React.ElementType; title: string; onAdd: () => void; addLabel: string; children: React.ReactNode; ro?: boolean }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3 px-0.5 pb-2 border-b border-gray-200">
        <h4 className="text-[15px] font-bold text-gray-800 flex items-center gap-2"><Icon className="w-4 h-4 text-gray-400" />{title}</h4>
        {!ro && <button onClick={onAdd} className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"><Plus className="w-3.5 h-3.5" />{addLabel}</button>}
      </div>
      {children}
    </div>
  )
}
function Empty() { return <p className="text-xs text-gray-400 py-1.5">—</p> }
function OhRow({ label, pct, onPct, value }: { label: string; pct: number; onPct: (v: number) => void; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-gray-600 flex-1">{label}</span>
      <div className="flex shrink-0 items-center rounded-md border border-gray-200 focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500 disabled:opacity-50">
        <input
          type="text" inputMode="decimal"
          value={pct.toLocaleString('de-DE', { maximumFractionDigits: 4 })}
          onChange={e => { const v = parseFloat(e.target.value.replace(/\./g, '').replace(',', '.')); onPct(isNaN(v) ? 0 : v) }}
          className="w-14 rounded-l-md px-2 py-1 text-sm bg-white focus:outline-none disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
        />
        <span className="px-2 py-1 text-sm text-gray-400 bg-gray-50 rounded-r-md border-l border-gray-200 select-none">%</span>
      </div>
      <span className="w-24 shrink-0 text-right font-medium text-gray-800">{value}</span>
    </div>
  )
}
function Mini({ label, unit, value, onValue, decimals }: { label: string; unit?: string; value: number; onValue: (v: number | null) => void; decimals?: number }) {
  return <div className="flex flex-col gap-1"><label className="text-xs font-medium text-label">{label}</label><NumberInput unit={unit} value={value} onValue={onValue} decimals={decimals} className="rounded-md border-gray-200 px-2 py-1 text-sm bg-white" /></div>
}
function ResRow({ label, cells, strong }: { label: string; cells: string[]; strong?: boolean }) {
  return (
    <tr>
      <td className="px-4 py-2.5 text-sm text-gray-500">{label}</td>
      {cells.map((v, i) => (
        <td key={i} className={`px-4 py-2.5 text-right whitespace-nowrap ${strong ? 'text-base font-bold text-gray-900' : 'text-sm font-medium text-[#7f7f7f]'}`}>{v}</td>
      ))}
    </tr>
  )
}
