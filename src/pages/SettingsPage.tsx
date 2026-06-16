import { useEffect, useState } from 'react'
import { Building2, Percent } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useCompany } from '../hooks/useCompany'
import { useLanguage } from '../hooks/useLanguage'
import { toast } from '../components/ui/Toast'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import NumberInput from '../components/ui/NumberInput'
import type { Company } from '../types/database'

const CURRENCIES = ['EUR', 'USD', 'GBP', 'CHF', 'SEK', 'NOK', 'DKK', 'PLN', 'CZK', 'HRK']

type Tab = 'company' | 'overhead'

export default function SettingsPage() {
  const { company, loading, refetch } = useCompany()
  const { t } = useLanguage()
  const s = t.qp
  const [tab, setTab] = useState<Tab>('company')
  const [form, setForm] = useState<Partial<Company>>({})
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => { if (company) setForm(company) }, [company])

  function field(key: keyof Company) {
    return {
      value: (form[key] as string) ?? '',
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [key]: e.target.value })),
    }
  }
  function numf(key: keyof Company) {
    return {
      value: (form[key] as number | null | undefined) ?? null,
      onValue: (v: number | null) => setForm(f => ({ ...f, [key]: v })),
    }
  }

  async function save(section: string, fields: (keyof Company)[]) {
    if (!company) return
    setSaving(section)
    const patch = Object.fromEntries(fields.map(k => [k, form[k] ?? null]))
    const { error } = await supabase.from('companies').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', company.id)
    setSaving(null)
    if (error) { toast.error(error.message); return }
    toast.success(t.common.saved); refetch()
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'company', label: s.tabCompany, icon: Building2 },
    { id: 'overhead', label: s.tabOverhead, icon: Percent },
  ]

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto">
      <div className="mb-6"><h1 className="text-2xl font-bold text-gray-900">{t.nav.settings}</h1></div>

      <div className="flex gap-1 border-b border-gray-200 mb-6 overflow-x-auto">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
              tab === id ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>
            <Icon className="w-4 h-4" />{label}
          </button>
        ))}
      </div>

      {tab === 'company' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="col-span-2"><Input id="name" label={t.common.name} {...field('name')} /></div>
            <Input id="email" label={t.common.email} type="email" {...field('email')} />
            <Input id="phone" label={t.common.phone} {...field('phone')} />
            <div className="col-span-2"><Input id="tax_id" label={s.vatNumber} {...field('tax_id')} /></div>
            <Input id="address_street" label={t.common.streetAddress} {...field('address_street')} />
            <Input id="address_city" label={t.common.city} {...field('address_city')} />
            <Input id="address_postal_code" label={t.common.postalCode} {...field('address_postal_code')} />
            <Input id="address_country" label={t.common.country} {...field('address_country')} />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">{t.settings.currency}</label>
              <select value={form.currency ?? 'EUR'} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {CURRENCIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <Input id="bank_iban" label="IBAN" {...field('bank_iban')} />
          </div>
          <div className="mt-4 flex justify-end">
            <Button loading={saving === 'company'} onClick={() => save('company', ['name', 'email', 'phone', 'tax_id', 'address_street', 'address_city', 'address_postal_code', 'address_country', 'currency', 'bank_iban'])}>{t.common.save}</Button>
          </div>
        </div>
      )}

      {tab === 'overhead' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-xs text-gray-400 mb-4">{s.overheadHint}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <NumberInput id="oh_mat" label={s.materialOh} {...numf('overhead_material_pct')} />
            <NumberInput id="oh_mfg" label={s.mfgOh} {...numf('overhead_mfg_pct')} />
            <NumberInput id="oh_sga" label={s.sga} {...numf('overhead_sga_pct')} />
            <NumberInput id="oh_log" label={s.logistics} {...numf('overhead_logistics_pct')} />
            <NumberInput id="oh_rd" label={s.rd} {...numf('overhead_rd_pct')} />
            <NumberInput id="oh_profit" label={s.profit} {...numf('overhead_profit_pct')} />
          </div>
          <div className="mt-4 flex justify-end">
            <Button loading={saving === 'overhead'} onClick={() => save('overhead', ['overhead_material_pct', 'overhead_mfg_pct', 'overhead_sga_pct', 'overhead_logistics_pct', 'overhead_rd_pct', 'overhead_profit_pct'])}>{t.common.save}</Button>
          </div>
        </div>
      )}
    </div>
  )
}
