import { ChevronRight } from 'lucide-react'
import type { Task } from '../types'
import { formatClock, formatDayMonth } from '../utils'
import { cn } from '../utils/cn'
import { Checkbox } from './Checkbox'
import { categoryTone, IconTile } from './IconTile'

type TaskRowProps = {
  task: Task
  onToggle: () => void
  onOpen?: () => void
  showDate?: boolean
}

export function TaskRow({ task, onToggle, onOpen, showDate }: TaskRowProps) {
  const tone = categoryTone(task.category)
  const meta = [
    task.category,
    showDate && task.dueDate ? formatDayMonth(task.dueDate) : null,
    formatClock(task.dueTime),
  ]
    .filter(Boolean)
    .join(' · ')

  const body = (
    <>
      <IconTile {...tone} />
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            'block truncate text-[15px] font-medium text-text',
            task.isCompleted && 'text-secondary line-through',
          )}
        >
          {task.title}
        </span>
        {meta ? (
          <span className="mt-0.5 block truncate text-[13px] text-secondary">{meta}</span>
        ) : null}
      </span>
      {onOpen ? (
        <ChevronRight size={18} strokeWidth={1.75} className="shrink-0 text-[#C8C8C6]" />
      ) : null}
    </>
  )

  return (
    <div className={cn('flex items-center gap-3 py-3', task.isCompleted && 'opacity-80')}>
      <Checkbox
        checked={task.isCompleted}
        onChange={onToggle}
        aria-label={`${task.title} tamamla`}
        className="!min-h-0 !min-w-0"
      />
      {onOpen ? (
        <button type="button" onClick={onOpen} className="flex min-w-0 flex-1 items-center gap-3 text-left">
          {body}
        </button>
      ) : (
        <div className="flex min-w-0 flex-1 items-center gap-3">{body}</div>
      )}
    </div>
  )
}
