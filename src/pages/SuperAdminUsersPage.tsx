import { useEffect, useState } from 'react'
import { Power, PowerOff } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { toast } from '../components/ui/Toast'

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
      setUsers(usrs.map(u => ({ ...u, company_name: nameMap[u.company_id] || '—' })))
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

  const fmt = (s: string) => new Date(s).toLocaleDateString('sl-SI')
  const q = search.toLowerCase()
  const filtered = search
    ? users.filter(u =>
        `${u.first_name} ${u.last_name}`.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.company_name.toLowerCase().includes(q)
      )
    : users

  return (
    <div className="px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Uporabniki</h1>
        <p className="text-sm text-gray-500 mt-0.5">{pluralUsers(users.length)} na platformi</p>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Išči po imenu, e-pošti ali podjetju..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full max-w-sm px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
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
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className="px-5 py-12 text-center text-gray-400">Ni rezultatov</td></tr>
            ) : filtered.map(u => (
              <tr key={u.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-5 py-3.5 font-medium text-gray-900">{u.first_name} {u.last_name}</td>
                <td className="px-5 py-3.5 text-gray-500">{u.email}</td>
                <td className="px-5 py-3.5 text-gray-600">{u.company_name}</td>
                <td className="px-5 py-3.5 text-center">
                  {u.is_super_admin ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">Super admin</span>
                  ) : u.is_admin ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">Admin</span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">Uporabnik</span>
                  )}
                </td>
                <td className="px-5 py-3.5 text-gray-500">{fmt(u.created_at)}</td>
                <td className="px-5 py-3.5 text-center">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
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
      </div>
    </div>
  )
}
