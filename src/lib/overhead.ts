import type { Company } from '../types/database'

const n = (v: unknown) => Number(v) || 0
const pct = (pool: number, base: number) => base > 0 ? Math.round((pool / base) * 10000) / 100 : 0

export interface OverheadResult {
  materialPct: number
  mfgPct: number
  sgaPct: number
  logisticsPct: number
  rdPct: number
  productionBase: number
  intermediateBase: number
}

// Cost-centre overhead rates: pool ÷ base (annual).
// Material/Mfg use their own direct base.
// SG&A/Logistics/R&D use the INTERMEDIATE base = production base + material & mfg overhead pools
// (mirrors the cascade in the quote calculation, so the rates fully recover the cost centres).
export function computeOverhead(c: Partial<Company>): OverheadResult {
  const baseMaterial = n(c.oh_base_material)
  const baseMfg = n(c.oh_base_manufacturing)
  const productionBase = baseMaterial + baseMfg
  const intermediateBase = productionBase + n(c.oh_cc_material) + n(c.oh_cc_manufacturing)
  return {
    materialPct: pct(n(c.oh_cc_material), baseMaterial),
    mfgPct: pct(n(c.oh_cc_manufacturing), baseMfg),
    sgaPct: pct(n(c.oh_cc_sga), intermediateBase),
    logisticsPct: pct(n(c.oh_cc_logistics), intermediateBase),
    rdPct: pct(n(c.oh_cc_rd), intermediateBase),
    productionBase,
    intermediateBase,
  }
}
