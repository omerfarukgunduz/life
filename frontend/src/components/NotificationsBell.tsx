import { useQuery } from '@tanstack/react-query'
import { Bell } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { buildTodayNotifications } from '../features/dashboard/todayNotifications'
import { dashboardApi } from '../services/endpoints'
import { getTimeZone, parseDateOnly, toDateOnly } from '../utils'
import { readCachedDashboard } from '../utils/theme'
import { cn } from '../utils/cn'
import type { Dashboard } from '../types'

function formatNotificationDate(isoUtc: string | null, todayKey: string): string {
  if (!isoUtc) {
    return new Intl.DateTimeFormat('tr-TR', {
      day: 'numeric',
      month: 'short',
      timeZone: getTimeZone(),
    }).format(parseDateOnly(todayKey))
  }
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'short',
    timeZone: getTimeZone(),
  }).format(new Date(isoUtc))
}

export function NotificationsBell() {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const todayKey = toDateOnly(new Date())

  const { data } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.get(),
    placeholderData: () => readCachedDashboard<Dashboard>() ?? undefined,
    staleTime: 30_000,
  })

  const items = useMemo(() => buildTodayNotifications(data, todayKey), [data, todayKey])
  const count = items.length

  useEffect(() => {
    if (!open) return
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label={count > 0 ? `${count} bildirim` : 'Bildirimler'}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          'relative inline-flex size-11 shrink-0 items-center justify-center rounded-full text-secondary transition-opacity duration-200 active:opacity-60',
          open && 'text-accent',
        )}
      >
        <Bell size={20} strokeWidth={1.75} />
        {count > 0 ? (
          <span className="absolute -top-0.5 -right-0.5 flex min-w-5 items-center justify-center rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
            {count > 9 ? '9+' : count}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          role="region"
          aria-label="Bildirimler"
          className="absolute right-0 top-[calc(100%+6px)] z-50 flex w-[min(320px,calc(100vw-40px))] flex-col overflow-hidden rounded-[var(--radius-group)] border border-border bg-surface shadow-[var(--shadow-subtle)]"
        >
          <div className="border-b border-divider px-4 py-3">
            <h2 className="text-[15px] font-semibold text-text">Bildirimler</h2>
          </div>
          <div className="max-h-[min(420px,60dvh)] overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-4 py-6 text-[14px] text-secondary">
                Bugün için bildirim yok.
              </p>
            ) : (
              <ul>
                {items.map((item) => (
                  <li key={item.id} className="border-b border-divider last:border-b-0">
                    <Link
                      to={item.href}
                      onClick={() => setOpen(false)}
                      className="block px-4 py-3 active:bg-black/[0.03] dark:active:bg-white/[0.04]"
                    >
                      <p className="text-[14px] leading-snug text-text">
                        <span className="font-medium">&ldquo;{item.title}&rdquo;</span>
                        {' — '}
                        {item.subtitle}
                      </p>
                      <p className="mt-1.5 text-[13px] text-secondary">
                        {formatNotificationDate(item.reminderAt, todayKey)}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}
