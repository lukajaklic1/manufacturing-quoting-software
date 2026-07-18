import { useEffect, useState } from 'react'
import { Building2, Users, TrendingUp } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface MonthCount { month: string; count: number }

interface Stats {
  total_companies: number
  total_users: number
  new_this_month: number
  growth: MonthCount[]
  user_growth: MonthCount[]
}

const SL_MONTHS = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'avg', 'sep', 'okt', 'nov', 'dec']

function formatMonth(ym: string) {
  const [year, month] = ym.split('-')
  return `${SL_MONTHS[parseInt(month) - 1]} ${year}`
}

function pluralCompanies(n: number) {
  if (n === 1) return '1 podjetje'
  if (n === 2) return '2 podjetji'
  if (n === 3 || n === 4) return `${n} podjetja`
  return `${n} podjetij`
}

function pluralUsers(n: number) {
  if (n === 1) return '1 uporabnik'
  if (n === 2) return '2 uporabnika'
  if (n === 3 || n === 4) return `${n} uporabniki`
  return `${n} uporabnikov`
}

export default function SuperAdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.rpc('get_platform_stats').then(({ data }) => {
      if (data) setStats(data as Stats)
      setLoading(false)
    })
  }, [])

  return (
    <div className="px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Nadzorna plošča</h1>
        <p className="text-sm text-gray-500 mt-0.5">Pregled platforme Toolingdesk</p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Nalagam...</div>
      ) : stats ? (
        <div className="space-y-6">
          {(() => {
            const currentMonth = new Date().toISOString().slice(0, 7)
            const newUsersThisMonth = stats.user_growth.find(d => d.month === currentMonth)?.count ?? 0
            return (
              <div className="grid grid-cols-4 gap-4">
                <StatCard icon={<Building2 size={20} />} label="Skupaj podjetij" value={pluralCompanies(stats.total_companies)} color="blue" />
                <StatCard icon={<Users size={20} />} label="Aktivni uporabniki" value={pluralUsers(stats.total_users)} color="green" />
                <StatCard icon={<TrendingUp size={20} />} label="Nova podjetja ta mesec" value={pluralCompanies(stats.new_this_month)} color="purple" />
                <StatCard icon={<Users size={20} />} label="Novi uporabniki ta mesec" value={pluralUsers(newUsersThisMonth)} color="orange" />
              </div>
            )
          })()}

          <div className="grid grid-cols-2 gap-4">
            <AreaChart
              data={toCumulative(stats.growth)}
              label="Rast podjetij"
              color="#2563eb"
              fillColor="#dbeafe"
            />
            <AreaChart
              data={toCumulative(stats.user_growth)}
              label="Rast uporabnikov"
              color="#16a34a"
              fillColor="#dcfce7"
            />
          </div>
        </div>
      ) : (
        <div className="text-center py-20 text-gray-400">Ni podatkov</div>
      )}
    </div>
  )
}

function toCumulative(data: MonthCount[]): MonthCount[] {
  let running = 0
  return data.map(d => { running += d.count; return { month: d.month, count: running } })
}

function AreaChart({ data, label, color, fillColor }: {
  data: MonthCount[]
  label: string
  color: string
  fillColor: string
}) {
  if (data.length === 0) return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-center justify-center h-52 text-sm text-gray-400">
      Ni podatkov
    </div>
  )

  const W = 500, H = 160, PX = 8, PY = 16
  const maxVal = Math.max(...data.map(d => d.count), 1)
  const pts = data.map((d, i) => ({
    x: PX + (i / Math.max(data.length - 1, 1)) * (W - PX * 2),
    y: PY + (1 - d.count / maxVal) * (H - PY * 2),
    ...d,
  }))

  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const areaPath = `${linePath} L${pts[pts.length - 1].x.toFixed(1)},${H} L${pts[0].x.toFixed(1)},${H} Z`

  // show at most 6 labels
  const step = Math.ceil(data.length / 6)
  const labelIndices = new Set(data.map((_, i) => i).filter(i => i === 0 || i === data.length - 1 || i % step === 0))

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-gray-700">{label}</span>
        <span className="text-lg font-bold" style={{ color }}>{data[data.length - 1]?.count ?? 0}</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="none" style={{ height: 140 }}>
        <path d={areaPath} fill={fillColor} />
        <path d={linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3.5" fill={color} />
        ))}
      </svg>
      <div className="flex justify-between mt-2">
        {pts.map((p, i) =>
          labelIndices.has(i) ? (
            <span key={i} className="text-xs text-gray-400">{formatMonth(p.month)}</span>
          ) : <span key={i} />
        )}
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: 'blue' | 'green' | 'purple' | 'orange' }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
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
