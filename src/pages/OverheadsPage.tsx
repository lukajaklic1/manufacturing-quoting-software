import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useCompany } from '../hooks/useCompany'
import { useLanguage } from '../hooks/useLanguage'
import { toast } from '../components/ui/Toast'
import Button from '../components/ui/Button'
import NumberInput from '../components/ui/NumberInput'
import { computeOverhead } from '../lib/overhead'
import { currencySymbol } from '../lib/currency'
import type { Company } from '../types/database'

export default function OverheadsPage() {
  const { company, loading, refetch, hasPerm } = useCompany()
  const canEdit = hasPerm('overheads', 'create')
  const { t } = useLanguage()
  const s = t.qp
  const cur = company?.currency ?? 'EUR'
  const sym = currencySymbol(cur)
  const money = (n: number) => (n ?? 0).toLocaleString('de-DE', { style: 'currency', currency: cur })

  const [form, setForm] = useState<Partial<Company>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => { if (company) setForm(company) }, [company])

  const r = computeOverhead(form)
  const num = (k: keyof Company) => Number(form[k]) || 0
  const directOH = num('oh_cc_material') + num('oh_cc_manufacturing')
  const indirectOH = num('oh_cc_sga') + num('oh_cc_logistics') + num('oh_cc_rd')
  const totalCC = directOH + indirectOH
  const totalAnnual = num('oh_base_material') + num('oh_base_manufacturing') + totalCC
  const profitPct = num('overhead_profit_pct')
  const annualMargin = totalAnnual * profitPct / 100
  const annualRevenue = totalAnnual + annualMargin
  const totalPctOnProd = r.productionBase > 0 ? Math.round((totalCC / r.productionBase) * 10000) / 100 : 0

  function numf(key: keyof Company) {
    return {
      value: (form[key] as number | null | undefined) ?? null,
      onValue: (v: number | null) => setForm(f => ({ ...f, [key]: v })),
    }
  }

  async function save() {
    if (!company) return
    setSaving(true)
    const rr = computeOverhead(form)
    const { error } = await supabase.from('companies').update({
      oh_cc_material: form.oh_cc_material ?? 0, oh_cc_manufacturing: form.oh_cc_manufacturing ?? 0,
      oh_cc_sga: form.oh_cc_sga ?? 0, oh_cc_logistics: form.oh_cc_logistics ?? 0, oh_cc_rd: form.oh_cc_rd ?? 0,
      oh_base_material: form.oh_base_material ?? 0, oh_base_manufacturing: form.oh_base_manufacturing ?? 0,
      // Derived rates that feed the quote calculator
      overhead_material_pct: rr.materialPct, overhead_mfg_pct: rr.mfgPct, overhead_sga_pct: rr.sgaPct,
      overhead_logistics_pct: rr.logisticsPct, overhead_rd_pct: rr.rdPct,
      overhead_profit_pct: form.overhead_profit_pct ?? 15,
      updated_at: new Date().toISOString(),
    }).eq('id', company.id)
    setSaving(false)
    if (error) { toast.error(error.message); return }
    toast.success(t.common.saved); refetch()
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
  if (!hasPerm('overheads', 'view')) return <Navigate to="/dashboard" replace />

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">{t.nav.overheads}</h1>
          <p className="text-xs text-gray-400 mt-1">{s.overheadCalcHint}</p>
        </div>
        {canEdit && <Button loading={saving} onClick={save}>{t.common.save}</Button>}
      </div>

      <div className="flex flex-col gap-6"><fieldset disabled={!canEdit} className="contents">
        {/* Bases first */}
        <Section title={s.bases}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
            <NumberInput label={s.baseMaterialDirect} unit={`${sym} ${s.units.perYear}`} {...numf('oh_base_material')} />
            <NumberInput label={s.baseMfgDirect} unit={`${sym} ${s.units.perYear}`} {...numf('oh_base_manufacturing')} />
          </div>
          <div className="mt-5"><ResultBar label={s.productionBase} value={money(r.productionBase)} /></div>
        </Section>

        {/* Cost centres — procurement & production */}
        <Section title={s.ccGroupProd}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
            <NumberInput label={s.ccMaterial} unit={`${sym} ${s.units.perYear}`} {...numf('oh_cc_material')} />
            <NumberInput label={s.ccManufacturing} unit={`${sym} ${s.units.perYear}`} {...numf('oh_cc_manufacturing')} />
          </div>
          <div className="mt-5 flex flex-col gap-2">
            <ResultBar label={s.directOverhead} value={money(directOH)} />
            <ResultBar label={s.intermediateBase} value={money(r.intermediateBase)} highlight />
          </div>
        </Section>

        {/* Cost centres — general overhead (on the intermediate base) */}
        <Section title={s.ccGroupGeneral}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
            <NumberInput label={s.ccSga} unit={`${sym} ${s.units.perYear}`} {...numf('oh_cc_sga')} />
            <NumberInput label={s.ccLogistics} unit={`${sym} ${s.units.perYear}`} {...numf('oh_cc_logistics')} />
            <NumberInput label={s.ccRd} unit={`${sym} ${s.units.perYear}`} {...numf('oh_cc_rd')} />
          </div>
          <div className="mt-5 flex flex-col gap-2">
            <ResultBar label={s.indirectOverhead} value={money(indirectOH)} />
            <ResultBar label={s.totalAnnualCosts} value={money(totalAnnual)} highlight />
          </div>
        </Section>

        {/* Computed rates */}
        <Section title={s.computedRatesTitle}>
          <div className="flex flex-col gap-2">
            <ResultBar label={s.materialOh} value={`${r.materialPct} %`} />
            <ResultBar label={s.mfgOh} value={`${r.mfgPct} %`} />
            <ResultBar label={s.sga} value={`${r.sgaPct} %`} />
            <ResultBar label={s.logistics} value={`${r.logisticsPct} %`} />
            <ResultBar label={s.rd} value={`${r.rdPct} %`} />
            <ResultBar label={s.totalPctOnProduction} value={`${totalPctOnProd} %`} highlight />
          </div>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 items-end">
            <NumberInput label={s.profit} unit={s.units.pct} {...numf('overhead_profit_pct')} />
            <ResultBar label={s.marginPerYear} value={money(annualMargin)} />
          </div>
          <div className="mt-4"><ResultBar label={s.totalAnnualRevenue} value={money(annualRevenue)} highlight /></div>
        </Section>
      </fieldset></div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      <hr className="border-gray-200 my-5" />
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
