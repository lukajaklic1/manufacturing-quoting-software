import { useEffect, useState } from 'react'
import { Power, PowerOff, Search } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { toast } from '../components/ui/Toast'
import Pagination from '../components/ui/Pagination'

interface Company {
  id: string
  name: string
  is_active: boolean
  created_at: string
  user_count?: number
}

const PAGE_SIZE = 20

function pluralUsers(n: number) {
  if (n === 1) return '1 uporabnik'
  if (n === 2) return '2 uporabnika'
  if (n === 3 || n === 4) return `${n} uporabniki`
  return `${n} uporabnikov`
}

function pluralCompanies(n: number) {
  if (n === 1) return '1 podjetje'
  if (n === 2) return '2 podjetji'
  if (n === 3 || n === 4) return `${n} podjetja`
  return `${n} podjetij`
}

export default function SuperAdminCompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const [{ data: comps }, { data: users }] = await Promise.all([
      supabase.from('companies').select('*').order('created_at', { ascending: false }),
      supabase.from('users').select('company_id'),
    ])
    if (comps) {
      const counts: Record<string, number> = {}
      for (const u of users ?? []) counts[u.company_id] = (counts[u.company_id] || 0) + 1
      setCompanies(comps.map(c => ({ ...c, user_count: counts[c.id] || 0 })))
    }
    setLoading(false)
  }

  async function toggle(c: Company) {
    setToggling(c.id)
    const { error } = await supabase.from('companies').update({ is_active: !c.is_active }).eq('id', c.id)
    if (error) toast('Napaka pri posodobitvi', 'error')
    else {
      toast(c.is_active ? 'Podjetje deaktivirano' : 'Podjetje aktivirano', 'success')
      setCompanies(prev => prev.map(x => x.id === c.id ? { ...x, is_active: !x.is_active } : x))
    }
    setToggling(null)
  }

  const q = search.toLowerCase()
  const filtered = companies.filter(c => {
    const nameMatch = !search || c.name.toLowerCase().includes(q)
    const statusMatch = statusFilter === 'all' ||
      (statusFilter === 'active' && c.is_active) ||
      (statusFilter === 'inactive' && !c.is_active)
    return nameMatch && statusMatch
  })

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const fmt = (s: string) => new Date(s).toLocaleDateString('sl-SI')

  return (
    <div className="px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Podjetja</h1>
        <p className="text-sm text-gray-500 mt-0.5">{pluralCompanies(companies.length)} na platformi</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Išči podjetje..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
          />
        </div>

        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="all">Vsi statusi</option>
          <option value="active">Aktivna</option>
          <option value="inactive">Deaktivirana</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-5 py-3 font-medium text-gray-500">Podjetje</th>
              <th className="text-left px-5 py-3 font-medium text-gray-500">Registrirano</th>
              <th className="text-center px-5 py-3 font-medium text-gray-500">Uporabniki</th>
              <th className="text-center px-5 py-3 font-medium text-gray-500">Status</th>
              <th className="px-5 py-3 w-12" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-5 py-12 text-center text-gray-400">Nalagam...</td></tr>
            ) : paged.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-12 text-center text-gray-400">Ni rezultatov</td></tr>
            ) : paged.map(c => (
              <tr key={c.id} className="border-t border-gray-200 hover:bg-gray-50">
                <td className="px-5 py-3.5 font-medium text-gray-900">{c.name}</td>
                <td className="px-5 py-3.5 text-gray-500">{fmt(c.created_at)}</td>
                <td className="px-5 py-3.5 text-center text-gray-600">{pluralUsers(c.user_count ?? 0)}</td>
                <td className="px-5 py-3.5 text-center">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    c.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {c.is_active ? 'Aktivno' : 'Deaktivirano'}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <button
                    onClick={() => toggle(c)}
                    disabled={toggling === c.id}
                    title={c.is_active ? 'Deaktiviraj' : 'Aktiviraj'}
                    className="text-gray-400 hover:text-gray-700 disabled:opacity-40 transition-colors"
                  >
                    {c.is_active ? <PowerOff size={15} /> : <Power size={15} />}
                  </button>
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
