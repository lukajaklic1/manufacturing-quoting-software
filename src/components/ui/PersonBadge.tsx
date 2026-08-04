interface PersonBadgeProps {
  name: string
  size?: 'sm' | 'md'
}

export function PersonBadge({ name, size = 'sm' }: PersonBadgeProps) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-gray-100 text-gray-800 text-xs font-medium whitespace-nowrap">
      <span
        className="flex items-center justify-center rounded-full text-white font-semibold shrink-0"
        style={{ backgroundColor: '#00d17e', width: size === 'sm' ? 16 : 20, height: size === 'sm' ? 16 : 20, fontSize: size === 'sm' ? 9 : 11 }}
      >
        {initials}
      </span>
      {name}
    </span>
  )
}
