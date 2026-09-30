import { NavLink } from 'react-router-dom'
import { CalendarDays, CheckSquare, LayoutGrid, Settings, Sun } from 'lucide-react'
import { cn } from '../utils/cn'

const items = [
  { to: '/', label: 'Bugün', icon: Sun, end: true },
  { to: '/tasks', label: 'İşler', icon: CheckSquare },
  { to: '/collections', label: 'Koleksiyonlar', icon: LayoutGrid },
  { to: '/calendar', label: 'Takvim', icon: CalendarDays },
  { to: '/settings', label: 'Ayarlar', icon: Settings },
] as const

export function BottomNavigation() {
  return (
    <nav
      aria-label="Ana menü"
      className="ios-tab-bar fixed inset-x-0 bottom-0 z-40 lg:hidden dark:bg-[rgb(28_28_30/0.92)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <ul className="mx-auto flex h-[50px] max-w-lg items-stretch">
        {items.map((item) => (
          <li key={item.to} className="min-w-0 flex-1">
            <NavLink
              to={item.to}
              end={'end' in item ? item.end : false}
              className={({ isActive }) =>
                cn(
                  'flex h-full flex-col items-center justify-center gap-0.5 px-1 text-[10px] font-medium leading-none tracking-tight',
                  isActive ? 'text-accent' : 'text-secondary',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon size={22} strokeWidth={isActive ? 2.2 : 1.75} />
                  <span className="max-w-full truncate">{item.label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
