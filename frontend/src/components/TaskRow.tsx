import { ChevronRight } from 'lucide-react'
import type { Task } from '../types'
import { formatClock, formatDayMonth } from '../utils'
import { cn } from '../utils/cn'
import { Checkbox } from './Checkbox'
import { IconTile, typeTone } from './IconTile'

type TaskRowProps = {
  task: Task
  onToggle: () => void
  onOpen?: () => void
  showDate?: boolean
}

export function TaskRow({ task, onToggle, onOpen, showDate }: TaskRowProps) {
  const tone = typeTone('task')
  const meta = [
    showDate && task.dueDate ? formatDayMonth(task.dueDate) : null,
    formatClock(task.dueTime),
  ]
    .filter(Boolean)
    .join(' · ')

  const body = (
    <>
      <IconTile {...tone} size="sm" />
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            'headline block truncate text-text',
            task.isCompleted &&
              'text-secondary line-through decoration-text decoration-1',
          )}
        >
          {task.title}
        </span>
        {meta ? (
          <span className="subheadline mt-0.5 block truncate text-secondary">{meta}</span>
        ) : null}
      </span>
      {onOpen ? (
        <ChevronRight size={16} strokeWidth={2} className="shrink-0 text-tertiary" />
      ) : null}
    </>
  )

  return (
    <div className="flex min-h-[56px] items-center gap-3 px-4 py-2.5">
      <Checkbox
        checked={task.isCompleted}
        onChange={onToggle}
        aria-label={`${task.title} tamamla`}
      />
      {onOpen ? (
        <button
          type="button"
          onClick={onOpen}
          className="flex min-w-0 flex-1 items-center gap-3 text-left active:opacity-70"
        >
          {body}
        </button>
      ) : (
        <div className="flex min-w-0 flex-1 items-center gap-3">{body}</div>
      )}
    </div>
  )
}
