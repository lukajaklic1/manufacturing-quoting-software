import { useEffect, useState } from 'react'
import { Building2, Users, TrendingUp, RefreshCw } from 'lucide-react'
import { supabase } from '../lib/supabase'
import Button from '../components/ui/Button'

interface Stats {
  total_companies: number
  total_users: number
  new_this_month: number
  growth: { month: string; count: number }[]
}

export default function SuperAdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase.rpc('get_platform_stats')
    if (data) setStats(data as Stats)
    setLoading(false)
  }

  return (
    <div className="px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nadzorna plošča</h1>
          <p className="text-sm text-gray-500 mt-0.5">Pregled platforme Toolingdesk</p>
        </div>
        <Button variant="secondary" onClick={load} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Osveži
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Nalagam...</div>
      ) : stats ? (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <StatCard icon={<Building2 size={20} />} label="Skupaj podjetij" value={stats.total_companies} color="blue" />
            <StatCard icon={<Users size={20} />} label="Aktivni uporabniki" value={stats.total_users} color="green" />
            <StatCard icon={<TrendingUp size={20} />} label="Nova podjetja ta mesec" value={stats.new_this_month} color="purple" />
          </div>

          {stats.growth.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-5">Rast podjetij — zadnjih 12 mesecev</h3>
              <div className="flex items-end gap-3 h-40">
                {stats.growth.map(g => {
                  const max = Math.max(...stats.growth.map(x => x.count), 1)
                  const pct = Math.max((g.count / max) * 100, 4)
                  return (
                    <div key={g.month} className="flex-1 flex flex-col items-center gap-1.5">
                      <span className="text-xs font-medium text-gray-600">{g.count}</span>
                      <div className="w-full rounded-md bg-blue-500" style={{ height: `${pct}%` }} />
                      <span className="text-xs text-gray-400">{g.month.slice(5)}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-400">Ni podatkov</div>
      )}
    </div>
  )
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: 'blue' | 'green' | 'purple' }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
  }
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
      <div className={`p-3 rounded-xl ${colors[color]}`}>{icon}</div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500 mt-0.5">{label}</p>
      </div>
    </div>
  )
}
