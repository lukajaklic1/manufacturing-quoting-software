import type { Machine } from '../types/database'

export interface MachineRateBreakdown {
  availableHours: number
  netHours: number
  totalInvestment: number
  depreciable: number
  // fixed (per year)
  depreciation: number
  interest: number
  insurance: number
  space: number
  fixedTotal: number
  // variable (per year)
  maintenance: number
  electricity: number
  water: number
  compressedAir: number
  tooling: number
  consumables: number
  other: number
  variableTotal: number
  // totals
  totalPerYear: number
  ratePerHour: number
}

const n = (v: unknown) => Number(v) || 0

// Full TCE-style machine hourly-rate model.
export function machineRateBreakdown(m: Partial<Machine>): MachineRateBreakdown {
  const availableHours = n(m.production_days_per_year) * n(m.shifts_per_day) * (n(m.hours_per_shift) - n(m.break_min_per_shift) / 60)
  const netHours = Math.max(0, availableHours) * (n(m.utilization_pct) / 100)

  const acquisition = n(m.acquisition_value)
  const totalInvestment = acquisition + n(m.installation_cost) + n(m.foundation_cost) + n(m.additional_cost)
  const depreciable = Math.max(0, totalInvestment - n(m.residual_value))

  const depreciation = n(m.depreciation_years) > 0 ? depreciable / n(m.depreciation_years) : 0
  const interest = (totalInvestment / 2) * (n(m.interest_rate_pct) / 100)        // avg book value
  const insurance = acquisition * (n(m.insurance_rate_pct) / 100)
  const space = n(m.space_m2) * n(m.space_cost_per_m2) * 12                       // €/m²/month → /year
  const fixedTotal = depreciation + interest + insurance + space

  const maintenance = acquisition * (n(m.maintenance_pct) / 100)
  const electricity = n(m.power_production_kw) * n(m.electricity_cost_per_kwh) * netHours
  const water = n(m.water_cost_per_year)
  const compressedAir = n(m.compressed_air_cost_per_year)
  const tooling = n(m.tooling_cost_per_year)
  const consumables = n(m.consumables_cost_per_year)
  const other = n(m.other_variable_per_year)
  const variableTotal = maintenance + electricity + water + compressedAir + tooling + consumables + other

  const totalPerYear = fixedTotal + variableTotal
  const ratePerHour = netHours > 0 ? totalPerYear / netHours : 0

  return {
    availableHours, netHours, totalInvestment, depreciable,
    depreciation, interest, insurance, space, fixedTotal,
    maintenance, electricity, water, compressedAir, tooling, consumables, other, variableTotal,
    totalPerYear, ratePerHour,
  }
}

// Effective rate used in quotes
export function effectiveMachineRate(m: Machine): number {
  if (m.use_manual_rate) return Number(m.hourly_rate_manual) || 0
  return m.hourly_rate_computed != null ? Number(m.hourly_rate_computed) : Math.round(machineRateBreakdown(m).ratePerHour * 100) / 100
}
