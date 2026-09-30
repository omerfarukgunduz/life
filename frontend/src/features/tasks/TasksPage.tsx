import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Search, SlidersHorizontal } from 'lucide-react'
import { useMemo, useState } from 'react'
import {
  BottomSheet,
  Button,
  Dialog,
  EmptyState,
  IconButton,
  ListSection,
  NavAddButton,
  PageHeader,
  SegmentControl,
  TaskRow,
} from '../../components'
import { useQuickAdd } from '../../hooks/useQuickAdd'
import { useToast } from '../../context/ToastContext'
import { tasksApi } from '../../services/endpoints'
import type { Priority, Task, TaskFilter } from '../../types'
import { TaskForm } from './TaskForm'

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

const priorities: { id: Priority | 'all'; label: string }[] = [
  { id: 'all', label: 'Tümü' },
  { id: 'High', label: 'Yüksek' },
  { id: 'Normal', label: 'Normal' },
  { id: 'Low', label: 'Düşük' },
]

export default function TasksPage() {
  const [filter, setFilter] = useState<TaskFilter>('today')
  const [editing, setEditing] = useState<Task | null>(null)
  const [deleting, setDeleting] = useState<Task | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [priority, setPriority] = useState<Priority | 'all'>('all')
  const [filterOpen, setFilterOpen] = useState(false)
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
      toast('İş silindi')
    },
  })

  const visible = useMemo(() => {
    const q = search.trim().toLocaleLowerCase('tr')
    return data.filter((task) => {
      if (priority !== 'all' && task.priority !== priority) return false
      if (!q) return true
      return task.title.toLocaleLowerCase('tr').includes(q)
    })
  }, [data, priority, search])

  return (
    <section>
      <PageHeader
        title="İşler"
        trailing={
          <>
            <IconButton label="Ara" onClick={() => setSearchOpen((open) => !open)}>
              <Search size={20} strokeWidth={2} />
            </IconButton>
            <IconButton
              label="Filtrele"
              onClick={() => setFilterOpen(true)}
              className="relative"
            >
              <SlidersHorizontal size={20} strokeWidth={2} />
              {priority !== 'all' ? (
                <span className="absolute top-2.5 right-2.5 size-1.5 rounded-full bg-accent" />
              ) : null}
            </IconButton>
            <NavAddButton onClick={() => openCreate('task')} label="İş ekle" />
          </>
        }
      />

      {searchOpen ? (
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="İş ara"
          aria-label="İş ara"
          className="mb-4 min-h-11 w-full rounded-[var(--radius-input)] border border-border bg-surface px-3 text-[17px] text-text placeholder:text-secondary"
        />
      ) : null}

      <SegmentControl
        ariaLabel="İş filtresi"
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

      {!isLoading && visible.length === 0 ? (
        <EmptyState
          message="Yapılacak iş yok."
          actionLabel="İş ekle"
          onAction={() => openCreate('task')}
        />
      ) : null}

      {visible.length > 0 ? (
        <ListSection>
          <ul>
            {visible.map((task) => (
              <li key={task.id}>
                <TaskRow
                  task={task}
                  showDate
                  onToggle={() => toggle.mutate(task)}
                  onOpen={() => setEditing(task)}
                />
              </li>
            ))}
          </ul>
        </ListSection>
      ) : null}

      <BottomSheet open={filterOpen} onClose={() => setFilterOpen(false)} title="Öncelik">
        <ul className="space-y-1">
          {priorities.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className="flex min-h-11 w-full items-center px-4 text-left text-[17px]"
                onClick={() => {
                  setPriority(item.id)
                  setFilterOpen(false)
                }}
              >
                <span className={item.id === priority ? 'font-medium text-accent' : 'text-text'}>
                  {item.label}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </BottomSheet>

      <BottomSheet
        open={editing !== null}
        onClose={() => setEditing(null)}
        title="İşi düzenle"
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
        title="İşi sil?"
        description="Bu işlem geri alınamaz."
        confirmLabel="Sil"
        danger
        busy={remove.isPending}
      />
    </section>
  )
}
