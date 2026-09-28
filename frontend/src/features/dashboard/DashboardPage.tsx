import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Cake, Camera, CheckSquare } from 'lucide-react'
import { Checkbox, EmptyState } from '../../components'
import { useQuickAdd } from '../../hooks/useQuickAdd'
import { useOnline } from '../../hooks/useOnline'
import { dashboardApi, tasksApi } from '../../services/endpoints'
import type { Dashboard, Task, UpcomingType } from '../../types'
import {
  formatDayMonth,
  formatWeekdayDayMonth,
  toDateOnly,
} from '../../utils'
import { cacheDashboard, readCachedDashboard } from '../../utils/theme'
import { cn } from '../../utils/cn'

const typeLabel: Record<UpcomingType, string> = {
  task: 'Görev',
  birthday: 'Doğum günü',
  contest: 'Yarışma',
}

function TypeIcon({ type }: { type: UpcomingType }) {
  const props = { size: 16, strokeWidth: 1.75, className: 'text-secondary' as const }
  if (type === 'birthday') return <Cake {...props} />
  if (type === 'contest') return <Camera {...props} />
  return <CheckSquare {...props} />
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
    <div>
      <header className="mb-6">
        <h1 className="text-[22px] font-semibold tracking-tight text-text">
          {formatWeekdayDayMonth(todayKey)}
        </h1>
        <p className="mt-1 text-[13px] text-secondary">Bugün</p>
      </header>

      <section className="mb-8">
        <h2 className="mb-3 text-[15px] font-semibold text-text">Bugünkü görevler</h2>
        {query.isLoading && !data ? (
          <div className="space-y-3" aria-hidden>
            <div className="h-12 animate-pulse rounded-[12px] bg-surface" />
            <div className="h-12 animate-pulse rounded-[12px] bg-surface" />
          </div>
        ) : null}
        {data?.todayTasks.length ? (
          <ul>
            {data.todayTasks.map((task) => (
              <li
                key={task.id}
                className={cn(
                  'flex items-start gap-3 border-b border-border py-3 last:border-b-0',
                  task.isCompleted && 'opacity-45',
                )}
              >
                <Checkbox
                  checked={task.isCompleted}
                  aria-label={`${task.title} tamamla`}
                  onChange={() => toggle.mutate(task)}
                  className="!min-h-0 pt-0.5"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {task.priority === 'High' ? (
                      <span className="size-1.5 shrink-0 rounded-full bg-text" aria-hidden />
                    ) : null}
                    <p className="truncate text-[15px] font-medium text-text">{task.title}</p>
                  </div>
                  <p className="mt-0.5 text-[13px] text-secondary">
                    {[task.category, task.dueTime].filter(Boolean).join(' · ')}
                  </p>
                </div>
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

      <section className="mb-8">
        <h2 className="mb-3 text-[15px] font-semibold text-text">Yaklaşanlar</h2>
        {data?.upcoming.length ? (
          <ul>
            {data.upcoming.map((item) => (
              <li
                key={`${item.type}-${item.entityId}-${item.date}`}
                className="flex items-start gap-3 border-b border-border py-3 last:border-b-0"
              >
                <TypeIcon type={item.type} />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] text-secondary">
                    {formatDayMonth(item.date)} · {typeLabel[item.type]}
                  </p>
                  <p className="truncate text-[15px] font-medium text-text">{item.title}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : !query.isLoading ? (
          <p className="text-[14px] text-secondary">Önümüzdeki 7 günde bir şey yok.</p>
        ) : null}
      </section>

      <section>
        <h2 className="mb-3 text-[15px] font-semibold text-text">Şu an okuyorum</h2>
        {data?.readingBook ? (
          <div>
            <p className="text-[15px] font-medium text-text">{data.readingBook.title}</p>
            <p className="text-[13px] text-secondary">{data.readingBook.author}</p>
          </div>
        ) : (
          <EmptyState
            message="Şu anda okuduğun bir kitap yok."
            actionLabel="Kitap ekle"
            onAction={() => openCreate('book')}
          />
        )}
      </section>

      {!online && data ? (
        <p className="mt-6 text-[12px] text-secondary">Çevrimdışı önbellek gösteriliyor.</p>
      ) : null}
    </div>
  )
}
