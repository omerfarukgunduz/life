import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import {
  BottomSheet,
  Button,
  Checkbox,
  Dialog,
  EmptyState,
  PageHeader,
  SegmentControl,
} from '../../components'
import { DesktopAddButton } from '../../layouts/AppShell'
import { useQuickAdd } from '../../hooks/useQuickAdd'
import { useToast } from '../../context/ToastContext'
import { tasksApi } from '../../services/endpoints'
import type { Task, TaskFilter } from '../../types'
import { TaskForm } from './TaskForm'
import { cn } from '../../utils/cn'

const filters: { id: TaskFilter; label: string }[] = [
  { id: 'today', label: 'Bugün' },
  { id: 'upcoming', label: 'Yaklaşan' },
  { id: 'all', label: 'Tümü' },
  { id: 'completed', label: 'Tamamlanan' },
]

function taskToInput(task: Task, isCompleted: boolean) {
  return {
    title: task.title,
    description: task.description,
    dueDate: task.dueDate,
    dueTime: task.dueTime,
    priority: task.priority,
    category: task.category,
    isCompleted,
  }
}

export default function TasksPage() {
  const [filter, setFilter] = useState<TaskFilter>('today')
  const [editing, setEditing] = useState<Task | null>(null)
  const [deleting, setDeleting] = useState<Task | null>(null)
  const { openCreate } = useQuickAdd()
  const { toast } = useToast()
  const qc = useQueryClient()

  const { data = [], isLoading } = useQuery({
    queryKey: ['tasks', filter],
    queryFn: () => tasksApi.list(filter),
  })

  const toggle = useMutation({
    mutationFn: (task: Task) =>
      tasksApi.update(task.id, taskToInput(task, !task.isCompleted)),
    onMutate: async (task) => {
      await qc.cancelQueries({ queryKey: ['tasks'] })
      const key = ['tasks', filter] as const
      const prev = qc.getQueryData<Task[]>(key)
      if (prev) {
        const nextCompleted = !task.isCompleted
        qc.setQueryData<Task[]>(
          key,
          prev
            .map((t) =>
              t.id === task.id ? { ...t, isCompleted: nextCompleted } : t,
            )
            .filter((t) => {
              if (filter === 'completed') return t.isCompleted
              if (filter === 'today' || filter === 'upcoming' || filter === 'all')
                return filter === 'all' ? true : !t.isCompleted || t.id !== task.id
              return true
            }),
        )
      }
      return { prev, key }
    },
    onError: (_e, _t, ctx) => {
      if (ctx?.prev) qc.setQueryData(ctx.key, ctx.prev)
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: ['tasks'] })
      void qc.invalidateQueries({ queryKey: ['dashboard'] })
      void qc.invalidateQueries({ queryKey: ['calendar'] })
    },
  })

  const remove = useMutation({
    mutationFn: (id: string) => tasksApi.remove(id),
    onSuccess: async () => {
      setDeleting(null)
      setEditing(null)
      await qc.invalidateQueries({ queryKey: ['tasks'] })
      await qc.invalidateQueries({ queryKey: ['dashboard'] })
      await qc.invalidateQueries({ queryKey: ['calendar'] })
      toast('Görev silindi')
    },
  })

  return (
    <section>
      <PageHeader
        title="Görevler"
        action={<DesktopAddButton onClick={() => openCreate('task')} label="Görev ekle" />}
      />

      <SegmentControl
        ariaLabel="Görev filtresi"
        className="mb-4"
        items={filters}
        value={filter}
        onChange={(id) => setFilter(id as TaskFilter)}
      />

      {isLoading ? (
        <div className="space-y-2" aria-hidden>
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded-[10px] bg-surface" />
          ))}
        </div>
      ) : null}

      {!isLoading && data.length === 0 ? (
        <EmptyState
          message="Görev yok."
          actionLabel="Görev ekle"
          onAction={() => openCreate('task')}
        />
      ) : null}

      <ul>
        {data.map((task) => (
          <li
            key={task.id}
            className={cn(
              'flex items-start gap-3 border-b border-border py-3 last:border-b-0',
              task.isCompleted && 'opacity-45',
            )}
          >
            <Checkbox
              checked={task.isCompleted}
              onChange={() => toggle.mutate(task)}
              aria-label={`${task.title} tamamlandı`}
              className="!min-h-0 pt-0.5"
            />
            <button
              type="button"
              className="min-w-0 flex-1 text-left"
              onClick={() => setEditing(task)}
            >
              <div className="flex items-center gap-2">
                {task.priority === 'High' ? (
                  <span className="size-1.5 shrink-0 rounded-full bg-text" aria-hidden />
                ) : null}
                <p className="truncate text-[15px] font-medium text-text">{task.title}</p>
              </div>
              <p className="mt-0.5 text-[13px] text-secondary">
                {[task.category, task.dueTime, task.dueDate].filter(Boolean).join(' · ')}
              </p>
            </button>
          </li>
        ))}
      </ul>

      <BottomSheet
        open={editing !== null}
        onClose={() => setEditing(null)}
        title="Görevi düzenle"
      >
        {editing ? (
          <div className="space-y-4">
            <TaskForm
              initial={editing}
              onDone={() => setEditing(null)}
            />
            <Button
              variant="danger"
              fullWidth
              onClick={() => setDeleting(editing)}
            >
              Sil
            </Button>
          </div>
        ) : null}
      </BottomSheet>

      <Dialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && remove.mutate(deleting.id)}
        title="Görevi sil?"
        description="Bu işlem geri alınamaz."
        confirmLabel="Sil"
        danger
        busy={remove.isPending}
      />
    </section>
  )
}
