import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { IconTile, ListSection, PageHeader, SegmentControl, typeTone } from '../../components'
import { calendarApi } from '../../services/endpoints'
import type { CalendarItem, CalendarItemType } from '../../types'
import {
  formatDayMonthWeekday,
  formatWeekdayDayMonth,
  toDateOnly,
} from '../../utils'
import { cn } from '../../utils/cn'

const typeLabel: Record<CalendarItemType, string> = {
  task: 'İş',
  birthday: 'Doğum günü',
  contest: 'Yarışma',
}

function useIsDesktop() {
  const [desktop, setDesktop] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches,
  )
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const onChange = () => setDesktop(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return desktop
}

function monthRange(anchor: Date): { from: string; to: string; days: Date[] } {
  const year = anchor.getFullYear()
  const month = anchor.getMonth()
  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)
  const startPad = (first.getDay() + 6) % 7
  const days: Date[] = []
  for (let i = -startPad; i < last.getDate() + (7 - ((startPad + last.getDate()) % 7 || 7)) % 7; i += 1) {
    days.push(new Date(year, month, 1 + i))
  }
  const from = toDateOnly(new Date(year, month, 1 - startPad))
  const to = toDateOnly(days[days.length - 1]!)
  return { from, to, days }
}

function agendaRange(): { from: string; to: string } {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(end.getDate() + 60)
  return { from: toDateOnly(start), to: toDateOnly(end) }
}

export default function CalendarPage() {
  const desktop = useIsDesktop()
  const [view, setView] = useState<'agenda' | 'month'>(desktop ? 'month' : 'agenda')
  const [anchor, setAnchor] = useState(() => new Date())
  const [selectedDay, setSelectedDay] = useState(() => toDateOnly(new Date()))

  useEffect(() => {
    setView(desktop ? 'month' : 'agenda')
  }, [desktop])

  const range = useMemo(() => {
    if (view === 'month') return monthRange(anchor)
    return { ...agendaRange(), days: [] as Date[] }
  }, [view, anchor])

  const { data = [], isLoading } = useQuery({
    queryKey: ['calendar', range.from, range.to],
    queryFn: () => calendarApi.get(range.from, range.to),
  })

  const byDate = useMemo(() => {
    const map = new Map<string, CalendarItem[]>()
    for (const item of data) {
      const list = map.get(item.date) ?? []
      list.push(item)
      map.set(item.date, list)
    }
    return map
  }, [data])

  const agendaDates = useMemo(
    () => [...byDate.keys()].sort(),
    [byDate],
  )

  const monthLabel = new Intl.DateTimeFormat('tr-TR', {
    month: 'long',
    year: 'numeric',
  }).format(anchor)

  const selectedItems = byDate.get(selectedDay) ?? []

  return (
    <section>
      <PageHeader title="Takvim" />

      <SegmentControl
        ariaLabel="Takvim görünümü"
        className="mb-4"
        items={[
          { id: 'agenda', label: 'Ajanda' },
          { id: 'month', label: 'Ay' },
        ]}
        value={view}
        onChange={(id) => setView(id as 'agenda' | 'month')}
      />

      {isLoading ? (
        <div className="space-y-2" aria-hidden>
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded-[10px] bg-surface" />
          ))}
        </div>
      ) : null}

      {view === 'agenda' ? (
        <div>
          {!isLoading && agendaDates.length === 0 ? (
            <p className="px-1 text-[15px] text-secondary">Yakın tarihte olay yok.</p>
          ) : null}
          {agendaDates.map((date) => (
            <ListSection key={date} title={formatDayMonthWeekday(date)} compactTitle>
              <ul>
                {(byDate.get(date) ?? []).map((item) => (
                  <li key={`${item.type}-${item.entityId}-${item.time ?? ''}`}>
                    <div className="flex min-h-[56px] items-center gap-3 px-4 py-2.5">
                      <IconTile {...typeTone(item.type)} size="sm" />
                      <span className="min-w-0 flex-1">
                        <span className="headline block truncate text-text">{item.title}</span>
                        <span className="subheadline mt-0.5 block text-secondary">
                          {[item.time?.slice(0, 5), typeLabel[item.type]].filter(Boolean).join(' · ')}
                        </span>
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </ListSection>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grouped-list p-3">
            <div className="mb-2 flex h-11 items-center justify-between px-1">
              <button
                type="button"
                className="min-h-11 min-w-11 px-2 text-[17px] text-accent"
                onClick={() =>
                  setAnchor(new Date(anchor.getFullYear(), anchor.getMonth() - 1, 1))
                }
              >
                ‹
              </button>
              <p className="headline capitalize text-text">{monthLabel}</p>
              <button
                type="button"
                className="min-h-11 min-w-11 px-2 text-[17px] text-accent"
                onClick={() =>
                  setAnchor(new Date(anchor.getFullYear(), anchor.getMonth() + 1, 1))
                }
              >
                ›
              </button>
            </div>

            <div className="grid grid-cols-7 text-center">
              {['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'].map((d) => (
                <div key={d} className="py-1 text-[12px] font-medium text-secondary">
                  {d}
                </div>
              ))}
              {range.days.map((day) => {
                const key = toDateOnly(day)
                const inMonth = day.getMonth() === anchor.getMonth()
                const hasEvents = (byDate.get(key)?.length ?? 0) > 0
                const selected = key === selectedDay
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedDay(key)}
                    className={cn(
                      'relative mx-auto flex size-11 items-center justify-center rounded-full text-[17px]',
                      !inMonth && 'text-tertiary',
                      selected && 'bg-accent font-semibold text-white',
                      !selected && inMonth && 'text-text',
                    )}
                  >
                    {day.getDate()}
                    {hasEvents ? (
                      <span
                        className={cn(
                          'absolute bottom-1 size-1 rounded-full',
                          selected ? 'bg-white' : 'bg-accent',
                        )}
                        aria-hidden
                      />
                    ) : null}
                  </button>
                )
              })}
            </div>
          </div>

          <ListSection title={formatWeekdayDayMonth(selectedDay)} compactTitle>
            {selectedItems.length === 0 ? (
              <p className="px-4 py-4 text-[15px] text-secondary">Bu günde olay yok.</p>
            ) : (
              <ul>
                {selectedItems.map((item) => (
                  <li key={`${item.type}-${item.entityId}-${item.time ?? ''}`}>
                    <div className="flex min-h-[56px] items-center gap-3 px-4 py-2.5">
                      <IconTile {...typeTone(item.type)} size="sm" />
                      <span className="min-w-0 flex-1">
                        <span className="headline block truncate text-text">{item.title}</span>
                        <span className="subheadline mt-0.5 block text-secondary">
                          {[item.time?.slice(0, 5), typeLabel[item.type]].filter(Boolean).join(' · ')}
                        </span>
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </ListSection>
        </div>
      )}
    </section>
  )
}
