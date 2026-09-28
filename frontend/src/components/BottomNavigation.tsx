import { NavLink } from 'react-router-dom'
import {
  CalendarDays,
  CheckSquare,
  LayoutGrid,
  Settings,
  Sun,
} from 'lucide-react'
import { cn } from '../utils/cn'

const items = [
  { to: '/', label: 'Bugün', icon: Sun, end: true },
  { to: '/tasks', label: 'Görevler', icon: CheckSquare },
  { to: '/collections', label: 'Koleksiyonlar', icon: LayoutGrid },
  { to: '/calendar', label: 'Takvim', icon: CalendarDays },
  { to: '/settings', label: 'Ayarlar', icon: Settings },
] as const

export function BottomNavigation() {
  return (
    <nav
      aria-label="Ana menü"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface lg:hidden safe-bottom"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-between px-2 pt-1">
        {items.map((item) => (
          <li key={item.to} className="flex-1">
            <NavLink
              to={item.to}
              end={'end' in item ? item.end : false}
              className={({ isActive }) =>
                cn(
                  'flex touch-target flex-col items-center justify-center gap-0.5 text-[11px]',
                  isActive ? 'text-accent' : 'text-secondary',
                )
              }
            >
              <item.icon size={20} strokeWidth={1.75} />
              <span>{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
