import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, Trophy, FileText, CheckCircle2 } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { supabase } from '../lib/supabase'
import { useCompany } from '../hooks/useCompany'
import { useLanguage } from '../hooks/useLanguage'
import type { QuoteStatus, LostReason } from '../types/database'
import { format } from 'date-fns'

interface Stats {
  pipeline_value: number
  win_rate: number
  won_90d: number
  lost_90d: number
  active_quotes: number
  realized_this_month: number
  lost_reasons: { reason: LostReason; count: number }[]
  recent_quotes: { id: string; quote_number: string; title: string; status: QuoteStatus; created_at: string; customer_name: string | null }[]
}

interface TrendData {
  period: string
  quote_count: number
  quote_value: number
  won_count: number
  won_value: number
}

interface CustomerStat {
  customer_id: string
  customer_name: string
  total_value: number
  quote_count: number
  won_count: number
  win_rate: number
}

const STATUS_STYLE: Record<QuoteStatus, string> = {
  draft: 'bg-gray-100 text-gray-600', issued: 'bg-indigo-100 text-indigo-700', sent: 'bg-blue-100 text-blue-700',
  accepted: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-100', expired: 'bg-amber-100 text-amber-700',
  won: 'bg-green-100 text-green-700', lost: 'bg-red-100 text-red-700', frozen: 'bg-purple-100 text-purple-700',
}

export default function DashboardPage() {
  const { company } = useCompany()
  const { t } = useLanguage()
  const s = t.qp
  const navigate = useNavigate()
  const cur = company?.currency ?? 'EUR'
  const money = (n: number) => (n ?? 0).toLocaleString('de-DE', { style: 'currency', currency: cur, maximumFractionDigits: 0 })

  const [stats, setStats] = useState<Stats | null>(null)
  const [trends, setTrends] = useState<TrendData[]>([])
  const [customers, setCustomers] = useState<CustomerStat[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<3 | 6 | 12>(12)

  useEffect(() => { if (company) load() }, [company, period])

  async function load() {
    if (!company) return
    setLoading(true)
    const [{ data: stats }, { data: trends }, { data: customers }] = await Promise.all([
      (supabase as any).rpc('get_quote_dashboard_stats', { p_company_id: company.id }),
      (supabase as any).rpc('get_quote_trends', { p_company_id: company.id, p_months: period }),
      (supabase as any).rpc('get_customer_stats', { p_company_id: company.id }),
    ])
    setStats(stats as Stats)
    setTrends((trends as TrendData[]) || [])
    setCustomers((customers as CustomerStat[]) || [])
    setLoading(false)
  }

  if (loading || !stats) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>

  const maxLost = Math.max(1, ...stats.lost_reasons.map(r => r.count))

  const cards = [
    { label: s.pipelineValue, value: money(stats.pipeline_value), icon: TrendingUp, color: 'text-blue-600 bg-blue-50' },
    { label: s.winRate, value: `${stats.win_rate}%`, icon: Trophy, color: 'text-green-600 bg-green-50' },
    { label: s.activeQuotes, value: String(stats.active_quotes), icon: FileText, color: 'text-purple-600 bg-purple-50' },
    { label: s.realizedThisMonth, value: money(stats.realized_this_month), icon: CheckCircle2, color: 'text-amber-600 bg-amber-50' },
  ]

  return (
    <div className="p-4 lg:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t.nav.dashboard}</h1>
        <div className="flex gap-2">
          {[3, 6, 12].map(p => (
            <button key={p} onClick={() => setPeriod(p as 3 | 6 | 12)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${period === p ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
              {p} {p === 3 ? 'mesece' : 'mesecev'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards.map(c => (
          <div key={c.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${c.color}`}><c.icon className="w-5 h-5" /></div>
            <p className="text-xs text-gray-400">{c.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Quote Count */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Število ponudb</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="quote_count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Quote Value */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Vrednost ponudb</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip formatter={(v) => money(v as number)} />
              <Bar dataKey="quote_value" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Won Count */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Pridobljene ponudbe</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="won_count" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Won Value */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Vrednost pridobljenih</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip formatter={(v) => money(v as number)} />
              <Area type="monotone" dataKey="won_value" fill="#d1fae5" stroke="#10b981" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Quotes */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100"><h2 className="text-sm font-semibold text-gray-900">Zadnje ponudbe</h2></div>
          {stats.recent_quotes.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-400">{s.noQuotes}</div>
          ) : (
            <table className="w-full text-sm">
              <tbody className="divide-y divide-gray-50">
                {stats.recent_quotes.map(q => (
                  <tr key={q.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/quotes/${q.id}`)}>
                    <td className="px-6 py-3 font-mono text-gray-500">{q.quote_number}</td>
                    <td className="px-6 py-3 text-gray-900">{q.customer_name ?? '—'}</td>
                    <td className="px-6 py-3 text-gray-600">{q.title}</td>
                    <td className="px-6 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLE[q.status]}`}>{s.status[q.status]}</span></td>
                    <td className="px-6 py-3 text-gray-400 text-right">{format(new Date(q.created_at), 'd. M.')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Lost Reasons */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100"><h2 className="text-sm font-semibold text-gray-900">{s.lostReasonsTitle}</h2></div>
          <div className="p-6 flex flex-col gap-3">
            {stats.lost_reasons.length === 0 ? (
              <p className="text-sm text-gray-400">—</p>
            ) : stats.lost_reasons.map(r => (
              <div key={r.reason}>
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>{s.lostReasons[r.reason]}</span><span>{r.count}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-red-400 rounded-full" style={{ width: `${(r.count / maxLost) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Customers */}
      {customers.length > 0 && (
        <div className="mt-6 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100"><h2 className="text-sm font-semibold text-gray-900">10 najboljših strank</h2></div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">Stranka</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500">Vrednost</th>
                <th className="text-center px-6 py-3 text-xs font-medium text-gray-500">Število</th>
                <th className="text-center px-6 py-3 text-xs font-medium text-gray-500">Pridobljeno</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500">% uspešnosti</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {customers.map(c => (
                <tr key={c.customer_id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-gray-900 font-medium">{c.customer_name}</td>
                  <td className="px-6 py-3 text-right text-gray-600">{money(c.total_value)}</td>
                  <td className="px-6 py-3 text-center text-gray-600">{c.quote_count}</td>
                  <td className="px-6 py-3 text-center text-green-600 font-medium">{c.won_count}</td>
                  <td className="px-6 py-3 text-right text-gray-600">{c.win_rate.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
