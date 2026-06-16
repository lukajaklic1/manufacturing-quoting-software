import type {
  RawMaterialRow, PurchasedPartRow, ProcessRow, ToolingRow, InvestmentRow, PackagingRow,
} from '../types/database'

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

// Per-row totals
export function rawTotal(r: RawMaterialRow): number {
  return r4((Number(r.qty_per_piece) || 0) * (Number(r.price_per_unit) || 0) * (1 + (Number(r.scrap_pct) || 0) / 100))
}
export function purchasedTotal(r: PurchasedPartRow): number {
  return r4((Number(r.qty_per_piece) || 0) * (Number(r.price_per_unit) || 0))
}
// Process cost per piece: cycle time always per piece; setup amortized over annual quantity.
export function processTotal(r: ProcessRow, quantity: number): number {
  const rate = Number(r.hourly_rate) || 0
  const cycle = (Number(r.cycle_min) || 0) / 60
  const setup = quantity > 0 ? (Number(r.setup_min) || 0) / 60 / quantity : 0
  return r4((cycle + setup) * rate)
}
export function toolingTotal(r: ToolingRow): number {
  const life = Number(r.lifetime_pcs) || 0
  return r4(life > 0 ? (Number(r.tool_cost) || 0) / life : 0)
}
export function packagingTotal(r: PackagingRow): number {
  return r4((Number(r.qty_per_piece) || 0) * (Number(r.price_per_unit) || 0))
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
  const total_packaging = r4(p.packaging.reduce((s, x) => s + packagingTotal(x), 0))

  const materialBase = total_raw_materials + total_purchased_parts
  const mfgBase = total_processes + total_tooling + total_investments

  const ohMaterial = materialBase * (p.oh_material_pct || 0) / 100
  const ohMfg = mfgBase * (p.oh_mfg_pct || 0) / 100
  const subtotal = materialBase + mfgBase + total_packaging + ohMaterial + ohMfg
  const ohSga = subtotal * (p.oh_sga_pct || 0) / 100
  const ohLog = subtotal * (p.oh_logistics_pct || 0) / 100
  const ohRd = subtotal * (p.oh_rd_pct || 0) / 100

  const total_overhead = r4(ohMaterial + ohMfg + ohSga + ohLog + ohRd)
  const cost_per_piece = r4(materialBase + mfgBase + total_packaging + total_overhead)
  const selling_price = r4(cost_per_piece * (1 + (p.profit_pct || 0) / 100))
  const annual_value = Math.round(selling_price * (quantity || 0) * 100) / 100

  return {
    total_raw_materials, total_purchased_parts, total_processes, total_tooling,
    total_investments, total_packaging, total_overhead, cost_per_piece, selling_price, annual_value,
  }
}
