import { useEffect, useState } from 'react'
import { Power, PowerOff, RefreshCw } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { toast } from '../components/ui/Toast'
import Button from '../components/ui/Button'

interface Company {
  id: string
  name: string
  is_active: boolean
  created_at: string
  user_count?: number
}

export default function SuperAdminCompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<string | null>(null)

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

  const fmt = (s: string) => new Date(s).toLocaleDateString('sl-SI')

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Podjetja</h1>
          <p className="text-sm text-gray-500 mt-0.5">{companies.length} podjetij na platformi</p>
        </div>
        <Button variant="secondary" onClick={load} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Osveži
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
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
            ) : companies.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-12 text-center text-gray-400">Ni podjetij</td></tr>
            ) : companies.map(c => (
              <tr key={c.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-5 py-3.5 font-medium text-gray-900">{c.name}</td>
                <td className="px-5 py-3.5 text-gray-500">{fmt(c.created_at)}</td>
                <td className="px-5 py-3.5 text-center text-gray-600">{c.user_count}</td>
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
      </div>
    </div>
  )
}
