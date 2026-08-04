import { useEffect, useState } from 'react'
import { useNavigate, useParams, Navigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useCompany } from '../hooks/useCompany'
import { useLanguage } from '../hooks/useLanguage'
import { toast } from '../components/ui/Toast'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import NumberInput from '../components/ui/NumberInput'
import { machineRateBreakdown } from '../lib/machineRate'
import { currencySymbol } from '../lib/currency'
import { format } from 'date-fns'
import type { Machine, MachineCategory } from '../types/database'

const CATEGORIES: MachineCategory[] = ['cnc_milling', 'cnc_turning', 'edm', 'grinding', 'laser', 'pressing', 'stamping', 'bending', 'welding', 'injection', 'extrusion', 'coating', 'heat_treatment', 'assembly', 'inspection', 'other']

const defaults: Partial<Machine> = {
  name: '', model: '', category: null, use_manual_rate: false, is_active: true,
  water_cost_per_year: 0, compressed_air_cost_per_year: 0,
  production_days_per_year: 240, shifts_per_day: 1, hours_per_shift: 8, break_min_per_shift: 0, utilization_pct: 85,
  acquisition_value: 0, installation_cost: 0, foundation_cost: 0, additional_cost: 0, residual_value: 0,
  // Sensible starting values (user can adjust)
  depreciation_years: 7, interest_rate_pct: 3, insurance_rate_pct: 1.5, space_m2: 0, space_cost_per_m2: 7,
  maintenance_pct: 4, power_production_kw: 0, power_standby_kw: 0, electricity_cost_per_kwh: 0.16,
  tooling_cost_per_year: 0, consumables_cost_per_year: 0, other_variable_per_year: 0,
  hourly_rate_manual: 0,
  energy_media: [],
}

