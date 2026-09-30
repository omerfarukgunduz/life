import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  BookCover,
  EmptyState,
  IconTile,
  ListSection,
  NavAddButton,
  NotificationsBell,
  TaskRow,
  typeTone,
} from '../../components'
import { useQuickAdd } from '../../hooks/useQuickAdd'
import { useOnline } from '../../hooks/useOnline'
import { dashboardApi, tasksApi } from '../../services/endpoints'
import type { Dashboard, Task, UpcomingItem, UpcomingType } from '../../types'
import {
  formatDayMonth,
  formatDayMonthLong,
  formatWeekday,
  toDateOnly,
} from '../../utils'
import { cacheDashboard, readCachedDashboard } from '../../utils/theme'

const typeLabel: Record<UpcomingType, string> = {
  task: 'İş',
  birthday: 'Doğum günü',
  contest: 'Yarışma',
}

const typeHref: Record<UpcomingType, string> = {
  task: '/tasks',
  birthday: '/collections/birthdays',
  contest: '/collections/contests',
}

function UpcomingRow({ item }: { item: UpcomingItem }) {
  const tone = typeTone(item.type)
  return (
    <li>
      <Link
        to={typeHref[item.type]}
        className="flex min-h-[56px] items-center gap-3 px-4 py-2.5 active:opacity-70"
      >
        <span className="w-[52px] shrink-0 text-[13px] font-semibold leading-[18px] text-secondary tabular-nums">
          {formatDayMonth(item.date)}
        </span>
        <IconTile {...tone} size="sm" />
        <span className="min-w-0 flex-1">
          <span className="headline block truncate text-text">{item.title}</span>
          <span className="subheadline mt-0.5 block truncate text-secondary">
            {item.subtitle || typeLabel[item.type]}
          </span>
        </span>
        <ChevronRight size={17} className="shrink-0 text-tertiary" strokeWidth={2} />
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

  return (
    <div className="pb-2">
      <header className="mb-6">
        <p className="subheadline text-secondary">
          {formatDayMonthLong(todayKey)} {formatWeekday(todayKey)}
        </p>
        <div className="mt-1 flex items-start justify-between gap-3">
          <h1 className="large-title min-w-0 text-text">Bugün</h1>
          <div className="flex h-11 shrink-0 items-center">
            <NotificationsBell />
            <NavAddButton onClick={() => openCreate('task')} label="İş ekle" />
          </div>
        </div>
      </header>

      <ListSection
        title="Bugünkü işler"
        action={
          <Link to="/tasks" className="footnote font-medium text-accent">
            Tümü
          </Link>
        }
      >
        {query.isLoading && !data ? (
          <div className="px-4 py-3" aria-hidden>
            <div className="h-12 animate-pulse rounded-[8px] bg-bg" />
          </div>
        ) : null}
        {data?.todayTasks.length ? (
          <ul>
            {data.todayTasks.map((task) => (
              <li key={task.id}>
                <TaskRow task={task} onToggle={() => toggle.mutate(task)} />
              </li>
            ))}
          </ul>
        ) : !query.isLoading ? (
          <EmptyState
            message="Bugün için yapılacak iş yok."
            actionLabel="İş ekle"
            onAction={() => openCreate('task')}
          />
        ) : null}
      </ListSection>

      <ListSection
        title="Yaklaşanlar"
        action={
          <Link to="/calendar" className="footnote font-medium text-accent">
            7 gün
          </Link>
        }
      >
        {data?.upcoming.length ? (
          <ul>
            {data.upcoming.map((item) => (
              <UpcomingRow
                key={`${item.type}-${item.entityId}-${item.date}`}
                item={item}
              />
            ))}
          </ul>
        ) : !query.isLoading ? (
          <p className="footnote px-4 py-4 text-secondary">Önümüzdeki 7 günde bir şey yok.</p>
        ) : null}
      </ListSection>

      <ListSection title="Şu an okuyorum">
        {data?.readingBook ? (
          <Link
            to="/collections/books"
            className="flex min-h-[56px] items-center gap-3 px-4 py-2.5 active:opacity-70"
          >
            <BookCover title={data.readingBook.title} author={data.readingBook.author} />
            <span className="min-w-0 flex-1">
              <span className="headline block truncate text-text">{data.readingBook.title}</span>
              <span className="subheadline mt-0.5 block truncate text-secondary">
                {data.readingBook.author}
              </span>
              <span className="caption-text mt-1 block text-secondary">Okuyorum</span>
            </span>
            <ChevronRight size={17} className="shrink-0 text-tertiary" strokeWidth={2} />
          </Link>
        ) : (
          <EmptyState
            message="Şu anda okuduğun bir kitap yok."
            actionLabel="Kitap ekle"
            onAction={() => openCreate('book')}
          />
        )}
      </ListSection>

      {!online && data ? (
        <p className="caption-text mt-2 text-center text-secondary">
          Çevrimdışı önbellek gösteriliyor.
        </p>
      ) : null}
    </div>
  )
}
