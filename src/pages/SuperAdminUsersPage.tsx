?import { useEffect, useRef, useState } from 'react'
import { Power, PowerOff, Search, X, Check } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { toast } from '../components/ui/Toast'
import Pagination from '../components/ui/Pagination'

interface UserRow {
  id: string
  first_name: string
  last_name: string
  email: string
  company_id: string
  company_name: string
  is_active: boolean
  is_admin: boolean
  is_super_admin: boolean
  created_at: string
}

const PAGE_SIZE = 20

function pluralUsers(n: number) {
  if (n === 1) return '1 uporabnik'
  if (n === 2) return '2 uporabnika'
  if (n === 3 || n === 4) return `${n} uporabniki`
  return `${n} uporabnikov`
}

export default function SuperAdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [companyFilter, setCompanyFilter] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const [{ data: usrs }, { data: comps }] = await Promise.all([
      supabase.from('users').select('*').order('created_at', { ascending: false }),
      supabase.from('companies').select('id, name'),
    ])
    if (usrs && comps) {
      const nameMap: Record<string, string> = {}
      for (const c of comps) nameMap[c.id] = c.name
      setUsers(usrs.map(u => ({ ...u, company_name: nameMap[u.company_id] || '�"' })))
    }
    setLoading(false)
  }

  async function toggle(u: UserRow) {
    setToggling(u.id)
    const { error } = await supabase.from('users').update({ is_active: !u.is_active }).eq('id', u.id)
    if (error) toast('Napaka pri posodobitvi', 'error')
    else {
      toast(u.is_active ? 'Uporabnik deaktiviran' : 'Uporabnik aktiviran', 'success')
      setUsers(prev => prev.map(x => x.id === u.id ? { ...x, is_active: !x.is_active } : x))
    }
    setToggling(null)
  }

  const companyOptions: [string, string][] = Array.from(
    new Map(users.map(u => [u.company_id, u.company_name])).entries()
  ).sort((a, b) => a[1].localeCompare(b[1]))

  const q = search.toLowerCase()
  const filtered = users.filter(u => {
    const nameMatch = !search || `${u.first_name} ${u.last_name}`.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    const companyMatch = companyFilter === 'all' || u.company_id === companyFilter
    const roleMatch = roleFilter === 'all' ||
      (roleFilter === 'super_admin' && u.is_super_admin) ||
      (roleFilter === 'admin' && u.is_admin && !u.is_super_admin) ||
      (roleFilter === 'user' && !u.is_admin && !u.is_super_admin)
    const statusMatch = statusFilter === 'all' ||
      (statusFilter === 'active' && u.is_active) ||
      (statusFilter === 'inactive' && !u.is_active)
    return nameMatch && companyMatch && roleMatch && statusMatch
  })

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const fmt = (s: string) => new Date(s).toLocaleDateString('sl-SI')

  function resetPage() { setPage(1) }

  return (
    <div className="px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Uporabniki</h1>
        <p className="text-sm text-gray-500 mt-0.5">{pluralUsers(users.length)} na platformi</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-900 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Ime, priimek ali e-pošta..."
            value={search}
            onChange={e => { setSearch(e.target.value); resetPage() }}
            className="pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
          />
        </div>

        <ComboFilter
          options={companyOptions}
          value={companyFilter}
          onChange={v => { setCompanyFilter(v); resetPage() }}
          placeholder="Podjetje"
          allLabel="Vsa podjetja"
        />

        <select
          value={roleFilter}
          onChange={e => { setRoleFilter(e.target.value); resetPage() }}
          className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="all">Vse vloge</option>
          <option value="super_admin">Super admin</option>
          <option value="admin">Admin</option>
          <option value="user">Uporabnik</option>
        </select>

        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); resetPage() }}
          className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="all">Vsi statusi</option>
          <option value="active">Aktivni</option>
          <option value="inactive">Deaktivirani</option>
        </select>
      </div>

      <div className="-mx-4 lg:-mx-6 border-t border-b border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-5 py-3 font-medium text-gray-500">Uporabnik</th>
              <th className="text-left px-5 py-3 font-medium text-gray-500">E-pošta</th>
              <th className="text-left px-5 py-3 font-medium text-gray-500">Podjetje</th>
              <th className="text-center px-5 py-3 font-medium text-gray-500">Vloga</th>
              <th className="text-left px-5 py-3 font-medium text-gray-500">Registriran</th>
              <th className="text-center px-5 py-3 font-medium text-gray-500">Status</th>
              <th className="px-5 py-3 w-12" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="px-5 py-12 text-center text-gray-400">Nalagam...</td></tr>
            ) : paged.length === 0 ? (
              <tr><td colSpan={7} className="px-5 py-12 text-center text-gray-400">Ni rezultatov</td></tr>
            ) : paged.map(u => (
              <tr key={u.id} className="border-t border-gray-200 hover:bg-[#fbfbfb]">
                <td className="px-5 py-3.5 font-medium text-gray-900">{u.first_name} {u.last_name}</td>
                <td className="px-5 py-3.5 text-gray-500">{u.email}</td>
                <td className="px-5 py-3.5 text-gray-600">{u.company_name}</td>
                <td className="px-5 py-3.5 text-center">
                  {u.is_super_admin ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-sm font-medium bg-blue-100 text-blue-700">Super admin</span>
                  ) : u.is_admin ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-sm font-medium bg-purple-100 text-purple-700">Admin</span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-sm font-medium bg-gray-100 text-gray-500">Uporabnik</span>
                  )}
                </td>
                <td className="px-5 py-3.5 text-gray-500">{fmt(u.created_at)}</td>
                <td className="px-5 py-3.5 text-center">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-sm font-medium ${
                    u.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {u.is_active ? 'Aktiven' : 'Deaktiviran'}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right">
                  {!u.is_super_admin && (
                    <button
                      onClick={() => toggle(u)}
                      disabled={toggling === u.id}
                      title={u.is_active ? 'Deaktiviraj' : 'Aktiviraj'}
                      className="text-gray-400 hover:text-gray-700 disabled:opacity-40 transition-colors"
                    >
                      {u.is_active ? <PowerOff size={15} /> : <Power size={15} />}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination total={filtered.length} page={page} pageSize={PAGE_SIZE} onChange={setPage} />
      </div>
    </div>
  )
}

function ComboFilter({ options, value, onChange, placeholder, allLabel }: {
  options: [string, string][]
  value: string
  onChange: (v: string) => void
  placeholder: string
  allLabel: string
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) { setOpen(false); setQuery('') }
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const selectedLabel = value === 'all' ? '' : (options.find(([id]) => id === value)?.[1] ?? '')
  const filtered = options.filter(([, name]) => name.toLowerCase().includes(query.toLowerCase()))

  function pick(v: string) { onChange(v); setOpen(false); setQuery('') }

  return (
    <div className="relative" ref={ref}>
      <Search className="w-4 h-4 text-gray-900 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      <input
        value={open ? query : selectedLabel}
        onChange={e => { setQuery(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        placeholder={value === 'all' ? `${placeholder}…` : selectedLabel}
        className="pl-9 pr-8 py-1.5 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-52"
      />
      {value !== 'all' && !open && (
        <button onClick={() => pick('all')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
          <X className="w-3.5 h-3.5" />
        </button>
      )}
      {open && (
        <div className="absolute z-20 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          <div className="max-h-60 overflow-y-auto py-1">
            <button onClick={() => pick('all')} className="flex items-center w-full px-3 py-2 text-sm text-left hover:bg-[#f6f6f6]">
              <span className="flex-1 text-gray-500">{allLabel}</span>
              {value === 'all' && <Check className="w-4 h-4 text-blue-600" />}
            </button>
            {filtered.map(([id, name]) => (
              <button key={id} onClick={() => pick(id)} className="flex items-center w-full px-3 py-2 text-sm text-left hover:bg-[#f6f6f6]">
                <span className="flex-1 text-gray-900 truncate">{name}</span>
                {value === id && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
              </button>
            ))}
            {filtered.length === 0 && <p className="px-3 py-2 text-sm text-gray-400">Ni rezultatov</p>}
          </div>
        </div>
      )}
    </div>
  )
}
