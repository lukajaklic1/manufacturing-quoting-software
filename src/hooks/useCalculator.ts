import type {
  RawMaterialRow, PurchasedPartRow, ProcessRow, ToolingRow, InvestmentRow, PackagingRow,
} from '../types/database'
import { rawWeight } from '../lib/materialWeight'

export interface PieceCalc {
  raw_materials: RawMaterialRow[]
  purchased_parts: PurchasedPartRow[]
  processes: ProcessRow[]
  tooling?: ToolingRow[]
  investments?: InvestmentRow[]
  packaging: PackagingRow[]
  oh_material_pct: number
  oh_mfg_pct: number
  oh_sga_pct: number
  oh_logistics_pct: number
  oh_rd_pct: number
  profit_pct: number
  scrap_pct?: number
  batch_size?: number
}

export interface CalcTotals {
  total_raw_materials: number
  total_purchased_parts: number
  total_processes: number
  total_tooling: number
  total_investments: number
  total_packaging: number
  total_overhead: number
  cost_per_piece: number
  selling_price: number
  annual_value: number
}

const r4 = (n: number) => Math.round((isFinite(n) ? n : 0) * 10000) / 10000

// Per-row totals — raw material = weight (kg) × price/kg ÷ yield, where yield = 1 − scrap%.
// (e.g. 50% scrap ⇒ ÷0.5 ⇒ cost ×2, since you must buy twice the net material.)
export function rawTotal(r: RawMaterialRow): number {
  const scrap = Number(r.scrap_pct) || 0
  const yieldFactor = scrap < 100 ? 1 / (1 - scrap / 100) : 1
  return r4(rawWeight(r) * (Number(r.price_per_kg) || 0) * yieldFactor)
}
export function purchasedTotal(r: PurchasedPartRow): number {
  const scrap = Number(r.scrap_pct) || 0
  const yieldFactor = scrap < 100 ? 1 / (1 - scrap / 100) : 1
  return r4((Number(r.qty_per_piece) || 0) * (Number(r.price_per_unit) || 0) * yieldFactor)
}
// Process cost per piece:
//  run   = cycle time × (machine rate + operators × operator rate)   — per piece
//  setup = setup time × (machine rate + technologist rate) ÷ quantity — amortized
// Falls back to the legacy single hourly_rate for old calculations.
export function processTotal(r: ProcessRow, quantity: number): number {
  const machineRate = Number(r.machine_rate ?? r.hourly_rate ?? 0) || 0
  const operators = Number(r.operators ?? 0) || 0
  const opRate = Number(r.operator_rate ?? 0) || 0
  const setupRate = Number(r.setup_rate ?? 0) || 0
  const setupQty = r.setup_qty == null ? 1 : (Number(r.setup_qty) || 0)
  const cavities = (Number(r.pieces_per_cycle) || 1) || 1
  const cycleH = (Number(r.cycle_min) || 0) / 60 / cavities
  const setupH = (Number(r.setup_min) || 0) / 60
  const setupOp = r.setup_with_operator ? operators * opRate : 0
  // Setups repeat per batch: ceil(qty / batch). batch 0 = one setup for the whole order.
  const batch = Number(r.batch_size) || 0
  const setups = batch > 0 ? Math.ceil(quantity / batch) : 1
  const run = cycleH * (machineRate + operators * opRate)
  const setup = quantity > 0 ? setupH * (machineRate + setupQty * setupRate + setupOp) * setups / quantity : 0
  return r4(run + setup)
}
export function toolingTotal(r: ToolingRow): number {
  const life = Number(r.lifetime_pcs) || 0
  const scrap = Number(r.scrap_pct) || 0
  const goodPcs = life * (scrap < 100 ? (1 - scrap / 100) : 1)
  return r4(goodPcs > 0 ? (Number(r.tool_cost) || 0) / goodPcs : 0)
}
// Packaging cost per piece. You pay for whole packaging units:
//  units = ceil(qty / pieces-per-unit), cost/piece = units × unit price ÷ qty.
// Without a known quantity, assume full utilization (price ÷ pieces-per-unit).
export function packagingTotal(r: PackagingRow, quantity = 0): number {
  const ppu = Number(r.pieces_per_unit) || 0
  const price = Number(r.price_per_unit) || 0
  if (ppu > 0) {
    if (quantity > 0) return r4(Math.ceil(quantity / ppu) * price / quantity)
    return r4(price / ppu)
  }
  // legacy: qty per piece × unit price
  return r4((Number(r.qty_per_piece) || 0) * price)
}
export function investmentTotal(r: InvestmentRow): number {
  return r4(Number(r.total_per_piece) || 0)
}

export function computeTotals(p: PieceCalc, quantity: number): CalcTotals {
  const total_raw_materials = r4(p.raw_materials.reduce((s, x) => s + rawTotal(x), 0))
  const total_purchased_parts = r4(p.purchased_parts.reduce((s, x) => s + purchasedTotal(x), 0))
  const total_processes = r4(p.processes.reduce((s, x) => s + processTotal(x, quantity), 0))
  const total_tooling = r4((p.tooling ?? []).reduce((s, x) => s + toolingTotal(x), 0))
  const total_investments = r4((p.investments ?? []).reduce((s, x) => s + investmentTotal(x), 0))
  const total_packaging = r4(p.packaging.reduce((s, x) => s + packagingTotal(x, quantity), 0))

  // Packaging is a direct material cost → part of the material base (gets material overhead too).
  const materialBase = total_raw_materials + total_purchased_parts + total_packaging
  const mfgBase = total_processes + total_tooling + total_investments

  const ohMaterial = materialBase * (p.oh_material_pct || 0) / 100
  const ohMfg = mfgBase * (p.oh_mfg_pct || 0) / 100
  const subtotal = materialBase + mfgBase + ohMaterial + ohMfg
  const ohSga = subtotal * (p.oh_sga_pct || 0) / 100
  const ohLog = subtotal * (p.oh_logistics_pct || 0) / 100
  const ohRd = subtotal * (p.oh_rd_pct || 0) / 100

  const total_overhead = r4(ohMaterial + ohMfg + ohSga + ohLog + ohRd)
  const cost_per_piece = r4(materialBase + mfgBase + total_overhead)
  const selling_price = r4(cost_per_piece * (1 + (p.profit_pct || 0) / 100))
  const annual_value = Math.round(selling_price * (quantity || 0) * 100) / 100

  return {
    total_raw_materials, total_purchased_parts, total_processes, total_tooling,
    total_investments, total_packaging, total_overhead, cost_per_piece, selling_price, annual_value,
  }
}
