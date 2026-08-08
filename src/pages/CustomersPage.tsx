import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Plus, Users, Search, CalendarDays, Building2, MoreVertical } from 'lucide-react'
import { SortIcon } from '../components/ui/SortIcon'
import { format } from 'date-fns'
import { supabase } from '../lib/supabase'
import { useCompany } from '../hooks/useCompany'
import { useLanguage } from '../hooks/useLanguage'
import { toast } from '../components/ui/Toast'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import Pagination from '../components/ui/Pagination'
import { PageHeader } from '../components/ui/PageHeader'
import { FilterSelect } from '../components/ui/FilterSelect'
import { PersonBadge } from '../components/ui/PersonBadge'
import type { Customer } from '../types/database'

interface Form {
  name: string; vat_number: string; contact_person: string
  address_street: string; address_city: string; address_postal_code: string; country: string
  email: string; phone: string; payment_terms: string; parity: string; status: 'active' | 'inactive'
}
const empty: Form = {
  name: '', vat_number: '', contact_person: '', address_street: '', address_city: '', address_postal_code: '',
  country: '', email: '', phone: '', payment_terms: '', parity: '', status: 'active',
}

const PAGE_SIZE = 20

export default function CustomersPage() {
  const { company, hasPerm, loading: permLoading } = useCompany()
  const canEdit = hasPerm('customers', 'create')
  const { t } = useLanguage()
  const s = t.qp
  const [rows, setRows] = useState<Customer[]>([])
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Customer | null>(null)
  const [form, setForm] = useState<Form>(empty)
  const [saving, setSaving] = useState(false)
  const [toDelete, setToDelete] = useState<Customer | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [page, setPage] = useState(1)
  const [sortKey, setSortKey] = useState<'name' | 'status' | 'quotes'>('name')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  function handleSort(k: typeof sortKey) { setSortKey(k); setSortDir(s => k === sortKey ? (s === 'asc' ? 'desc' : 'asc') : 'asc'); setPage(1) }

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
      name: c.name, vat_number: c.vat_number ?? '', contact_person: c.contact_person ?? '',
      address_street: c.address_street ?? '', address_city: c.address_city ?? '', address_postal_code: c.address_postal_code ?? '',
      country: c.country ?? '', email: c.email ?? '', phone: c.phone ?? '',
      payment_terms: c.payment_terms ?? '', parity: c.parity ?? '', status: c.status ?? 'active',
    })
    setOpen(true)
  }

  async function save() {
    if (!company || !form.name.trim()) return
    setSaving(true)
    const tr = (v: string) => v.trim() || null
    const payload = {
      name: form.name.trim(), vat_number: tr(form.vat_number), contact_person: tr(form.contact_person),
      address_street: tr(form.address_street), address_city: tr(form.address_city), address_postal_code: tr(form.address_postal_code),
      country: tr(form.country), email: tr(form.email), phone: tr(form.phone),
      payment_terms: tr(form.payment_terms), parity: tr(form.parity), status: form.status,
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
    if ((counts[toDelete.id] ?? 0) > 0) { setDeleting(false); toast.error(s.cannotDeleteLinkedCustomer); setToDelete(null); return }
    const { error } = await supabase.from('customers').delete().eq('id', toDelete.id)
    setDeleting(false)
    if (error) { toast.error(error.message); return }
    toast.success(t.common.deleted); setToDelete(null); load()
  }

  const filtered = rows.filter(c =>
    (statusFilter === 'all' || (c.status ?? 'active') === statusFilter) &&
    (!search || c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.contact_person ?? '').toLowerCase().includes(search.toLowerCase())))
  const sorted = [...filtered].sort((a, b) => {
    const mul = sortDir === 'asc' ? 1 : -1
    if (sortKey === 'name') return a.name.localeCompare(b.name) * mul
    if (sortKey === 'status') return ((a.status ?? 'active') > (b.status ?? 'active') ? 1 : -1) * mul
    if (sortKey === 'quotes') return ((counts[a.id] ?? 0) - (counts[b.id] ?? 0)) * mul
    return 0
  })
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const field = (key: keyof Form) => ({ value: form[key] as string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [key]: e.target.value })) })

  if (!permLoading && !hasPerm('customers', 'view')) return <Navigate to="/dashboard" replace />

  return (
    <div>
      <PageHeader title={s.customers} icon={Users} count={rows.length} action={canEdit && <Button onClick={openNew} className="gap-2"><Plus className="w-4 h-4" />{s.newCustomer}</Button>} />
      <div className="p-4">

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-gray-900 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder={t.common.search}
            className="w-full pl-9 pr-3 py-1 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <FilterSelect label={t.common.status} value={statusFilter === 'all' ? '' : statusFilter} allLabel={t.common.all}
          options={[{ value: 'active', label: t.common.activeFPl }, { value: 'inactive', label: t.common.inactiveFPl }]}
          onChange={v => { setStatusFilter((v || 'all') as typeof statusFilter); setPage(1) }} />
      </div>

      <div className="-mx-4 border-t border-b border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center h-48"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <Users className="w-10 h-10 text-gray-200 mb-3" />
            <p className="text-sm text-gray-400">{s.noCustomers}</p>
          </div>
        ) : (
          <div className="overflow-x-auto"><table className="w-full text-sm min-w-[820px]">
            <thead className="bg-gray-50 border-b border-gray-200"><tr>
              {([['name', s.companyName], ['', s.contact], ['', t.common.email], ['', t.common.phone], ['', s.paymentTerms], ['quotes', s.quotesCount], ['status', t.common.status], ['', s.updatedAt], ['', '']] as [string, string][]).map(([key, h], i) => (
                <th key={i} className={`text-left px-4 py-3 text-xs font-medium text-gray-500 ${key ? 'cursor-pointer select-none hover:text-gray-700' : ''}`}
                  onClick={() => key && handleSort(key as typeof sortKey)}>
                  <span className="inline-flex items-center gap-0.5">{h}{key && <SortIcon active={sortKey === key} dir={sortDir} />}</span>
                </th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-gray-200">
              {paginated.map(c => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: '#e5eeff', border: '1px solid #d6e5ff' }}>
                        <Building2 className="w-3.5 h-3.5" style={{ color: '#215bcf' }} />
                      </div>
                      <span className="font-medium text-gray-900">{c.name}{c.vat_number && <span className="ml-2 text-xs text-gray-400 font-normal">{c.vat_number}</span>}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">{c.contact_person ? <PersonBadge name={c.contact_person} /> : <span className="text-gray-400">—</span>}</td>
                  <td className="px-4 py-3 text-gray-600">{c.email ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{c.phone ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{c.payment_terms ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{counts[c.id] ?? 0}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-md text-xs font-medium" style={(c.status ?? 'active') === 'active' ? { backgroundColor: '#e0fced', border: '1px solid #d4f8e6', color: '#098259' } : { backgroundColor: '#feeee1', border: '1px solid #fee0c8', color: '#9e3f00' }}>
                      {(c.status ?? 'active') === 'active' ? t.common.activeF : t.common.inactiveF}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-gray-200 text-xs text-gray-900 whitespace-nowrap" style={{ backgroundColor: '#fbfbfb' }}><CalendarDays className="w-3 h-3 text-gray-500 shrink-0" />{format(new Date(c.updated_at), 'd. M. yyyy')}</span>
                  </td>
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-end">
                      {canEdit && <button onClick={() => openEdit(c)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"><MoreVertical className="w-4 h-4" /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </div>

      <Pagination total={filtered.length} page={page} pageSize={PAGE_SIZE} onChange={setPage} />

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? s.editCustomer : s.newCustomer} size="lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2"><Input id="c-name" label={s.companyName} {...field('name')} /></div>
          <Input id="c-vat" label={s.vatNumber} {...field('vat_number')} />
          <Input id="c-contact" label={s.contactPerson} {...field('contact_person')} />
          <Input id="c-street" label={t.common.streetAddress} {...field('address_street')} />
          <Input id="c-city" label={t.common.city} {...field('address_city')} />
          <Input id="c-postal" label={t.common.postalCode} {...field('address_postal_code')} />
          <Input id="c-country" label={s.country} {...field('country')} />
          <Input id="c-email" label={t.common.email} type="email" {...field('email')} />
          <Input id="c-phone" label={t.common.phone} {...field('phone')} />
          <Input id="c-payterms" label={s.paymentTerms} placeholder={s.paymentTermsHint} {...field('payment_terms')} />
          <Input id="c-parity" label={s.parity} placeholder={s.parityHint} {...field('parity')} />
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-700 mt-4">
          <input type="checkbox" checked={form.status === 'active'} onChange={e => setForm(f => ({ ...f, status: e.target.checked ? 'active' : 'inactive' }))}
            className="rounded border-gray-200 text-blue-600 focus:ring-blue-500" />{t.common.activeF}
        </label>
        {editing && (counts[editing.id] ?? 0) > 0 && <p className="text-sm text-gray-400 mt-5">{s.cannotDeleteLinkedCustomer}</p>}
        <div className="flex items-center justify-between mt-4 pt-4 -mx-6 px-6 border-t border-gray-200">
          <div>
            {editing && (counts[editing.id] ?? 0) === 0 && (
              <Button variant="danger" onClick={() => { setOpen(false); setToDelete(editing) }}>{t.common.delete}</Button>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setOpen(false)}>{t.common.cancel}</Button>
            <Button loading={saving} onClick={save} disabled={!form.name.trim()}>{editing ? t.common.save : s.newCustomer}</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!toDelete} onClose={() => setToDelete(null)} onConfirm={doDelete}
        title={s.deleteCustomer} message={s.deleteCustomerConfirm} confirmLabel={t.common.delete} danger loading={deleting} />
    </div>
    </div>
  )
}
