import { useEffect, useState } from 'react'
import { Building2, Receipt, CreditCard, Settings } from 'lucide-react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useCompany } from '../hooks/useCompany'
import { useLanguage } from '../hooks/useLanguage'
import { toast } from '../components/ui/Toast'
import Button from '../components/ui/Button'
import { PageHeader } from '../components/ui/PageHeader'
import Input from '../components/ui/Input'
import { currencySymbol } from '../lib/currency'
import type { Company } from '../types/database'

const CURRENCIES = ['EUR', 'USD', 'GBP', 'CHF', 'SEK', 'NOK', 'DKK', 'PLN', 'CZK', 'HRK']

export default function SettingsPage() {
  const { company, loading, refetch, isAdmin } = useCompany()
  const { t } = useLanguage()
  const s = t.qp
  const [form, setForm] = useState<Partial<Company>>({})
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => { if (company) setForm(company) }, [company])

  function field(key: keyof Company) {
    return {
      value: (form[key] as string) ?? '',
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [key]: e.target.value })),
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
  if (!isAdmin) return <Navigate to="/dashboard" replace />

  const prefix = form.quote_prefix ?? 'Q'
  const nextNum = (form.quote_counter ?? 0) + 1
  const year = new Date().getFullYear()
  const preview = `${prefix}${year}${String(nextNum).padStart(4, '0')}`

  return (
    <div>
      <PageHeader title={t.nav.settings} icon={Settings} />
      <div className="p-4 lg:p-6 max-w-3xl mx-auto">
      <div className="flex flex-col gap-6"><fieldset disabled={!isAdmin} className="contents">
        {/* Company profile */}
        <Section icon={Building2} title={s.companyProfile}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="col-span-2"><Input id="name" label={s.companyName} {...field('name')} /></div>
            <Input id="email" label={t.common.email} type="email" {...field('email')} />
            <Input id="phone" label={t.common.phone} {...field('phone')} />
            <div className="col-span-2"><Input id="tax_id" label={s.vatNumber} {...field('tax_id')} /></div>
            <Input id="address_street" label={t.common.streetAddress} {...field('address_street')} />
            <Input id="address_city" label={t.common.city} {...field('address_city')} />
            <Input id="address_postal_code" label={t.common.postalCode} {...field('address_postal_code')} />
            <Input id="address_country" label={t.common.country} {...field('address_country')} />
          </div>
          {isAdmin && <SaveRow loading={saving === 'profile'} onClick={() => save('profile', ['name', 'email', 'phone', 'tax_id', 'address_street', 'address_city', 'address_postal_code', 'address_country'])} label={t.common.save} />}
        </Section>

        {/* Quote settings */}
        <Section icon={Receipt} title={s.quoteSettings}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-[#7f7f7f]">{t.settings.currency}</label>
              <select value={form.currency ?? 'EUR'} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                {CURRENCIES.map(c => <option key={c} value={c}>{currencySymbol(c)} · {c}</option>)}
              </select>
            </div>
            <Input id="quote_prefix" label={s.quotePrefix} {...field('quote_prefix')} />
            <Input id="next_num" label={s.nextQuoteNumber} type="number" value={String(nextNum)}
              onChange={e => setForm(f => ({ ...f, quote_counter: Math.max(0, (parseInt(e.target.value) || 1) - 1) }))} />
          </div>
          <p className="text-xs text-gray-400 mt-2">{s.nextQuoteWillBe}: <span className="font-mono text-gray-600">{preview}</span></p>
          {isAdmin && <SaveRow loading={saving === 'quote'} onClick={() => save('quote', ['currency', 'quote_prefix', 'quote_counter'])} label={t.common.save} />}
        </Section>

        {/* Bank details */}
        <Section icon={CreditCard} title={s.bankDetails}>
          <p className="text-xs text-gray-400 mb-4">{s.bankHint}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input id="bank_name" label={s.bankName} {...field('bank_name')} />
            <Input id="bank_iban" label="IBAN" {...field('bank_iban')} />
          </div>
          {isAdmin && <SaveRow loading={saving === 'bank'} onClick={() => save('bank', ['bank_name', 'bank_iban'])} label={t.common.save} />}
        </Section>

        {/* General terms */}
        <Section icon={Receipt} title={s.quoteTerms}>
          <p className="text-xs text-gray-400 mb-4">{s.quoteTermsHint}</p>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">{s.quoteTermsSl}</label>
              <textarea
                rows={6}
                value={form.quote_terms ?? ''}
                onChange={e => setForm(f => ({ ...f, quote_terms: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">{s.quoteTermsEn}</label>
              <textarea
                rows={6}
                value={form.quote_terms_en ?? ''}
                onChange={e => setForm(f => ({ ...f, quote_terms_en: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
              />
            </div>
          </div>
          {isAdmin && <SaveRow loading={saving === 'terms'} onClick={() => save('terms', ['quote_terms', 'quote_terms_en'])} label={t.common.save} />}
        </Section>
      </fieldset></div>
    </div>
    </div>
  )
}

function Section({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
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

function SaveRow({ loading, onClick, label }: { loading: boolean; onClick: () => void; label: string }) {
  return <div className="mt-5 flex justify-end"><Button loading={loading} onClick={onClick}>{label}</Button></div>
}