export default function MachineFormPage() {
  const { id } = useParams()
  const editMode = !!id
  const { company, profile, hasPerm } = useCompany()
  const { t } = useLanguage()
  const s = t.qp
  const navigate = useNavigate()
  const cur = company?.currency ?? 'EUR'
  const sym = currencySymbol(cur)
  const u = s.units
  const money = (n: number) => (n ?? 0).toLocaleString('de-DE', { style: 'currency', currency: cur })
  const hours = (n: number) => `${n.toLocaleString('de-DE', { maximumFractionDigits: 0 })} h`

  const [m, setM] = useState<Partial<Machine>>(defaults)
  const [editorName, setEditorName] = useState<string | null>(null)
  const [loading, setLoading] = useState(editMode)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!editMode || !id) return
    supabase.from('machines').select('*').eq('id', id).single().then(async ({ data }) => {
      if (data) {
        setM(data as Machine)
        const uid = (data as Machine).updated_by
        if (uid) {
          const { data: usr } = await supabase.from('users').select('first_name, last_name').eq('id', uid).single()
          if (usr) setEditorName(`${usr.first_name} ${usr.last_name}`)
        }
      }
      setLoading(false)
    })
  }, [id])

  const b = machineRateBreakdown(m)
  const perHour = (perYear: number) => b.netHours > 0 ? perYear / b.netHours : 0

  function numf(key: keyof Machine) {
    return {
      value: (m[key] as number | null | undefined) ?? null,
      onValue: (v: number | null) => setM(s => ({ ...s, [key]: v })),
    }
  }

  async function save() {
    if (!company || !m.name?.trim()) return
    setSaving(true)
    const computed = Math.round(machineRateBreakdown(m).ratePerHour * 100) / 100
    const { id: _omit, created_at, updated_at, company_id, ...rest } = m as Machine
    const payload = { ...rest, name: m.name!.trim(), use_manual_rate: false, hourly_rate_computed: computed, updated_by: profile?.id ?? null }
    const { error } = editMode
      ? await supabase.from('machines').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', id!)
      : await supabase.from('machines').insert({ ...payload, company_id: company.id })
    setSaving(false)
    if (error) { toast.error(error.message); return }
    toast.success(t.common.saved); navigate('/machines')
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
  if (company && !hasPerm('machine_rates', 'create')) return <Navigate to="/machines" replace />

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      <button onClick={() => navigate('/machines')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-5"><ChevronLeft className="w-4 h-4" />{s.machines}</button>

      <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">{editMode ? m.name : s.addMachine}</h1>
          {editMode && m.updated_at && (
            <p className="text-xs text-gray-400 mt-1">
              {s.updatedAt}: {format(new Date(m.updated_at), 'd. M. yyyy, HH:mm')}{editorName ? ` · ${s.updatedBy}: ${editorName}` : ''}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => navigate('/machines')} disabled={saving}>{t.common.cancel}</Button>
          <Button loading={saving} onClick={save} disabled={!m.name?.trim()}>{t.common.save}</Button>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* General */}
        <Section title={s.general}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
            <Input id="name" label={s.machineName} value={m.name ?? ''} onChange={e => setM(v => ({ ...v, name: e.target.value }))} />
            <Input id="model" label={s.machineModel} value={m.model ?? ''} onChange={e => setM(v => ({ ...v, model: e.target.value }))} />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">{s.category}</label>
              <select value={m.category ?? ''} onChange={e => setM(v => ({ ...v, category: (e.target.value || null) as MachineCategory | null }))}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="">—</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{s.cat[c]}</option>)}
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700 mt-5">
            <input type="checkbox" checked={m.is_active ?? true} onChange={e => setM(v => ({ ...v, is_active: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />{s.active}
          </label>
        </Section>

        {/* Capacity */}
        <Section title={s.capacity}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
            <NumberInput id="pd" label={s.productionDays} unit={u.daysYear} {...numf('production_days_per_year')} />
            <NumberInput id="sh" label={s.shifts} unit={u.shiftsDay} {...numf('shifts_per_day')} />
            <NumberInput id="hps" label={s.hoursPerShift} unit={u.hoursShift} {...numf('hours_per_shift')} />
            <NumberInput id="br" label={s.breakMin} unit={u.minShift} {...numf('break_min_per_shift')} />
            <NumberInput id="ut" label={s.utilization} unit={u.pct} {...numf('utilization_pct')} />
          </div>
          <div className="mt-5 flex flex-col gap-2">
            <ResultBar label={s.availableHours} value={hours(b.availableHours)} />
            <ResultBar label={s.netHours} value={hours(b.netHours)} highlight />
          </div>
        </Section>

        {/* Investments */}
        <Section title={s.investments}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
            <NumberInput id="acq" label={s.acquisitionValue} unit={sym} {...numf('acquisition_value')} />
            <NumberInput id="add" label={s.additional} unit={sym} {...numf('additional_cost')} />
            <NumberInput id="res" label={s.residual} unit={sym} {...numf('residual_value')} />
          </div>
          <div className="mt-5 flex flex-col gap-2">
            <ResultBar label={s.totalInvestment} value={money(b.totalInvestment)} highlight />
            <ResultBar label={s.depreciableValue} value={money(b.depreciable)} />
          </div>
        </Section>

        {/* Fixed costs */}
        <Section title={s.fixedCosts}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
            <NumberInput id="dep" label={s.depreciationYears} unit={u.years} {...numf('depreciation_years')} />
            <NumberInput id="int" label={s.interestRate} unit={u.pctYear} {...numf('interest_rate_pct')} />
            <NumberInput id="ins" label={s.insuranceRate} unit={u.pctYear} {...numf('insurance_rate_pct')} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6 mt-6">
            <NumberInput id="sm2" label={s.spaceM2} unit={u.m2} {...numf('space_m2')} />
            <NumberInput id="scm" label={s.space} unit={`${sym} ${u.perM2Month}`} {...numf('space_cost_per_m2')} />
          </div>
          <BreakdownTable money={money} s={s}
            rows={[
              [s.depreciation, b.depreciation, perHour(b.depreciation)],
              [s.interest, b.interest, perHour(b.interest)],
              [s.insurance, b.insurance, perHour(b.insurance)],
              [s.space, b.space, perHour(b.space)],
            ]}
            total={[s.fixedCosts, b.fixedTotal, perHour(b.fixedTotal)]} />
        </Section>

        {/* Variable costs */}
        <Section title={s.variableCosts}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
            <NumberInput id="mnt" label={s.maintenancePct} unit={u.pctYear} {...numf('maintenance_pct')} />
            <NumberInput id="pwp" label={s.powerProduction} unit={u.kw} {...numf('power_production_kw')} />
            <NumberInput id="elc" label={s.energyCost} unit={`${sym} ${u.perKwh}`} {...numf('electricity_cost_per_kwh')} />
            <NumberInput id="wat" label={s.water} unit={`${sym} ${u.perYear}`} {...numf('water_cost_per_year')} />
            <NumberInput id="air" label={s.compressedAir} unit={`${sym} ${u.perYear}`} {...numf('compressed_air_cost_per_year')} />
            <NumberInput id="oth" label={s.otherEnergy} unit={`${sym} ${u.perYear}`} {...numf('other_variable_per_year')} />
            <NumberInput id="tl" label={s.toolingPerYear} unit={`${sym} ${u.perYear}`} {...numf('tooling_cost_per_year')} />
            <NumberInput id="cns" label={s.consumablesPerYear} unit={`${sym} ${u.perYear}`} {...numf('consumables_cost_per_year')} />
          </div>
          <BreakdownTable money={money} s={s}
            rows={[
              [s.maintenancePct, b.maintenance, perHour(b.maintenance)],
              [s.electricity, b.electricity, perHour(b.electricity)],
              [s.water, b.water, perHour(b.water)],
              [s.compressedAir, b.compressedAir, perHour(b.compressedAir)],
              [s.otherEnergy, b.other, perHour(b.other)],
              [s.toolingPerYear, b.tooling, perHour(b.tooling)],
              [s.consumablesPerYear, b.consumables, perHour(b.consumables)],
            ]}
            total={[s.variableCosts, b.variableTotal, perHour(b.variableTotal)]} />
        </Section>

        {/* Result */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 flex items-center justify-between gap-6 flex-wrap">
          <div>
            <p className="text-sm text-gray-400">{s.ratePerHour}</p>
            <p className="text-4xl font-bold text-gray-900 mt-1">{money(b.ratePerHour)}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => navigate('/machines')} disabled={saving}>{t.common.cancel}</Button>
            <Button loading={saving} onClick={save} disabled={!m.name?.trim()}>{t.common.save}</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      <hr className="border-gray-100 my-5" />
      {children}
    </div>
  )
}

function ResultBar({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`flex items-center justify-between rounded-lg px-4 py-3 ${highlight ? 'bg-blue-50' : 'bg-gray-50'}`}>
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`text-base font-bold ${highlight ? 'text-blue-700' : 'text-gray-900'}`}>{value}</span>
    </div>
  )
}

function BreakdownTable({ rows, total, money, s }: {
  rows: [string, number, number][]; total: [string, number, number]
  money: (n: number) => string; s: { perYear: string; perHour: string }
}) {
  return (
    <div className="mt-6 -mx-6 border-t border-gray-100">
      <table className="w-full text-sm">
        <thead><tr className="text-xs text-gray-400"><th className="text-left font-medium px-6 py-3"></th><th className="text-right font-medium px-6 py-3">{s.perYear}</th><th className="text-right font-medium px-6 py-3">{s.perHour}</th></tr></thead>
        <tbody className="text-gray-600">
          {rows.map(([label, y, h], i) => (
            <tr key={i} className={i % 2 ? 'bg-gray-50' : ''}><td className="px-6 py-2.5">{label}</td><td className="text-right px-6 py-2.5">{money(y)}</td><td className="text-right px-6 py-2.5">{money(h)}</td></tr>
          ))}
          <tr className="border-t border-gray-200 font-semibold text-gray-900"><td className="px-6 py-3">{total[0]}</td><td className="text-right px-6 py-3">{money(total[1])}</td><td className="text-right px-6 py-3">{money(total[2])}</td></tr>
        </tbody>
      </table>
    </div>
  )
}
