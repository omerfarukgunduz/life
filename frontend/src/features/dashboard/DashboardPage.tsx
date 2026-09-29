import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Avatar, BookCover, EmptyState, IconTile, TaskRow, typeTone } from '../../components'
import { useQuickAdd } from '../../hooks/useQuickAdd'
import { useOnline } from '../../hooks/useOnline'
import { dashboardApi, tasksApi } from '../../services/endpoints'
import type { Dashboard, Task, UpcomingItem, UpcomingType } from '../../types'
import {
  formatDayMonth,
  formatDayMonthLong,
  formatWeekday,
  formatWeekdayShort,
  toDateOnly,
} from '../../utils'
import { cacheDashboard, readCachedDashboard } from '../../utils/theme'
import { cn } from '../../utils/cn'

const typeLabel: Record<UpcomingType, string> = {
  task: 'Görev',
  birthday: 'Doğum günü',
  contest: 'Yarışma',
}

const typeHref: Record<UpcomingType, string> = {
  task: '/tasks',
  birthday: '/collections/birthdays',
  contest: '/collections/contests',
}

function UpcomingRow({ item, last }: { item: UpcomingItem; last: boolean }) {
  const tone = typeTone(item.type)
  return (
    <li className="flex gap-3">
      <div className="w-12 shrink-0 pt-3 text-right">
        <p className="text-[13px] font-semibold leading-tight text-text">
          {formatDayMonth(item.date)}
        </p>
        <p className="text-[11px] capitalize text-secondary">{formatWeekdayShort(item.date)}</p>
      </div>
      <div className="flex w-3 shrink-0 flex-col items-center pt-4">
        <span className={cn('size-2 rounded-full', tone.dot ?? 'bg-accent')} />
        {!last ? <span className="mt-1 w-px flex-1 bg-divider" /> : null}
      </div>
      <Link
        to={typeHref[item.type]}
        className="flex min-w-0 flex-1 items-center gap-3 py-3"
      >
        <IconTile {...tone} size="sm" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[15px] font-medium text-text">{item.title}</span>
          <span className="mt-0.5 block truncate text-[13px] text-secondary">
            {item.subtitle || typeLabel[item.type]}
          </span>
        </span>
        <ChevronRight size={18} className="shrink-0 text-[#C8C8C6]" />
      </Link>
    </li>
  )
}

export default function DashboardPage() {
  const todayKey = toDateOnly(new Date())
  const online = useOnline()
  const { openCreate } = useQuickAdd()
  const qc = useQueryClient()

  const query = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const data = await dashboardApi.get()
      cacheDashboard(JSON.stringify(data))
      return data
    },
    placeholderData: () => readCachedDashboard<Dashboard>() ?? undefined,
  })

  const toggle = useMutation({
    mutationFn: async (task: Task) =>
      tasksApi.update(task.id, {
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        dueTime: task.dueTime,
        priority: task.priority,
        category: task.category,
        isCompleted: !task.isCompleted,
      }),
    onMutate: async (task) => {
      await qc.cancelQueries({ queryKey: ['dashboard'] })
      const prev = qc.getQueryData<Dashboard>(['dashboard'])
      if (prev) {
        qc.setQueryData<Dashboard>(['dashboard'], {
          ...prev,
          todayTasks: prev.todayTasks.map((t) =>
            t.id === task.id ? { ...t, isCompleted: !t.isCompleted } : t,
          ),
        })
      }
      return { prev }
    },
    onError: (_e, _t, ctx) => {
      if (ctx?.prev) qc.setQueryData(['dashboard'], ctx.prev)
    },
    onSettled: async () => {
      await qc.invalidateQueries({ queryKey: ['dashboard'] })
      await qc.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  const data = query.data
  const taskCount = data?.todayTasks.length ?? 0

  return (
    <div className="pb-4">
      <header className="mb-6 flex items-start justify-between gap-3">
        <div>
          <p className="text-[13px] capitalize text-secondary">{formatWeekday(todayKey)}</p>
          <p className="mt-0.5 text-[15px] font-medium text-text">
            {formatDayMonthLong(todayKey)}
          </p>
          <h1 className="mt-4 text-[34px] font-bold leading-none tracking-[-0.03em] text-text">
            Bugün
          </h1>
        </div>
        <Avatar />
      </header>

      <section className="surface mb-4 p-4">
        <div className="mb-1 flex items-center justify-between gap-3">
          <h2 className="text-[16px] font-semibold text-text">Bugünkü görevler</h2>
          {taskCount > 0 ? (
            <Link to="/tasks" className="text-[13px] text-secondary">
              {taskCount} görev
            </Link>
          ) : (
            <Link to="/tasks" className="text-[13px] text-secondary">
              Tümü
            </Link>
          )}
        </div>
        {query.isLoading && !data ? (
          <div className="space-y-3 py-2" aria-hidden>
            <div className="h-12 animate-pulse rounded-[12px] bg-bg" />
            <div className="h-12 animate-pulse rounded-[12px] bg-bg" />
          </div>
        ) : null}
        {data?.todayTasks.length ? (
          <ul className="divide-y divide-divider">
            {data.todayTasks.map((task) => (
              <li key={task.id}>
                <TaskRow task={task} onToggle={() => toggle.mutate(task)} />
              </li>
            ))}
          </ul>
        ) : !query.isLoading ? (
          <EmptyState
            message="Bugün için görev yok."
            actionLabel="Görev ekle"
            onAction={() => openCreate('task')}
          />
        ) : null}
      </section>

      <section className="surface mb-4 p-4">
        <div className="mb-1 flex items-center justify-between gap-3">
          <h2 className="text-[16px] font-semibold text-text">Yaklaşanlar</h2>
          <Link to="/calendar" className="text-[13px] text-secondary">
            7 gün
          </Link>
        </div>
        {data?.upcoming.length ? (
          <ul>
            {data.upcoming.map((item, index) => (
              <UpcomingRow
                key={`${item.type}-${item.entityId}-${item.date}`}
                item={item}
                last={index === data.upcoming.length - 1}
              />
            ))}
          </ul>
        ) : !query.isLoading ? (
          <p className="py-3 text-[14px] text-secondary">Önümüzdeki 7 günde bir şey yok.</p>
        ) : null}
      </section>

      <section className="surface p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-[16px] font-semibold text-text">Şu an okuyorum</h2>
          <Link to="/collections/books" aria-label="Kitaplar" className="text-secondary">
            <ChevronRight size={18} />
          </Link>
        </div>
        {data?.readingBook ? (
          <Link to="/collections/books" className="flex items-center gap-3">
            <BookCover title={data.readingBook.title} author={data.readingBook.author} />
            <span className="min-w-0">
              <span className="block truncate text-[15px] font-semibold text-text">
                {data.readingBook.title}
              </span>
              <span className="mt-0.5 block text-[13px] text-secondary">
                {data.readingBook.author}
              </span>
              <span className="mt-2 block text-[12px] text-secondary">Okuyorum</span>
            </span>
          </Link>
        ) : (
          <EmptyState
            message="Şu anda okuduğun bir kitap yok."
            actionLabel="Kitap ekle"
            onAction={() => openCreate('book')}
          />
        )}
      </section>

      {!online && data ? (
        <p className="mt-4 text-[12px] text-secondary">Çevrimdışı önbellek gösteriliyor.</p>
      ) : null}
    </div>
  )
}
