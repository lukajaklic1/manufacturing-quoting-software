import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Zap, ArrowRight, Calculator, TrendingUp, FileText, BarChart2, Settings, ChevronDown, Check } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useLanguage } from '../hooks/useLanguage'
import AppLogo from '../components/ui/AppLogo'

const FEATURE_ICONS = [
  { icon: Calculator, k: 'feature1' },
  { icon: Zap, k: 'feature2' },
  { icon: TrendingUp, k: 'feature3' },
  { icon: Settings, k: 'feature4' },
  { icon: FileText, k: 'feature5' },
  { icon: BarChart2, k: 'feature6' },
]

const STEP_NUMS = ['01', '02', '03', '04']
const FAQ_KEYS = ['faq1', 'faq2', 'faq3', 'faq4', 'faq5'] as const

export default function LandingPage() {
  const { session, loading } = useAuth()
  const { lang, setLang, t } = useLanguage()
  const navigate = useNavigate()
  const l = t.landing
  const isSl = lang === 'sl'
  const [openFaq, setOpenFaq] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && session) navigate('/dashboard', { replace: true })
  }, [session, loading])

  if (loading) return null

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="#" onClick={e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
            <AppLogo size="sm" />
          </a>
          <div className="flex items-center gap-3 lg:gap-6">
            <a href="#features" className="hidden md:block text-sm text-gray-500 hover:text-gray-900 transition-colors">{l.navFeatures}</a>
            <a href="#how-it-works" className="hidden md:block text-sm text-gray-500 hover:text-gray-900 transition-colors">{l.navHowItWorks}</a>
            <Link to="/login" className="hidden sm:block text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors">{l.navSignIn}</Link>
            <div className="flex gap-1">
              {(['en', 'sl'] as const).map(lng => (
                <button key={lng} onClick={() => setLang(lng)}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${lang === lng ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'}`}>
                  {lng.toUpperCase()}
                </button>
              ))}
            </div>
            <Link to="/register" className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap flex items-center gap-1.5">
              {l.navCta} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ background: 'linear-gradient(160deg, #eef2ff 0%, #f8faff 50%, #ffffff 100%)' }} className="pt-24 pb-20">
        <div className="max-w-6xl mx-auto px-6 text-center">

          <div className="inline-flex items-center gap-2 bg-white border border-indigo-100 text-indigo-700 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-8 shadow-sm">
            <Zap className="w-3.5 h-3.5" />
            {l.heroBadge}
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.08]" style={{ color: '#1a1f5e' }}>
            {l.heroTitle1}<br />
            <span style={{ color: '#4f46e5' }}>{l.heroTitle2}</span>
          </h1>

          <p className="text-lg text-gray-500 max-w-xl mx-auto mb-10 leading-relaxed">
            {l.heroSubtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
            <Link to="/register"
              className="w-full sm:w-auto flex items-center justify-center gap-2 text-white font-semibold px-7 py-3.5 rounded-xl transition-all text-base shadow-lg"
              style={{ background: '#4f46e5' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#4338ca')}
              onMouseLeave={e => (e.currentTarget.style.background = '#4f46e5')}>
              {l.heroCtaPrimary} <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/login"
              className="w-full sm:w-auto text-gray-700 font-semibold px-7 py-3.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors text-base">
              {l.heroCtaSecondary}
            </Link>
          </div>

          {/* App preview */}
          <div className="relative mx-auto max-w-4xl hidden sm:block">
            <div className="rounded-2xl border border-indigo-100 shadow-2xl overflow-hidden" style={{ boxShadow: '0 25px 60px rgba(79,70,229,0.12)' }}>
              <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 mx-3 bg-gray-100 rounded-md h-6 flex items-center px-3">
                  <span className="text-xs text-gray-400">app.toolingdesk.com/dashboard</span>
                </div>
              </div>
              <div className="bg-gray-50 p-6 flex gap-4 min-h-[280px]">
                <div className="w-44 bg-white rounded-xl border border-gray-200 p-3 flex flex-col gap-1 shrink-0">
                  <div className="flex items-center gap-2 p-2 mb-2">
                    <div className="w-6 h-6 rounded-md" style={{ background: '#4f46e5' }} />
                    <span className="text-xs font-semibold text-gray-800">Toolingdesk</span>
                  </div>
                  {[
                    isSl ? 'Nadzorna plošča' : 'Dashboard',
                    isSl ? 'Ponudbe' : 'Quotes',
                    isSl ? 'Stranke' : 'Customers',
                    isSl ? 'Materiali' : 'Materials',
                    isSl ? 'Stroški strojev' : 'Machines',
                    isSl ? 'Stroški dela' : 'Labour',
                  ].map((item, i) => (
                    <div key={item} className={`text-xs px-2 py-1.5 rounded-lg ${i === 0 ? 'font-medium text-indigo-700' : 'text-gray-500'}`}
                      style={i === 0 ? { background: '#eef2ff' } : {}}>
                      {item}
                    </div>
                  ))}
                </div>
                <div className="flex-1 flex flex-col gap-3">
                  <div className="grid grid-cols-4 gap-3">
                    {(isSl
                      ? [['Ponujena vrednost', '184.200 €'], ['Dobljena vrednost', '120.000 €'], ['Poslane ponudbe', '25'], ['Dobljene ponudbe', '12']]
                      : [['Quoted value', '€184,200'], ['Won value', '€120,000'], ['Sent quotes', '25'], ['Won quotes', '12']]
                    ).map(([label, val]) => (
                      <div key={label} className="bg-white rounded-xl border border-gray-200 p-3">
                        <p className="text-xs text-gray-400 mb-1">{label}</p>
                        <p className="text-base font-bold text-gray-900">{val}</p>
                      </div>
                    ))}
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-4 flex-1">
                    <p className="text-xs font-semibold text-gray-500">{isSl ? 'Vrednost ponudb po mesecih' : 'Quote value by month'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pain Section ── */}
      <section className="py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#4f46e5' }}>{isSl ? 'Zakaj Toolingdesk' : 'Why Toolingdesk'}</p>
            <h2 className="text-4xl font-bold tracking-tight max-w-2xl mx-auto" style={{ color: '#1a1f5e' }}>{l.painTitle}</h2>
            <p className="text-gray-500 mt-4 text-lg max-w-2xl mx-auto">{l.painSubtitle}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {(['pain1', 'pain2', 'pain3'] as const).map((k, i) => (
              <div key={k} className="rounded-2xl p-8" style={i === 0 ? { background: '#eef2ff' } : i === 2 ? { background: '#1a1f5e' } : { background: '#f8faff', border: '1px solid #e0e7ff' }}>
                <h3 className="text-xl font-bold mb-3" style={{ color: i === 2 ? '#fff' : '#1a1f5e' }}>{l[`${k}Title` as keyof typeof l] as string}</h3>
                <p className="leading-relaxed" style={{ color: i === 2 ? '#a5b4fc' : '#6b7280' }}>{l[`${k}Desc` as keyof typeof l] as string}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-28" style={{ background: '#f8faff' }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#4f46e5' }}>{l.featuresTitle}</p>
            <h2 className="text-4xl font-bold tracking-tight" style={{ color: '#1a1f5e' }}>{l.featuresHeading}</h2>
            <p className="text-gray-500 mt-4 text-lg max-w-xl mx-auto">{l.featuresSubtitle}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURE_ICONS.map(({ icon: Icon, k }, i) => (
              <div key={k} className="rounded-2xl p-7 transition-shadow hover:shadow-md"
                style={i === 1 ? { background: '#eef2ff' } : i === 4 ? { background: '#1a1f5e' } : { background: '#fff', border: '1px solid #e5e7eb' }}>
                <div className="inline-flex p-3 rounded-xl mb-4" style={i === 4 ? { background: 'rgba(255,255,255,0.1)' } : { background: '#eef2ff' }}>
                  <Icon className="w-5 h-5" style={{ color: i === 4 ? '#a5b4fc' : '#4f46e5' }} />
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: i === 4 ? '#fff' : '#1a1f5e' }}>{l[`${k}Title` as keyof typeof l] as string}</h3>
                <p className="leading-relaxed" style={{ color: i === 4 ? '#a5b4fc' : '#6b7280' }}>{l[`${k}Desc` as keyof typeof l] as string}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#4f46e5' }}>{l.howTitle}</p>
            <h2 className="text-4xl font-bold tracking-tight" style={{ color: '#1a1f5e' }}>{l.howHeading}</h2>
            <p className="text-gray-500 mt-4 text-lg max-w-2xl mx-auto">{l.howSubtitle}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEP_NUMS.map((num, i) => (
              <div key={num} className="rounded-2xl p-7" style={i === 3 ? { background: '#1a1f5e' } : { background: '#f8faff', border: '1px solid #e0e7ff' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg mb-5"
                  style={i === 3 ? { background: 'rgba(255,255,255,0.1)', color: '#a5b4fc' } : { background: '#4f46e5', color: '#fff' }}>
                  {num}
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: i === 3 ? '#fff' : '#1a1f5e' }}>{l[`step${i + 1}Title` as keyof typeof l] as string}</h3>
                <p className="leading-relaxed text-sm" style={{ color: i === 3 ? '#a5b4fc' : '#6b7280' }}>{l[`step${i + 1}Desc` as keyof typeof l] as string}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Za koga ── */}
      <section className="py-28" style={{ background: '#f8faff' }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#4f46e5' }}>{isSl ? 'Za koga' : 'For whom'}</p>
            <h2 className="text-4xl font-bold tracking-tight" style={{ color: '#1a1f5e' }}>{isSl ? 'Komu je namenjen Toolingdesk?' : 'Who is Toolingdesk for?'}</h2>
            <p className="text-gray-500 mt-4 text-lg">{isSl ? 'Toolingdesk je zasnovan za proizvodna podjetja, ki pripravijo ponudbe na podlagi materiala, operacij in stroškov dela.' : 'Toolingdesk is built for manufacturers who quote based on materials, operations, and labour costs.'}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {(isSl ? [
              [Settings, 'Orodjarne', 'Natančen izračun strojnih ur, materiala in dela za orodja, forme in priprave.', false],
              [Calculator, 'CNC obdelava', 'Vsaka operacija — rezkanje, struženje, EDM — ima svojo urno postavko in čas obdelave.', true],
              [Zap, 'Varjenje in jeklene konstrukcije', 'Kalkulacija materiala, časa varjenja in površinske obdelave za varjene sestave in konstrukcije.', false],
              [FileText, 'Lasersko rezanje in pločevinarstvo', 'Stroški rezanja, upogibanja in obdelave pločevine glede na material, debelino in čas stroja.', false],
              [BarChart2, 'Maloserijska in naročniška proizvodnja', 'Vsak kos zahteva svojo kalkulacijo. Toolingdesk zagotavlja enoten proces za celotno ekipo.', false],
              [TrendingUp, 'Kooperacija in podizvajalstvo', 'Stroški zunanjih storitev in kooperantov so vključeni skupaj z lastnimi stroški v eno ponudbo.', true],
            ] : [
              [Settings, 'Tool & Die Shops', 'Precise calculation of machine hours, materials and labour for tools, moulds and fixtures.', false],
              [Calculator, 'CNC Machining', 'Every operation — milling, turning, EDM — has its own hourly rate and cycle time in the quote.', true],
              [Zap, 'Welding & Steel Structures', 'Material, welding time and surface treatment costs calculated together for every assembly.', false],
              [FileText, 'Laser Cutting & Sheet Metal', 'Cutting, bending and forming costs based on material type, thickness and machine time.', false],
              [BarChart2, 'Custom & Job-Shop Manufacturing', 'Every part needs its own calculation. Toolingdesk ensures a consistent process across your team.', false],
              [TrendingUp, 'Subcontracting', 'External service and subcontractor costs included alongside your own in a single quote.', true],
            ]).map(([Icon, title, desc, dark]) => (
              <div key={title as string} className="rounded-2xl p-7"
                style={(dark as boolean) ? { background: '#1a1f5e' } : { background: '#fff', border: '1px solid #e0e7ff' }}>
                <div className="inline-flex p-3 rounded-xl mb-4"
                  style={(dark as boolean) ? { background: 'rgba(255,255,255,0.1)' } : { background: '#eef2ff' }}>
                  {/* @ts-ignore */}
                  <Icon className="w-5 h-5" style={{ color: (dark as boolean) ? '#a5b4fc' : '#4f46e5' }} />
                </div>
                <h3 className="text-base font-bold mb-2" style={{ color: (dark as boolean) ? '#fff' : '#1a1f5e' }}>{title as string}</h3>
                <p className="text-sm leading-relaxed" style={{ color: (dark as boolean) ? '#a5b4fc' : '#6b7280' }}>{desc as string}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-28">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold tracking-tight" style={{ color: '#1a1f5e' }}>{l.faqHeading}</h2>
          </div>
          <div className="rounded-2xl border border-gray-100 divide-y divide-gray-100 overflow-hidden" style={{ background: '#f8faff' }}>
            {FAQ_KEYS.map(k => (
              <div key={k}>
                <button
                  className="w-full flex items-center justify-between px-6 py-5 text-left gap-4 hover:bg-white/60 transition-colors"
                  onClick={() => setOpenFaq(openFaq === k ? null : k)}>
                  <span className="font-semibold" style={{ color: '#1a1f5e' }}>{l[`${k}Q` as keyof typeof l] as string}</span>
                  <ChevronDown className={`w-5 h-5 shrink-0 transition-transform ${openFaq === k ? 'rotate-180' : ''}`} style={{ color: '#4f46e5' }} />
                </button>
                {openFaq === k && (
                  <p className="px-6 pb-5 text-gray-500 leading-relaxed">{l[`${k}A` as keyof typeof l] as string}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-28" style={{ background: '#1a1f5e' }}>
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight leading-tight">{l.ctaHeading}</h2>
          <p className="text-lg mb-10" style={{ color: '#a5b4fc' }}>{l.ctaSubtitle}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link to="/register"
              className="inline-flex items-center gap-2 font-semibold px-8 py-4 rounded-xl transition-colors text-base"
              style={{ background: '#4f46e5', color: '#fff' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#4338ca')}
              onMouseLeave={e => (e.currentTarget.style.background = '#4f46e5')}>
              {l.ctaButton} <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/login" className="font-medium text-sm transition-colors hover:text-white" style={{ color: '#a5b4fc' }}>
              {l.navSignIn} →
            </Link>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm" style={{ color: '#a5b4fc' }}>
            {[
              isSl ? 'Brezplačna registracija' : 'Free to register',
              isSl ? 'Brez kreditne kartice' : 'No credit card required',
              isSl ? 'Takojšen dostop' : 'Instant access',
            ].map(item => (
              <div key={item} className="flex items-center gap-2">
                <Check className="w-4 h-4" />{item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center gap-4 sm:gap-0 justify-between">
          <a href="#" onClick={e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
            <AppLogo size="sm" />
          </a>
          <p className="text-sm text-gray-400">{l.footerRights}</p>
          <div className="flex gap-6 text-sm text-gray-400 order-first sm:order-last">
            <Link to="/privacy" className="hover:text-gray-700 transition-colors">{l.footerPrivacy}</Link>
            <Link to="/terms" className="hover:text-gray-700 transition-colors">{l.footerTerms}</Link>
            <a href="mailto:info@tce.si" className="hover:text-gray-700 transition-colors">{l.footerContact}</a>
          </div>
        </div>
      </footer>

    </div>
  )
}
