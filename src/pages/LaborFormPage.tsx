import { useEffect, useState } from 'react'
import { useNavigate, useParams, Navigate } from 'react-router-dom'
import { ChevronLeft, HardHat, Info, Clock, Calculator, type LucideIcon } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useCompany } from '../hooks/useCompany'
import { useLanguage } from '../hooks/useLanguage'
import { toast } from '../components/ui/Toast'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import NumberInput from '../components/ui/NumberInput'
import { laborRateBreakdown } from '../lib/laborRate'
import { currencySymbol } from '../lib/currency'
import { usedLaborIds } from '../lib/usageCheck'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { PageHeader } from '../components/ui/PageHeader'
import { PersonBadge } from '../components/ui/PersonBadge'
import { format } from 'date-fns'
import type { LaborRate } from '../types/database'

const defaults: Partial<LaborRate> = {
  name: '', is_active: true, annual_cost: 0,
  working_days_per_year: 240, vacation_days: 30, shifts_per_day: 1,
  hours_per_shift: 8, break_min_per_shift: 30, utilization_pct: 85,
}

export default function LaborFormPage() {
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
  const days = (n: number) => `${n.toLocaleString('de-DE', { maximumFractionDigits: 0 })}`

  const [l, setL] = useState<Partial<LaborRate>>(defaults)
  const [editorName, setEditorName] = useState<string | null>(null)
  const [loading, setLoading] = useState(editMode)
  const [saving, setSaving] = useState(false)
  const [isUsed, setIsUsed] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!editMode || !id) return
    supabase.from('labor_rates').select('*').eq('id', id).single().then(async ({ data }) => {
      if (data) {
        setL(data as LaborRate)
        const uid = (data as LaborRate).updated_by
        if (uid) {
          const { data: usr } = await supabase.from('users').select('first_name, last_name').eq('id', uid).single()
          if (usr) setEditorName(`${usr.first_name} ${usr.last_name}`)
        }
      }
      setLoading(false)
    })
    usedLaborIds().then(ids => setIsUsed(ids.has(id!)))
  }, [id])

  async function doDelete() {
    if (!id) return
    setDeleting(true)
    const { error } = await supabase.from('labor_rates').delete().eq('id', id)
    setDeleting(false)
    if (error) { toast.error(error.message); return }
    toast.success(t.common.deleted); navigate('/labor')
  }

  async function toggleActive() {
    if (!id) return
    const next = !l.is_active
    const { error } = await supabase.from('labor_rates').update({ is_active: next, updated_at: new Date().toISOString() }).eq('id', id)
    if (error) { toast.error(error.message); return }
    setL(v => ({ ...v, is_active: next }))
    toast.success(t.common.saved)
  }

  const b = laborRateBreakdown(l)

  function numf(key: keyof LaborRate) {
    return {
      value: (l[key] as number | null | undefined) ?? null,
      onValue: (v: number | null) => setL(s => ({ ...s, [key]: v })),
    }
  }

  async function save() {
    if (!company || !l.name?.trim()) return
    setSaving(true)
    const computed = Math.round(laborRateBreakdown(l).ratePerHour * 100) / 100
    const { id: _omit, created_at, updated_at, company_id, ...rest } = l as LaborRate
    const payload = { ...rest, name: l.name!.trim(), hourly_rate_computed: computed, updated_by: profile?.id ?? null }
    const { error } = editMode
      ? await supabase.from('labor_rates').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', id!)
      : await supabase.from('labor_rates').insert({ ...payload, company_id: company.id })
    setSaving(false)
    if (error) { toast.error(error.message); return }
    toast.success(t.common.saved); navigate('/labor')
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
  if (company && !hasPerm('labor_rates', 'create')) return <Navigate to="/labor" replace />

  return (
    <div>
      <PageHeader title={editMode ? (l.name || s.addLabor) : s.addLabor} icon={HardHat} />

      {/* Subtitle bar */}
      <div className="px-4 py-3 border-b border-gray-200 bg-white flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={() => navigate('/labor')} className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 shrink-0 transition-colors">
            <ChevronLeft className="w-4 h-4" />{t.nav.labor}
          </button>
          <span className="text-gray-200 shrink-0">·</span>
          <span className="text-sm text-gray-500 truncate">{s.laborFormHint}</span>
        </div>
        {editMode && l.updated_at && (
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-sm text-gray-400">{t.common.lastUpdated}: {format(new Date(l.updated_at), 'd. M. yyyy')}</span>
            {editorName && <PersonBadge name={editorName} />}
          </div>
        )}
      </div>

      <div className="p-4 lg:p-8 max-w-4xl mx-auto">
        <div className="flex flex-col gap-6">
          <Section icon={Info} title={s.general}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
              <Input id="name" label={s.operatorTitle} value={l.name ?? ''} onChange={e => setL(v => ({ ...v, name: e.target.value }))} />
              <NumberInput id="ac" label={s.annualCost} unit={sym} {...numf('annual_cost')} />
            </div>
          </Section>

          <Section icon={Clock} title={s.capacity}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
              <NumberInput id="wd" label={s.workingDays} unit={u.daysYear} {...numf('working_days_per_year')} />
              <NumberInput id="vd" label={s.vacationDays} unit={u.daysYear} {...numf('vacation_days')} />
              <NumberInput id="sh" label={s.shifts} unit={u.shiftsDay} {...numf('shifts_per_day')} />
              <NumberInput id="hps" label={s.hoursPerShift} unit={u.hoursShift} {...numf('hours_per_shift')} />
              <NumberInput id="br" label={s.breakMin} unit={u.minShift} {...numf('break_min_per_shift')} />
              <NumberInput id="ut" label={s.utilization} unit={u.pct} {...numf('utilization_pct')} />
            </div>
            <div className="mt-5 flex flex-col gap-2">
              <ResultBar label={s.effectiveWorkdays} value={days(b.effectiveWorkdays)} />
              <ResultBar label={s.netHours} value={hours(b.netHours)} highlight />
            </div>
          </Section>

          {/* Result + actions */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200">
              <div className="p-2 bg-blue-50 rounded-lg"><Calculator className="w-4 h-4 text-blue-600" /></div>
              <h2 className="text-sm font-semibold text-gray-900">{s.summary}</h2>
            </div>
            <div className="px-6 py-5 flex flex-col gap-2">
              <ResultBar label={s.ratePerHour} value={money(b.ratePerHour)} highlight />
              {editMode && isUsed && <p className="text-sm text-gray-400 mt-1">{s.cannotDeleteLinkedLabor}</p>}
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex items-center gap-2">
              {editMode && <Button variant="secondary" onClick={toggleActive} disabled={saving}>{l.is_active ? t.common.deactivate : t.common.activate}</Button>}
              {editMode && !isUsed && <Button variant="danger" onClick={() => setConfirmDelete(true)} disabled={saving}>{t.common.delete}</Button>}
              <div className="flex-1" />
              <Button variant="secondary" onClick={() => navigate('/labor')} disabled={saving}>{t.common.cancel}</Button>
              <Button loading={saving} onClick={save} disabled={!l.name?.trim()}>{t.common.save}</Button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog open={confirmDelete} onClose={() => setConfirmDelete(false)} onConfirm={doDelete}
        title={t.nav.labor} message={s.deleteLaborConfirm} confirmLabel={t.common.delete} danger loading={deleting} />
    </div>
  )
}

function Section({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200">
        <div className="p-2 bg-blue-50 rounded-lg"><Icon className="w-4 h-4 text-blue-600" /></div>
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

function ResultBar({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`flex items-center justify-between rounded-lg px-4 py-3 ${highlight ? 'bg-blue-50' : 'bg-gray-50'}`}>
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`text-base font-bold ${highlight ? 'text-blue-600' : 'text-gray-900'}`}>{value}</span>
    </div>
  )
}
