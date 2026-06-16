import type { LaborRate } from '../types/database'

const n = (v: unknown) => Number(v) || 0

export interface LaborRateBreakdown {
  effectiveWorkdays: number
  availableHours: number
  netHours: number
  ratePerHour: number
}

// Labour hourly rate (TCE LABOR HOURLY RATE, simplified):
// rate = annual cost / net operating hours per year.
export function laborRateBreakdown(l: Partial<LaborRate>): LaborRateBreakdown {
  const effectiveWorkdays = Math.max(0, n(l.working_days_per_year) - n(l.vacation_days))
  const availableHours = effectiveWorkdays * n(l.shifts_per_day) * (n(l.hours_per_shift) - n(l.break_min_per_shift) / 60)
  const netHours = Math.max(0, availableHours) * (n(l.utilization_pct) / 100)
  const ratePerHour = netHours > 0 ? n(l.annual_cost) / netHours : 0
  return { effectiveWorkdays, availableHours: Math.max(0, availableHours), netHours, ratePerHour }
}

export function effectiveLaborRate(l: LaborRate): number {
  return l.hourly_rate_computed != null ? Number(l.hourly_rate_computed) : Math.round(laborRateBreakdown(l).ratePerHour * 100) / 100
}
