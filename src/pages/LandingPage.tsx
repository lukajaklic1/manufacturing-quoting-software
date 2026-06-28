import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Zap, ArrowRight, Calculator, TrendingUp, FileText, BarChart2, Settings, ChevronDown, Check, Clock, Eye } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useLanguage } from '../hooks/useLanguage'
import AppLogo from '../components/ui/AppLogo'

const FEATURE_ICONS = [
  { icon: Calculator, color: 'bg-blue-50 text-blue-600', k: 'feature1' },
  { icon: Zap, color: 'bg-purple-50 text-purple-600', k: 'feature2' },
  { icon: TrendingUp, color: 'bg-green-50 text-green-600', k: 'feature3' }, // eslint-disable-line
  { icon: Settings, color: 'bg-amber-50 text-amber-600', k: 'feature4' },
  { icon: FileText, color: 'bg-red-50 text-red-600', k: 'feature5' },
  { icon: BarChart2, color: 'bg-indigo-50 text-indigo-600', k: 'feature6' },
]

const STEP_NUMS = ['01', '02', '03', '04']
const TESTIMONIALS = ['t1', 't2', 't3'] as const
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

  const painIcons = [
    { icon: Zap, cls: 'bg-blue-50 text-blue-600' },
    { icon: BarChart2, cls: 'bg-green-50 text-green-600' },
    { icon: TrendingUp, cls: 'bg-purple-50 text-purple-600' },
  ]

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
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
            <Link to="/register" className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap">
              {l.navCta}
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full mb-8">
          <Zap className="w-3.5 h-3.5" />
          {l.heroBadge}
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 mb-6 leading-tight">
          {l.heroTitle1}<br />
          <span className="text-blue-600">{l.heroTitle2}</span>
        </h1>

        <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          {l.heroSubtitle}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-14">
          <Link to="/register"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold px-7 py-3.5 rounded-xl hover:bg-blue-700 transition-colors text-base shadow-sm shadow-blue-200">
            {l.heroCtaPrimary} <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/login"
            className="w-full sm:w-auto text-gray-700 font-semibold px-7 py-3.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-base">
            {l.heroCtaSecondary}
          </Link>
        </div>


        {/* App preview */}
        <div className="relative mx-auto max-w-4xl hidden sm:block">
          <div className="rounded-2xl border border-gray-200 shadow-2xl shadow-gray-200/60 overflow-hidden">
            <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 mx-3 bg-gray-100 rounded-md h-6 flex items-center px-3">
                <span className="text-xs text-gray-400">app.costflow.com/dashboard</span>
              </div>
            </div>
            <div className="bg-gray-50 p-6 flex gap-4 min-h-[280px]">
              <div className="w-44 bg-white rounded-xl border border-gray-200 p-3 flex flex-col gap-1 shrink-0">
                <div className="flex items-center gap-2 p-2 mb-2">
                  <div className="w-6 h-6 bg-blue-600 rounded-md" />
                  <span className="text-xs font-semibold text-gray-800">Costflow</span>
                </div>
                {[
                  isSl ? 'Nadzorna plošča' : 'Dashboard',
                  isSl ? 'Ponudbe' : 'Quotes',
                  isSl ? 'Stranke' : 'Customers',
                  isSl ? 'Materiali' : 'Materials',
                  isSl ? 'Stroški strojev' : 'Machines',
                  isSl ? 'Stroški dela' : 'Labour',
                ].map((item, i) => (
                  <div key={item} className={`text-xs px-2 py-1.5 rounded-lg ${i === 0 ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-500'}`}>
                    {item}
                  </div>
                ))}
              </div>
              <div className="flex-1 flex flex-col gap-3">
                <div className="grid grid-cols-4 gap-3">
                  {(isSl
                    ? [['Ponujena vrednost','184.200 €'],['Dobljena vrednost','120.000 €'],['Poslane ponudbe','25'],['Dobljene ponudbe','12']]
                    : [['Quoted value','€184,200'],['Won value','€120,000'],['Sent quotes','25'],['Won quotes','12']]
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
      </section>

      {/* ── Pain Section ── */}
      <section className="bg-gray-50 border-y border-gray-100 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-gray-900 tracking-tight max-w-2xl mx-auto">{l.painTitle}</h2>
            <p className="text-gray-500 mt-4 text-lg max-w-2xl mx-auto">{l.painSubtitle}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(['pain1', 'pain2', 'pain3'] as const).map((k, i) => {
              const { icon: Icon, cls } = painIcons[i]
              return (
                <div key={k} className="bg-white rounded-2xl border border-gray-200 p-8">
                  <div className={`inline-flex p-3 rounded-xl ${cls} mb-5`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{l[`${k}Title` as keyof typeof l] as string}</h3>
                  <p className="text-gray-500 leading-relaxed">{l[`${k}Desc` as keyof typeof l] as string}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-3">{l.featuresTitle}</p>
            <h2 className="text-4xl font-bold text-gray-900 tracking-tight">{l.featuresHeading}</h2>
            <p className="text-gray-500 mt-4 text-lg max-w-xl mx-auto">{l.featuresSubtitle}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURE_ICONS.map(({ icon: Icon, color, k }) => (
              <div key={k} className="bg-white rounded-2xl border border-gray-200 p-7 hover:shadow-md transition-shadow">
                <div className={`inline-flex p-3 rounded-xl ${color} mb-4`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{l[`${k}Title` as keyof typeof l] as string}</h3>
                <p className="text-gray-500 leading-relaxed">{l[`${k}Desc` as keyof typeof l] as string}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="bg-gray-50 border-y border-gray-100 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-3">{l.howTitle}</p>
            <h2 className="text-4xl font-bold text-gray-900 tracking-tight">{l.howHeading}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {STEP_NUMS.map((num, i) => (
              <div key={num} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white font-bold text-xl flex items-center justify-center mx-auto mb-5">
                  {num}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{l[`step${i + 1}Title` as keyof typeof l] as string}</h3>
                <p className="text-gray-500 leading-relaxed">{l[`step${i + 1}Desc` as keyof typeof l] as string}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-3">{l.testimonialsTitle}</p>
            <h2 className="text-4xl font-bold text-gray-900 tracking-tight">{l.testimonialsHeading}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(k => (
              <div key={k} className="bg-gray-50 rounded-2xl border border-gray-100 p-8 flex flex-col gap-5">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                  ))}
                </div>
                <p className="text-gray-700 leading-relaxed flex-1">"{l[`${k}Quote` as keyof typeof l] as string}"</p>
                <div className="border-t border-gray-200 pt-4">
                  <p className="font-semibold text-gray-900">{l[`${k}Name` as keyof typeof l] as string}</p>
                  <p className="text-sm text-gray-500">{l[`${k}Role` as keyof typeof l] as string}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="bg-gray-50 border-t border-gray-100 py-24">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-3">{l.faqTitle}</p>
            <h2 className="text-4xl font-bold text-gray-900 tracking-tight">{l.faqHeading}</h2>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">
            {FAQ_KEYS.map(k => (
              <div key={k}>
                <button
                  className="w-full flex items-center justify-between px-6 py-5 text-left gap-4"
                  onClick={() => setOpenFaq(openFaq === k ? null : k)}
                >
                  <span className="font-semibold text-gray-900">{l[`${k}Q` as keyof typeof l] as string}</span>
                  <ChevronDown className={`w-5 h-5 text-gray-400 shrink-0 transition-transform ${openFaq === k ? 'rotate-180' : ''}`} />
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
      <section className="bg-blue-600 py-24">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight leading-tight">{l.ctaHeading}</h2>
          <p className="text-blue-200 text-lg mb-10">{l.ctaSubtitle}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link to="/register"
              className="inline-flex items-center gap-2 bg-white text-blue-600 font-semibold px-8 py-4 rounded-xl hover:bg-blue-50 transition-colors text-base">
              {l.ctaButton} <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/login" className="text-blue-200 hover:text-white font-medium text-sm transition-colors">
              {l.navSignIn} →
            </Link>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-blue-200 text-sm">
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
            <a href="mailto:info@costflow.com" className="hover:text-gray-700 transition-colors">{l.footerContact}</a>
          </div>
        </div>
      </footer>

    </div>
  )
}
