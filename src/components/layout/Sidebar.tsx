import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, FileText, Users, UserCog, Settings, LogOut, X, Factory, HardHat, Layers, Box,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useCompany } from '../../hooks/useCompany'
import { useLanguage } from '../../hooks/useLanguage'
import { cn } from '../../lib/cn'

const NAV_KEYS = [
  { to: '/dashboard', icon: LayoutDashboard, key: 'dashboard' as const },
  { to: '/quotes',    icon: FileText,        key: 'quotes' as const, mod: 'quotes' as const },
  { to: '/customers', icon: Users,           key: 'customers' as const, mod: 'customers' as const },
  { to: '/materials', icon: Box,             key: 'materials' as const, mod: 'materials' as const },
  { to: '/machines',  icon: Factory,         key: 'machines' as const, mod: 'machine_rates' as const },
  { to: '/labor',     icon: HardHat,         key: 'labor' as const, mod: 'labor_rates' as const },
  { to: '/overheads', icon: Layers,          key: 'overheads' as const, mod: 'overheads' as const },
  { to: '/users',     icon: UserCog,         key: 'users' as const, adminOnly: true },
]

interface SidebarProps {
  onClose?: () => void
}

export default function Sidebar({ onClose }: SidebarProps) {
  const { signOut } = useAuth()
  const { company, profile, hasPerm } = useCompany()
  const { lang, setLang, t } = useLanguage()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  function handleNavClick() {
    onClose?.()
  }

  const initials = company?.name
    ? company.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  return (
    <aside className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col h-screen shrink-0">
      {/* Company header — same height as PageHeader (h-[57px]) */}
      <div className="h-[57px] px-4 border-b border-gray-200 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center text-white text-[9px] font-bold shrink-0">
            {initials}
          </div>
          <p className="text-sm font-semibold text-gray-900 truncate">{company?.name ?? 'Toolingdesk'}</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors shrink-0">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2 px-2">
        {NAV_KEYS.filter(item => (!item.adminOnly || profile?.is_admin) && (!('mod' in item) || hasPerm((item as { mod: Parameters<typeof hasPerm>[0] }).mod, 'view'))).map(({ to, icon: Icon, key }) => (
          <NavLink
            key={to}
            to={to}
            onClick={handleNavClick}
            className={({ isActive }) => cn(
              'flex items-center gap-2.5 px-3 py-1.5 rounded-lg mb-0.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-[#f1f1f1] text-gray-900'
                : 'text-gray-900 hover:bg-gray-100',
            )}
          >
            <Icon className="w-4 h-4 shrink-0 text-gray-500" />
            {t.nav[key]}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="border-t border-gray-200 p-2">
        <NavLink
          to="/settings"
          onClick={handleNavClick}
          className={({ isActive }) => cn(
            'flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors mb-0.5',
            isActive ? 'bg-[#f1f1f1] text-gray-900' : 'text-gray-900 hover:bg-gray-100',
          )}
        >
          <Settings className="w-4 h-4 text-gray-500" />
          {t.nav.settings}
        </NavLink>

        {/* Language switcher */}
        <div className="flex items-center gap-2 px-3 py-2 mb-1">
          <span className="text-xs text-gray-500 shrink-0">{t.language.label}:</span>
          <div className="flex gap-1">
            {(['en', 'sl'] as const).map(l => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={cn(
                  'px-2 py-0.5 rounded text-xs font-medium transition-colors',
                  lang === l ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100',
                )}
              >
                {l === 'en' ? 'EN' : 'SL'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold shrink-0">
            {profile ? `${profile.first_name[0]}${profile.last_name[0]}` : '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-900 truncate">
              {profile ? `${profile.first_name} ${profile.last_name}` : '—'}
            </p>
          </div>
          <button onClick={handleSignOut} className="text-gray-500 hover:text-gray-900 transition-colors" title={t.nav.signOut}>
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
