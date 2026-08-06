﻿import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, FileText, Users, UserCog, Settings, LogOut, X, Factory, HardHat, Layers, Box, Building2, PanelLeft,
} from 'lucide-react'
import { useSidebarCollapse } from './AppLayout'
import { useAuth } from '../../hooks/useAuth'
import { useCompany } from '../../hooks/useCompany'
import { useLanguage } from '../../hooks/useLanguage'
import { cn } from '../../lib/cn'
import AppLogo from '../ui/AppLogo'

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
  const { toggle } = useSidebarCollapse()
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
      {/* App logo â€" same height as PageHeader (h-[57px]) */}
      <div className="h-[57px] px-4 border-b border-gray-200 flex items-center justify-between shrink-0">
        <AppLogo size="sm" />
        <div className="flex items-center gap-1">
          <button onClick={toggle} className="hidden lg:flex p-1.5 text-gray-400 hover:text-gray-700 hover:bg-[#f6f6f6] rounded-md transition-colors" title="Hide sidebar">
            <PanelLeft className="w-[18px] h-[18px]" />
          </button>
          {onClose && (
            <button onClick={onClose} className="lg:hidden p-1.5 text-gray-500 hover:text-gray-900 hover:bg-[#f6f6f6] rounded-lg transition-colors shrink-0">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Company pill */}
      {company && (
        <div className="px-3 pt-3 pb-1">
          <div className="flex items-center gap-2 px-2.5 py-1 bg-white rounded-md border border-gray-200">
            <Building2 className="w-4 h-4 text-gray-400 shrink-0" />
            <p className="text-sm font-medium text-gray-900 truncate">{company.name}</p>
          </div>
        </div>
      )}

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
                : 'text-gray-900 hover:bg-[#f6f6f6]',
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
            isActive ? 'bg-[#f1f1f1] text-gray-900' : 'text-gray-900 hover:bg-[#f6f6f6]',
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
                  lang === l ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-900 hover:bg-[#f6f6f6]',
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
              {profile ? `${profile.first_name} ${profile.last_name}` : 'â€"'}
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
