import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useEffect, useState, useRef, RefObject } from 'react'
import { ArrowRight, Check, ChevronDown, Zap, Calculator, TrendingUp, FileText, BarChart2, Settings, Factory, Box, Star, ChevronRight } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useLanguage } from '../hooks/useLanguage'
import AppLogo from '../components/ui/AppLogo'

function useInView(ref: RefObject<Element | null>, threshold = 0.1) {
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect() } },
      { threshold }
    )
    obs.observe(el); return () => obs.disconnect()
  }, [])
  return inView
}

function FadeUp({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref)
  return (
    <div ref={ref}
      className={`transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  )
}

/* ── Animated hero product mockup — Attio style ── */
function HeroMockup({ isSl }: { isSl: boolean }) {
  const [step, setStep] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setStep(s => (s + 1) % 6), 1700)
    return () => clearInterval(t)
  }, [])

  const rows = isSl
    ? [
        { name: 'Jeklo S235JR – 4.2 kg', cost: '28,70', tag: 'Material' },
        { name: 'CNC rezkanje – 1.4 h',  cost: '84,00', tag: 'Stroj' },
        { name: 'Varjenje – 0.8 h',       cost: '32,00', tag: 'Delo' },
        { name: 'Režija 22%',             cost: '31,81', tag: 'Režija' },
      ]
    : [
        { name: 'S235JR Steel – 4.2 kg', cost: '28.70', tag: 'Material' },
        { name: 'CNC Milling – 1.4 h',   cost: '84.00', tag: 'Machine' },
        { name: 'Welding – 0.8 h',        cost: '32.00', tag: 'Labour' },
        { name: 'Overhead 22%',           cost: '31.81', tag: 'Overhead' },
      ]

  const tagColors: Record<string, string> = {
    Material: 'bg-blue-50 text-blue-600',
    Stroj: 'bg-purple-50 text-purple-600',
    Machine: 'bg-purple-50 text-purple-600',
    Delo: 'bg-orange-50 text-orange-600',
    Labour: 'bg-orange-50 text-orange-600',
    'Režija': 'bg-gray-100 text-gray-500',
    'Režija 22%': 'bg-gray-100 text-gray-500',
    Overhead: 'bg-gray-100 text-gray-500',
  }

  const navItems = isSl
    ? ['Nadzorna plošča', 'Ponudbe', 'Stranke', 'Materiali', 'Stroji', 'Operaterji']
    : ['Dashboard', 'Quotes', 'Customers', 'Materials', 'Machines', 'Operators']

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-gray-200/80 shadow-[0_24px_80px_rgba(0,0,0,.10)]">
      {/* Browser chrome */}
      <div className="bg-[#f6f6f6] border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex-1 mx-2 bg-white rounded-md h-6 flex items-center px-3 border border-gray-200/60">
          <span className="text-xs text-gray-400">app.toolingdesk.com/quotes/new</span>
        </div>
      </div>

      {/* App UI */}
      <div className="bg-white flex" style={{ minHeight: 380 }}>
        {/* Sidebar */}
        <div className="w-48 border-r border-gray-100 p-3 flex flex-col gap-0.5 bg-[#fafafa] shrink-0">
          <div className="flex items-center gap-2 px-2 py-2 mb-3">
            <div className="w-6 h-6 bg-[#266df0] rounded-md flex items-center justify-center shrink-0">
              <Factory className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-xs font-semibold text-gray-800">Toolingdesk</span>
          </div>
          {navItems.map((item, i) => (
            <div key={item}
              className={`text-xs px-2.5 py-1.5 rounded-md transition-colors ${i === 1 ? 'bg-gray-900 text-white font-medium' : 'text-gray-500 hover:bg-gray-100'}`}>
              {item}
            </div>
          ))}
        </div>

        {/* Main */}
        <div className="flex-1 p-6">
          {/* Header row */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-gray-400">{isSl ? 'Ponudbe' : 'Quotes'}</span>
                <ChevronRight className="w-3 h-3 text-gray-300" />
                <span className="text-xs text-gray-600 font-medium">{isSl ? 'Nova ponudba' : 'New quote'}</span>
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                {isSl ? 'Ogrodje varjeno – 3 kosi' : 'Welded frame – 3 pcs'}
              </h2>
            </div>
            <div className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all duration-500 border ${step >= 5 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
              {step >= 5 ? (isSl ? '✓ Izračunano' : '✓ Calculated') : (isSl ? 'V delu…' : 'In progress…')}
            </div>
          </div>

          {/* Cost table */}
          <div className="border border-gray-100 rounded-xl overflow-hidden mb-4">
            <div className="grid grid-cols-3 bg-gray-50 px-4 py-2 border-b border-gray-100">
              <span className="text-xs font-medium text-gray-400">{isSl ? 'Opis' : 'Description'}</span>
              <span className="text-xs font-medium text-gray-400">{isSl ? 'Vrsta' : 'Type'}</span>
              <span className="text-xs font-medium text-gray-400 text-right">{isSl ? 'Strošek' : 'Cost'}</span>
            </div>
            {rows.map((row, i) => (
              <div
                key={row.name}
                className={`grid grid-cols-3 px-4 py-2.5 border-b border-gray-50 last:border-0 items-center transition-all duration-500 ${step > i ? 'opacity-100' : 'opacity-0'}`}
                style={{ transitionDelay: `${i * 60}ms` }}
              >
                <span className="text-sm text-gray-700">{row.name}</span>
                <span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tagColors[row.tag] || 'bg-gray-100 text-gray-500'}`}>{row.tag}</span>
                </span>
                <span className="text-sm font-semibold text-gray-900 text-right font-mono">{row.cost} €</span>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className={`flex items-center justify-between bg-gray-900 rounded-xl px-5 py-3.5 transition-all duration-700 ${step >= 5 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            <div>
              <p className="text-xs text-white/50 mb-0.5">{isSl ? 'Prodajna cena (marža 15%)' : 'Selling price (margin 15%)'}</p>
              <p className="text-xl font-bold text-white">203,58 €</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-white/50 mb-0.5">{isSl ? 'Stroški skupaj' : 'Total cost'}</p>
              <p className="text-sm font-medium text-white/80">176,51 €</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function DashboardMockup({ isSl }: { isSl: boolean }) {
  const bars = [55, 72, 60, 88, 65, 95, 80]
  const months = isSl ? ['Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Avg'] : ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug']
  const stats = isSl
    ? [['Vrednost ponudb', '184.200 €', '+12%', true], ['Dobljene', '120.000 €', '+8%', true], ['Poslane', '25', '↑3', true], ['Uspešnost', '65%', '+5%', true]]
    : [['Quote value', '€184,200', '+12%', true], ['Won', '€120,000', '+8%', true], ['Sent', '25', '↑3', true], ['Win rate', '65%', '+5%', true]]

  return (
    <div className="rounded-2xl overflow-hidden border border-gray-200/80 shadow-[0_24px_80px_rgba(0,0,0,.10)]">
      <div className="bg-[#f6f6f6] border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57]" /><div className="w-3 h-3 rounded-full bg-[#febc2e]" /><div className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex-1 mx-2 bg-white rounded-md h-6 flex items-center px-3 border border-gray-200/60">
          <span className="text-xs text-gray-400">app.toolingdesk.com/dashboard</span>
        </div>
      </div>
      <div className="bg-white p-5">
        <div className="grid grid-cols-4 gap-3 mb-5">
          {stats.map(([label, val, chg]) => (
            <div key={label as string} className="rounded-xl border border-gray-100 p-3">
              <p className="text-xs text-gray-400 mb-1">{label as string}</p>
              <p className="text-base font-bold text-gray-900">{val as string}</p>
              <p className="text-xs text-green-600 font-medium mt-0.5">{chg as string}</p>
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-gray-700">{isSl ? 'Vrednost ponudb po mesecih' : 'Quote value by month'}</p>
            <span className="text-xs text-gray-400">{isSl ? 'Zadnjih 7 mesecev' : 'Last 7 months'}</span>
          </div>
          <div className="flex items-end gap-2" style={{ height: 80 }}>
            {bars.map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full rounded-sm bg-gray-900 transition-all" style={{ height: `${h}%` }} />
                <span className="text-xs text-gray-400">{months[i]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function FeatureCard({ Icon, title, desc, delay }: { Icon: React.ElementType; title: string; desc: string; delay: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref)
  return (
    <div ref={ref}
      className={`p-7 border-b border-r border-gray-100 last:border-r-0 transition-all duration-600 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
      style={{ transitionDelay: `${delay}ms` }}>
      <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center mb-4">
        <Icon className="w-4 h-4 text-white" />
      </div>
      <h3 className="text-base font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 leading-relaxed text-sm">{desc}</p>
    </div>
  )
}

function ForWhomCard({ Icon, label, desc, delay }: { Icon: React.ElementType; label: string; desc: string; delay: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref)
  return (
    <div ref={ref}
      className={`group p-7 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-500 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
      style={{ transitionDelay: `${delay}ms` }}>
      <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-gray-900 flex items-center justify-center mb-4 transition-colors duration-300">
        <Icon className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors duration-300" />
      </div>
      <h3 className="text-base font-semibold text-gray-900 mb-2">{label}</h3>
      <p className="text-gray-500 leading-relaxed text-sm">{desc}</p>
    </div>
  )
}

function StepCard({ num, title, desc, delay }: { num: string; title: string; desc: string; delay: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref)
  return (
    <div ref={ref}
      className={`transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
      style={{ transitionDelay: `${delay}ms` }}>
      <div className="text-5xl font-bold text-gray-100 mb-4 tabular-nums">{num}</div>
      <h3 className="text-base font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 leading-relaxed text-sm">{desc}</p>
    </div>
  )
}

function TestiCard({ quote, name, role }: { quote: string; name: string; role: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref)
  return (
    <div ref={ref}
      className={`flex flex-col gap-5 p-8 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-500 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      <div className="flex gap-0.5">
        {[0,1,2,3,4].map(i => <Star key={i} className="w-4 h-4 fill-gray-900 text-gray-900" />)}
      </div>
      <p className="text-gray-600 leading-relaxed text-sm flex-1">"{quote}"</p>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gray-900 flex items-center justify-center text-white font-semibold text-sm shrink-0">
          {name[0]}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">{name}</p>
          <p className="text-xs text-gray-400">{role}</p>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   MAIN
═══════════════════════════════════════════ */
export default function LandingPage() {
  const { session, loading } = useAuth()
  const { lang, setLang, t } = useLanguage()
  const navigate = useNavigate()
  const l = t.landing
  const isSl = lang === 'sl'
  const [openFaq, setOpenFaq] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && session) {
      supabase.rpc('is_super_admin').then(({ data }) => {
        navigate(data ? '/super-admin' : '/dashboard', { replace: true })
      })
    }
  }, [session, loading])

  if (loading) return null

  const FAQ_KEYS = ['faq1', 'faq2', 'faq3', 'faq4', 'faq5'] as const

  const forWhom = isSl ? [
    { Icon: Settings,   label: 'Orodjarne',                       desc: 'Natančen izračun strojnih ur, materiala in dela za orodja, forme in priprave.' },
    { Icon: Calculator, label: 'CNC obdelava',                    desc: 'Vsaka operacija — rezkanje, struženje, EDM — ima svojo urno postavko in čas.' },
    { Icon: Zap,        label: 'Varjenje in jeklene konstrukcije', desc: 'Kalkulacija materiala, časa varjenja in površinske obdelave za varjene sestave.' },
    { Icon: FileText,   label: 'Lasersko rezanje',                desc: 'Stroški rezanja, upogibanja in obdelave pločevine po materialu in debelini.' },
    { Icon: BarChart2,  label: 'Maloserijska proizvodnja',        desc: 'Vsak kos zahteva svojo kalkulacijo. Toolingdesk zagotavlja enoten proces za ekipo.' },
    { Icon: TrendingUp, label: 'Kooperacija',                     desc: 'Stroški zunanjih storitev so vključeni skupaj z lastnimi stroški v eno ponudbo.' },
  ] : [
    { Icon: Settings,   label: 'Tool & Die Shops',           desc: 'Precise calculation of machine hours, materials and labour for tools, moulds and fixtures.' },
    { Icon: Calculator, label: 'CNC Machining',              desc: 'Every operation — milling, turning, EDM — has its own hourly rate and cycle time.' },
    { Icon: Zap,        label: 'Welding & Steel Structures', desc: 'Material, welding time and surface treatment costs calculated together for every assembly.' },
    { Icon: FileText,   label: 'Laser Cutting & Sheet Metal',desc: 'Cutting and forming costs based on material type, thickness and machine time.' },
    { Icon: BarChart2,  label: 'Custom Manufacturing',       desc: 'Every part needs its own calculation. Toolingdesk gives your team a consistent process.' },
    { Icon: TrendingUp, label: 'Subcontracting',             desc: 'External service and subcontractor costs included alongside your own in a single quote.' },
  ]

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans antialiased">

      {/* ══ NAV ══ */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <a href="#" onClick={e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
            <AppLogo size="sm" mono />
          </a>
          <div className="hidden md:flex items-center gap-7">
            <a href="#features" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">{l.navFeatures}</a>
            <a href="#how-it-works" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">{l.navHowItWorks}</a>
            <a href="#faq" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5 mr-1">
              {(['en', 'sl'] as const).map(lng => (
                <button key={lng} onClick={() => setLang(lng)}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${lang === lng ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-700'}`}>
                  {lng.toUpperCase()}
                </button>
              ))}
            </div>
            <Link to="/login"
              className="hidden sm:block text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-50 border border-gray-200">
              {l.navSignIn}
            </Link>
            <Link to="/register"
              className="bg-gray-900 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors whitespace-nowrap">
              {l.navCta}
            </Link>
          </div>
        </div>
      </nav>

      {/* ══ HERO ══ */}
      <section className="pt-20 pb-0 text-center px-6 overflow-hidden">
        {/* Announcement pill */}
        <div className="animate-fade-up flex justify-center mb-10" style={{ animationDelay: '0.05s' }}>
          <a href="#features"
            className="inline-flex items-center gap-1.5 text-sm text-gray-600 border border-gray-200 rounded-full px-4 py-1.5 hover:bg-gray-50 transition-colors">
            {isSl ? 'Kalkulacije za orodjarne in kovinarstvo' : 'Quoting software for metal manufacturers'}
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          </a>
        </div>

        {/* Giant headline */}
        <div className="animate-fade-up max-w-5xl mx-auto mb-6" style={{ animationDelay: '0.12s' }}>
          <h1 className="font-bold text-gray-900 tracking-tight" style={{ fontSize: 'clamp(3rem, 7vw, 5.5rem)', lineHeight: 1.06 }}>
            {l.heroTitle1}<br />{l.heroTitle2}
          </h1>
        </div>

        {/* Subtitle */}
        <p className="animate-fade-up text-lg text-gray-500 max-w-xl mx-auto mb-10 leading-relaxed" style={{ animationDelay: '0.2s' }}>
          {l.heroSubtitle}
        </p>

        {/* CTAs */}
        <div className="animate-fade-up flex flex-col sm:flex-row items-center justify-center gap-3 mb-16" style={{ animationDelay: '0.28s' }}>
          <Link to="/register"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gray-900 text-white font-semibold px-6 py-3 rounded-xl hover:bg-gray-700 transition-colors text-sm">
            {l.heroCtaPrimary} <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/login"
            className="w-full sm:w-auto text-sm text-gray-600 font-semibold px-6 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
            {l.heroCtaSecondary}
          </Link>
        </div>

        {/* Product mockup — Attio style, centered, wide */}
        <div className="animate-fade-up max-w-6xl mx-auto" style={{ animationDelay: '0.38s' }}>
          <HeroMockup isSl={isSl} />
        </div>
      </section>

      {/* ══ STATS ══ */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-3 divide-x divide-gray-100">
          {[
            { val: l.stat1Val, label: l.stat1Label },
            { val: l.stat2Val, label: l.stat2Label },
            { val: l.stat3Val, label: l.stat3Label },
          ].map(({ val, label }) => (
            <FadeUp key={label} className="text-center px-8 py-4">
              <p className="text-4xl font-bold text-gray-900 mb-1">{val}</p>
              <p className="text-sm text-gray-400">{label}</p>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ══ FEATURES ══ */}
      <section id="features" className="border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 pt-20 pb-0">
          <FadeUp className="mb-14">
            <p className="text-sm font-medium text-gray-400 uppercase tracking-widest mb-3">{l.featuresTitle}</p>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight leading-[1.1] max-w-xl">
                {l.featuresHeading}
              </h2>
              <p className="text-gray-500 max-w-sm leading-relaxed text-sm sm:text-base">{l.featuresSubtitle}</p>
            </div>
          </FadeUp>
        </div>
        {/* Feature grid — border style like Attio */}
        <div className="max-w-7xl mx-auto px-6">
          <div className="border border-gray-100 rounded-2xl overflow-hidden grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard Icon={Calculator} title={l.feature1Title} desc={l.feature1Desc} delay={0}   />
            <FeatureCard Icon={Zap}        title={l.feature2Title} desc={l.feature2Desc} delay={60}  />
            <FeatureCard Icon={TrendingUp} title={l.feature3Title} desc={l.feature3Desc} delay={120} />
            <FeatureCard Icon={Box}        title={l.feature4Title} desc={l.feature4Desc} delay={0}   />
            <FeatureCard Icon={FileText}   title={l.feature5Title} desc={l.feature5Desc} delay={60}  />
            <FeatureCard Icon={BarChart2}  title={l.feature6Title} desc={l.feature6Desc} delay={120} />
          </div>
        </div>
        <div className="h-20" />
      </section>

      {/* ══ DASHBOARD — alternating ══ */}
      <section className="border-t border-gray-100 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <FadeUp>
              <p className="text-sm font-medium text-gray-400 uppercase tracking-widest mb-4">
                {isSl ? 'Pregled' : 'Analytics'}
              </p>
              <h2 className="text-4xl font-bold text-gray-900 tracking-tight leading-[1.1] mb-5">
                {isSl ? 'Vse ponudbe na enem mestu.' : 'All your quotes in one place.'}
              </h2>
              <p className="text-gray-500 leading-relaxed mb-8">
                {isSl
                  ? 'Nadzorna plošča prikazuje vrednost poslanih, dobljenih in izgubljenih ponudb. Vedno veste, kje stojite.'
                  : 'The dashboard shows the value of sent, won and lost quotes. You always know where you stand.'}
              </p>
              <div className="flex flex-col gap-3">
                {(isSl
                  ? ['Skupna vrednost ponudb v teku', 'Stopnja dobljenih poslov', 'Mesečni trend ponudb']
                  : ['Total value of open quotes', 'Win rate tracking', 'Monthly quote trend']
                ).map(item => (
                  <div key={item} className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="text-gray-700 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </FadeUp>
            <FadeUp delay={100}>
              <DashboardMockup isSl={isSl} />
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ══ FOR WHOM ══ */}
      <section className="border-t border-gray-100 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <FadeUp className="mb-14">
            <p className="text-sm font-medium text-gray-400 uppercase tracking-widest mb-3">
              {isSl ? 'Za koga' : 'For whom'}
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight leading-[1.1] max-w-2xl">
              {isSl ? 'Namenjen vsakemu tipu proizvodnje.' : 'Built for every type of manufacturing.'}
            </h2>
          </FadeUp>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {forWhom.map((item, i) => (
              <ForWhomCard key={item.label} {...item} delay={(i % 3) * 80} />
            ))}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section id="how-it-works" className="border-t border-gray-100 py-24 bg-[#fafafa]">
        <div className="max-w-7xl mx-auto px-6">
          <FadeUp className="mb-16">
            <p className="text-sm font-medium text-gray-400 uppercase tracking-widest mb-3">{l.howTitle}</p>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight leading-[1.1] max-w-2xl">{l.howHeading}</h2>
          </FadeUp>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            <StepCard num="01" title={l.step1Title} desc={l.step1Desc} delay={0}   />
            <StepCard num="02" title={l.step2Title} desc={l.step2Desc} delay={100} />
            <StepCard num="03" title={l.step3Title} desc={l.step3Desc} delay={200} />
            <StepCard num="04" title={l.step4Title} desc={l.step4Desc} delay={300} />
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ══ */}
      <section className="border-t border-gray-100 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <FadeUp className="mb-14">
            <p className="text-sm font-medium text-gray-400 uppercase tracking-widest mb-3">{l.testimonialsTitle}</p>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight leading-[1.1]">{l.testimonialsHeading}</h2>
          </FadeUp>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <TestiCard quote={l.t1Quote} name={l.t1Name} role={l.t1Role} />
            <TestiCard quote={l.t2Quote} name={l.t2Name} role={l.t2Role} />
            <TestiCard quote={l.t3Quote} name={l.t3Name} role={l.t3Role} />
          </div>
        </div>
      </section>

      {/* ══ FAQ ══ */}
      <section id="faq" className="border-t border-gray-100 py-24 bg-[#fafafa]">
        <div className="max-w-2xl mx-auto px-6">
          <FadeUp className="mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight">{l.faqHeading}</h2>
          </FadeUp>
          <div className="border border-gray-100 rounded-2xl divide-y divide-gray-100 overflow-hidden bg-white">
            {FAQ_KEYS.map(k => (
              <div key={k}>
                <button
                  className="w-full flex items-center justify-between px-6 py-5 text-left gap-4 hover:bg-gray-50 transition-colors"
                  onClick={() => setOpenFaq(openFaq === k ? null : k)}>
                  <span className="font-semibold text-gray-900 text-sm leading-relaxed">{l[`${k}Q` as keyof typeof l] as string}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-300 shrink-0 transition-transform duration-200 ${openFaq === k ? 'rotate-180' : ''}`} />
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${openFaq === k ? 'max-h-48' : 'max-h-0'}`}>
                  <p className="px-6 pb-5 text-gray-500 leading-relaxed text-sm">{l[`${k}A` as keyof typeof l] as string}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section className="border-t border-gray-100 py-24 bg-gray-900">
        <FadeUp className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-5 tracking-tight leading-[1.1]">{l.ctaHeading}</h2>
          <p className="text-gray-400 text-lg mb-10 leading-relaxed">{l.ctaSubtitle}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
            <Link to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-gray-900 font-semibold px-7 py-3.5 rounded-xl hover:bg-gray-100 transition-colors text-base">
              {l.ctaButton} <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/login" className="text-gray-500 hover:text-white font-medium text-sm transition-colors">
              {l.navSignIn} →
            </Link>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-gray-600 text-sm">
            {(isSl
              ? ['Brezplačna registracija', 'Brez kreditne kartice', 'Takojšen dostop']
              : ['Free to register', 'No credit card required', 'Instant access']
            ).map(item => (
              <div key={item} className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-gray-500" />{item}
              </div>
            ))}
          </div>
        </FadeUp>
      </section>

      {/* ══ FOOTER ══ */}
      <footer className="bg-gray-900 border-t border-white/8 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center gap-4 sm:gap-0 justify-between">
          <a href="#" onClick={e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
            <AppLogo size="sm" mono dark />
          </a>
          <p className="text-sm text-gray-600">{l.footerRights}</p>
          <div className="flex gap-6 text-sm text-gray-500 order-first sm:order-last">
            <Link to="/privacy" className="hover:text-white transition-colors">{l.footerPrivacy}</Link>
            <Link to="/terms" className="hover:text-white transition-colors">{l.footerTerms}</Link>
            <a href="mailto:info@toolingdesk.com" className="hover:text-white transition-colors">{l.footerContact}</a>
          </div>
        </div>
      </footer>

    </div>
  )
}
