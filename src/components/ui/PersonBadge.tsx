interface PersonBadgeProps {
  name: string
}

export function PersonBadge({ name }: PersonBadgeProps) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-gray-800 whitespace-nowrap">
      <span
        className="flex items-center justify-center rounded-full text-white font-bold shrink-0"
        style={{ backgroundColor: '#00d17e', width: 18, height: 18, fontSize: 9 }}
      >
        {initials}
      </span>
      {name}
    </span>
  )
}
