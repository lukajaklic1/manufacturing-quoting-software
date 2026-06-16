import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Users, Search } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useCompany } from '../hooks/useCompany'
import { useLanguage } from '../hooks/useLanguage'
import { toast } from '../components/ui/Toast'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import type { Customer } from '../types/database'

type Form = { name: string; contact_person: string; email: string; phone: string; address: string; vat_number: string; country: string; notes: string }

const empty: Form = { name: '', contact_person: '', email: '', phone: '', address: '', vat_number: '', country: '', notes: '' }

export default function CustomersPage() {
  const { company } = useCompany()
  const { t } = useLanguage()
  const s = t.qp
  const [rows, setRows] = useState<Customer[]>([])
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Customer | null>(null)
  const [form, setForm] = useState<Form>(empty)
  const [saving, setSaving] = useState(false)
  const [toDelete, setToDelete] = useState<Customer | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => { if (company) load() }, [company])

  async function load() {
    if (!company) return
    setLoading(true)
    const [{ data: custData }, { data: quoteData }] = await Promise.all([
      supabase.from('customers').select('*').eq('company_id', company.id).order('name'),
      supabase.from('quotes').select('customer_id').eq('company_id', company.id),
    ])
    setRows((custData as Customer[]) ?? [])
    const c: Record<string, number> = {}
    for (const q of (quoteData as { customer_id: string }[]) ?? []) c[q.customer_id] = (c[q.customer_id] ?? 0) + 1
    setCounts(c)
    setLoading(false)
  }

  function openNew() { setEditing(null); setForm(empty); setOpen(true) }
  function openEdit(c: Customer) {
    setEditing(c)
    setForm({
      name: c.name, contact_person: c.contact_person ?? '', email: c.email ?? '', phone: c.phone ?? '',
      address: c.address ?? '', vat_number: c.vat_number ?? '', country: c.country ?? '', notes: c.notes ?? '',
    })
    setOpen(true)
  }

  async function save() {
    if (!company || !form.name.trim()) return
    setSaving(true)
    const payload = {
      name: form.name.trim(),
      contact_person: form.contact_person.trim() || null,
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      address: form.address.trim() || null,
      vat_number: form.vat_number.trim() || null,
      country: form.country.trim() || null,
      notes: form.notes.trim() || null,
    }
    const { error } = editing
      ? await supabase.from('customers').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', editing.id)
      : await supabase.from('customers').insert({ ...payload, company_id: company.id })
    setSaving(false)
    if (error) { toast.error(error.message); return }
    toast.success(t.common.saved); setOpen(false); load()
  }

  async function doDelete() {
    if (!toDelete) return
    setDeleting(true)
    const { error } = await supabase.from('customers').delete().eq('id', toDelete.id)
    setDeleting(false)
    if (error) { toast.error(error.message); return }
    toast.success(t.common.deleted); setToDelete(null); load()
  }

  const filtered = rows.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.contact_person ?? '').toLowerCase().includes(search.toLowerCase()))

  function field(key: keyof Form) {
    return { value: form[key], onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [key]: e.target.value })) }
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{s.customers}</h1>
          <p className="text-gray-500 text-sm mt-1">{rows.length} {s.customers.toLowerCase()}</p>
        </div>
        <Button onClick={openNew} className="gap-2"><Plus className="w-4 h-4" />{s.newCustomer}</Button>
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t.common.search}
          className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <Users className="w-10 h-10 text-gray-200 mb-3" />
            <p className="text-sm text-gray-400">{s.noCustomers}</p>
          </div>
        ) : (
          <div className="overflow-x-auto"><table className="w-full text-sm min-w-[700px]">
            <thead className="bg-gray-50 border-b border-gray-100"><tr>
              {[s.customerName, s.contactPerson, t.common.email, s.country, s.quotesCount, ''].map((h, i) => (
                <th key={i} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                  <td className="px-4 py-3 text-gray-600">{c.contact_person ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{c.email ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{c.country ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{counts[c.id] ?? 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => openEdit(c)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setToDelete(c)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? s.editCustomer : s.newCustomer} size="lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2"><Input id="c-name" label={s.customerName} {...field('name')} /></div>
          <Input id="c-contact" label={s.contactPerson} {...field('contact_person')} />
          <Input id="c-email" label={t.common.email} type="email" {...field('email')} />
          <Input id="c-phone" label={t.common.phone} {...field('phone')} />
          <Input id="c-country" label={s.country} {...field('country')} />
          <Input id="c-vat" label={s.vatNumber} {...field('vat_number')} />
          <div className="sm:col-span-2"><Input id="c-address" label={t.common.streetAddress} {...field('address')} /></div>
          <div className="sm:col-span-2 flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">{s.notes}</label>
            <textarea rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
        </div>
        <div className="flex gap-3 justify-end mt-5">
          <Button variant="secondary" onClick={() => setOpen(false)}>{t.common.cancel}</Button>
          <Button loading={saving} onClick={save} disabled={!form.name.trim()}>{t.common.save}</Button>
        </div>
      </Modal>

      <ConfirmDialog open={!!toDelete} onClose={() => setToDelete(null)} onConfirm={doDelete}
        title={s.deleteCustomer} message={s.deleteCustomerConfirm} confirmLabel={t.common.delete} danger loading={deleting} />
    </div>
  )
}
