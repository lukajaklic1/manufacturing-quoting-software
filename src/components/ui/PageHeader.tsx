import type { LucideIcon } from 'lucide-react'
import { PanelLeft } from 'lucide-react'
import { useSidebarCollapse } from '../layout/AppLayout'

interface PageHeaderProps {
  title: string
  icon?: LucideIcon
  action?: React.ReactNode
}

export function PageHeader({ title, icon: Icon, action }: PageHeaderProps) {
  const { collapsed, toggle } = useSidebarCollapse()

  return (
    <div className="h-[57px] flex items-center justify-between px-4 lg:px-6 border-b border-gray-200 bg-white shrink-0">
      <div className="flex items-center gap-2">
        <button
          onClick={toggle}
          className="hidden lg:flex p-1.5 rounded-md text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          title={collapsed ? 'Show sidebar' : 'Hide sidebar'}
        >
          <PanelLeft className="w-4 h-4" />
        </button>
        {Icon && <Icon className="w-4 h-4 text-gray-500 shrink-0" />}
        <h1 className="text-sm font-medium text-gray-900">{title}</h1>
      </div>
      {action}
    </div>
  )
}
