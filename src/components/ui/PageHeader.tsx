interface PageHeaderProps {
  title: string
  action?: React.ReactNode
}

export function PageHeader({ title, action }: PageHeaderProps) {
  return (
    <div className="h-[57px] flex items-center justify-between px-6 border-b border-gray-200 bg-white shrink-0">
      <h1 className="text-xl font-bold text-gray-900 leading-tight">{title}</h1>
      {action}
    </div>
  )
}
